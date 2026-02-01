import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/db';
import { validateSearchQuery } from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/constants';
import { logger } from '@/lib/logger';

/**
 * GET /api/search?q=<query>
 * Search products, categories, and departments by query string.
 * Returns results grouped by type for autocomplete functionality.
 */
export async function GET(request: NextRequest) {
  // Rate limiting for search endpoint
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`search:${clientId}`, RATE_LIMITS.SEARCH);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many search requests. Please slow down.' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMITS.SEARCH),
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('q');

  // Validate and sanitize search query
  const query = validateSearchQuery(rawQuery || '', 200);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { products: [], categories: [], departments: [] },
      { status: 200 }
    );
  }

  try {
    const results = await searchProducts(query, 5);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    logger.error('Search error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
