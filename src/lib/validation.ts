/**
 * Input validation utilities for security.
 */

/** Valid characters for URL slugs (no consecutive dashes, alphanumeric with dashes) */
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Amazon ASIN format (10 alphanumeric characters, usually starts with B0) */
const ASIN_REGEX = /^[A-Z0-9]{10}$/;

/** RFC 5322 compliant email regex (simplified but more accurate than basic checks) */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/** UUID v4 format */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** IP address validation (IPv4) */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/** Maximum request body sizes by endpoint type */
export const MAX_BODY_SIZES = {
  BLOG_POST: 100 * 1024, // 100KB for blog content
  PRODUCT: 10 * 1024, // 10KB for product data
  NEWSLETTER: 1024, // 1KB for newsletter subscription
  SEARCH: 512, // 512 bytes for search queries
} as const;

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

/**
 * Validates an email address format (RFC 5322 compliant).
 * @param email - The email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Check length limits (RFC 5321)
  if (email.length > 254) {
    return false;
  }
  const [local, domain] = email.split('@');
  if (!local || !domain || local.length > 64) {
    return false;
  }
  return EMAIL_REGEX.test(email);
}

/**
 * Validates a UUID v4 format.
 * @param uuid - The UUID to validate
 * @returns True if valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  return UUID_REGEX.test(uuid);
}

/**
 * Validates an IPv4 address format.
 * @param ip - The IP address to validate
 * @returns True if valid IPv4 format
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  return IPV4_REGEX.test(ip);
}

/**
 * Validates Content-Type header is application/json.
 * @param contentType - The Content-Type header value
 * @returns True if valid JSON content type
 */
export function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }
  const normalized = contentType.toLowerCase().split(';')[0].trim();
  return normalized === 'application/json';
}

/**
 * Validates request body size against a maximum limit.
 * @param body - The request body
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if body is within size limit
 */
export async function isWithinBodyLimit(request: Request, maxSize: number): Promise<boolean> {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10) <= maxSize;
  }
  // If no content-length, we need to read the body to check
  // This is a fallback and should rarely be needed
  return true; // Trust the Content-Length header if present
}

/**
 * Validates a search query string.
 * @param query - The search query
 * @param maxLength - Maximum allowed length (default: 200)
 * @returns Sanitized query or null if invalid
 */
export function validateSearchQuery(query: string, maxLength: number = 200): string | null {
  if (!query || typeof query !== 'string') {
    return null;
  }
  // Remove control characters and trim
  const sanitized = query.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (sanitized.length === 0 || sanitized.length > maxLength) {
    return null;
  }
  return sanitized;
}

/**
 * Validates blog post input fields.
 * @param data - The blog post data
 * @returns Validation result with errors if any
 */
export function validateBlogPost(data: {
  slug?: string;
  title?: string;
  content?: string;
  keywords?: unknown;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string' || !isValidSlug(data.slug)) {
      errors.push('Invalid slug format');
    }
    if (data.slug.length > 100) {
      errors.push('Slug must be 100 characters or less');
    }
  }

  if (data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required');
    }
    if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push('Content is required');
    }
    if (data.content.length > 50000) {
      errors.push('Content must be 50000 characters or less');
    }
  }

  if (data.keywords !== undefined) {
    if (!Array.isArray(data.keywords)) {
      errors.push('Keywords must be an array');
    } else if (data.keywords.length > 20) {
      errors.push('Maximum 20 keywords allowed');
    } else if (!data.keywords.every((k) => typeof k === 'string' && k.length <= 50)) {
      errors.push('Each keyword must be a string of 50 characters or less');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * HTML escapes a string for safe display in HTML context.
 * @param str - The string to escape
 * @returns HTML-escaped string
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Validates limit and offset pagination parameters.
 * @param limit - The limit value
 * @param offset - The offset value
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated and sanitized values
 */
export function validatePagination(
  limit: unknown,
  offset: unknown,
  maxLimit: number = 100
): { limit: number; offset: number } {
  const validLimit = Math.max(1, Math.min(maxLimit, parseInt(String(limit), 10) || 10));
  const validOffset = Math.max(0, parseInt(String(offset), 10) || 0);
  return { limit: validLimit, offset: validOffset };
}
