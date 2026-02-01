/**
 * Zod schemas for runtime validation of database entities.
 * Provides type-safe parsing and validation of database results.
 */

import { z } from 'zod';

// ============================================
// Core Entity Schemas
// ============================================

/**
 * Department schema - top-level product categorization
 */
export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number(),
});
export type Department = z.infer<typeof DepartmentSchema>;

/**
 * Category schema - subdivision within a department
 */
export const CategorySchema = z.object({
  id: z.string(),
  department_id: z.string(),
  name: z.string(),
  slug: z.string(),
  full_slug: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

/**
 * Product schema - Amazon product with affiliate link
 */
export const ProductSchema = z.object({
  id: z.string(),
  asin: z.string(),
  name: z.string(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
  amazon_url: z.string(),
  rating: z.number().nullable(),
  review_count: z.number().nullable(),
});
export type Product = z.infer<typeof ProductSchema>;

/**
 * Bestseller schema - combines product, category, and department info
 */
export const BestsellerSchema = z.object({
  product: ProductSchema,
  category: CategorySchema,
  department: DepartmentSchema,
});
export type Bestseller = z.infer<typeof BestsellerSchema>;

// ============================================
// Blog Schemas
// ============================================

export const BlogStatusSchema = z.enum(['draft', 'published', 'archived']);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;

export const BlogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  meta_description: z.string().nullable(),
  featured_image: z.string().nullable(),
  category_ids: z.array(z.string()),
  department_id: z.string().nullable(),
  keywords: z.array(z.string()),
  status: BlogStatusSchema,
  published_at: z.date().nullable(),
  view_count: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const BlogPostSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  featured_image: z.string().nullable(),
  status: BlogStatusSchema,
  published_at: z.date().nullable(),
  view_count: z.number(),
});
export type BlogPostSummary = z.infer<typeof BlogPostSummarySchema>;

// ============================================
// Subscriber Schemas
// ============================================

export const SubscriberStatusSchema = z.enum(['active', 'unsubscribed', 'bounced']);
export type SubscriberStatus = z.infer<typeof SubscriberStatusSchema>;

export const SubscriberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  status: SubscriberStatusSchema,
  unsubscribe_token: z.string(),
  subscribed_at: z.date(),
  unsubscribed_at: z.date().nullable(),
});
export type Subscriber = z.infer<typeof SubscriberSchema>;

// ============================================
// Social Post Schemas
// ============================================

export const SocialPlatformSchema = z.enum(['twitter', 'facebook', 'instagram', 'tiktok']);
export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;

export const SocialPostStatusSchema = z.enum(['pending', 'posted', 'failed']);
export type SocialPostStatus = z.infer<typeof SocialPostStatusSchema>;

export const SocialPostSchema = z.object({
  id: z.string(),
  platform: SocialPlatformSchema,
  content: z.string(),
  product_id: z.string().nullable(),
  category_id: z.string().nullable(),
  post_url: z.string().nullable(),
  post_id: z.string().nullable(),
  status: SocialPostStatusSchema,
  error_message: z.string().nullable(),
  posted_at: z.date(),
});
export type SocialPost = z.infer<typeof SocialPostSchema>;

// ============================================
// Search Result Schemas
// ============================================

export const SearchResultProductSchema = z.object({
  type: z.literal('product'),
  asin: z.string(),
  name: z.string(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
  rating: z.number().nullable(),
});
export type SearchResultProduct = z.infer<typeof SearchResultProductSchema>;

export const SearchResultCategorySchema = z.object({
  type: z.literal('category'),
  name: z.string(),
  full_slug: z.string(),
  department_name: z.string(),
  product_count: z.number(),
});
export type SearchResultCategory = z.infer<typeof SearchResultCategorySchema>;

export const SearchResultDepartmentSchema = z.object({
  type: z.literal('department'),
  name: z.string(),
  slug: z.string(),
  product_count: z.number(),
});
export type SearchResultDepartment = z.infer<typeof SearchResultDepartmentSchema>;

export const SearchResultsSchema = z.object({
  products: z.array(SearchResultProductSchema),
  categories: z.array(SearchResultCategorySchema),
  departments: z.array(SearchResultDepartmentSchema),
});
export type SearchResults = z.infer<typeof SearchResultsSchema>;

// ============================================
// Validation Schemas (for API input)
// ============================================

export const EmailSchema = z.string().email('Invalid email address');

export const SlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const SearchQuerySchema = z
  .string()
  .min(1, 'Search query is required')
  .max(200, 'Search query is too long')
  .transform((q) => q.trim());

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});
export type Pagination = z.infer<typeof PaginationSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Safely parse and validate data with a schema.
 * Returns null if parsing fails instead of throwing.
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Parse data with a schema and throw a descriptive error if invalid.
 */
export function parseOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = context
      ? `${context}: ${result.error.message}`
      : result.error.message;
    throw new Error(message);
  }
  return result.data;
}
