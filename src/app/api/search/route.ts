import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/db';

/**
 * GET /api/search?q=<query>
 * Search products, categories, and departments by query string.
 * Returns results grouped by type for autocomplete functionality.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { products: [], categories: [], departments: [] },
      { status: 200 }
    );
  }

  try {
    const results = await searchProducts(query.trim(), 5);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
