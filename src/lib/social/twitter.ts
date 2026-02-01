import { PostContent, PostResult } from './types';
import crypto from 'crypto';
import { logger } from '../logger';

/**
 * Twitter/X API v2 integration.
 * Uses OAuth 1.0a for authentication.
 */

const TWITTER_API_URL = 'https://api.twitter.com/2/tweets';

/** Fetch timeout in milliseconds */
const FETCH_TIMEOUT_MS = 30000; // 30 seconds

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

function getConfig(): TwitterConfig | null {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null;
  }

  return { apiKey, apiSecret, accessToken, accessSecret };
}

/**
 * Generate OAuth 1.0a signature for Twitter API.
 */
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  config: TwitterConfig
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(config.apiSecret)}&${encodeURIComponent(config.accessSecret)}`;

  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');
}

/**
 * Generate OAuth 1.0a Authorization header.
 */
function generateAuthHeader(method: string, url: string, config: TwitterConfig): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: config.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: config.accessToken,
    oauth_version: '1.0',
  };

  const signature = generateOAuthSignature(method, url, oauthParams, config);
  oauthParams.oauth_signature = signature;

  const headerParams = Object.keys(oauthParams)
    .sort()
    .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParams}`;
}

/**
 * Post a tweet to Twitter/X.
 * Includes timeout handling and proper error logging.
 */
export async function postToTwitter(content: PostContent): Promise<PostResult> {
  const config = getConfig();

  if (!config) {
    return {
      success: false,
      platform: 'twitter',
      error: 'Twitter API credentials not configured',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const authHeader = generateAuthHeader('POST', TWITTER_API_URL, config);

    const response = await fetch(TWITTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content.text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Twitter API error', undefined, { status: response.status, errorText });
      return {
        success: false,
        platform: 'twitter',
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    // Safely access nested properties with null checks
    const tweetId = data && typeof data === 'object' && data.data && typeof data.data === 'object'
      ? String(data.data.id || '')
      : undefined;

    return {
      success: true,
      platform: 'twitter',
      postId: tweetId || undefined,
      postUrl: tweetId ? `https://twitter.com/OneOptionStore/status/${tweetId}` : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Twitter post error', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      platform: 'twitter',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if Twitter integration is configured.
 */
export function isTwitterConfigured(): boolean {
  return getConfig() !== null;
}
