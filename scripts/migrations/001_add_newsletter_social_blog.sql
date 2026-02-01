-- Migration: Add Newsletter, Social Media, and Blog Tables
-- Run this migration to set up Phase 1-3 features

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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_bestseller_changes_date ON bestseller_changes(changed_at);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(email) WHERE unsubscribed_at IS NULL;

-- ===============================
-- SOCIAL MEDIA TABLES (Phase 2)
-- ===============================

-- Log of social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  post_url VARCHAR(2048),
  post_id VARCHAR(255),
  posted_at TIMESTAMP DEFAULT NOW(),
  engagement JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'posted',
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
  category_ids UUID[],
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  keywords TEXT[],
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- ===============================
-- VERIFICATION QUERIES
-- ===============================

-- Run these to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('subscribers', 'bestseller_changes', 'social_posts', 'blog_posts');
