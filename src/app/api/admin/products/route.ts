import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

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
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
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

    type Row = Record<string, unknown>;

    // 1. Upsert department
    const deptResult = await db()`
      INSERT INTO departments (name, slug, sort_order)
      VALUES (${department.name}, ${department.slug}, ${department.sortOrder ?? 0})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        sort_order = COALESCE(EXCLUDED.sort_order, departments.sort_order),
        updated_at = NOW()
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
        department_id = EXCLUDED.department_id,
        updated_at = NOW()
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
      INSERT INTO bestseller_rankings (product_id, category_id, rank, is_current, recorded_at)
      VALUES (${productId}, ${categoryId}, 1, true, NOW())
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
    console.error('Admin product API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save product' },
      { status: 500 }
    );
  }
}

// Also support DELETE to remove all data (for reset)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete all data (in correct order for foreign keys)
    await db()`DELETE FROM bestseller_rankings`;
    await db()`DELETE FROM products`;
    await db()`DELETE FROM categories`;
    await db()`DELETE FROM departments`;

    return NextResponse.json({ success: true, message: 'All data deleted' });
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete data' },
      { status: 500 }
    );
  }
}
