import { db } from './connection';

/**
 * Database operations for social media post logging.
 */

export type Platform = 'twitter' | 'instagram' | 'tiktok' | 'facebook';
export type PostStatus = 'posted' | 'failed' | 'scheduled';

export interface SocialPost {
  id: string;
  platform: Platform;
  content: string;
  product_id: string | null;
  category_id: string | null;
  post_url: string | null;
  post_id: string | null;
  posted_at: Date;
  status: PostStatus;
  error_message: string | null;
  engagement: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

type Row = Record<string, unknown>;

/**
 * Log a social media post to the database.
 */
export async function logSocialPost(params: {
  platform: Platform;
  content: string;
  productId?: string;
  categoryId?: string;
  postUrl?: string;
  postId?: string;
  status: PostStatus;
  errorMessage?: string;
}): Promise<string> {
  const result = await db()`
    INSERT INTO social_posts (
      platform,
      content,
      product_id,
      category_id,
      post_url,
      post_id,
      status,
      error_message
    )
    VALUES (
      ${params.platform},
      ${params.content},
      ${params.productId || null},
      ${params.categoryId || null},
      ${params.postUrl || null},
      ${params.postId || null},
      ${params.status},
      ${params.errorMessage || null}
    )
    RETURNING id
  `;

  const rows = result as unknown as Row[];
  return String(rows[0].id);
}

/**
 * Get recent social posts for a platform.
 */
export async function getRecentPosts(
  platform: Platform,
  limit: number = 10
): Promise<SocialPost[]> {
  const result = await db()`
    SELECT id, platform, content, product_id, category_id, post_url, post_id,
           posted_at, status, error_message, engagement
    FROM social_posts
    WHERE platform = ${platform}
    ORDER BY posted_at DESC
    LIMIT ${limit}
  `;

  const rows = result as unknown as Row[];
  return rows.map(rowToSocialPost);
}

/**
 * Check if a product was posted to a platform recently.
 * Prevents duplicate posts.
 * @param productId - Product ID to check
 * @param platform - Social media platform
 * @param hoursAgo - Number of hours to look back (default: 24, max: 168)
 */
export async function wasProductPostedRecently(
  productId: string,
  platform: Platform,
  hoursAgo: number = 24
): Promise<boolean> {
  // Validate hoursAgo to prevent SQL injection and ensure reasonable values
  const validHours = Math.max(1, Math.min(168, Math.floor(hoursAgo)));

  // Use parameterized query with interval arithmetic instead of string interpolation
  const result = await db()`
    SELECT id FROM social_posts
    WHERE product_id = ${productId}
      AND platform = ${platform}
      AND status = 'posted'
      AND posted_at > NOW() - (${validHours} * INTERVAL '1 hour')
    LIMIT 1
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0;
}

/**
 * Get posting statistics.
 * @param days - Number of days to look back (default: 7, max: 365)
 */
export async function getPostingStats(days: number = 7): Promise<{
  total: number;
  byPlatform: { platform: Platform; count: number; successful: number }[];
}> {
  // Validate days to prevent SQL injection and ensure reasonable values
  const validDays = Math.max(1, Math.min(365, Math.floor(days)));

  // Use parameterized query with interval arithmetic instead of string interpolation
  const result = await db()`
    SELECT
      platform,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'posted') as successful
    FROM social_posts
    WHERE posted_at > NOW() - (${validDays} * INTERVAL '1 day')
    GROUP BY platform
  `;

  const rows = result as unknown as Row[];
  const byPlatform = rows.map((r) => ({
    platform: String(r.platform) as Platform,
    count: Number(r.total),
    successful: Number(r.successful),
  }));

  const total = byPlatform.reduce((sum, p) => sum + p.count, 0);

  return { total, byPlatform };
}

function rowToSocialPost(row: Row): SocialPost {
  return {
    id: String(row.id),
    platform: String(row.platform) as Platform,
    content: String(row.content),
    product_id: row.product_id ? String(row.product_id) : null,
    category_id: row.category_id ? String(row.category_id) : null,
    post_url: row.post_url ? String(row.post_url) : null,
    post_id: row.post_id ? String(row.post_id) : null,
    posted_at: new Date(String(row.posted_at)),
    status: String(row.status) as PostStatus,
    error_message: row.error_message ? String(row.error_message) : null,
    engagement: (row.engagement as { likes?: number; shares?: number; comments?: number }) || {},
  };
}
