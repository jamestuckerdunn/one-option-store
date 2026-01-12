-- One Option Store Database Schema
-- Run this SQL to initialize the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    amazon_node_id VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    full_slug VARCHAR(500) NOT NULL UNIQUE,
    amazon_url TEXT,
    depth INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for category lookups
CREATE INDEX IF NOT EXISTS idx_categories_department ON categories(department_id);
CREATE INDEX IF NOT EXISTS idx_categories_full_slug ON categories(full_slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asin VARCHAR(10) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price DECIMAL(10,2),
    image_url TEXT,
    amazon_url TEXT NOT NULL,
    rating DECIMAL(2,1),
    review_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ASIN lookups
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);

-- Bestseller rankings table
CREATE TABLE IF NOT EXISTS bestseller_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    became_number_one_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_current BOOLEAN DEFAULT true,
    UNIQUE(product_id, category_id, is_current)
);

-- Create indexes for ranking queries
CREATE INDEX IF NOT EXISTS idx_rankings_current ON bestseller_rankings(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_rankings_category ON bestseller_rankings(category_id);
CREATE INDEX IF NOT EXISTS idx_rankings_product ON bestseller_rankings(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment to insert sample department
-- INSERT INTO departments (name, slug, sort_order) VALUES ('Electronics', 'electronics', 1);
