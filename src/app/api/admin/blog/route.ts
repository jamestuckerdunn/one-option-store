import { NextRequest, NextResponse } from 'next/server';
import {
  createBlogPost,
  updateBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  deleteBlogPost,
  isSlugAvailable,
} from '@/lib/db/blog';
import { generateBuyingGuide, generateSlug, isAIConfigured } from '@/lib/ai/content-generator';
import { getBestsellerByCategory, getCategoryBySlug } from '@/lib/db';
import { isAdminAuthorized } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  isJsonContentType,
  validateBlogPost,
  validatePagination,
  MAX_BODY_SIZES,
} from '@/lib/validation';
import { checkRateLimit, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limit';
import { RATE_LIMITS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/** Valid blog post statuses */
const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
type BlogStatus = (typeof VALID_STATUSES)[number];

/**
 * GET /api/admin/blog
 * List all blog posts (admin view).
 */
export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for admin endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-blog-get:${clientId}`, RATE_LIMITS.GENERAL);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMITS.GENERAL),
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    // Validate status parameter
    let status: BlogStatus | undefined;
    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam as BlogStatus)) {
        return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 });
      }
      status = statusParam as BlogStatus;
    }

    // Validate and sanitize limit parameter
    const { limit } = validatePagination(searchParams.get('limit'), 0, 100);

    const posts = await getAllBlogPosts({
      status,
      limit,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    logger.error('Blog list error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to list posts' }, { status: 500 });
  }
}

/**
 * POST /api/admin/blog
 * Create a new blog post.
 *
 * Body options:
 * 1. Manual creation: { slug, title, content, ... }
 * 2. AI generation: { generate: true, categorySlug: "...", ... }
 */
export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for admin endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-blog-post:${clientId}`, RATE_LIMITS.GENERAL);
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
  if (contentLength > MAX_BODY_SIZES.BLOG_POST) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();

    // AI-generated content
    if (body.generate === true) {
      if (!isAIConfigured()) {
        return NextResponse.json(
          { error: 'AI content generation is not configured. Set OPENAI_API_KEY.' },
          { status: 400 }
        );
      }

      const { categorySlug, targetAudience } = body;

      if (!categorySlug) {
        return NextResponse.json(
          { error: 'categorySlug is required for AI generation' },
          { status: 400 }
        );
      }

      // Get category and products
      const category = await getCategoryBySlug(categorySlug);
      if (!category) {
        // SECURITY: Don't reveal the slug in error message to prevent enumeration
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      const bestseller = await getBestsellerByCategory(category.id);
      const products = bestseller
        ? [{
            name: bestseller.name,
            price: bestseller.price,
            rating: bestseller.rating,
            review_count: bestseller.review_count,
            asin: bestseller.asin,
          }]
        : [];

      // Generate content
      const generated = await generateBuyingGuide({
        categoryName: category.name,
        departmentName: categorySlug.split('/')[0] || 'Products',
        products,
        targetAudience,
      });

      // Create unique slug
      let slug = generateSlug(generated.title);
      let attempt = 0;
      while (!(await isSlugAvailable(slug))) {
        attempt++;
        slug = `${generateSlug(generated.title)}-${attempt}`;
      }

      const post = await createBlogPost({
        slug,
        title: generated.title,
        content: generated.content,
        excerpt: generated.excerpt,
        meta_description: generated.meta_description,
        keywords: generated.keywords,
        status: body.publish === true ? 'published' : 'draft',
      });

      return NextResponse.json({ post }, { status: 201 });
    }

    // Manual creation
    const { slug, title, content, excerpt, meta_description, featured_image, keywords, status } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'slug, title, and content are required' },
        { status: 400 }
      );
    }

    // Validate blog post fields
    const validation = validateBlogPost({ slug, title, content, keywords });
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate slug availability
    if (!(await isSlugAvailable(slug))) {
      return NextResponse.json(
        { error: 'Slug is already in use' },
        { status: 400 }
      );
    }

    const post = await createBlogPost({
      slug,
      title,
      content,
      excerpt,
      meta_description,
      featured_image,
      keywords: keywords || [],
      status: status || 'draft',
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    logger.error('Blog create error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blog
 * Update an existing blog post.
 */
export async function PUT(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for admin endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-blog-put:${clientId}`, RATE_LIMITS.GENERAL);
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
  if (contentLength > MAX_BODY_SIZES.BLOG_POST) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check if post exists (also serves as authorization check - admins can only update existing posts)
    const existing = await getBlogPostById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Validate update fields
    const fieldsToValidate: { slug?: string; title?: string; content?: string; keywords?: unknown } = {};
    if (updates.slug !== undefined) fieldsToValidate.slug = updates.slug;
    if (updates.title !== undefined) fieldsToValidate.title = updates.title;
    if (updates.content !== undefined) fieldsToValidate.content = updates.content;
    if (updates.keywords !== undefined) fieldsToValidate.keywords = updates.keywords;

    if (Object.keys(fieldsToValidate).length > 0) {
      const validation = validateBlogPost(fieldsToValidate);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate slug if changing
    if (updates.slug && updates.slug !== existing.slug) {
      if (!(await isSlugAvailable(updates.slug, id))) {
        return NextResponse.json(
          { error: 'Slug is already in use' },
          { status: 400 }
        );
      }
    }

    const post = await updateBlogPost(id, updates);

    return NextResponse.json({ post });
  } catch (error) {
    logger.error('Blog update error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog
 * Delete a blog post.
 */
export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting for admin endpoints
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`admin-blog-delete:${clientId}`, RATE_LIMITS.GENERAL);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMITS.GENERAL),
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const deleted = await deleteBlogPost(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Blog delete error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
