import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Current valid products with correct image URLs (scraped fresh from Amazon)
const validProducts = [
  {
    asin: 'B0BZYCJK89',
    name: 'Owala FreeSip Insulated Stainless Steel Water Bottle with Straw, BPA-Free Sports Water Bottle, Great for Travel, 24 Oz, Denim',
    price: 29.99,
    imageUrl: 'https://m.media-amazon.com/images/I/61sS-XIvEXL._AC_SL500_.jpg',
    amazonUrl: 'https://www.amazon.com/dp/B0BZYCJK89',
    rating: 4.7,
    reviewCount: 104133,
  },
  {
    asin: 'B08JHCVHTY',
    name: 'Blink Subscription Plan PLUS (monthly auto-renewal)',
    price: 10.00,
    imageUrl: 'https://m.media-amazon.com/images/I/316iIKOVz7L._AC_SL500_.jpg',
    amazonUrl: 'https://www.amazon.com/dp/B08JHCVHTY',
    rating: 4.4,
    reviewCount: 269116,
  },
  {
    asin: '1401971369',
    name: "The Let Them Theory: A Life-Changing Tool That Millions of People Can't Stop Talking About",
    price: 18.89,
    imageUrl: 'https://m.media-amazon.com/images/I/71mf7+e9ufL._AC_SL500_.jpg',
    amazonUrl: 'https://www.amazon.com/dp/1401971369',
    rating: 4.6,
    reviewCount: 34955,
  },
  {
    asin: 'B07NNRP6BF',
    name: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
    price: 9.99,
    imageUrl: 'https://m.media-amazon.com/images/I/61xBXiVYAuL._AC_SL500_.jpg',
    amazonUrl: 'https://www.amazon.com/dp/B07NNRP6BF',
    rating: 4.5,
    reviewCount: 115000,
  },
  {
    asin: 'B0DHZJQ2HG',
    name: 'LEGO Star Wars: The Mandalorian N-1 Starfighter Microfighter',
    price: 15.99,
    imageUrl: 'https://m.media-amazon.com/images/I/81HBLcJTseL._AC_SL500_.jpg',
    amazonUrl: 'https://www.amazon.com/dp/B0DHZJQ2HG',
    rating: 4.8,
    reviewCount: 5000,
  },
];

// Outdated ASINs to remove
const outdatedAsins = ['B07MNF3N7V', 'B0CXZ3XZ2X', 'B00UVK9L12', 'B09RGRJ13P'];

async function fixProducts() {
  console.log('🔧 Fixing product data...\n');

  // Delete outdated products and their rankings
  for (const asin of outdatedAsins) {
    // First get the product ID
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('asin', asin)
      .single();

    if (product) {
      // Delete bestseller rankings for this product
      await supabase
        .from('bestseller_rankings')
        .delete()
        .eq('product_id', product.id);

      // Delete the product
      await supabase
        .from('products')
        .delete()
        .eq('asin', asin);

      console.log(`  🗑️  Removed outdated product: ${asin}`);
    }
  }

  // Update valid products with correct image URLs
  for (const prod of validProducts) {
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('asin', prod.asin)
      .single();

    if (existing) {
      await supabase
        .from('products')
        .update({
          name: prod.name,
          price: prod.price,
          image_url: prod.imageUrl,
          amazon_url: prod.amazonUrl,
          rating: prod.rating,
          review_count: prod.reviewCount,
        })
        .eq('asin', prod.asin);

      console.log(`  ✓ Updated: ${prod.name.substring(0, 40)}...`);
    } else {
      const { error } = await supabase
        .from('products')
        .insert({
          asin: prod.asin,
          name: prod.name,
          price: prod.price,
          image_url: prod.imageUrl,
          amazon_url: prod.amazonUrl,
          rating: prod.rating,
          review_count: prod.reviewCount,
        });

      if (!error) {
        console.log(`  + Added: ${prod.name.substring(0, 40)}...`);
      }
    }
  }

  // Verify
  const { data: products } = await supabase
    .from('products')
    .select('asin, name, image_url');

  console.log('\n📦 Current products:');
  products?.forEach(p => {
    console.log(`  - ${p.asin}: ${p.name?.substring(0, 40)}...`);
    console.log(`    Image: ${p.image_url}`);
  });
}

fixProducts();
