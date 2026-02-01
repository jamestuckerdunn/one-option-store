/**
 * Run database migrations using Neon serverless driver.
 * Usage: node scripts/run-migration.js
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('Running migration: Add Newsletter, Social Media, and Blog Tables\n');

  try {
    // Create subscribers table
    console.log('Creating subscribers table...');
    await sql`
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
      )
    `;
    console.log('✓ subscribers table created');

    // Create bestseller_changes table
    console.log('Creating bestseller_changes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS bestseller_changes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
        old_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        new_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        changed_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ bestseller_changes table created');

    // Create indexes for newsletter
    console.log('Creating newsletter indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_bestseller_changes_date ON bestseller_changes(changed_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(email) WHERE unsubscribed_at IS NULL`;
    console.log('✓ newsletter indexes created');

    // Create social_posts table
    console.log('Creating social_posts table...');
    await sql`
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
      )
    `;
    console.log('✓ social_posts table created');

    // Create social posts index
    console.log('Creating social posts index...');
    await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform, posted_at)`;
    console.log('✓ social posts index created');

    // Create blog_posts table
    console.log('Creating blog_posts table...');
    await sql`
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
      )
    `;
    console.log('✓ blog_posts table created');

    // Create blog indexes
    console.log('Creating blog indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status, published_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`;
    console.log('✓ blog indexes created');

    // Verify tables
    console.log('\nVerifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('subscribers', 'bestseller_changes', 'social_posts', 'blog_posts')
      ORDER BY table_name
    `;

    console.log('Created tables:', tables.map(t => t.table_name).join(', '));

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
