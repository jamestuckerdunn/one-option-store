import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fixRankings() {
  console.log('🔍 Checking bestseller_rankings...\n');

  // Get all rankings with their products
  const { data: rankings, error: rankingsError } = await supabase
    .from('bestseller_rankings')
    .select(`
      id,
      is_current,
      product_id,
      category_id,
      products (
        id,
        asin,
        name
      ),
      categories (
        id,
        name,
        full_slug
      )
    `);

  if (rankingsError) {
    console.error('Error fetching rankings:', rankingsError);
    return;
  }

  console.log(`Found ${rankings?.length || 0} rankings:\n`);

  // Check for orphaned rankings (product_id points to non-existent product)
  const orphanedRankings: any[] = [];

  rankings?.forEach((r: any) => {
    const productInfo = r.products ? `${r.products.asin} - ${r.products.name?.substring(0, 30)}...` : 'NULL (orphaned!)';
    const categoryInfo = r.categories ? r.categories.name : 'Unknown category';
    console.log(`  Ranking ${r.id}:`);
    console.log(`    Category: ${categoryInfo}`);
    console.log(`    Product: ${productInfo}`);
    console.log(`    Is Current: ${r.is_current}`);
    console.log('');

    if (!r.products) {
      orphanedRankings.push(r);
    }
  });

  if (orphanedRankings.length > 0) {
    console.log(`\n⚠️  Found ${orphanedRankings.length} orphaned rankings (pointing to deleted products)`);
    console.log('   Deleting orphaned rankings...\n');

    for (const orphan of orphanedRankings) {
      const { error } = await supabase
        .from('bestseller_rankings')
        .delete()
        .eq('id', orphan.id);

      if (error) {
        console.error(`   Error deleting ranking ${orphan.id}:`, error);
      } else {
        console.log(`   ✓ Deleted orphaned ranking for category: ${orphan.categories?.name || orphan.category_id}`);
      }
    }
  } else {
    console.log('\n✅ No orphaned rankings found');
  }

  // Show final state
  console.log('\n📊 Final rankings state:');
  const { data: finalRankings } = await supabase
    .from('bestseller_rankings')
    .select(`
      id,
      is_current,
      products (asin, name),
      categories (name, full_slug)
    `);

  finalRankings?.forEach((r: any) => {
    console.log(`  - ${r.categories?.name}: ${r.products?.name?.substring(0, 40)}...`);
  });
}

fixRankings();
