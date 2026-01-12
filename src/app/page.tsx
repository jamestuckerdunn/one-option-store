import { getCurrentBestsellers } from '@/lib/db';
import { logger } from '@/lib/logger';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const bestsellers = await getCurrentBestsellers().catch((error) => {
    logger.error('Failed to fetch bestsellers for homepage', error);
    return [];
  });
  const heroProduct = bestsellers[0];
  const feedProducts = bestsellers.slice(1, 13);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {heroProduct && (
          <ProductHero
            asin={heroProduct.product.asin}
            name={heroProduct.product.name}
            price={heroProduct.product.price}
            imageUrl={heroProduct.product.image_url}
            amazonUrl={heroProduct.product.amazon_url}
            rating={heroProduct.product.rating}
            reviewCount={heroProduct.product.review_count}
            categoryName={heroProduct.category.name}
          />
        )}

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
                  <ProductCard
                    key={item.product.id}
                    asin={item.product.asin}
                    name={item.product.name}
                    price={item.product.price}
                    imageUrl={item.product.image_url}
                    rating={item.product.rating}
                    reviewCount={item.product.review_count}
                    categoryName={item.category.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-gray-500">
                  No products to display. Database may be initializing.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-black text-white">
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
