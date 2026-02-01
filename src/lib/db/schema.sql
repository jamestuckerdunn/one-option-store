-- One Option Store Database Schema
-- This file documents the complete database schema including new newsletter and social features.

-- ===============================
-- CORE TABLES (existing)
-- ===============================

-- Departments (top-level categories)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories (subcategories within departments)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  full_slug VARCHAR(512) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (Amazon products)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(1000) NOT NULL,
  price DECIMAL(10, 2),
  image_url VARCHAR(2048),
  amazon_url VARCHAR(2048) NOT NULL,
  rating DECIMAL(2, 1),
  review_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bestseller Rankings (tracks which products are #1 in which categories)
CREATE TABLE IF NOT EXISTS bestseller_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_current BOOLEAN DEFAULT true,
  became_number_one_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- NEWSLETTER TABLES (Phase 1)
-- ===============================

-- Email subscribers for weekly digest
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  confirmation_token VARCHAR(64),
  unsubscribe_token VARCHAR(64) NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  preferences JSONB DEFAULT '{"weekly_digest": true}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track bestseller changes for digest emails
CREATE TABLE IF NOT EXISTS bestseller_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  old_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  new_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient weekly digest queries
CREATE INDEX IF NOT EXISTS idx_bestseller_changes_date ON bestseller_changes(changed_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(email) WHERE unsubscribed_at IS NULL;

-- ===============================
-- SOCIAL MEDIA TABLES (Phase 2)
-- ===============================

-- Log of social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL, -- twitter, instagram, tiktok, facebook
  content TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  post_url VARCHAR(2048),
  post_id VARCHAR(255), -- Platform-specific post ID
  posted_at TIMESTAMP DEFAULT NOW(),
  engagement JSONB DEFAULT '{}'::jsonb, -- likes, shares, comments, etc.
  status VARCHAR(20) DEFAULT 'posted', -- posted, failed, scheduled
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform, posted_at);

-- ===============================
-- BLOG TABLES (Phase 3)
-- ===============================

-- AI-generated blog posts / buying guides
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  meta_description VARCHAR(300),
  featured_image VARCHAR(2048),
  category_ids UUID[], -- Array of related category IDs
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  keywords TEXT[], -- SEO keywords
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
