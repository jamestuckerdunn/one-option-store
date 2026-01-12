/**
 * Input validation utilities for security.
 */

/** Valid characters for URL slugs */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Amazon ASIN format (10 alphanumeric characters) */
const ASIN_REGEX = /^[A-Z0-9]{10}$/;

/**
 * Validates a URL slug format.
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && slug.length <= 100;
}

/**
 * Validates an Amazon ASIN format.
 * @param asin - The ASIN to validate
 * @returns True if valid ASIN format
 */
export function isValidAsin(asin: string): boolean {
  return ASIN_REGEX.test(asin);
}

/**
 * Sanitizes a string for safe display.
 * Removes potential XSS vectors while preserving normal text.
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);
}

/**
 * Validates that a URL is a safe Amazon URL.
 * @param url - The URL to validate
 * @returns True if the URL is a valid Amazon URL
 */
export function isValidAmazonUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('amazon.com') && parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
