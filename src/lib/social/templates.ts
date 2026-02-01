import { ProductPostData } from './types';

/**
 * Post templates for social media content.
 * Varies templates to avoid repetition.
 */

/** Maximum length for hashtag slugs */
const MAX_HASHTAG_LENGTH = 30;

/** Twitter character limit */
const TWITTER_CHAR_LIMIT = 280;

/** Reserved characters for Twitter link (t.co shortens to 23 chars) */
const TWITTER_LINK_RESERVED = 25;

/** Maximum product name length for templates (keeps posts concise) */
const MAX_PRODUCT_NAME_LENGTH = 100;

/** Shorter product name length for Twitter (due to character limits) */
const TWITTER_PRODUCT_NAME_LENGTH = 80;

const NEW_BESTSELLER_TEMPLATES = [
  (p: ProductPostData) =>
    `New #1 in ${p.categoryName}! ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}${p.price ? ` - $${p.price.toFixed(2)}` : ''}`,
  (p: ProductPostData) =>
    `This just became Amazon's #1 bestseller in ${p.categoryName}: ${p.productName.slice(0, TWITTER_PRODUCT_NAME_LENGTH)}`,
  (p: ProductPostData) =>
    `The new top pick in ${p.categoryName} is here! ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}`,
  (p: ProductPostData) =>
    `Bestseller alert! ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)} is now #1 in ${p.categoryName}`,
  (p: ProductPostData) =>
    `Amazon's new #1 in ${p.categoryName}: ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}`,
];

const TRENDING_TEMPLATES = [
  (p: ProductPostData) =>
    `Trending in ${p.departmentName}: ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}${p.price ? ` ($${p.price.toFixed(2)})` : ''}`,
  (p: ProductPostData) =>
    `Top pick: ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)} - #1 in ${p.categoryName}`,
  (p: ProductPostData) =>
    `Still the bestseller in ${p.categoryName}: ${p.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}`,
];

/**
 * Generate hashtags for a product post.
 * @param product - Product data for hashtag generation
 * @returns Array of hashtag strings (without # prefix)
 */
export function generateHashtags(product: ProductPostData): string[] {
  const hashtags = [
    'bestseller',
    'amazon',
    'toprated',
  ];

  // Add category-based hashtags (limited to MAX_HASHTAG_LENGTH to avoid issues)
  const categorySlug = product.categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, MAX_HASHTAG_LENGTH);

  if (categorySlug && categorySlug.length > 2) {
    hashtags.push(categorySlug);
  }

  // Add department-based hashtags
  const deptSlug = product.departmentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, MAX_HASHTAG_LENGTH);

  if (deptSlug && deptSlug.length > 2 && deptSlug !== categorySlug) {
    hashtags.push(deptSlug);
  }

  return hashtags;
}

/**
 * Generate a post for a new bestseller announcement.
 */
export function generateNewBestsellerPost(product: ProductPostData): string {
  const template = NEW_BESTSELLER_TEMPLATES[Math.floor(Math.random() * NEW_BESTSELLER_TEMPLATES.length)];
  const text = template(product);
  const hashtags = generateHashtags(product);

  return `${text}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;
}

/**
 * Generate a post for trending/featured products.
 */
export function generateTrendingPost(product: ProductPostData): string {
  const template = TRENDING_TEMPLATES[Math.floor(Math.random() * TRENDING_TEMPLATES.length)];
  const text = template(product);
  const hashtags = generateHashtags(product);

  return `${text}\n\n${hashtags.map(h => `#${h}`).join(' ')}`;
}

/**
 * Generate Twitter-specific post (shorter, with link).
 * @param product - Product data for the post
 * @param isNew - Whether this is a new bestseller (vs. trending)
 * @returns Formatted tweet text within character limits
 */
export function generateTwitterPost(product: ProductPostData, isNew: boolean = true): string {
  const baseText = isNew
    ? `New #1 in ${product.categoryName}! ${product.productName.slice(0, TWITTER_PRODUCT_NAME_LENGTH)}${product.productName.length > TWITTER_PRODUCT_NAME_LENGTH ? '...' : ''}`
    : `Top pick in ${product.categoryName}: ${product.productName.slice(0, TWITTER_PRODUCT_NAME_LENGTH)}${product.productName.length > TWITTER_PRODUCT_NAME_LENGTH ? '...' : ''}`;

  const hashtags = generateHashtags(product).slice(0, 3);
  const hashtagString = hashtags.map(h => `#${h}`).join(' ');

  // Calculate max text length accounting for link and hashtags
  // TWITTER_LINK_RESERVED accounts for t.co shortening (23 chars) plus spacing
  const maxTextLength = TWITTER_CHAR_LIMIT - TWITTER_LINK_RESERVED - hashtagString.length - 2;
  const truncatedText = baseText.slice(0, maxTextLength);

  return `${truncatedText}\n\n${product.affiliateUrl}\n\n${hashtagString}`;
}

/**
 * Generate Instagram-specific post (longer, more hashtags).
 */
export function generateInstagramPost(product: ProductPostData, isNew: boolean = true): string {
  const intro = isNew
    ? `New #1 Bestseller Alert!`
    : `Featured Bestseller`;

  const price = product.price ? `$${product.price.toFixed(2)}` : 'Check link for price';

  const hashtags = [
    ...generateHashtags(product),
    'shopping',
    'deals',
    'musthave',
    'trending',
    'productreview',
  ];

  return `${intro}

${product.productName}

Category: ${product.categoryName}
Price: ${price}

Link in bio to shop this bestseller!

${hashtags.map(h => `#${h}`).join(' ')}`;
}

/**
 * Generate Facebook-specific post (conversational).
 */
export function generateFacebookPost(product: ProductPostData, isNew: boolean = true): string {
  const intro = isNew
    ? `This product just became Amazon's #1 bestseller in ${product.categoryName}!`
    : `Check out this top-rated product in ${product.categoryName}:`;

  const price = product.price ? `Price: $${product.price.toFixed(2)}` : '';

  return `${intro}

${product.productName}

${price}

Shop now: ${product.affiliateUrl}

#bestseller #amazon #${product.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
}

/**
 * Generate TikTok-specific post (casual, engaging).
 * @param product - Product data for the post
 * @param isNew - Whether this is a new bestseller (vs. trending)
 * @returns Formatted TikTok caption
 */
export function generateTikTokPost(product: ProductPostData, isNew: boolean = true): string {
  const intro = isNew
    ? `This is now the #1 bestseller in ${product.categoryName}`
    : `Still the top pick in ${product.categoryName}`;

  const hashtags = [
    'tiktokmademebuyit',
    'amazonfinds',
    'bestseller',
    ...generateHashtags(product).slice(0, 2),
  ];

  return `${intro}

${product.productName.slice(0, MAX_PRODUCT_NAME_LENGTH)}

Link in bio!

${hashtags.map(h => `#${h}`).join(' ')}`;
}
