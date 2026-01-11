import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import ProductCard from '@/components/products/ProductCard';

interface ProductData {
  id: string;
  asin: string;
  name: string;
  price: number | null;
  image_url: string | null;
  amazon_url: string;
  rating: number | null;
  review_count: number | null;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  full_slug: string;
  departments: {
    name: string;
    slug: string;
  } | null;
}

interface BestsellerRanking {
  id: string;
  became_number_one_at: string;
  products: ProductData | null;
  categories: CategoryData | null;
}

async function getBestsellers(): Promise<BestsellerRanking[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('bestseller_rankings')
    .select(`
      id,
      became_number_one_at,
      products (
        id,
        asin,
        name,
        price,
        image_url,
        amazon_url,
        rating,
        review_count
      ),
      categories (
        id,
        name,
        slug,
        full_slug,
        departments (
          name,
          slug
        )
      )
    `)
    .eq('is_current', true)
    .order('became_number_one_at', { ascending: false });

  if (error) {
    console.error('Error fetching bestsellers:', error);
    return [];
  }

  return (data || []) as unknown as BestsellerRanking[];
}

export default async function Home() {
  const bestsellers = await getBestsellers();

  // Get the most recent bestseller for the hero
  const heroProduct = bestsellers[0];
  const feedProducts = bestsellers.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        {heroProduct && heroProduct.products && heroProduct.categories && (
          <ProductHero
            asin={heroProduct.products.asin}
            name={heroProduct.products.name}
            price={heroProduct.products.price}
            imageUrl={heroProduct.products.image_url}
            amazonUrl={heroProduct.products.amazon_url}
            rating={heroProduct.products.rating}
            reviewCount={heroProduct.products.review_count}
            categoryName={heroProduct.categories.name}
          />
        )}

        {/* Intro Section */}
        <section className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              The Best Choice Is No Choice
            </h2>
            <p className="font-sans text-[#333333] max-w-2xl mx-auto">
              Why waste time comparing when you can have the #1 bestseller?
              We show you only the top-ranked product in every Amazon category.
            </p>
          </div>
        </section>

        {/* Product Feed */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold mb-8">
              More #1 Bestsellers
            </h2>

            {feedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {feedProducts.map((item) => (
                  item.products && item.categories && (
                    <ProductCard
                      key={item.id}
                      asin={item.products.asin}
                      name={item.products.name}
                      price={item.products.price}
                      imageUrl={item.products.image_url}
                      rating={item.products.rating}
                      reviewCount={item.products.review_count}
                      categoryName={item.categories.name}
                      categorySlug={item.categories.full_slug}
                    />
                  )
                ))}
              </div>
            ) : (
              <p className="font-sans text-[#333333] text-center py-12">
                No additional products to display.
              </p>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-[#e5e5e5] bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              Explore All Departments
            </h2>
            <p className="font-sans text-[#e5e5e5] mb-8 max-w-2xl mx-auto">
              Browse through 40+ departments and discover the #1 bestseller in each category.
            </p>
            <a
              href="/browse"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Browse All Departments
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
