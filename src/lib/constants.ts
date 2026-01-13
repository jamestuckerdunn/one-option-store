/**
 * Application-wide constants
 */

/** Site metadata */
export const SITE_NAME = 'One Option Store';
export const SITE_DESCRIPTION = 'The best choice is no choice. Only the #1 bestseller from every Amazon category.';
export const SITE_TAGLINE = 'The best choice is no choice.';

/** External URLs */
export const AMAZON_BASE_URL = 'https://www.amazon.com';

/** UI Constants */
export const ITEMS_PER_PAGE = 20;

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
