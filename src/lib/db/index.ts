import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Types
export interface Department {
  id: string;
  name: string;
  slug: string;
  amazon_node_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  department_id: string | null;
  parent_category_id: string | null;
  name: string;
  slug: string;
  full_slug: string;
  amazon_url: string | null;
  depth: number;
  created_at: string;
}

export interface Product {
  id: string;
  asin: string;
  name: string;
  price: number | null;
  image_url: string | null;
  amazon_url: string;
  rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface BestsellerRanking {
  id: string;
  product_id: string | null;
  category_id: string | null;
  became_number_one_at: string;
  is_current: boolean;
}

// Extended types with joins
export interface ProductWithRanking extends Product {
  categories?: Category[];
}

// Lazy-load database connection
let _sql: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

// Query helpers
export async function getDepartments(): Promise<Department[]> {
  const sql = getDb();
  const result = await sql`SELECT * FROM departments ORDER BY sort_order, name`;
  return result as Department[];
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  const sql = getDb();
  const result = await sql`SELECT * FROM departments WHERE slug = ${slug} LIMIT 1`;
  return (result as Department[])[0] || null;
}

export async function getCategoriesByDepartment(departmentId: string): Promise<Category[]> {
  const sql = getDb();
  const result = await sql`SELECT * FROM categories WHERE department_id = ${departmentId} ORDER BY depth, name`;
  return result as Category[];
}

export async function getCategoryByFullSlug(fullSlug: string): Promise<Category | null> {
  const sql = getDb();
  const result = await sql`SELECT * FROM categories WHERE full_slug = ${fullSlug} LIMIT 1`;
  return (result as Category[])[0] || null;
}

export async function getProductByAsin(asin: string): Promise<Product | null> {
  const sql = getDb();
  const result = await sql`SELECT * FROM products WHERE asin = ${asin} LIMIT 1`;
  return (result as Product[])[0] || null;
}

export async function getCurrentBestsellers(): Promise<{product: Product; category: Category; department: Department}[]> {
  const sql = getDb();
  const result = await sql`
    SELECT
      p.id as product_id, p.asin, p.name as product_name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count, p.created_at as product_created_at, p.updated_at,
      c.id as category_id, c.name as category_name, c.slug as category_slug, c.full_slug, c.amazon_url as category_amazon_url, c.depth,
      d.id as department_id, d.name as department_name, d.slug as department_slug
    FROM bestseller_rankings br
    JOIN products p ON br.product_id = p.id
    JOIN categories c ON br.category_id = c.id
    JOIN departments d ON c.department_id = d.id
    WHERE br.is_current = true
    ORDER BY d.sort_order, d.name, c.depth, c.name
  `;

  return (result as Record<string, unknown>[]).map(row => ({
    product: {
      id: row.product_id as string,
      asin: row.asin as string,
      name: row.product_name as string,
      price: row.price as number | null,
      image_url: row.image_url as string | null,
      amazon_url: row.amazon_url as string,
      rating: row.rating as number | null,
      review_count: row.review_count as number | null,
      created_at: row.product_created_at as string,
      updated_at: row.updated_at as string,
    },
    category: {
      id: row.category_id as string,
      department_id: row.department_id as string,
      parent_category_id: null,
      name: row.category_name as string,
      slug: row.category_slug as string,
      full_slug: row.full_slug as string,
      amazon_url: row.category_amazon_url as string | null,
      depth: row.depth as number,
      created_at: '',
    },
    department: {
      id: row.department_id as string,
      name: row.department_name as string,
      slug: row.department_slug as string,
      amazon_node_id: null,
      sort_order: 0,
      created_at: '',
    },
  }));
}

export async function getBestsellerForCategory(categoryId: string): Promise<Product | null> {
  const sql = getDb();
  const result = await sql`
    SELECT p.*
    FROM bestseller_rankings br
    JOIN products p ON br.product_id = p.id
    WHERE br.category_id = ${categoryId} AND br.is_current = true
    LIMIT 1
  `;
  return (result as Product[])[0] || null;
}

export async function getCategoriesWithProductsByDepartment(departmentId: string): Promise<(Category & { product: Product | null })[]> {
  const sql = getDb();
  const categories = await sql`
    SELECT c.*,
           p.id as product_id, p.asin, p.name as product_name, p.price, p.image_url,
           p.amazon_url as product_amazon_url, p.rating, p.review_count
    FROM categories c
    LEFT JOIN bestseller_rankings br ON c.id = br.category_id AND br.is_current = true
    LEFT JOIN products p ON br.product_id = p.id
    WHERE c.department_id = ${departmentId}
    ORDER BY c.depth, c.name
  `;

  return (categories as Record<string, unknown>[]).map(row => ({
    id: row.id as string,
    department_id: row.department_id as string | null,
    parent_category_id: row.parent_category_id as string | null,
    name: row.name as string,
    slug: row.slug as string,
    full_slug: row.full_slug as string,
    amazon_url: row.amazon_url as string | null,
    depth: row.depth as number,
    created_at: row.created_at as string,
    product: row.product_id ? {
      id: row.product_id as string,
      asin: row.asin as string,
      name: row.product_name as string,
      price: row.price as number | null,
      image_url: row.image_url as string | null,
      amazon_url: row.product_amazon_url as string,
      rating: row.rating as number | null,
      review_count: row.review_count as number | null,
      created_at: '',
      updated_at: '',
    } : null,
  }));
}

export async function getProductWithCategories(asin: string): Promise<ProductWithRanking | null> {
  const sql = getDb();
  const product = await getProductByAsin(asin);
  if (!product) return null;

  const categories = await sql`
    SELECT c.*
    FROM bestseller_rankings br
    JOIN categories c ON br.category_id = c.id
    WHERE br.product_id = ${product.id} AND br.is_current = true
  `;

  return {
    ...product,
    categories: categories as Category[],
  };
}
