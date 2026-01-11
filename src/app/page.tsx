import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';

// Disable caching to always fetch fresh data from database
export const revalidate = 0;

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
        <section className="py-20 lg:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              The Best Choice Is No Choice
            </h2>
            <p className="font-sans text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Why waste time comparing hundreds of products? We show you only the #1 bestselling item in every Amazon category. Simple, curated, decisive.
            </p>
          </div>
        </section>

        {/* Product Feed */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                  More #1 Bestsellers
                </h2>
                <p className="font-sans text-gray-500 mt-2">
                  The top-selling products across all categories
                </p>
              </div>
              <Link
                href="/browse"
                className="hidden sm:inline-flex items-center font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                View all departments
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {feedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
              <div className="text-center py-16">
                <p className="font-sans text-gray-500">
                  No additional products to display.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-black text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Explore All Departments
            </h2>
            <p className="font-sans text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Browse through 40+ departments and discover the #1 bestseller in hundreds of categories.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-sm font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Browse All Departments
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
