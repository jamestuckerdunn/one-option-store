import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyChanges } from '@/lib/db/bestseller-changes';
import { logSocialPost, wasProductPostedRecently } from '@/lib/db/social-posts';
import {
  postProductToAllPlatforms,
  getConfiguredPlatforms,
  ProductPostData,
} from '@/lib/social';
import { isCronAuthorized } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { AMAZON_ASSOCIATE_TAG } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/social-post
 * Post bestseller changes to configured social media platforms.
 *
 * Can be triggered:
 * - By cron job on a schedule
 * - Manually via admin
 *
 * Requires CRON_SECRET authorization in production.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret using timing-safe comparison
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configuredPlatforms = getConfiguredPlatforms();

    if (configuredPlatforms.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No social media platforms configured',
        platforms: [],
        posted: 0,
      });
    }

    // Get recent bestseller changes (last 24 hours for daily posting)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);

    const changes = await getWeeklyChanges();
    const recentChanges = changes.filter(
      (c) => c.changed_at >= startDate && c.changed_at <= endDate
    );

    if (recentChanges.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new bestsellers to post',
        platforms: configuredPlatforms,
        posted: 0,
      });
    }

    const affiliateTag = AMAZON_ASSOCIATE_TAG;
    const results: Array<{
      product: string;
      platforms: Array<{ platform: string; success: boolean; postUrl?: string }>;
    }> = [];

    // Post up to 5 products to avoid rate limits
    const productsToPost = recentChanges.slice(0, 5);

    for (const change of productsToPost) {
      // Check if already posted recently
      const alreadyPosted = await wasProductPostedRecently(
        change.new_product_id,
        configuredPlatforms[0],
        24
      );

      if (alreadyPosted) {
        continue;
      }

      const productData: ProductPostData = {
        productName: change.new_product_name,
        categoryName: change.category_name,
        departmentName: change.department_name,
        price: change.new_product_price,
        imageUrl: change.new_product_image,
        asin: change.new_product_asin,
        affiliateUrl: `https://amazon.com/dp/${change.new_product_asin}?tag=${affiliateTag}`,
      };

      const postResults = await postProductToAllPlatforms(productData, true);

      // Log results to database
      for (const result of postResults) {
        await logSocialPost({
          platform: result.platform,
          content: `New #1 in ${change.category_name}: ${change.new_product_name.slice(0, 100)}`,
          productId: change.new_product_id,
          categoryId: change.category_id,
          postUrl: result.postUrl,
          postId: result.postId,
          status: result.success ? 'posted' : 'failed',
          errorMessage: result.error,
        });
      }

      results.push({
        product: change.new_product_name.slice(0, 50),
        platforms: postResults.map((r) => ({
          platform: r.platform,
          success: r.success,
          postUrl: r.postUrl,
        })),
      });

      // Add delay between products to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      message: `Posted ${results.length} products to social media`,
      platforms: configuredPlatforms,
      results,
    });
  } catch (error) {
    logger.error('Social posting error', error instanceof Error ? error : undefined, {
      errorString: String(error),
    });
    return NextResponse.json(
      { error: 'Failed to post to social media' },
      { status: 500 }
    );
  }
}
