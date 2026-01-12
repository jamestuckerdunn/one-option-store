import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDepartmentBySlug, getCategoriesWithProducts } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentPage({ params }: Props) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);

  if (!department) notFound();

  const categories = await getCategoriesWithProducts(department.id);
  const featured = categories.find((c) => c.product);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <nav className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-black">Home</Link>
              <span>/</span>
              <Link href="/browse" className="hover:text-black">Browse</Link>
              <span>/</span>
              <span className="text-black font-medium">{department.name}</span>
            </div>
          </div>
        </nav>

        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <h1 className="font-serif text-5xl font-bold mb-3">{department.name}</h1>
            <p className="text-lg text-gray-500">
              {categories.length} categories with #1 bestsellers
            </p>
          </div>
        </section>

        {featured?.product && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase rounded-full">
                  Featured
                </span>
                <h2 className="font-serif text-2xl font-bold">#1 in {department.name}</h2>
              </div>
              <div className="max-w-sm">
                <ProductCard
                  asin={featured.product.asin}
                  name={featured.product.name}
                  price={featured.product.price}
                  imageUrl={featured.product.image_url}
                  rating={featured.product.rating}
                  reviewCount={featured.product.review_count}
                  categoryName={featured.name}
                  categorySlug={featured.full_slug}
                />
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-serif text-3xl font-bold mb-8">All Categories</h2>

            {categories.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.full_slug}`}
                    className="group p-6 rounded-2xl bg-white border hover:shadow-lg transition"
                  >
                    <h3 className="font-serif text-lg font-bold mb-2">{category.name}</h3>
                    {category.product ? (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        #1: {category.product.name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">View bestseller</p>
                    )}
                    <div className="mt-4 flex items-center text-xs text-gray-400 group-hover:text-gray-600">
                      View category
                      <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-16 text-gray-500">No categories available.</p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
