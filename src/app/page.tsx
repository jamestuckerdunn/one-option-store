import Link from 'next/link';
import { getBestsellers } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import ProductCard from '@/components/products/ProductCard';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const bestsellers = await getBestsellers().catch(() => []);
  const hero = bestsellers[0];
  const products = bestsellers.slice(1, 13);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {hero && (
          <ProductHero
            asin={hero.product.asin}
            name={hero.product.name}
            price={hero.product.price}
            imageUrl={hero.product.image_url}
            amazonUrl={hero.product.amazon_url}
            rating={hero.product.rating}
            reviewCount={hero.product.review_count}
            categoryName={hero.category.name}
          />
        )}

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl font-bold mb-6">
              The Best Choice Is No Choice
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Why compare hundreds of products? We show you only the #1 bestseller in every Amazon category.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-serif text-3xl font-bold">More Bestsellers</h2>
                <p className="text-gray-500 mt-2">Top products across all categories</p>
              </div>
              <Link href="/browse" className="hidden sm:flex items-center text-sm text-gray-600 hover:text-black">
                View all
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((item) => (
                  <ProductCard
                    key={item.product.id}
                    asin={item.product.asin}
                    name={item.product.name}
                    price={item.product.price}
                    imageUrl={item.product.image_url}
                    rating={item.product.rating}
                    reviewCount={item.product.review_count}
                    categoryName={item.category.name}
                    categorySlug={item.category.full_slug}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center py-16 text-gray-500">No products available.</p>
            )}
          </div>
        </section>

        <section className="bg-black text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl font-bold mb-6">Explore All Departments</h2>
            <p className="text-gray-300 mb-10">
              Browse 20+ departments and find the #1 bestseller in every category.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Browse Departments
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
