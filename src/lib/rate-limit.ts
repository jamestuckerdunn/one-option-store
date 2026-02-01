/**
 * In-memory rate limiting utility.
 * Prevents abuse of API endpoints.
 *
 * Note: This implementation uses in-memory storage which works well for
 * single-instance deployments. For multi-instance deployments, consider
 * using Redis or a similar distributed cache.
 */

import { RATE_LIMITS } from './constants';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// In-memory store for rate limit tracking
const store = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Schedule periodic cleanup of expired entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  // If no entry or entry has expired, create new entry
  if (!entry || entry.resetTime < now) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const rateLimiters = {
  /**
   * Rate limit for search endpoint.
   */
  search: (identifier: string) => checkRateLimit(identifier, RATE_LIMITS.SEARCH),

  /**
   * Rate limit for newsletter subscription.
   */
  subscribe: (identifier: string) => checkRateLimit(identifier, RATE_LIMITS.SUBSCRIBE),

  /**
   * General rate limit for API endpoints.
   */
  general: (identifier: string) => checkRateLimit(identifier, RATE_LIMITS.GENERAL),
} as const;

/** IPv4 address validation regex */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/** IPv6 address validation (simplified) */
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:){0,6}::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/;

/**
 * Validates an IP address format (IPv4 or IPv6).
 * @param ip - The IP address to validate
 * @returns True if valid IP format
 */
function isValidIP(ip: string): boolean {
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
}

/**
 * Get client identifier from request headers.
 * Uses X-Forwarded-For for proxied requests, falls back to a default.
 *
 * SECURITY: Validates IP format to prevent header spoofing attacks.
 * Only trusts X-Forwarded-For when behind a trusted proxy.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Get the first IP in the chain (client IP)
    const clientIp = forwarded.split(',')[0].trim();
    // Validate IP format to prevent header spoofing
    if (isValidIP(clientIp)) {
      return clientIp;
    }
    // If invalid format, use a hash to still rate limit but safely
    return `invalid-xff-${clientIp.slice(0, 20).replace(/[^a-zA-Z0-9.-]/g, '')}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    if (isValidIP(realIp)) {
      return realIp;
    }
    return `invalid-xri-${realIp.slice(0, 20).replace(/[^a-zA-Z0-9.-]/g, '')}`;
  }

  // Fallback (shouldn't happen in production with a proper proxy)
  return 'unknown';
}

/**
 * Create rate limit headers for response.
 */
export function createRateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>,
  config: RateLimitConfig
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000 + result.resetIn / 1000)),
  };
}
