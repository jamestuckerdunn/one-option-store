import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('products')
    .select('asin, name, image_url')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Products in database:');
  data?.forEach(p => {
    console.log(`\nASIN: ${p.asin}`);
    console.log(`Name: ${p.name?.substring(0, 50)}...`);
    console.log(`Image: ${p.image_url}`);
  });
}

main();
