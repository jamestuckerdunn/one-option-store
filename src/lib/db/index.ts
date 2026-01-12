import { neon } from '@neondatabase/serverless';

// Database types
export interface Department {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Category {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  full_slug: string;
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
}

export interface Bestseller {
  product: Product;
  category: Category;
  department: Department;
}

type Row = Record<string, unknown>;

// Lazy database connection
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

// Department queries
export async function getDepartments(): Promise<Department[]> {
  const result = await db()`
    SELECT id, name, slug, sort_order
    FROM departments
    ORDER BY sort_order, name
  `;
  return result as unknown as Department[];
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  const result = await db()`
    SELECT id, name, slug, sort_order
    FROM departments
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? (rows[0] as unknown as Department) : null;
}

// Category queries
export async function getCategoriesByDepartment(departmentId: string): Promise<Category[]> {
  const result = await db()`
    SELECT id, department_id, name, slug, full_slug
    FROM categories
    WHERE department_id = ${departmentId}
    ORDER BY name
  `;
  return result as unknown as Category[];
}

export async function getCategoryBySlug(fullSlug: string): Promise<Category | null> {
  const result = await db()`
    SELECT id, department_id, name, slug, full_slug
    FROM categories
    WHERE full_slug = ${fullSlug}
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? (rows[0] as unknown as Category) : null;
}

// Product queries
export async function getProductByAsin(asin: string): Promise<Product | null> {
  const result = await db()`
    SELECT id, asin, name, price, image_url, amazon_url, rating, review_count
    FROM products
    WHERE asin = ${asin}
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? (rows[0] as unknown as Product) : null;
}

// Bestseller queries
export async function getBestsellers(): Promise<Bestseller[]> {
  const result = await db()`
    SELECT
      p.id, p.asin, p.name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count,
      c.id as cat_id, c.department_id, c.name as cat_name, c.slug as cat_slug, c.full_slug,
      d.id as dept_id, d.name as dept_name, d.slug as dept_slug, d.sort_order
    FROM bestseller_rankings br
    JOIN products p ON br.product_id = p.id
    JOIN categories c ON br.category_id = c.id
    JOIN departments d ON c.department_id = d.id
    WHERE br.is_current = true
    ORDER BY d.sort_order, c.name
  `;
  const rows = result as unknown as Row[];

  return rows.map((r) => ({
    product: {
      id: String(r.id),
      asin: String(r.asin),
      name: String(r.name),
      price: r.price as number | null,
      image_url: r.image_url as string | null,
      amazon_url: String(r.amazon_url),
      rating: r.rating as number | null,
      review_count: r.review_count as number | null,
    },
    category: {
      id: String(r.cat_id),
      department_id: String(r.department_id),
      name: String(r.cat_name),
      slug: String(r.cat_slug),
      full_slug: String(r.full_slug),
    },
    department: {
      id: String(r.dept_id),
      name: String(r.dept_name),
      slug: String(r.dept_slug),
      sort_order: Number(r.sort_order),
    },
  }));
}

export async function getBestsellerByCategory(categoryId: string): Promise<Product | null> {
  const result = await db()`
    SELECT p.id, p.asin, p.name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count
    FROM bestseller_rankings br
    JOIN products p ON br.product_id = p.id
    WHERE br.category_id = ${categoryId} AND br.is_current = true
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? (rows[0] as unknown as Product) : null;
}

export async function getCategoriesWithProducts(departmentId: string): Promise<(Category & { product: Product | null })[]> {
  const result = await db()`
    SELECT
      c.id, c.department_id, c.name, c.slug, c.full_slug,
      p.id as prod_id, p.asin, p.name as prod_name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count
    FROM categories c
    LEFT JOIN bestseller_rankings br ON c.id = br.category_id AND br.is_current = true
    LEFT JOIN products p ON br.product_id = p.id
    WHERE c.department_id = ${departmentId}
    ORDER BY c.name
  `;
  const rows = result as unknown as Row[];

  return rows.map((r) => ({
    id: String(r.id),
    department_id: String(r.department_id),
    name: String(r.name),
    slug: String(r.slug),
    full_slug: String(r.full_slug),
    product: r.prod_id ? {
      id: String(r.prod_id),
      asin: String(r.asin),
      name: String(r.prod_name),
      price: r.price as number | null,
      image_url: r.image_url as string | null,
      amazon_url: String(r.amazon_url),
      rating: r.rating as number | null,
      review_count: r.review_count as number | null,
    } : null,
  }));
}

export async function getProductCategories(productId: string): Promise<Category[]> {
  const result = await db()`
    SELECT c.id, c.department_id, c.name, c.slug, c.full_slug
    FROM bestseller_rankings br
    JOIN categories c ON br.category_id = c.id
    WHERE br.product_id = ${productId} AND br.is_current = true
  `;
  return result as unknown as Category[];
}
