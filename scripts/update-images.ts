import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Corrected image URLs (verified working)
const imageUpdates: Record<string, string> = {
  // The Let Them Theory book - image ID: 91ZVf3kNrcL
  '1401971369': 'https://m.media-amazon.com/images/I/91ZVf3kNrcL._AC_SL500_.jpg',
  // Owala water bottle - image ID: 61sS-XIvEXL (should work, no + sign)
  'B0BZYCJK89': 'https://m.media-amazon.com/images/I/61sS-XIvEXL._AC_SL500_.jpg',
  // Blink subscription - image ID: 316iIKOVz7L
  'B08JHCVHTY': 'https://m.media-amazon.com/images/I/316iIKOVz7L._AC_SL500_.jpg',
  // Mielle hair oil - image ID: 61xBXiVYAuL
  'B07NNRP6BF': 'https://m.media-amazon.com/images/I/61xBXiVYAuL._AC_SL500_.jpg',
  // LEGO Star Wars - image ID: 81HBLcJTseL
  'B0DHZJQ2HG': 'https://m.media-amazon.com/images/I/81HBLcJTseL._AC_SL500_.jpg',
};

async function updateImages() {
  console.log('Updating product images...\n');

  for (const [asin, imageUrl] of Object.entries(imageUpdates)) {
    const { error } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('asin', asin);

    if (error) {
      console.log(`  Error updating ${asin}: ${error.message}`);
    } else {
      console.log(`  Updated ${asin}`);
    }
  }

  // Verify
  console.log('\nVerifying images:');
  const { data: products } = await supabase
    .from('products')
    .select('asin, name, image_url');

  products?.forEach(p => {
    console.log(`  ${p.asin}: ${p.image_url}`);
  });
}

updateImages();
