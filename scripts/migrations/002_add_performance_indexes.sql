-- Migration: Add Performance Indexes
-- This migration adds indexes for frequently queried columns to improve query performance.
-- Run this after 001_add_newsletter_social_blog.sql

-- ===============================
-- DEPARTMENTS TABLE INDEXES
-- ===============================

-- Index for department lookup by slug (used in getDepartmentBySlug)
CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);

-- ===============================
-- CATEGORIES TABLE INDEXES
-- ===============================

-- Index for category lookup by department_id (used in getCategoriesByDepartment)
CREATE INDEX IF NOT EXISTS idx_categories_department_id ON categories(department_id);

-- Index for category lookup by full_slug (used in getCategoryBySlug)
CREATE INDEX IF NOT EXISTS idx_categories_full_slug ON categories(full_slug);

-- ===============================
-- PRODUCTS TABLE INDEXES
-- ===============================

-- Index for product lookup by ASIN (used in getProductByAsin)
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);

-- ===============================
-- SOCIAL POSTS TABLE INDEXES
-- ===============================

-- Composite index for checking recent posts by platform and product
-- Used in hasRecentPost() to prevent duplicate social media posts
CREATE INDEX IF NOT EXISTS idx_social_posts_product_platform
  ON social_posts(product_id, platform, posted_at DESC)
  WHERE status = 'posted';

-- ===============================
-- BESTSELLER CHANGES TABLE INDEXES
-- ===============================

-- Index for date range queries on bestseller changes
-- Used in getRecentChanges() for weekly digest emails
CREATE INDEX IF NOT EXISTS idx_bestseller_changes_changed_at
  ON bestseller_changes(changed_at DESC);

-- ===============================
-- VERIFICATION QUERIES
-- ===============================

-- Run these to verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE schemaname = 'public'
-- AND indexname IN (
--   'idx_departments_slug',
--   'idx_categories_department_id',
--   'idx_categories_full_slug',
--   'idx_products_asin',
--   'idx_social_posts_product_platform',
--   'idx_bestseller_changes_changed_at'
-- );
