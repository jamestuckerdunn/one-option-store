import { neon } from '@neondatabase/serverless';

/**
 * Database module for One Option Store.
 * Provides typed queries for departments, categories, products, and bestsellers.
 * Uses Neon serverless PostgreSQL for database connectivity.
 */

/** Department entity - top-level product categorization */
export interface Department {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

/** Category entity - subdivision within a department */
export interface Category {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  full_slug: string;
}

/** Product entity - Amazon product with affiliate link */
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

/** Bestseller entity - combines product, category, and department info */
export interface Bestseller {
  product: Product;
  category: Category;
  department: Department;
}

type Row = Record<string, unknown>;

/** Helper to convert a database row to a Product object with proper type conversion */
function rowToProduct(r: Row): Product {
  return {
    id: String(r.id),
    asin: String(r.asin),
    name: String(r.name),
    price: r.price != null ? Number(r.price) : null,
    image_url: r.image_url as string | null,
    amazon_url: String(r.amazon_url),
    rating: r.rating != null ? Number(r.rating) : null,
    review_count: r.review_count != null ? Number(r.review_count) : null,
  };
}

/** Lazy-initialized database connection */
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

/**
 * Retrieves all departments ordered by sort_order and name.
 * @returns Array of Department objects
 */
export async function getDepartments(): Promise<Department[]> {
  const result = await db()`
    SELECT id, name, slug, sort_order
    FROM departments
    ORDER BY sort_order, name
  `;
  return result as unknown as Department[];
}

/**
 * Retrieves a department by its URL slug.
 * @param slug - The department's URL-friendly identifier
 * @returns Department object or null if not found
 */
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

/**
 * Retrieves all categories within a department.
 * @param departmentId - The department's unique identifier
 * @returns Array of Category objects ordered by name
 */
export async function getCategoriesByDepartment(departmentId: string): Promise<Category[]> {
  const result = await db()`
    SELECT id, department_id, name, slug, full_slug
    FROM categories
    WHERE department_id = ${departmentId}
    ORDER BY name
  `;
  return result as unknown as Category[];
}

/**
 * Retrieves a category by its full slug (includes department slug).
 * @param fullSlug - The category's full URL path
 * @returns Category object or null if not found
 */
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

/**
 * Retrieves a product by its Amazon Standard Identification Number (ASIN).
 * @param asin - Amazon's unique product identifier
 * @returns Product object or null if not found
 */
export async function getProductByAsin(asin: string): Promise<Product | null> {
  const result = await db()`
    SELECT id, asin, name, price, image_url, amazon_url, rating, review_count
    FROM products
    WHERE asin = ${asin}
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? rowToProduct(rows[0]) : null;
}

/**
 * Retrieves all current bestsellers with their product, category, and department info.
 * @returns Array of Bestseller objects ordered by department sort_order and category name
 */
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
      price: r.price != null ? Number(r.price) : null,
      image_url: r.image_url as string | null,
      amazon_url: String(r.amazon_url),
      rating: r.rating != null ? Number(r.rating) : null,
      review_count: r.review_count != null ? Number(r.review_count) : null,
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

/**
 * Retrieves the current bestseller product for a specific category.
 * @param categoryId - The category's unique identifier
 * @returns Product object or null if no bestseller exists
 */
export async function getBestsellerByCategory(categoryId: string): Promise<Product | null> {
  const result = await db()`
    SELECT p.id, p.asin, p.name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count
    FROM bestseller_rankings br
    JOIN products p ON br.product_id = p.id
    WHERE br.category_id = ${categoryId} AND br.is_current = true
    LIMIT 1
  `;
  const rows = result as unknown as Row[];
  return rows.length > 0 ? rowToProduct(rows[0]) : null;
}

/**
 * Retrieves all categories in a department with their current bestseller products.
 * @param departmentId - The department's unique identifier
 * @returns Array of Category objects extended with optional product property
 */
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
      price: r.price != null ? Number(r.price) : null,
      image_url: r.image_url as string | null,
      amazon_url: String(r.amazon_url),
      rating: r.rating != null ? Number(r.rating) : null,
      review_count: r.review_count != null ? Number(r.review_count) : null,
    } : null,
  }));
}

/**
 * Retrieves all categories where a product is currently a bestseller.
 * @param productId - The product's unique identifier
 * @returns Array of Category objects where the product ranks #1
 */
export async function getProductCategories(productId: string): Promise<Category[]> {
  const result = await db()`
    SELECT c.id, c.department_id, c.name, c.slug, c.full_slug
    FROM bestseller_rankings br
    JOIN categories c ON br.category_id = c.id
    WHERE br.product_id = ${productId} AND br.is_current = true
  `;
  return result as unknown as Category[];
}
