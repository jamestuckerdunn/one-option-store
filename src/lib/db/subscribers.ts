import { db } from './connection';

/**
 * Database operations for newsletter subscribers.
 */

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  confirmed_at: Date | null;
  unsubscribe_token: string;
  preferences: {
    weekly_digest: boolean;
  };
}

type Row = Record<string, unknown>;

/**
 * Subscribe an email to the newsletter.
 * @param email - Email address to subscribe
 * @returns The subscriber record or null if already subscribed
 */
export async function subscribeEmail(email: string): Promise<Subscriber | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await db()`
    SELECT id, email, subscribed_at, unsubscribed_at, confirmed_at, unsubscribe_token, preferences
    FROM subscribers
    WHERE email = ${normalizedEmail}
    LIMIT 1
  `;

  const rows = existing as unknown as Row[];

  if (rows.length > 0) {
    const row = rows[0];
    // If previously unsubscribed, resubscribe
    if (row.unsubscribed_at) {
      const updated = await db()`
        UPDATE subscribers
        SET unsubscribed_at = NULL,
            subscribed_at = NOW(),
            updated_at = NOW()
        WHERE email = ${normalizedEmail}
        RETURNING id, email, subscribed_at, unsubscribed_at, confirmed_at, unsubscribe_token, preferences
      `;
      const updatedRows = updated as unknown as Row[];
      return rowToSubscriber(updatedRows[0]);
    }
    // Already subscribed
    return null;
  }

  // Create new subscriber
  const result = await db()`
    INSERT INTO subscribers (email, preferences)
    VALUES (${normalizedEmail}, '{"weekly_digest": true}'::jsonb)
    RETURNING id, email, subscribed_at, unsubscribed_at, confirmed_at, unsubscribe_token, preferences
  `;

  const newRows = result as unknown as Row[];
  return rowToSubscriber(newRows[0]);
}

/**
 * Unsubscribe an email using the unsubscribe token.
 * @param token - Unsubscribe token
 * @returns true if unsubscribed, false if token not found
 */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const result = await db()`
    UPDATE subscribers
    SET unsubscribed_at = NOW(),
        updated_at = NOW()
    WHERE unsubscribe_token = ${token}
      AND unsubscribed_at IS NULL
    RETURNING id
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0;
}

/**
 * Get all active subscribers for sending emails.
 * @returns Array of active subscriber emails with unsubscribe tokens
 */
export async function getActiveSubscribers(): Promise<{ email: string; unsubscribe_token: string }[]> {
  const result = await db()`
    SELECT email, unsubscribe_token
    FROM subscribers
    WHERE unsubscribed_at IS NULL
    ORDER BY subscribed_at ASC
  `;

  const rows = result as unknown as Row[];
  return rows.map((r) => ({
    email: String(r.email),
    unsubscribe_token: String(r.unsubscribe_token),
  }));
}

/**
 * Get subscriber count statistics.
 */
export async function getSubscriberStats(): Promise<{
  total: number;
  active: number;
  unsubscribed: number;
}> {
  const result = await db()`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE unsubscribed_at IS NULL) as active,
      COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as unsubscribed
    FROM subscribers
  `;

  const rows = result as unknown as Row[];
  const row = rows[0];
  return {
    total: Number(row.total || 0),
    active: Number(row.active || 0),
    unsubscribed: Number(row.unsubscribed || 0),
  };
}

function rowToSubscriber(row: Row): Subscriber {
  return {
    id: String(row.id),
    email: String(row.email),
    subscribed_at: new Date(String(row.subscribed_at)),
    unsubscribed_at: row.unsubscribed_at ? new Date(String(row.unsubscribed_at)) : null,
    confirmed_at: row.confirmed_at ? new Date(String(row.confirmed_at)) : null,
    unsubscribe_token: String(row.unsubscribe_token),
    preferences: (row.preferences as { weekly_digest: boolean }) || { weekly_digest: true },
  };
}
