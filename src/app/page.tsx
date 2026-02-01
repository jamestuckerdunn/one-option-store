import Link from 'next/link';
import Image from 'next/image';
import { getBestsellers, getDepartmentsWithCount, getBestsellersByDepartment } from '@/lib/db';
import { logger } from '@/lib/logger';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { StarRating } from '@/components/ui/StarRating';
import { SearchBar } from '@/components/ui/SearchBar';

export const revalidate = 300;

export default async function Home() {
  const [bestsellers, departments, departmentProducts] = await Promise.all([
    getBestsellers().catch((error) => {
      logger.error('Failed to fetch bestsellers', error);
      return [];
    }),
    getDepartmentsWithCount().catch((error) => {
      logger.error('Failed to fetch departments', error);
      return [];
    }),
    getBestsellersByDepartment(4).catch((error) => {
      logger.error('Failed to fetch department products', error);
      return [];
    }),
  ]);

  const featuredProducts = bestsellers.slice(0, 8);
  const activeDepartments = departments.filter((d) => d.productCount > 0);
  const totalProducts = departments.reduce((sum, d) => sum + d.productCount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Search Focused */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pattern-grid opacity-30" />
          <div className="relative max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
            <div className="animate-slide-up">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 gradient-text">
                The Best Choice Is No Choice
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                Stop comparing hundreds of options. We show you only the #1 bestseller in every Amazon category.
              </p>

              {/* Large Hero Search Bar */}
              <div className="max-w-xl mx-auto mb-8">
                <SearchBar size="large" placeholder="Search for any product..." />
              </div>

              <p className="text-sm text-gray-400">
                {totalProducts.toLocaleString()} bestselling products across {departments.length} departments
              </p>
            </div>
          </div>
        </section>

        {/* Quick Department Pills */}
        {activeDepartments.length > 0 && (
          <section className="py-6 border-y border-gray-100 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {activeDepartments.slice(0, 12).map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/department/${dept.slug}`}
                    className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-black hover:border-gray-300 hover:shadow-sm transition-all btn-press"
                  >
                    {dept.name}
                  </Link>
                ))}
                <Link
                  href="/browse"
                  className="flex-shrink-0 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all btn-press"
                >
                  View All
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Trending Bestsellers */}
        {featuredProducts.length > 0 && (
          <section className="py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">Trending Bestsellers</h2>
                  <p className="text-gray-500 mt-2">Top-rated products people are buying now</p>
                </div>
                <Link
                  href="/browse"
                  className="hidden sm:flex items-center text-sm font-medium text-gray-600 hover:text-black transition link-animate"
                >
                  View all
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Clean Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 stagger-fade">
                {featuredProducts.map((item) => (
                  <Link
                    key={item.product.id}
                    href={`/product/${item.product.asin}`}
                    className="group"
                  >
                    <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 card-hover">
                      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-white image-container">
                        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-black text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                          #1
                        </div>
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-contain p-6"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">{item.category.name}</p>
                        <h3 className="font-serif text-sm font-semibold leading-snug line-clamp-2 mb-3 group-hover:text-gray-600 transition">
                          {item.product.name}
                        </h3>

                        <div className="flex items-end justify-between">
                          {item.product.price !== null ? (
                            <span className="text-lg font-bold">${item.product.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Check price</span>
                          )}

                          {item.product.rating !== null && (
                            <StarRating rating={item.product.rating} size="sm" />
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Browse by Department */}
        {activeDepartments.length > 0 && (
          <section className="py-16 lg:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold">Browse by Department</h2>
                  <p className="text-gray-500 mt-2">{activeDepartments.length} departments with top products</p>
                </div>
                <Link
                  href="/browse"
                  className="hidden sm:flex items-center text-sm font-medium text-gray-600 hover:text-black transition link-animate"
                >
                  View all
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-fade">
                {activeDepartments.slice(0, 8).map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/department/${dept.slug}`}
                    className="group relative p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 card-hover"
                  >
                    <div className="flex flex-col h-full min-h-[120px]">
                      <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-gray-700 transition">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {dept.productCount} {dept.productCount === 1 ? 'product' : 'products'}
                      </p>
                      <div className="mt-auto flex items-center text-sm font-medium text-gray-500 group-hover:text-black transition">
                        Explore
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {activeDepartments.length > 8 && (
                <div className="text-center mt-8">
                  <Link
                    href="/browse"
                    className="inline-flex items-center px-6 py-3 border-2 border-gray-200 font-medium rounded-xl hover:border-black transition-all btn-press"
                  >
                    View All {activeDepartments.length} Departments
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Featured Department Showcase */}
        {departmentProducts.slice(0, 2).map((group, groupIndex) => (
          <section key={group.department.id} className={`py-16 lg:py-20 ${groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold">{group.department.name}</h2>
                  <p className="text-gray-500 mt-1">Top picks in this department</p>
                </div>
                <Link
                  href={`/department/${group.department.slug}`}
                  className="hidden sm:flex items-center text-sm font-medium text-gray-600 hover:text-black transition link-animate"
                >
                  See all
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 stagger-fade">
                {group.products.map((item) => (
                  <Link
                    key={item.product.id}
                    href={`/product/${item.product.asin}`}
                    className="group"
                  >
                    <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 card-hover">
                      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-white image-container">
                        <div className="absolute top-3 left-3 z-10 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                          #1
                        </div>
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">{item.category.name}</p>
                        <h3 className="font-serif text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-gray-600 transition">
                          {item.product.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          {item.product.price !== null ? (
                            <span className="text-lg font-bold">${item.product.price.toFixed(2)}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Check price</span>
                          )}

                          {item.product.rating !== null && (
                            <StarRating rating={item.product.rating} size="sm" />
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Final CTA Section */}
        <section className="relative py-20 lg:py-24 bg-black text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="pattern-grid" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)' }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Find Your Perfect Product
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Browse {totalProducts.toLocaleString()} bestselling products across {departments.length} departments. No endless scrolling, no decision fatigue.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all btn-press"
            >
              Browse All Departments
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
