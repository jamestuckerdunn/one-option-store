import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CategoryData {
  name: string;
  slug: string;
  amazon_url: string;
}

interface ProductData {
  asin: string;
  name: string;
  price: number | null;
  image_url: string;
  amazon_url: string;
  rating: number | null;
  review_count: number | null;
}

interface DepartmentData {
  slug: string;
  amazonSlug: string;
  categories: CategoryData[];
  topProduct: ProductData;
}

// All department data with correct database slugs
const departmentData: DepartmentData[] = [
  {
    slug: 'electronics',
    amazonSlug: 'electronics',
    categories: [
      { name: 'Accessories & Supplies', slug: 'accessories-supplies', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Electronics-Accessories-Supplies/zgbs/electronics/281407' },
      { name: 'Camera & Photo', slug: 'camera-photo', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Camera-Photo-Products/zgbs/electronics/502394' },
      { name: 'Car Electronics', slug: 'car-electronics', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Car-Electronics/zgbs/electronics/1077068' },
      { name: 'Cell Phones & Accessories', slug: 'cell-phones-accessories', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Cell-Phones-Accessories/zgbs/electronics/2811119011' },
      { name: 'Computers & Accessories', slug: 'computers-accessories', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Computers-Accessories/zgbs/electronics/541966' },
      { name: 'Headphones', slug: 'headphones', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Headphones-Earbuds/zgbs/electronics/172541' },
      { name: 'Home Audio & Theater', slug: 'home-audio-theater', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Home-Audio-Theater-Products/zgbs/electronics/667846011' },
      { name: 'Office Electronics', slug: 'office-electronics', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Office-Electronics-Products/zgbs/electronics/172574' },
      { name: 'Security & Surveillance', slug: 'security-surveillance', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Security-Surveillance-Equipment/zgbs/electronics/524136' },
      { name: 'Televisions & Video', slug: 'televisions-video', amazon_url: 'https://www.amazon.com/Best-Sellers-Electronics-Televisions-Video-Products/zgbs/electronics/1266092011' },
    ],
    topProduct: {
      asin: 'B08JHCVHTY',
      name: 'Blink Subscription Plan PLUS (monthly auto-renewal)',
      price: 10.00,
      image_url: 'https://m.media-amazon.com/images/I/71lM5ntJGaL._AC_SY200_.jpg',
      amazon_url: 'https://www.amazon.com/Blink-Plus-Plan-monthly-auto-renewal/dp/B08JHCVHTY',
      rating: 4.4,
      review_count: 269115,
    }
  },
  {
    slug: 'home-kitchen',
    amazonSlug: 'home-garden',
    categories: [
      { name: 'Bath', slug: 'bath', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Bath-Products/zgbs/home-garden/1063236' },
      { name: 'Bedding', slug: 'bedding', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Bedding/zgbs/home-garden/1063252' },
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Household-Cleaning-Supplies/zgbs/home-garden/10802561' },
      { name: 'Furniture', slug: 'furniture', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Furniture/zgbs/home-garden/1063306' },
      { name: 'Home Décor', slug: 'home-decor', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Home-Dcor-Products/zgbs/home-garden/1063278' },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Kitchen-Dining/zgbs/home-garden/284507' },
      { name: 'Storage & Organization', slug: 'storage-organization', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Home-Storage-Organization/zgbs/home-garden/3610841' },
      { name: 'Vacuums & Floor Care', slug: 'vacuums-floor-care', amazon_url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Vacuum-Cleaners-Floor-Care/zgbs/home-garden/510106' },
    ],
    topProduct: {
      asin: 'B0BZYCJK89',
      name: 'Owala FreeSip Insulated Stainless Steel Water Bottle with Straw, BPA-Free Sports Water Bottle, 24 Oz',
      price: 29.99,
      image_url: 'https://m.media-amazon.com/images/I/61d5awJLgML._AC_SY200_.jpg',
      amazon_url: 'https://www.amazon.com/Owala-FreeSip-Insulated-Stainless-BPA-Free/dp/B0BZYCJK89',
      rating: 4.7,
      review_count: 104132,
    }
  },
  {
    slug: 'books',
    amazonSlug: 'books',
    categories: [
      { name: 'Arts & Photography', slug: 'arts-photography', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Arts-Photography/zgbs/books/1' },
      { name: 'Biographies & Memoirs', slug: 'biographies-memoirs', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Biographies/zgbs/books/2' },
      { name: 'Business & Money', slug: 'business-money', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Business-Money/zgbs/books/3' },
      { name: 'Children\'s Books', slug: 'childrens-books', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Childrens-Books/zgbs/books/4' },
      { name: 'Cookbooks, Food & Wine', slug: 'cookbooks-food-wine', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Cookbooks-Food-Wine/zgbs/books/6' },
      { name: 'Health, Fitness & Dieting', slug: 'health-fitness-dieting', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Health-Fitness-Dieting/zgbs/books/10' },
      { name: 'History', slug: 'history', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-History/zgbs/books/9' },
      { name: 'Literature & Fiction', slug: 'literature-fiction', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Literature-Fiction/zgbs/books/17' },
      { name: 'Mystery, Thriller & Suspense', slug: 'mystery-thriller-suspense', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Mystery-Thriller-Suspense/zgbs/books/18' },
      { name: 'Science Fiction & Fantasy', slug: 'science-fiction-fantasy', amazon_url: 'https://www.amazon.com/Best-Sellers-Books-Science-Fiction-Fantasy/zgbs/books/25' },
    ],
    topProduct: {
      asin: '1401971369',
      name: 'The Let Them Theory: A Life-Changing Tool That Millions of People Can\'t Stop Talking About',
      price: 14.99,
      image_url: 'https://m.media-amazon.com/images/I/71mf7+e9ufL._SY342_.jpg',
      amazon_url: 'https://www.amazon.com/Let-Them-Theory-Life-Changing-Millions/dp/1401971369',
      rating: 4.6,
      review_count: 34955,
    }
  },
  {
    slug: 'toys-games',
    amazonSlug: 'toys-and-games',
    categories: [
      { name: 'Action Figures & Statues', slug: 'action-figures', amazon_url: 'https://www.amazon.com/Best-Sellers-Toys-Games-Action-Figures/zgbs/toys-and-games/166023011' },
      { name: 'Arts & Crafts', slug: 'arts-crafts', amazon_url: 'https://www.amazon.com/Best-Sellers-Toys-Games-Arts-Crafts/zgbs/toys-and-games/166034011' },
      { name: 'Building Toys', slug: 'building-toys', amazon_url: 'https://www.amazon.com/Best-Sellers-Toys-Games-Building-Toys/zgbs/toys-and-games/166043011' },
      { name: 'Dolls & Accessories', slug: 'dolls-accessories', amazon_url: 'https://www.amazon.com/Best-Sellers-Toys-Games-Dolls-Accessories/zgbs/toys-and-games/166057011' },
      { name: 'Games & Puzzles', slug: 'games-puzzles', amazon_url: 'https://www.amazon.com/Best-Sellers-Toys-Games-Games-Puzzles/zgbs/toys-and-games/166220011' },
    ],
    topProduct: {
      asin: 'B0CXZ3XZ2X',
      name: 'Squishmallows 8" Festive Yeti - Irresistibly Soft Plush Toy',
      price: 12.99,
      image_url: 'https://m.media-amazon.com/images/I/71v5B-AXZML._AC_SY200_.jpg',
      amazon_url: 'https://www.amazon.com/dp/B0CXZ3XZ2X',
      rating: 4.8,
      review_count: 15000,
    }
  },
  {
    slug: 'beauty',
    amazonSlug: 'beauty',
    categories: [
      { name: 'Makeup', slug: 'makeup', amazon_url: 'https://www.amazon.com/Best-Sellers-Beauty-Makeup/zgbs/beauty/11058281' },
      { name: 'Skin Care', slug: 'skin-care', amazon_url: 'https://www.amazon.com/Best-Sellers-Beauty-Skin-Care/zgbs/beauty/11060451' },
      { name: 'Hair Care', slug: 'hair-care', amazon_url: 'https://www.amazon.com/Best-Sellers-Beauty-Hair-Care/zgbs/beauty/11057241' },
      { name: 'Fragrance', slug: 'fragrance', amazon_url: 'https://www.amazon.com/Best-Sellers-Beauty-Fragrance/zgbs/beauty/11056591' },
      { name: 'Tools & Accessories', slug: 'tools-accessories', amazon_url: 'https://www.amazon.com/Best-Sellers-Beauty-Tools-Accessories/zgbs/beauty/11062741' },
    ],
    topProduct: {
      asin: 'B00UVK9L12',
      name: 'Maybelline Lash Sensational Sky High Mascara, Washable',
      price: 10.48,
      image_url: 'https://m.media-amazon.com/images/I/61Zqz4KfTQL._SY200_.jpg',
      amazon_url: 'https://www.amazon.com/dp/B00UVK9L12',
      rating: 4.4,
      review_count: 120000,
    }
  },
  {
    slug: 'fashion',
    amazonSlug: 'fashion',
    categories: [
      { name: 'Women\'s Fashion', slug: 'womens-fashion', amazon_url: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Women/zgbs/fashion/7147440011' },
      { name: 'Men\'s Fashion', slug: 'mens-fashion', amazon_url: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Men/zgbs/fashion/7147441011' },
      { name: 'Girls\' Fashion', slug: 'girls-fashion', amazon_url: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Girls/zgbs/fashion/7147442011' },
      { name: 'Boys\' Fashion', slug: 'boys-fashion', amazon_url: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Boys/zgbs/fashion/7147443011' },
      { name: 'Luggage & Travel', slug: 'luggage-travel', amazon_url: 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Luggage-Travel-Gear/zgbs/fashion/9479199011' },
    ],
    topProduct: {
      asin: 'B07MNF3N7V',
      name: 'Amazon Essentials Women\'s Classic-Fit Long-Sleeve Crewneck T-Shirt',
      price: 16.90,
      image_url: 'https://m.media-amazon.com/images/I/71-xLx5HBAL._AC_SY200_.jpg',
      amazon_url: 'https://www.amazon.com/dp/B07MNF3N7V',
      rating: 4.3,
      review_count: 85000,
    }
  },
];

async function seedDepartment(data: DepartmentData) {
  console.log(`\n📦 Seeding ${data.slug}...`);

  // Get department
  const { data: dept, error: deptError } = await supabase
    .from('departments')
    .select('id, name')
    .eq('slug', data.slug)
    .single();

  if (deptError || !dept) {
    console.error(`  ❌ Could not find department ${data.slug}:`, deptError?.message);
    return;
  }

  console.log(`  Found: ${dept.name}`);

  // Create or get main category
  let { data: mainCat } = await supabase
    .from('categories')
    .select('id')
    .eq('full_slug', data.slug)
    .single();

  if (!mainCat) {
    const { data: newCat, error: newCatError } = await supabase
      .from('categories')
      .insert({
        department_id: dept.id,
        name: dept.name,
        slug: data.slug,
        full_slug: data.slug,
        amazon_url: `https://www.amazon.com/Best-Sellers/zgbs/${data.amazonSlug}`,
        depth: 0,
      })
      .select()
      .single();

    if (newCatError) {
      console.error(`  ❌ Error creating main category:`, newCatError.message);
      return;
    }
    mainCat = newCat;
    console.log(`  + Created main category`);
  }

  // Insert subcategories
  if (!mainCat) {
    console.error(`  ❌ mainCat is null, cannot insert subcategories`);
    return;
  }

  let catCount = 0;
  for (const cat of data.categories) {
    const fullSlug = `${data.slug}/${cat.slug}`;
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('full_slug', fullSlug)
      .single();

    if (existingCat) continue;

    const { error: catError } = await supabase
      .from('categories')
      .insert({
        department_id: dept.id,
        parent_category_id: mainCat.id,
        name: cat.name,
        slug: cat.slug,
        full_slug: fullSlug,
        amazon_url: cat.amazon_url,
        depth: 1,
      });

    if (!catError) catCount++;
  }
  if (catCount > 0) console.log(`  + Added ${catCount} subcategories`);

  // Insert product
  let { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('asin', data.topProduct.asin)
    .single();

  if (!product) {
    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert({
        asin: data.topProduct.asin,
        name: data.topProduct.name,
        price: data.topProduct.price,
        image_url: data.topProduct.image_url,
        amazon_url: data.topProduct.amazon_url,
        rating: data.topProduct.rating,
        review_count: data.topProduct.review_count,
      })
      .select()
      .single();

    if (prodError) {
      console.error('  ❌ Error inserting product:', prodError.message);
      return;
    }
    product = newProduct;
    console.log(`  + Added product: ${data.topProduct.name.substring(0, 40)}...`);
  }

  // Create bestseller ranking
  if (!product) {
    console.error(`  ❌ product is null, cannot create ranking`);
    return;
  }

  const { data: existingRanking } = await supabase
    .from('bestseller_rankings')
    .select('id')
    .eq('category_id', mainCat.id)
    .eq('is_current', true)
    .single();

  if (!existingRanking) {
    const { error: rankError } = await supabase
      .from('bestseller_rankings')
      .insert({
        product_id: product.id,
        category_id: mainCat.id,
        is_current: true,
      });

    if (!rankError) {
      console.log(`  + Created bestseller ranking`);
    }
  }

  console.log(`  ✓ ${data.slug} complete!`);
}

async function main() {
  console.log('🚀 Starting data seed...');

  for (const dept of departmentData) {
    await seedDepartment(dept);
  }

  // Print summary
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: rankCount } = await supabase.from('bestseller_rankings').select('*', { count: 'exact', head: true });

  console.log('\n✅ Seed complete!');
  console.log(`   📁 ${catCount} categories`);
  console.log(`   📦 ${prodCount} products`);
  console.log(`   🏆 ${rankCount} bestseller rankings`);
}

main();
