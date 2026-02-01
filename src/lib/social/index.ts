/**
 * Social media posting orchestrator.
 * Coordinates posting across all configured platforms.
 */

import { Platform, PostResult, ProductPostData } from './types';
import { postToTwitter, isTwitterConfigured } from './twitter';
import { postToFacebook, isFacebookConfigured, postPhotoToFacebook } from './facebook';
import { postToInstagram, isInstagramConfigured } from './instagram';
import { postToTikTok, isTikTokConfigured } from './tiktok';
import {
  generateTwitterPost,
  generateFacebookPost,
  generateInstagramPost,
  generateTikTokPost,
} from './templates';
import { logger } from '../logger';

export * from './types';
export * from './templates';

/**
 * Get list of configured social media platforms.
 */
export function getConfiguredPlatforms(): Platform[] {
  const platforms: Platform[] = [];

  if (isTwitterConfigured()) platforms.push('twitter');
  if (isFacebookConfigured()) platforms.push('facebook');
  if (isInstagramConfigured()) platforms.push('instagram');
  if (isTikTokConfigured()) platforms.push('tiktok');

  return platforms;
}

/**
 * Post a product announcement to all configured platforms.
 */
export async function postProductToAllPlatforms(
  product: ProductPostData,
  isNewBestseller: boolean = true
): Promise<PostResult[]> {
  const results: PostResult[] = [];
  const platforms = getConfiguredPlatforms();

  if (platforms.length === 0) {
    logger.info('No social media platforms configured');
    return results;
  }

  // Post to each configured platform
  const postPromises: Promise<PostResult>[] = [];

  if (platforms.includes('twitter')) {
    const twitterText = generateTwitterPost(product, isNewBestseller);
    postPromises.push(postToTwitter({ text: twitterText, link: product.affiliateUrl }));
  }

  if (platforms.includes('facebook')) {
    const facebookText = generateFacebookPost(product, isNewBestseller);
    if (product.imageUrl) {
      postPromises.push(
        postPhotoToFacebook({
          text: facebookText,
          imageUrl: product.imageUrl,
          link: product.affiliateUrl,
        })
      );
    } else {
      postPromises.push(
        postToFacebook({
          text: facebookText,
          link: product.affiliateUrl,
        })
      );
    }
  }

  if (platforms.includes('instagram')) {
    const instagramText = generateInstagramPost(product, isNewBestseller);
    postPromises.push(
      postToInstagram({
        text: instagramText,
        imageUrl: product.imageUrl || undefined,
      })
    );
  }

  if (platforms.includes('tiktok')) {
    const tiktokText = generateTikTokPost(product, isNewBestseller);
    postPromises.push(postToTikTok({ text: tiktokText }));
  }

  // Execute all posts in parallel
  const settledResults = await Promise.allSettled(postPromises);

  settledResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      logger.error('Social post failed', result.reason instanceof Error ? result.reason : undefined, {
        reason: String(result.reason),
      });
    }
  });

  return results;
}

/**
 * Post to a specific platform.
 */
export async function postToPlatform(
  platform: Platform,
  product: ProductPostData,
  isNewBestseller: boolean = true
): Promise<PostResult> {
  switch (platform) {
    case 'twitter': {
      const text = generateTwitterPost(product, isNewBestseller);
      return postToTwitter({ text, link: product.affiliateUrl });
    }
    case 'facebook': {
      const text = generateFacebookPost(product, isNewBestseller);
      if (product.imageUrl) {
        return postPhotoToFacebook({ text, imageUrl: product.imageUrl, link: product.affiliateUrl });
      }
      return postToFacebook({ text, link: product.affiliateUrl });
    }
    case 'instagram': {
      const text = generateInstagramPost(product, isNewBestseller);
      return postToInstagram({ text, imageUrl: product.imageUrl || undefined });
    }
    case 'tiktok': {
      const text = generateTikTokPost(product, isNewBestseller);
      return postToTikTok({ text });
    }
    default:
      return {
        success: false,
        platform,
        error: `Unknown platform: ${platform}`,
      };
  }
}
