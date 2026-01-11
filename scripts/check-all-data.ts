import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkAllData() {
  console.log('=== FULL DATABASE CHECK ===\n');

  // Check all products
  console.log('📦 PRODUCTS:');
  const { data: products } = await supabase.from('products').select('*');
  products?.forEach(p => {
    console.log(`  - ${p.asin}: ${p.name?.substring(0, 50)}...`);
    console.log(`    Image: ${p.image_url?.substring(0, 60)}...`);
  });
  console.log(`  Total: ${products?.length || 0}\n`);

  // Check all categories
  console.log('📂 CATEGORIES:');
  const { data: categories } = await supabase.from('categories').select('id, name, full_slug');
  categories?.forEach(c => {
    console.log(`  - ${c.name} (${c.full_slug})`);
  });
  console.log(`  Total: ${categories?.length || 0}\n`);

  // Check all bestseller_rankings
  console.log('🏆 BESTSELLER RANKINGS:');
  const { data: rankings } = await supabase
    .from('bestseller_rankings')
    .select(`
      id,
      is_current,
      product_id,
      category_id,
      products (asin, name),
      categories (name)
    `);

  rankings?.forEach((r: any) => {
    const prodName = r.products?.name || 'NO PRODUCT (orphaned)';
    const catName = r.categories?.name || 'NO CATEGORY';
    console.log(`  - [${r.is_current ? 'CURRENT' : 'old'}] ${catName}: ${prodName.substring(0, 40)}...`);
  });
  console.log(`  Total: ${rankings?.length || 0}\n`);

  // Check departments
  console.log('🏢 DEPARTMENTS:');
  const { data: departments } = await supabase.from('departments').select('name, slug');
  console.log(`  Total: ${departments?.length || 0}`);

  // Show first few
  departments?.slice(0, 5).forEach(d => {
    console.log(`  - ${d.name} (${d.slug})`);
  });
  if ((departments?.length || 0) > 5) {
    console.log(`  ... and ${(departments?.length || 0) - 5} more`);
  }
}

checkAllData();
