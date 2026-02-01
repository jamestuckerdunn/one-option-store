import { PostContent, PostResult } from './types';
import { logger } from '../logger';

/**
 * Facebook Graph API integration.
 * Posts to a Facebook Page.
 *
 * Requires META_ACCESS_TOKEN and META_PAGE_ID environment variables.
 * The access token must have pages_manage_posts permission.
 */

/** Facebook Graph API version - update as needed for new features */
const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 30000;

interface FacebookConfig {
  accessToken: string;
  pageId: string;
}

function getConfig(): FacebookConfig | null {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;

  if (!accessToken || !pageId) {
    return null;
  }

  return { accessToken, pageId };
}

/**
 * Post to a Facebook Page.
 * @param content - The post content including text and optional link
 * @returns PostResult indicating success/failure with optional post URL
 */
export async function postToFacebook(content: PostContent): Promise<PostResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      platform: 'facebook',
      error: 'Facebook API credentials not configured',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${GRAPH_API_URL}/${config.pageId}/feed`;

    const params = new URLSearchParams({
      access_token: config.accessToken,
      message: content.text,
    });

    if (content.link) {
      params.append('link', content.link);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Facebook API error', undefined, { status: response.status, errorText });
      return {
        success: false,
        platform: 'facebook',
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    // Safely access nested properties with null checks
    const postId = data && typeof data === 'object' ? String(data.id || '') : undefined;

    return {
      success: true,
      platform: 'facebook',
      postId: postId || undefined,
      postUrl: postId ? `https://facebook.com/${postId}` : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Facebook post error', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      platform: 'facebook',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Post a photo with caption to Facebook.
 * Falls back to text-only post if no image URL provided.
 * @param content - The post content including text and optional imageUrl
 * @returns PostResult indicating success/failure with optional post URL
 */
export async function postPhotoToFacebook(content: PostContent): Promise<PostResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      platform: 'facebook',
      error: 'Facebook API credentials not configured',
    };
  }

  if (!content.imageUrl) {
    return postToFacebook(content);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${GRAPH_API_URL}/${config.pageId}/photos`;

    const params = new URLSearchParams({
      access_token: config.accessToken,
      url: content.imageUrl,
      caption: content.text,
    });

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Facebook photo API error', undefined, { status: response.status, errorText });
      return {
        success: false,
        platform: 'facebook',
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    // Safely access nested properties with null checks
    const postId = data && typeof data === 'object'
      ? String(data.post_id || data.id || '')
      : undefined;

    return {
      success: true,
      platform: 'facebook',
      postId: postId || undefined,
      postUrl: postId ? `https://facebook.com/${postId}` : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Facebook photo post error', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      platform: 'facebook',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if Facebook integration is configured.
 */
export function isFacebookConfigured(): boolean {
  return getConfig() !== null;
}
