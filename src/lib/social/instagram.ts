import { PostContent, PostResult } from './types';
import { logger } from '../logger';

/**
 * Instagram Graph API integration (via Meta Business).
 * Requires a linked Facebook Page and Instagram Business Account.
 *
 * Note: Instagram API requires images to be publicly accessible URLs.
 * For products without accessible images, posting will be skipped.
 *
 * Requires META_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID environment variables.
 */

/** Instagram Graph API version - update as needed for new features */
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 30000;

interface InstagramConfig {
  accessToken: string;
  accountId: string;
}

function getConfig(): InstagramConfig | null {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    return null;
  }

  return { accessToken, accountId };
}

/**
 * Post an image with caption to Instagram.
 * Instagram requires an image for all feed posts.
 *
 * This is a two-step process:
 * 1. Create a media container with the image URL and caption
 * 2. Publish the container to make it visible
 *
 * @param content - The post content including text and required imageUrl
 * @returns PostResult indicating success/failure with optional post URL
 */
export async function postToInstagram(content: PostContent): Promise<PostResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Instagram API credentials not configured',
    };
  }

  if (!content.imageUrl) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Instagram requires an image URL for posts',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // Step 1: Create media container
    const containerUrl = `${GRAPH_API_URL}/${config.accountId}/media`;
    const containerParams = new URLSearchParams({
      access_token: config.accessToken,
      image_url: content.imageUrl,
      caption: content.text,
    });

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      body: containerParams,
      signal: controller.signal,
    });

    if (!containerResponse.ok) {
      clearTimeout(timeoutId);
      const errorText = await containerResponse.text();
      logger.error('Instagram container API error', undefined, { status: containerResponse.status, errorText });
      return {
        success: false,
        platform: 'instagram',
        error: `Container creation failed: ${containerResponse.status}`,
      };
    }

    const containerData = await containerResponse.json();
    const containerId = containerData && typeof containerData === 'object'
      ? String(containerData.id || '')
      : undefined;

    if (!containerId) {
      clearTimeout(timeoutId);
      return {
        success: false,
        platform: 'instagram',
        error: 'Failed to create media container',
      };
    }

    // Step 2: Publish the container
    const publishUrl = `${GRAPH_API_URL}/${config.accountId}/media_publish`;
    const publishParams = new URLSearchParams({
      access_token: config.accessToken,
      creation_id: containerId,
    });

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      body: publishParams,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      logger.error('Instagram publish API error', undefined, { status: publishResponse.status, errorText });
      return {
        success: false,
        platform: 'instagram',
        error: `Publish failed: ${publishResponse.status}`,
      };
    }

    const publishData = await publishResponse.json();
    const postId = publishData && typeof publishData === 'object'
      ? String(publishData.id || '')
      : undefined;

    return {
      success: true,
      platform: 'instagram',
      postId: postId || undefined,
      postUrl: postId ? `https://instagram.com/p/${postId}` : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Instagram post error', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      platform: 'instagram',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if Instagram integration is configured.
 */
export function isInstagramConfigured(): boolean {
  return getConfig() !== null;
}
