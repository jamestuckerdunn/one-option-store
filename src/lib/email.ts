/**
 * Email sending utility using Resend.
 * Handles newsletter digest and transactional emails.
 */

import { logger } from './logger';
import { escapeHtml } from './validation';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'One Option <newsletter@oneoptionstore.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneoptionstore.com';

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 30000; // 30 seconds

/** Max retries for transient failures */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const RETRY_BASE_DELAY_MS = 1000;

/**
 * Delay helper for retry logic.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable (network errors, rate limits, server errors).
 */
function isRetryableError(status: number | null, error: unknown): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && String(error).includes('fetch')) {
    return true;
  }
  // Rate limits (429) and server errors (5xx) are retryable
  if (status !== null && (status === 429 || status >= 500)) {
    return true;
  }
  return false;
}

/**
 * Send an email using Resend API.
 * Includes timeout and retry logic for transient failures.
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    logger.error('RESEND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  let lastError: string = 'Unknown error';

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `HTTP ${response.status}: ${errorText}`;

          // Check if we should retry
          if (isRetryableError(response.status, null) && attempt < MAX_RETRIES - 1) {
            const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
            logger.warn(`Email send failed (attempt ${attempt + 1}), retrying in ${delayMs}ms`, {
              status: response.status,
            });
            await delay(delayMs);
            continue;
          }

          logger.error('Failed to send email', undefined, { status: response.status, errorText });
          return { success: false, error: lastError };
        }

        const data = await response.json();
        const id = data && typeof data === 'object' && 'id' in data ? String(data.id) : undefined;
        return { success: true, id };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      // Check if we should retry
      if (isRetryableError(null, error) && attempt < MAX_RETRIES - 1) {
        const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn(`Email send error (attempt ${attempt + 1}), retrying in ${delayMs}ms`, {
          error: lastError,
        });
        await delay(delayMs);
        continue;
      }

      logger.error('Email send error', error instanceof Error ? error : new Error(lastError));
      return { success: false, error: lastError };
    }
  }

  return { success: false, error: lastError };
}

/**
 * Generate HTML for the weekly digest email.
 */
export function generateWeeklyDigestHtml(
  changes: Array<{
    category_name: string;
    department_name: string;
    new_product_name: string;
    new_product_price: number | null;
    new_product_image: string | null;
    new_product_asin: string;
  }>,
  unsubscribeToken: string
): string {
  const affiliateTag = process.env.AMAZON_ASSOCIATE_TAG || 'jtuckerdunn01-20';
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  // MAX_PRODUCTS_IN_DIGEST: Show up to 10 products in the email
  const productRows = changes.slice(0, 10).map((change) => {
    const amazonUrl = `https://amazon.com/dp/${encodeURIComponent(change.new_product_asin)}?tag=${encodeURIComponent(affiliateTag)}`;
    const price = change.new_product_price
      ? `$${change.new_product_price.toFixed(2)}`
      : 'Check price';

    // XSS: Escape all user-generated content for safe HTML display
    const safeDepartmentName = escapeHtml(change.department_name);
    const safeCategoryName = escapeHtml(change.category_name);
    const safeProductName = escapeHtml(change.new_product_name.slice(0, 80));
    const productNameTruncated = change.new_product_name.length > 80 ? '...' : '';
    const safeImageUrl = change.new_product_image
      ? escapeHtml(change.new_product_image)
      : null;

    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="80" style="vertical-align: top;">
                ${safeImageUrl
                  ? `<img src="${safeImageUrl}" alt="" width="70" height="70" style="border-radius: 8px; object-fit: contain; background: #f9f9f9;">`
                  : '<div style="width: 70px; height: 70px; background: #f0f0f0; border-radius: 8px;"></div>'
                }
              </td>
              <td style="vertical-align: top; padding-left: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #666; text-transform: uppercase;">
                  ${safeDepartmentName} &rarr; ${safeCategoryName}
                </p>
                <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #111;">
                  ${safeProductName}${productNameTruncated}
                </p>
                <p style="margin: 0;">
                  <span style="font-size: 16px; font-weight: bold; color: #111;">${price}</span>
                  <a href="${amazonUrl}" style="margin-left: 12px; font-size: 13px; color: #0066cc; text-decoration: none;">View on Amazon &rarr;</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Bestseller Updates</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: #111; padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #fff; font-family: Georgia, serif;">
                One Option
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">
                Weekly Bestseller Updates
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 32px 24px 24px 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #111;">
                New #1 Products This Week
              </h2>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
                ${changes.length} ${changes.length === 1 ? 'category has' : 'categories have'} a new bestseller. Here are the products that climbed to the top:
              </p>
            </td>
          </tr>

          <!-- Product List -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${productRows}
              </table>
            </td>
          </tr>

          ${changes.length > 10 ? `
          <tr>
            <td style="padding: 16px 24px; text-align: center;">
              <a href="${SITE_URL}" style="font-size: 14px; color: #0066cc; text-decoration: none;">
                View all ${changes.length} changes on our website &rarr;
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding: 24px; text-align: center; background: #f9f9f9;">
              <a href="${SITE_URL}/browse" style="display: inline-block; padding: 14px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Browse All Bestsellers
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="${SITE_URL}" style="color: #666; text-decoration: underline;">Visit Website</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of the weekly digest.
 */
export function generateWeeklyDigestText(
  changes: Array<{
    category_name: string;
    department_name: string;
    new_product_name: string;
    new_product_price: number | null;
    new_product_asin: string;
  }>,
  unsubscribeToken: string
): string {
  const affiliateTag = process.env.AMAZON_ASSOCIATE_TAG || 'jtuckerdunn01-20';
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const productList = changes.slice(0, 10).map((change) => {
    const amazonUrl = `https://amazon.com/dp/${change.new_product_asin}?tag=${affiliateTag}`;
    const price = change.new_product_price
      ? `$${change.new_product_price.toFixed(2)}`
      : 'Check price';

    return `
${change.department_name} > ${change.category_name}
${change.new_product_name}
${price} - ${amazonUrl}
`;
  }).join('\n---\n');

  return `
ONE OPTION - Weekly Bestseller Updates
======================================

New #1 Products This Week

${changes.length} ${changes.length === 1 ? 'category has' : 'categories have'} a new bestseller.

${productList}

---

Browse all bestsellers: ${SITE_URL}/browse

---

As an Amazon Associate, we earn from qualifying purchases.

Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

/**
 * Send welcome email to new subscriber.
 */
export async function sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<SendResult> {
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: #111; padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #fff; font-family: Georgia, serif;">
                One Option
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111;">
                Welcome to One Option!
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #444; line-height: 1.6;">
                You're now subscribed to our weekly bestseller digest. Every week, we'll send you a summary of which categories got new #1 products on Amazon.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #444; line-height: 1.6;">
                No spam, no fluff - just the products that matter.
              </p>
              <a href="${SITE_URL}/browse" style="display: inline-block; padding: 14px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Browse Bestsellers
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: 'Welcome to One Option - Weekly Bestseller Updates',
    html,
    text: `Welcome to One Option!\n\nYou're now subscribed to our weekly bestseller digest.\n\nBrowse bestsellers: ${SITE_URL}/browse\n\nUnsubscribe: ${unsubscribeUrl}`,
  });
}
