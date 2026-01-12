import { getCategoryByFullSlug, getBestsellerForCategory, getDepartmentBySlug } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join('/');

  const category = await getCategoryByFullSlug(fullSlug);
  if (!category) {
    notFound();
  }

  const product = await getBestsellerForCategory(category.id);

  // Get department for breadcrumb
  let department = null;
  if (category.department_id) {
    const deptSlug = slug[0];
    department = await getDepartmentBySlug(deptSlug);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="font-sans text-sm text-gray-500 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/browse" className="hover:text-black transition-colors">
                Browse
              </Link>
              {department && (
                <>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link
                    href={`/department/${department.slug}`}
                    className="hover:text-black transition-colors"
                  >
                    {department.name}
                  </Link>
                </>
              )}
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Hero or Empty State */}
        {product ? (
          <ProductHero
            asin={product.asin}
            name={product.name}
            price={product.price}
            imageUrl={product.image_url}
            amazonUrl={product.amazon_url}
            rating={product.rating}
            reviewCount={product.review_count}
            categoryName={category.name}
          />
        ) : (
          <section className="relative overflow-hidden py-20 lg:py-28">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming Soon
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                {category.name}
              </h1>
              <p className="font-sans text-lg text-gray-500 mb-10 max-w-lg mx-auto">
                No bestseller data available for this category yet. Check back soon!
              </p>
              {category.amazon_url && (
                <a
                  href={category.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  View on Amazon
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Category Info */}
        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl font-bold mb-4">
                About This Category
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed mb-6">
                This product is the current #1 bestseller in Amazon&apos;s {category.name} category.
                Rankings are updated frequently to ensure you always see the top choice.
              </p>

              {category.amazon_url && (
                <a
                  href={category.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors group"
                >
                  View full category on Amazon
                  <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
