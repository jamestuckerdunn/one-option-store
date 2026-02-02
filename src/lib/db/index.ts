import { db } from './connection';

/**
 * Database module for One Option Store.
 * Provides typed queries for departments, categories, products, and bestsellers.
 * Uses Neon serverless PostgreSQL for database connectivity.
 */

// Re-export types from schemas for backwards compatibility
export type {
  Department,
  Category,
  Product,
  Bestseller,
} from './schemas';

import type {
  Department,
  Category,
  Product,
  Bestseller,
} from './schemas';

type Row = Record<string, unknown>;

/** Helper to convert a database row to a Product object with proper type conversion */
function rowToProduct(r: Row): Product {
  return {
    id: String(r.id),
    asin: String(r.asin),
    name: String(r.name),
    price: r.price != null ? Number(r.price) : null,
    image_url: r.image_url != null ? String(r.image_url) : null,
    amazon_url: String(r.amazon_url),
    rating: r.rating != null ? Number(r.rating) : null,
    review_count: r.review_count != null ? Number(r.review_count) : null,
  };
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
 * Retrieves current bestsellers with their product, category, and department info.
 * @param limit - Optional maximum number of results to return (default: no limit)
 * @returns Array of Bestseller objects ordered by department sort_order and category name
 */
export async function getBestsellers(limit?: number): Promise<Bestseller[]> {
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
    ${limit ? db()`LIMIT ${limit}` : db()``}
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

/** GroupedBestsellers type for getBestsellersByDepartment return */
export type GroupedBestsellers = { department: Department; products: Bestseller[] };

/**
 * Retrieves bestsellers grouped by department with product count per department.
 * Uses SQL window functions for efficient limiting at the database level.
 * @param limit - Maximum number of products per department (default: 4)
 * @returns Array of departments with their bestseller products
 */
export async function getBestsellersByDepartment(limit = 4): Promise<GroupedBestsellers[]> {
  const result = await db()`
    WITH ranked_bestsellers AS (
      SELECT
        p.id, p.asin, p.name, p.price, p.image_url, p.amazon_url, p.rating, p.review_count,
        c.id as cat_id, c.department_id, c.name as cat_name, c.slug as cat_slug, c.full_slug,
        d.id as dept_id, d.name as dept_name, d.slug as dept_slug, d.sort_order,
        ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY c.name) as row_num
      FROM bestseller_rankings br
      JOIN products p ON br.product_id = p.id
      JOIN categories c ON br.category_id = c.id
      JOIN departments d ON c.department_id = d.id
      WHERE br.is_current = true
    )
    SELECT * FROM ranked_bestsellers
    WHERE row_num <= ${limit}
    ORDER BY sort_order, cat_name
  `;
  const rows = result as unknown as Row[];

  // Group by department in JavaScript (but now with limited data from SQL)
  const grouped = new Map<string, GroupedBestsellers>();

  for (const r of rows) {
    const deptId = String(r.dept_id);
    let group = grouped.get(deptId);
    if (!group) {
      group = {
        department: {
          id: deptId,
          name: String(r.dept_name),
          slug: String(r.dept_slug),
          sort_order: Number(r.sort_order),
        },
        products: [],
      };
      grouped.set(deptId, group);
    }
    group.products.push({
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
      department: group.department,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => a.department.sort_order - b.department.sort_order);
}

/**
 * Retrieves departments with their product count.
 * @param limit - Optional maximum number of departments to return (default: no limit)
 * @returns Array of departments with bestseller count
 */
export async function getDepartmentsWithCount(limit?: number): Promise<(Department & { productCount: number })[]> {
  const result = await db()`
    SELECT d.id, d.name, d.slug, d.sort_order, COUNT(DISTINCT br.product_id) as product_count
    FROM departments d
    LEFT JOIN categories c ON c.department_id = d.id
    LEFT JOIN bestseller_rankings br ON br.category_id = c.id AND br.is_current = true
    GROUP BY d.id, d.name, d.slug, d.sort_order
    ORDER BY d.sort_order, d.name
    ${limit ? db()`LIMIT ${limit}` : db()``}
  `;
  const rows = result as unknown as Row[];
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    sort_order: Number(r.sort_order),
    productCount: Number(r.product_count || 0),
  }));
}

/** Search result types */
export interface SearchResultProduct {
  type: 'product';
  asin: string;
  name: string;
  price: number | null;
  image_url: string | null;
  rating: number | null;
}

export interface SearchResultCategory {
  type: 'category';
  name: string;
  full_slug: string;
  department_name: string;
  product_count: number;
}

export interface SearchResultDepartment {
  type: 'department';
  name: string;
  slug: string;
  product_count: number;
}

export interface SearchResults {
  products: SearchResultProduct[];
  categories: SearchResultCategory[];
  departments: SearchResultDepartment[];
}

/**
 * Searches products, categories, and departments by query string.
 * Uses PostgreSQL ILIKE for case-insensitive text matching.
 * @param query - The search query string
 * @param limit - Maximum number of results per type (default 5)
 * @returns Object with products, categories, and departments arrays
 */
export async function searchProducts(query: string, limit = 5): Promise<SearchResults> {
  const searchPattern = `%${query}%`;

  // Search products that are current bestsellers
  const productsResult = await db()`
    SELECT DISTINCT p.asin, p.name, p.price, p.image_url, p.rating
    FROM products p
    JOIN bestseller_rankings br ON br.product_id = p.id AND br.is_current = true
    WHERE p.name ILIKE ${searchPattern}
    ORDER BY p.rating DESC NULLS LAST
    LIMIT ${limit}
  `;

  // Search categories with product count
  const categoriesResult = await db()`
    SELECT c.name, c.full_slug, d.name as department_name,
           COUNT(DISTINCT br.product_id) as product_count
    FROM categories c
    JOIN departments d ON c.department_id = d.id
    LEFT JOIN bestseller_rankings br ON br.category_id = c.id AND br.is_current = true
    WHERE c.name ILIKE ${searchPattern}
    GROUP BY c.id, c.name, c.full_slug, d.name
    HAVING COUNT(DISTINCT br.product_id) > 0
    ORDER BY COUNT(DISTINCT br.product_id) DESC
    LIMIT ${limit}
  `;

  // Search departments with product count
  const departmentsResult = await db()`
    SELECT d.name, d.slug,
           COUNT(DISTINCT br.product_id) as product_count
    FROM departments d
    LEFT JOIN categories c ON c.department_id = d.id
    LEFT JOIN bestseller_rankings br ON br.category_id = c.id AND br.is_current = true
    WHERE d.name ILIKE ${searchPattern}
    GROUP BY d.id, d.name, d.slug
    HAVING COUNT(DISTINCT br.product_id) > 0
    ORDER BY COUNT(DISTINCT br.product_id) DESC
    LIMIT ${limit}
  `;

  const products = (productsResult as unknown as Row[]).map((r) => ({
    type: 'product' as const,
    asin: String(r.asin),
    name: String(r.name),
    price: r.price != null ? Number(r.price) : null,
    image_url: r.image_url as string | null,
    rating: r.rating != null ? Number(r.rating) : null,
  }));

  const categories = (categoriesResult as unknown as Row[]).map((r) => ({
    type: 'category' as const,
    name: String(r.name),
    full_slug: String(r.full_slug),
    department_name: String(r.department_name),
    product_count: Number(r.product_count || 0),
  }));

  const departments = (departmentsResult as unknown as Row[]).map((r) => ({
    type: 'department' as const,
    name: String(r.name),
    slug: String(r.slug),
    product_count: Number(r.product_count || 0),
  }));

  return { products, categories, departments };
}
