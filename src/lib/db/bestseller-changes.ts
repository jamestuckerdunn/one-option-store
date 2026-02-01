import { db } from './connection';

/**
 * Database operations for tracking bestseller changes.
 * Used for weekly digest emails.
 */

export interface BestsellerChange {
  id: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  department_name: string;
  old_product_id: string | null;
  old_product_name: string | null;
  new_product_id: string;
  new_product_name: string;
  new_product_price: number | null;
  new_product_image: string | null;
  new_product_asin: string;
  changed_at: Date;
}

type Row = Record<string, unknown>;

/**
 * Record a bestseller change when a new #1 product takes the top spot.
 * @param categoryId - Category where change occurred
 * @param oldProductId - Previous #1 product (null if first entry)
 * @param newProductId - New #1 product
 */
export async function recordBestsellerChange(
  categoryId: string,
  oldProductId: string | null,
  newProductId: string
): Promise<void> {
  await db()`
    INSERT INTO bestseller_changes (category_id, old_product_id, new_product_id)
    VALUES (${categoryId}, ${oldProductId}, ${newProductId})
  `;
}

/**
 * Get all bestseller changes within a date range.
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of changes with product and category details
 */
export async function getChangesInRange(
  startDate: Date,
  endDate: Date
): Promise<BestsellerChange[]> {
  const result = await db()`
    SELECT
      bc.id,
      bc.category_id,
      c.name as category_name,
      c.full_slug as category_slug,
      d.name as department_name,
      bc.old_product_id,
      old_p.name as old_product_name,
      bc.new_product_id,
      new_p.name as new_product_name,
      new_p.price as new_product_price,
      new_p.image_url as new_product_image,
      new_p.asin as new_product_asin,
      bc.changed_at
    FROM bestseller_changes bc
    JOIN categories c ON bc.category_id = c.id
    JOIN departments d ON c.department_id = d.id
    JOIN products new_p ON bc.new_product_id = new_p.id
    LEFT JOIN products old_p ON bc.old_product_id = old_p.id
    WHERE bc.changed_at >= ${startDate}::timestamptz
      AND bc.changed_at <= ${endDate}::timestamptz
    ORDER BY bc.changed_at DESC
  `;

  const rows = result as unknown as Row[];
  return rows.map((r) => ({
    id: String(r.id),
    category_id: String(r.category_id),
    category_name: String(r.category_name),
    category_slug: String(r.category_slug),
    department_name: String(r.department_name),
    old_product_id: r.old_product_id ? String(r.old_product_id) : null,
    old_product_name: r.old_product_name ? String(r.old_product_name) : null,
    new_product_id: String(r.new_product_id),
    new_product_name: String(r.new_product_name),
    new_product_price: r.new_product_price != null ? Number(r.new_product_price) : null,
    new_product_image: r.new_product_image as string | null,
    new_product_asin: String(r.new_product_asin),
    changed_at: new Date(String(r.changed_at)),
  }));
}

/**
 * Get changes from the last 7 days for weekly digest.
 */
export async function getWeeklyChanges(): Promise<BestsellerChange[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return getChangesInRange(startDate, endDate);
}

/**
 * Get count of changes in date range grouped by department.
 */
export async function getChangeCountsByDepartment(
  startDate: Date,
  endDate: Date
): Promise<{ department: string; count: number }[]> {
  const result = await db()`
    SELECT d.name as department, COUNT(*) as count
    FROM bestseller_changes bc
    JOIN categories c ON bc.category_id = c.id
    JOIN departments d ON c.department_id = d.id
    WHERE bc.changed_at >= ${startDate}::timestamptz
      AND bc.changed_at <= ${endDate}::timestamptz
    GROUP BY d.name
    ORDER BY count DESC
  `;

  const rows = result as unknown as Row[];
  return rows.map((r) => ({
    department: String(r.department),
    count: Number(r.count),
  }));
}
