import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getBestsellerByCategory, getDepartmentBySlug } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join('/');

  const category = await getCategoryBySlug(fullSlug);
  if (!category) notFound();

  const product = await getBestsellerByCategory(category.id);
  const department = await getDepartmentBySlug(slug[0]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <nav className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <Link href="/" className="hover:text-black">Home</Link>
              <span>/</span>
              <Link href="/browse" className="hover:text-black">Browse</Link>
              {department && (
                <>
                  <span>/</span>
                  <Link href={`/department/${department.slug}`} className="hover:text-black">
                    {department.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-black font-medium">{category.name}</span>
            </div>
          </div>
        </nav>

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
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <span className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 text-xs font-semibold uppercase rounded-full mb-6">
                Coming Soon
              </span>
              <h1 className="font-serif text-5xl font-bold mb-4">{category.name}</h1>
              <p className="text-lg text-gray-500">
                No bestseller data available for this category yet.
              </p>
            </div>
          </section>
        )}

        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl font-bold mb-4">About This Category</h2>
              <p className="text-gray-600 leading-relaxed">
                This product is the current #1 bestseller in Amazon&apos;s {category.name} category.
                Rankings are updated regularly to ensure you see the top choice.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
