import { NextRequest, NextResponse } from 'next/server';
import { getActiveSubscribers } from '@/lib/db/subscribers';
import { getWeeklyChanges } from '@/lib/db/bestseller-changes';
import { sendEmail, generateWeeklyDigestHtml, generateWeeklyDigestText } from '@/lib/email';
import { isCronAuthorized } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing all subscribers

/**
 * GET /api/cron/weekly-digest
 * Send weekly digest email to all active subscribers.
 * Should be triggered by a cron job (e.g., Vercel Cron) every Sunday/Monday.
 *
 * Requires CRON_SECRET authorization in production.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret using timing-safe comparison
  if (!isCronAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get this week's changes
    const changes = await getWeeklyChanges();

    if (changes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes this week, skipping digest',
        sent: 0,
        changes: 0,
      });
    }

    // Get all active subscribers
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribers to send to',
        sent: 0,
        changes: changes.length,
      });
    }

    // Send emails in batches to avoid rate limits
    const BATCH_SIZE = 50;
    const DELAY_MS = 1000;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (subscriber) => {
          const html = generateWeeklyDigestHtml(changes, subscriber.unsubscribe_token);
          const text = generateWeeklyDigestText(changes, subscriber.unsubscribe_token);

          return sendEmail({
            to: subscriber.email,
            subject: `Weekly Bestseller Updates: ${changes.length} New #1 Products`,
            html,
            text,
          });
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          sent++;
        } else {
          failed++;
        }
      });

      // Delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest sent`,
      sent,
      failed,
      changes: changes.length,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    logger.error('Weekly digest error', error instanceof Error ? error : undefined, {
      errorString: String(error),
    });
    return NextResponse.json(
      { error: 'Failed to send weekly digest' },
      { status: 500 }
    );
  }
}
