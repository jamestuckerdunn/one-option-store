import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('departments')
    .select('name, slug')
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Departments in database:');
  data?.forEach(d => {
    console.log(`  ${d.name} -> ${d.slug}`);
  });
}

main();
