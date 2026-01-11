import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Department data with Amazon slugs
const departments = [
  { name: 'Amazon Devices & Accessories', dbSlug: 'amazon-devices', amazonSlug: 'amazon-devices' },
  { name: 'Appliances', dbSlug: 'appliances', amazonSlug: 'appliances' },
  { name: 'Apps & Games', dbSlug: 'apps-games', amazonSlug: 'mobile-apps' },
  { name: 'Arts, Crafts & Sewing', dbSlug: 'arts-crafts-sewing', amazonSlug: 'arts-crafts' },
  { name: 'Automotive', dbSlug: 'automotive', amazonSlug: 'automotive' },
  { name: 'Baby', dbSlug: 'baby', amazonSlug: 'baby-products' },
  { name: 'Beauty & Personal Care', dbSlug: 'beauty', amazonSlug: 'beauty' },
  { name: 'Books', dbSlug: 'books', amazonSlug: 'books' },
  { name: 'Camera & Photo Products', dbSlug: 'camera-photo', amazonSlug: 'photo' },
  { name: 'CDs & Vinyl', dbSlug: 'cds-vinyl', amazonSlug: 'music' },
  { name: 'Cell Phones & Accessories', dbSlug: 'cell-phones', amazonSlug: 'wireless' },
  { name: 'Clothing, Shoes & Jewelry', dbSlug: 'fashion', amazonSlug: 'fashion' },
  { name: 'Collectible Coins', dbSlug: 'collectible-coins', amazonSlug: 'coins' },
  { name: 'Computers & Accessories', dbSlug: 'computers', amazonSlug: 'pc' },
  { name: 'Electronics', dbSlug: 'electronics', amazonSlug: 'electronics' },
  { name: 'Gift Cards', dbSlug: 'gift-cards', amazonSlug: 'gift-cards' },
  { name: 'Grocery & Gourmet Food', dbSlug: 'grocery', amazonSlug: 'grocery' },
  { name: 'Handmade Products', dbSlug: 'handmade', amazonSlug: 'handmade' },
  { name: 'Health & Household', dbSlug: 'health-household', amazonSlug: 'hpc' },
  { name: 'Home & Kitchen', dbSlug: 'home-kitchen', amazonSlug: 'home-garden' },
  { name: 'Industrial & Scientific', dbSlug: 'industrial', amazonSlug: 'industrial' },
  { name: 'Kindle Store', dbSlug: 'kindle-store', amazonSlug: 'digital-text' },
  { name: 'Kitchen & Dining', dbSlug: 'kitchen-dining', amazonSlug: 'kitchen' },
  { name: 'Movies & TV', dbSlug: 'movies-tv', amazonSlug: 'movies-tv' },
  { name: 'Musical Instruments', dbSlug: 'musical-instruments', amazonSlug: 'mi' },
  { name: 'Office Products', dbSlug: 'office-products', amazonSlug: 'office-products' },
  { name: 'Patio, Lawn & Garden', dbSlug: 'patio-lawn-garden', amazonSlug: 'lawn-garden' },
  { name: 'Pet Supplies', dbSlug: 'pet-supplies', amazonSlug: 'pet-supplies' },
  { name: 'Software', dbSlug: 'software', amazonSlug: 'software' },
  { name: 'Sports & Outdoors', dbSlug: 'sports-outdoors', amazonSlug: 'sporting-goods' },
  { name: 'Tools & Home Improvement', dbSlug: 'tools-home-improvement', amazonSlug: 'hi' },
  { name: 'Toys & Games', dbSlug: 'toys-games', amazonSlug: 'toys-and-games' },
  { name: 'Video Games', dbSlug: 'video-games', amazonSlug: 'videogames' },
];

interface ScrapedProduct {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string;
  amazonUrl: string;
  rating: number | null;
  reviewCount: number | null;
}

interface ScrapedCategory {
  name: string;
  slug: string;
  amazonUrl: string;
  product: ScrapedProduct | null;
}

interface ScrapedDepartment {
  name: string;
  dbSlug: string;
  amazonSlug: string;
  categories: ScrapedCategory[];
  topProduct: ScrapedProduct | null;
}

// Convert scraped image URL to stable format
function toStableImageUrl(imageUrl: string): string {
  // Extract image ID from various Amazon image URL formats
  const match = imageUrl.match(/\/images\/I\/([A-Za-z0-9+\-_]+)\./);
  if (match) {
    const imageId = match[1];
    return `https://m.media-amazon.com/images/I/${imageId}._AC_SL500_.jpg`;
  }
  return imageUrl;
}

// This data will be populated by browser scraping
// For now, using sample data with correct stable image URLs
const scrapedData: ScrapedDepartment[] = [
  {
    name: 'Electronics',
    dbSlug: 'electronics',
    amazonSlug: 'electronics',
    categories: [
      { name: 'Accessories & Supplies', slug: 'accessories-supplies', amazonUrl: 'https://www.amazon.com/Best-Sellers-Electronics-Accessories-Supplies/zgbs/electronics/281407', product: null },
      { name: 'Camera & Photo', slug: 'camera-photo', amazonUrl: 'https://www.amazon.com/Best-Sellers-Electronics-Camera-Photo/zgbs/electronics/502394', product: null },
      { name: 'Car Electronics', slug: 'car-electronics', amazonUrl: 'https://www.amazon.com/Best-Sellers-Electronics-Car-Electronics/zgbs/electronics/1077068', product: null },
      { name: 'Cell Phones & Accessories', slug: 'cell-phones-accessories', amazonUrl: 'https://www.amazon.com/Best-Sellers-Cell-Phones-Accessories/zgbs/electronics/2811119011', product: null },
      { name: 'Computers & Accessories', slug: 'computers-accessories', amazonUrl: 'https://www.amazon.com/Best-Sellers-Computers-Accessories/zgbs/electronics/541966', product: null },
      { name: 'GPS & Navigation', slug: 'gps-navigation', amazonUrl: 'https://www.amazon.com/Best-Sellers-GPS-Navigation/zgbs/electronics/172526', product: null },
      { name: 'Headphones', slug: 'headphones', amazonUrl: 'https://www.amazon.com/Best-Sellers-Headphones/zgbs/electronics/172541', product: null },
      { name: 'Home Audio & Theater', slug: 'home-audio-theater', amazonUrl: 'https://www.amazon.com/Best-Sellers-Home-Audio-Theater/zgbs/electronics/667846011', product: null },
      { name: 'Office Electronics', slug: 'office-electronics', amazonUrl: 'https://www.amazon.com/Best-Sellers-Office-Electronics/zgbs/electronics/172574', product: null },
      { name: 'Security & Surveillance', slug: 'security-surveillance', amazonUrl: 'https://www.amazon.com/Best-Sellers-Security-Surveillance/zgbs/electronics/524136', product: null },
      { name: 'Televisions & Video', slug: 'televisions-video', amazonUrl: 'https://www.amazon.com/Best-Sellers-Televisions-Video/zgbs/electronics/1266092011', product: null },
      { name: 'Wearable Technology', slug: 'wearable-technology', amazonUrl: 'https://www.amazon.com/Best-Sellers-Wearable-Technology/zgbs/electronics/10048700011', product: null },
    ],
    topProduct: {
      asin: 'B08JHCVHTY',
      name: 'Blink Subscription Plan PLUS (monthly auto-renewal)',
      price: 10.00,
      imageUrl: 'https://m.media-amazon.com/images/I/316iIKOVz7L._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/B08JHCVHTY',
      rating: 4.4,
      reviewCount: 269116,
    }
  },
  {
    name: 'Home & Kitchen',
    dbSlug: 'home-kitchen',
    amazonSlug: 'home-garden',
    categories: [
      { name: 'Bath', slug: 'bath', amazonUrl: 'https://www.amazon.com/Best-Sellers-Bath/zgbs/home-garden/1063236', product: null },
      { name: 'Bedding', slug: 'bedding', amazonUrl: 'https://www.amazon.com/Best-Sellers-Bedding/zgbs/home-garden/1063252', product: null },
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies', amazonUrl: 'https://www.amazon.com/Best-Sellers-Cleaning-Supplies/zgbs/home-garden/10802561', product: null },
      { name: 'Furniture', slug: 'furniture', amazonUrl: 'https://www.amazon.com/Best-Sellers-Furniture/zgbs/home-garden/1063306', product: null },
      { name: 'Home Decor', slug: 'home-decor', amazonUrl: 'https://www.amazon.com/Best-Sellers-Home-Decor/zgbs/home-garden/1063278', product: null },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', amazonUrl: 'https://www.amazon.com/Best-Sellers-Kitchen-Dining/zgbs/home-garden/284507', product: null },
      { name: 'Storage & Organization', slug: 'storage-organization', amazonUrl: 'https://www.amazon.com/Best-Sellers-Storage-Organization/zgbs/home-garden/3610841', product: null },
      { name: 'Vacuums & Floor Care', slug: 'vacuums-floor-care', amazonUrl: 'https://www.amazon.com/Best-Sellers-Vacuums-Floor-Care/zgbs/home-garden/510106', product: null },
    ],
    topProduct: {
      asin: 'B0BZYCJK89',
      name: 'Owala FreeSip Insulated Stainless Steel Water Bottle with Straw, BPA-Free Sports Water Bottle, Great for Travel, 24 Oz, Denim',
      price: 29.99,
      imageUrl: 'https://m.media-amazon.com/images/I/61sS-XIvEXL._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/B0BZYCJK89',
      rating: 4.7,
      reviewCount: 104133,
    }
  },
  {
    name: 'Books',
    dbSlug: 'books',
    amazonSlug: 'books',
    categories: [
      { name: 'Arts & Photography', slug: 'arts-photography', amazonUrl: 'https://www.amazon.com/Best-Sellers-Arts-Photography/zgbs/books/1', product: null },
      { name: 'Biographies & Memoirs', slug: 'biographies-memoirs', amazonUrl: 'https://www.amazon.com/Best-Sellers-Biographies/zgbs/books/2', product: null },
      { name: 'Business & Money', slug: 'business-money', amazonUrl: 'https://www.amazon.com/Best-Sellers-Business-Money/zgbs/books/3', product: null },
      { name: "Children's Books", slug: 'childrens-books', amazonUrl: 'https://www.amazon.com/Best-Sellers-Childrens-Books/zgbs/books/4', product: null },
      { name: 'Cookbooks, Food & Wine', slug: 'cookbooks-food-wine', amazonUrl: 'https://www.amazon.com/Best-Sellers-Cookbooks-Food-Wine/zgbs/books/6', product: null },
      { name: 'Health, Fitness & Dieting', slug: 'health-fitness-dieting', amazonUrl: 'https://www.amazon.com/Best-Sellers-Health-Fitness-Dieting/zgbs/books/10', product: null },
      { name: 'Literature & Fiction', slug: 'literature-fiction', amazonUrl: 'https://www.amazon.com/Best-Sellers-Literature-Fiction/zgbs/books/17', product: null },
      { name: 'Mystery, Thriller & Suspense', slug: 'mystery-thriller-suspense', amazonUrl: 'https://www.amazon.com/Best-Sellers-Mystery-Thriller-Suspense/zgbs/books/18', product: null },
      { name: 'Science Fiction & Fantasy', slug: 'science-fiction-fantasy', amazonUrl: 'https://www.amazon.com/Best-Sellers-Science-Fiction-Fantasy/zgbs/books/25', product: null },
      { name: 'Self-Help', slug: 'self-help', amazonUrl: 'https://www.amazon.com/Best-Sellers-Self-Help/zgbs/books/4736', product: null },
    ],
    topProduct: {
      asin: '1401971369',
      name: "The Let Them Theory: A Life-Changing Tool That Millions of People Can't Stop Talking About",
      price: 18.89,
      imageUrl: 'https://m.media-amazon.com/images/I/71mf7+e9ufL._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/1401971369',
      rating: 4.6,
      reviewCount: 34955,
    }
  },
  {
    name: 'Toys & Games',
    dbSlug: 'toys-games',
    amazonSlug: 'toys-and-games',
    categories: [
      { name: 'Action Figures & Statues', slug: 'action-figures', amazonUrl: 'https://www.amazon.com/Best-Sellers-Action-Figures/zgbs/toys-and-games/166023011', product: null },
      { name: 'Arts & Crafts', slug: 'arts-crafts', amazonUrl: 'https://www.amazon.com/Best-Sellers-Arts-Crafts/zgbs/toys-and-games/166034011', product: null },
      { name: 'Building Toys', slug: 'building-toys', amazonUrl: 'https://www.amazon.com/Best-Sellers-Building-Toys/zgbs/toys-and-games/166043011', product: null },
      { name: 'Dolls & Accessories', slug: 'dolls-accessories', amazonUrl: 'https://www.amazon.com/Best-Sellers-Dolls-Accessories/zgbs/toys-and-games/166057011', product: null },
      { name: 'Games & Puzzles', slug: 'games-puzzles', amazonUrl: 'https://www.amazon.com/Best-Sellers-Games-Puzzles/zgbs/toys-and-games/166220011', product: null },
      { name: 'Stuffed Animals & Plush Toys', slug: 'stuffed-animals', amazonUrl: 'https://www.amazon.com/Best-Sellers-Stuffed-Animals/zgbs/toys-and-games/166461011', product: null },
    ],
    topProduct: {
      asin: 'B0DHZJQ2HG',
      name: 'LEGO Star Wars: The Mandalorian N-1 Starfighter Microfighter',
      price: 15.99,
      imageUrl: 'https://m.media-amazon.com/images/I/81HBLcJTseL._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/B0DHZJQ2HG',
      rating: 4.8,
      reviewCount: 5000,
    }
  },
  {
    name: 'Beauty & Personal Care',
    dbSlug: 'beauty',
    amazonSlug: 'beauty',
    categories: [
      { name: 'Makeup', slug: 'makeup', amazonUrl: 'https://www.amazon.com/Best-Sellers-Makeup/zgbs/beauty/11058281', product: null },
      { name: 'Skin Care', slug: 'skin-care', amazonUrl: 'https://www.amazon.com/Best-Sellers-Skin-Care/zgbs/beauty/11060451', product: null },
      { name: 'Hair Care', slug: 'hair-care', amazonUrl: 'https://www.amazon.com/Best-Sellers-Hair-Care/zgbs/beauty/11057241', product: null },
      { name: 'Fragrance', slug: 'fragrance', amazonUrl: 'https://www.amazon.com/Best-Sellers-Fragrance/zgbs/beauty/11056591', product: null },
      { name: 'Tools & Accessories', slug: 'tools-accessories', amazonUrl: 'https://www.amazon.com/Best-Sellers-Tools-Accessories/zgbs/beauty/11062741', product: null },
      { name: 'Foot, Hand & Nail Care', slug: 'foot-hand-nail', amazonUrl: 'https://www.amazon.com/Best-Sellers-Foot-Hand-Nail/zgbs/beauty/11062211', product: null },
    ],
    topProduct: {
      asin: 'B07NNRP6BF',
      name: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
      price: 9.99,
      imageUrl: 'https://m.media-amazon.com/images/I/61xBXiVYAuL._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/B07NNRP6BF',
      rating: 4.5,
      reviewCount: 115000,
    }
  },
  {
    name: 'Clothing, Shoes & Jewelry',
    dbSlug: 'fashion',
    amazonSlug: 'fashion',
    categories: [
      { name: "Women's Fashion", slug: 'womens-fashion', amazonUrl: 'https://www.amazon.com/Best-Sellers-Womens-Fashion/zgbs/fashion/7147440011', product: null },
      { name: "Men's Fashion", slug: 'mens-fashion', amazonUrl: 'https://www.amazon.com/Best-Sellers-Mens-Fashion/zgbs/fashion/7147441011', product: null },
      { name: "Girls' Fashion", slug: 'girls-fashion', amazonUrl: 'https://www.amazon.com/Best-Sellers-Girls-Fashion/zgbs/fashion/7147442011', product: null },
      { name: "Boys' Fashion", slug: 'boys-fashion', amazonUrl: 'https://www.amazon.com/Best-Sellers-Boys-Fashion/zgbs/fashion/7147443011', product: null },
      { name: 'Luggage & Travel', slug: 'luggage-travel', amazonUrl: 'https://www.amazon.com/Best-Sellers-Luggage-Travel/zgbs/fashion/9479199011', product: null },
      { name: 'Jewelry', slug: 'jewelry', amazonUrl: 'https://www.amazon.com/Best-Sellers-Jewelry/zgbs/fashion/7192394011', product: null },
      { name: 'Watches', slug: 'watches', amazonUrl: 'https://www.amazon.com/Best-Sellers-Watches/zgbs/fashion/6358539011', product: null },
    ],
    topProduct: {
      asin: 'B09RGRJ13P',
      name: 'Amazon Essentials Unisex Adults Lightweight Water-Resistant Packable Puffer Vest',
      price: 33.10,
      imageUrl: 'https://m.media-amazon.com/images/I/81+t+xyiCML._AC_SL500_.jpg',
      amazonUrl: 'https://www.amazon.com/dp/B09RGRJ13P',
      rating: 4.4,
      reviewCount: 15000,
    }
  },
];

async function seedFromScrapedData() {
  console.log('🚀 Starting database update with scraped data...\n');

  for (const dept of scrapedData) {
    console.log(`\n📦 Processing ${dept.name}...`);

    // Get or create department
    let { data: dbDept } = await supabase
      .from('departments')
      .select('id, name')
      .eq('slug', dept.dbSlug)
      .single();

    if (!dbDept) {
      const { data: newDept, error } = await supabase
        .from('departments')
        .insert({ name: dept.name, slug: dept.dbSlug })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Error creating department: ${error.message}`);
        continue;
      }
      dbDept = newDept;
      console.log(`  + Created department: ${dept.name}`);
    }

    // Get or create main category
    let { data: mainCat } = await supabase
      .from('categories')
      .select('id')
      .eq('full_slug', dept.dbSlug)
      .single();

    if (!mainCat) {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert({
          department_id: dbDept.id,
          name: dept.name,
          slug: dept.dbSlug,
          full_slug: dept.dbSlug,
          amazon_url: `https://www.amazon.com/Best-Sellers/zgbs/${dept.amazonSlug}`,
          depth: 0,
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Error creating main category: ${error.message}`);
        continue;
      }
      mainCat = newCat;
      console.log(`  + Created main category`);
    }

    // Insert subcategories
    let catCount = 0;
    for (const cat of dept.categories) {
      const fullSlug = `${dept.dbSlug}/${cat.slug}`;

      const { data: existingCat } = await supabase
        .from('categories')
        .select('id')
        .eq('full_slug', fullSlug)
        .single();

      if (!existingCat) {
        const { error } = await supabase
          .from('categories')
          .insert({
            department_id: dbDept.id,
            parent_category_id: mainCat.id,
            name: cat.name,
            slug: cat.slug,
            full_slug: fullSlug,
            amazon_url: cat.amazonUrl,
            depth: 1,
          });

        if (!error) catCount++;
      }
    }
    if (catCount > 0) console.log(`  + Added ${catCount} subcategories`);

    // Insert top product
    if (dept.topProduct) {
      let { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('asin', dept.topProduct.asin)
        .single();

      if (!product) {
        const { data: newProd, error } = await supabase
          .from('products')
          .insert({
            asin: dept.topProduct.asin,
            name: dept.topProduct.name,
            price: dept.topProduct.price,
            image_url: dept.topProduct.imageUrl,
            amazon_url: dept.topProduct.amazonUrl,
            rating: dept.topProduct.rating,
            review_count: dept.topProduct.reviewCount,
          })
          .select()
          .single();

        if (error) {
          console.error(`  ❌ Error inserting product: ${error.message}`);
        } else {
          product = newProd;
          console.log(`  + Added product: ${dept.topProduct.name.substring(0, 40)}...`);
        }
      } else {
        // Update existing product with stable image URL
        const { error } = await supabase
          .from('products')
          .update({ image_url: dept.topProduct.imageUrl })
          .eq('asin', dept.topProduct.asin);

        if (!error) {
          console.log(`  ↻ Updated product image URL`);
        }
      }

      // Create bestseller ranking
      if (product) {
        const { data: existingRanking } = await supabase
          .from('bestseller_rankings')
          .select('id')
          .eq('category_id', mainCat.id)
          .eq('is_current', true)
          .single();

        if (!existingRanking) {
          await supabase
            .from('bestseller_rankings')
            .insert({
              product_id: product.id,
              category_id: mainCat.id,
              is_current: true,
            });
          console.log(`  + Created bestseller ranking`);
        }
      }
    }

    console.log(`  ✓ ${dept.name} complete!`);
  }

  // Print summary
  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: rankCount } = await supabase.from('bestseller_rankings').select('*', { count: 'exact', head: true });

  console.log('\n✅ Update complete!');
  console.log(`   📁 ${catCount} categories`);
  console.log(`   📦 ${prodCount} products`);
  console.log(`   🏆 ${rankCount} bestseller rankings`);
}

seedFromScrapedData();
