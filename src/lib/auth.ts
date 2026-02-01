/**
 * Authentication utilities with timing-safe comparisons.
 * Prevents timing attacks on authentication checks.
 */

import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Performs a timing-safe string comparison.
 * Returns false if strings have different lengths (but still takes constant time).
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  // Pad to same length to prevent timing attacks on length
  const maxLength = Math.max(aBuffer.length, bBuffer.length);
  const aPadded = Buffer.alloc(maxLength);
  const bPadded = Buffer.alloc(maxLength);

  aBuffer.copy(aPadded);
  bBuffer.copy(bPadded);

  // Timing-safe comparison
  const equal = timingSafeEqual(aPadded, bPadded);

  // Also check original lengths match
  return equal && aBuffer.length === bBuffer.length;
}

/**
 * Verify admin authorization from request headers.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * SECURITY: All checks go through timing-safe comparison to prevent
 * timing attacks from revealing valid credentials.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const adminSecret = process.env.ADMIN_SECRET;

  // SECURITY: In development without ADMIN_SECRET, require explicit dev token
  // to prevent accidental exposure of admin endpoints
  if (!adminSecret) {
    if (process.env.NODE_ENV !== 'production') {
      // In dev mode, require a dev token OR ADMIN_SECRET
      const devToken = 'Bearer dev-admin-token';
      console.warn('[AUTH] ADMIN_SECRET not set. Using dev token authentication.');
      return timingSafeCompare(authHeader, devToken);
    }
    return false;
  }

  const expectedToken = `Bearer ${adminSecret}`;
  // Always perform timing-safe comparison even if authHeader is empty
  // to prevent timing attacks based on early returns
  return timingSafeCompare(authHeader, expectedToken);
}

/**
 * Verify cron job authorization from request headers.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * SECURITY: All checks go through timing-safe comparison to prevent
 * timing attacks from revealing valid credentials.
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: In development without CRON_SECRET, require explicit dev token
  // to prevent accidental exposure of cron endpoints
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') {
      // In dev mode, require a dev token OR CRON_SECRET
      const devToken = 'Bearer dev-cron-token';
      console.warn('[AUTH] CRON_SECRET not set. Using dev token authentication.');
      return timingSafeCompare(authHeader, devToken);
    }
    return false;
  }

  const expectedToken = `Bearer ${cronSecret}`;
  // Always perform timing-safe comparison even if authHeader is empty
  // to prevent timing attacks based on early returns
  return timingSafeCompare(authHeader, expectedToken);
}
