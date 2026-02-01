// Admin API for product management - v2
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAdminAuthorized } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  isJsonContentType,
  isValidAsin,
  isValidSlug,
  isValidAmazonUrl,
  MAX_BODY_SIZES,
} from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/constants';

interface ProductPayload {
  department: {
    name: string;
    slug: string;
    sortOrder?: number;
  };
  category: {
    name: string;
    slug: string;
    fullSlug: string;
  };
  product: {
    asin: string;
    name: string;
    price: number | null;
    imageUrl: string | null;
    amazonUrl: string;
    rating: number | null;
    reviewCount: number | null;
  };
}

let sql: ReturnType<typeof neon> | null = null;

function db() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function POST(request: NextRequest) {
  // Verify authorization using timing-safe comparison
  if (!isAdminAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Rate limiting for admin endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-products-post:${clientId}`, RATE_LIMITS.GENERAL);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMITS.GENERAL),
      }
    );
  }

  // Validate Content-Type
  if (!isJsonContentType(request.headers.get('content-type'))) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }

  // Validate body size
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_SIZES.PRODUCT) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  try {
    const payload: ProductPayload = await request.json();
    const { department, category, product } = payload;

    // Validate required fields
    if (!department?.name || !department?.slug) {
      return NextResponse.json(
        { error: 'Department name and slug are required' },
        { status: 400 }
      );
    }
    if (!category?.name || !category?.slug || !category?.fullSlug) {
      return NextResponse.json(
        { error: 'Category name, slug, and fullSlug are required' },
        { status: 400 }
      );
    }
    if (!product?.asin || !product?.name || !product?.amazonUrl) {
      return NextResponse.json(
        { error: 'Product asin, name, and amazonUrl are required' },
        { status: 400 }
      );
    }

    // Validate ASIN format
    if (!isValidAsin(product.asin)) {
      return NextResponse.json(
        { error: 'Invalid ASIN format' },
        { status: 400 }
      );
    }

    // Validate slug formats
    if (!isValidSlug(department.slug)) {
      return NextResponse.json(
        { error: 'Invalid department slug format' },
        { status: 400 }
      );
    }
    if (!isValidSlug(category.slug)) {
      return NextResponse.json(
        { error: 'Invalid category slug format' },
        { status: 400 }
      );
    }

    // Validate Amazon URL
    if (!isValidAmazonUrl(product.amazonUrl)) {
      return NextResponse.json(
        { error: 'Invalid Amazon URL' },
        { status: 400 }
      );
    }

    type Row = Record<string, unknown>;

    // 1. Upsert department
    const deptResult = await db()`
      INSERT INTO departments (name, slug, sort_order)
      VALUES (${department.name}, ${department.slug}, ${department.sortOrder ?? 0})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        sort_order = COALESCE(EXCLUDED.sort_order, departments.sort_order)
      RETURNING id
    `;
    const deptRows = deptResult as unknown as Row[];
    const departmentId = deptRows[0].id as string;

    // 2. Upsert category
    const catResult = await db()`
      INSERT INTO categories (department_id, name, slug, full_slug)
      VALUES (${departmentId}, ${category.name}, ${category.slug}, ${category.fullSlug})
      ON CONFLICT (full_slug) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        department_id = EXCLUDED.department_id
      RETURNING id
    `;
    const catRows = catResult as unknown as Row[];
    const categoryId = catRows[0].id as string;

    // 3. Upsert product
    const prodResult = await db()`
      INSERT INTO products (asin, name, price, image_url, amazon_url, rating, review_count)
      VALUES (
        ${product.asin},
        ${product.name},
        ${product.price},
        ${product.imageUrl},
        ${product.amazonUrl},
        ${product.rating},
        ${product.reviewCount}
      )
      ON CONFLICT (asin) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url,
        amazon_url = EXCLUDED.amazon_url,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        updated_at = NOW()
      RETURNING id
    `;
    const prodRows = prodResult as unknown as Row[];
    const productId = prodRows[0].id as string;

    // 4. Update bestseller rankings
    // First, mark any existing current ranking for this category as not current
    await db()`
      UPDATE bestseller_rankings
      SET is_current = false
      WHERE category_id = ${categoryId} AND is_current = true
    `;

    // Then insert new ranking
    await db()`
      INSERT INTO bestseller_rankings (product_id, category_id, is_current, became_number_one_at)
      VALUES (${productId}, ${categoryId}, true, NOW())
    `;

    return NextResponse.json({
      success: true,
      data: {
        departmentId,
        categoryId,
        productId,
        product: {
          asin: product.asin,
          name: product.name,
        },
      },
    });
  } catch (error) {
    logger.error('Admin product API error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to save product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * Remove all data (for reset). Requires explicit confirmation.
 *
 * SECURITY: This is a destructive operation. Requires:
 * 1. Admin authorization
 * 2. Explicit confirmation header: X-Confirm-Delete: DELETE_ALL_DATA
 * 3. Rate limited to prevent abuse
 */
export async function DELETE(request: NextRequest) {
  // Verify authorization using timing-safe comparison
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for admin endpoints (stricter for destructive operations)
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-products-delete:${clientId}`, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Only 3 deletes per hour
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many delete requests. Please wait before trying again.' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, { windowMs: 60 * 60 * 1000, maxRequests: 3 }),
      }
    );
  }

  // Require explicit confirmation header to prevent accidental deletion
  const confirmHeader = request.headers.get('x-confirm-delete');
  if (confirmHeader !== 'DELETE_ALL_DATA') {
    return NextResponse.json(
      {
        error: 'Confirmation required',
        message: 'This operation will delete ALL data. Set header X-Confirm-Delete: DELETE_ALL_DATA to confirm.',
      },
      { status: 400 }
    );
  }

  try {
    // Log the destructive action
    logger.warn('Admin initiated full data deletion', {
      clientId,
      timestamp: new Date().toISOString(),
    });

    // Delete all data (in correct order for foreign keys)
    await db()`DELETE FROM bestseller_rankings`;
    await db()`DELETE FROM products`;
    await db()`DELETE FROM categories`;
    await db()`DELETE FROM departments`;

    logger.info('Full data deletion completed');

    return NextResponse.json({
      success: true,
      message: 'All data deleted',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Admin delete error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
