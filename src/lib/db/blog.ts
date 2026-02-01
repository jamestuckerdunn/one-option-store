import { db } from './connection';

/**
 * Database operations for blog posts.
 */

// Re-export types from schemas
export type { BlogStatus, BlogPost, BlogPostSummary } from './schemas';
import type { BlogStatus, BlogPost, BlogPostSummary } from './schemas';

type Row = Record<string, unknown>;

/**
 * Create a new blog post.
 */
export async function createBlogPost(params: {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  featured_image?: string;
  category_ids?: string[];
  department_id?: string;
  keywords?: string[];
  status?: BlogStatus;
}): Promise<BlogPost> {
  const result = await db()`
    INSERT INTO blog_posts (
      slug,
      title,
      content,
      excerpt,
      meta_description,
      featured_image,
      category_ids,
      department_id,
      keywords,
      status,
      published_at
    )
    VALUES (
      ${params.slug},
      ${params.title},
      ${params.content},
      ${params.excerpt || null},
      ${params.meta_description || null},
      ${params.featured_image || null},
      ${params.category_ids || []},
      ${params.department_id || null},
      ${params.keywords || []},
      ${params.status || 'draft'},
      ${params.status === 'published' ? new Date().toISOString() : null}
    )
    RETURNING *
  `;

  const rows = result as unknown as Row[];
  return rowToBlogPost(rows[0]);
}

/**
 * Update an existing blog post.
 * Uses parameterized queries to prevent SQL injection.
 */
export async function updateBlogPost(
  id: string,
  params: Partial<{
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    meta_description: string;
    featured_image: string;
    category_ids: string[];
    department_id: string;
    keywords: string[];
    status: BlogStatus;
  }>
): Promise<BlogPost | null> {
  // If no updates provided, return current state
  const hasUpdates = Object.values(params).some((v) => v !== undefined);
  if (!hasUpdates) {
    return getBlogPostById(id);
  }

  // Determine if we need to set published_at
  const shouldSetPublishedAt = params.status === 'published';

  // Use a single parameterized query with COALESCE to handle optional updates
  // This avoids SQL injection by never using dynamic SQL strings
  const result = await db()`
    UPDATE blog_posts
    SET
      slug = COALESCE(${params.slug ?? null}, slug),
      title = COALESCE(${params.title ?? null}, title),
      content = COALESCE(${params.content ?? null}, content),
      excerpt = CASE
        WHEN ${params.excerpt !== undefined} THEN ${params.excerpt ?? null}
        ELSE excerpt
      END,
      meta_description = CASE
        WHEN ${params.meta_description !== undefined} THEN ${params.meta_description ?? null}
        ELSE meta_description
      END,
      featured_image = CASE
        WHEN ${params.featured_image !== undefined} THEN ${params.featured_image ?? null}
        ELSE featured_image
      END,
      category_ids = COALESCE(${params.category_ids ?? null}, category_ids),
      department_id = CASE
        WHEN ${params.department_id !== undefined} THEN ${params.department_id ?? null}
        ELSE department_id
      END,
      keywords = COALESCE(${params.keywords ?? null}, keywords),
      status = COALESCE(${params.status ?? null}, status),
      published_at = CASE
        WHEN ${shouldSetPublishedAt} THEN COALESCE(published_at, NOW())
        ELSE published_at
      END,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0 ? rowToBlogPost(rows[0]) : null;
}

/**
 * Get a blog post by ID.
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const result = await db()`
    SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0 ? rowToBlogPost(rows[0]) : null;
}

/**
 * Get a blog post by slug.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await db()`
    SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0 ? rowToBlogPost(rows[0]) : null;
}

/**
 * Get published blog posts for the blog listing.
 */
export async function getPublishedBlogPosts(params?: {
  limit?: number;
  offset?: number;
  departmentId?: string;
}): Promise<BlogPostSummary[]> {
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  let result;

  if (params?.departmentId) {
    result = await db()`
      SELECT id, slug, title, excerpt, featured_image, status, published_at, view_count
      FROM blog_posts
      WHERE status = 'published' AND department_id = ${params.departmentId}
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    result = await db()`
      SELECT id, slug, title, excerpt, featured_image, status, published_at, view_count
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const rows = result as unknown as Row[];
  return rows.map(rowToBlogPostSummary);
}

/**
 * Get all blog posts (for admin).
 */
export async function getAllBlogPosts(params?: {
  status?: BlogStatus;
  limit?: number;
  offset?: number;
}): Promise<BlogPostSummary[]> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let result;

  if (params?.status) {
    result = await db()`
      SELECT id, slug, title, excerpt, featured_image, status, published_at, view_count
      FROM blog_posts
      WHERE status = ${params.status}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    result = await db()`
      SELECT id, slug, title, excerpt, featured_image, status, published_at, view_count
      FROM blog_posts
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const rows = result as unknown as Row[];
  return rows.map(rowToBlogPostSummary);
}

/**
 * Increment view count for a blog post.
 */
export async function incrementViewCount(id: string): Promise<void> {
  await db()`
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE id = ${id}
  `;
}

/**
 * Delete a blog post.
 */
export async function deleteBlogPost(id: string): Promise<boolean> {
  const result = await db()`
    DELETE FROM blog_posts WHERE id = ${id} RETURNING id
  `;

  const rows = result as unknown as Row[];
  return rows.length > 0;
}

/**
 * Check if a slug is available.
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  let result;

  if (excludeId) {
    result = await db()`
      SELECT id FROM blog_posts WHERE slug = ${slug} AND id != ${excludeId} LIMIT 1
    `;
  } else {
    result = await db()`
      SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1
    `;
  }

  const rows = result as unknown as Row[];
  return rows.length === 0;
}

function rowToBlogPost(row: Row): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    content: String(row.content),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    meta_description: row.meta_description ? String(row.meta_description) : null,
    featured_image: row.featured_image ? String(row.featured_image) : null,
    category_ids: (row.category_ids as string[]) || [],
    department_id: row.department_id ? String(row.department_id) : null,
    keywords: (row.keywords as string[]) || [],
    status: String(row.status) as BlogStatus,
    published_at: row.published_at ? new Date(String(row.published_at)) : null,
    view_count: Number(row.view_count || 0),
    created_at: new Date(String(row.created_at)),
    updated_at: new Date(String(row.updated_at)),
  };
}

function rowToBlogPostSummary(row: Row): BlogPostSummary {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: row.excerpt ? String(row.excerpt) : null,
    featured_image: row.featured_image ? String(row.featured_image) : null,
    status: String(row.status) as BlogStatus,
    published_at: row.published_at ? new Date(String(row.published_at)) : null,
    view_count: Number(row.view_count || 0),
  };
}
