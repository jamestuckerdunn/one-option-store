/**
 * Application-wide constants.
 * Centralized configuration to avoid hardcoded values throughout the codebase.
 *
 * FALLBACK VALUES NOTE:
 * Some constants have hardcoded fallback values for development convenience.
 * In production, these should always come from environment variables.
 * - SITE_URL: Fallback to oneoptionstore.com for local development
 * - AMAZON_BASE_URL: Fallback to amazon.com (standard)
 * - AMAZON_ASSOCIATE_TAG: Fallback to development affiliate tag
 */

/** Site metadata */
export const SITE_NAME = 'One Option Store';
export const SITE_DESCRIPTION = 'The best choice is no choice. Only the #1 bestseller from every Amazon category.';
export const SITE_TAGLINE = 'The best choice is no choice.';

/**
 * Site URL - uses environment variable in production.
 * FALLBACK: 'https://oneoptionstore.com' for development
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneoptionstore.com';

/**
 * Amazon base URL for product links.
 * FALLBACK: 'https://www.amazon.com' (standard US Amazon)
 */
export const AMAZON_BASE_URL = process.env.NEXT_PUBLIC_AMAZON_URL || 'https://www.amazon.com';

/**
 * Amazon Associates affiliate tag for commission tracking.
 * IMPORTANT: Set AMAZON_ASSOCIATE_TAG in production environment.
 * FALLBACK: 'jtuckerdunn01-20' for development testing
 */
export const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'jtuckerdunn01-20';

/** Social media handles */
export const SOCIAL_HANDLES = {
  TWITTER: '@oneoptionstore',
  INSTAGRAM: '@oneoptionstore',
  FACEBOOK: 'oneoptionstore',
} as const;

/** UI Constants */
export const ITEMS_PER_PAGE = 20;
export const MAX_SEARCH_RESULTS = 10;
export const NEWSLETTER_BATCH_SIZE = 50;

/** Cache durations (in seconds) */
export const CACHE_DURATION = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
} as const;

/** Default placeholder values */
export const PLACEHOLDER = {
  IMAGE_ALT: 'Product image',
  PRICE: 'Check price',
  NO_RATING: 'No rating available',
} as const;

/** Email configuration */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'One Option <newsletter@oneoptionstore.com>';

/** API rate limiting */
export const RATE_LIMITS = {
  SEARCH: { windowMs: 60_000, maxRequests: 30 },      // 30 requests per minute
  SUBSCRIBE: { windowMs: 3600_000, maxRequests: 5 },  // 5 requests per hour
  GENERAL: { windowMs: 60_000, maxRequests: 100 },    // 100 requests per minute
} as const;
