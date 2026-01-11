import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string[] }>;
}

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
  amazon_url: string | null;
  departments: {
    id: string;
    name: string;
    slug: string;
  } | null;
  bestseller_rankings: Array<{
    id: string;
    products: ProductData | null;
  }>;
}

async function getCategoryData(slugParts: string[]): Promise<CategoryData | null> {
  const supabase = createServerClient();
  const fullSlug = slugParts.join('/');

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      full_slug,
      amazon_url,
      departments (
        id,
        name,
        slug
      ),
      bestseller_rankings (
        id,
        products (
          id,
          asin,
          name,
          price,
          image_url,
          amazon_url,
          rating,
          review_count
        )
      )
    `)
    .eq('full_slug', fullSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as CategoryData;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryData(slug);

  if (!category) {
    notFound();
  }

  const product = category.bestseller_rankings?.[0]?.products;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="font-sans text-sm text-[#333333]">
              <Link href="/" className="hover:opacity-60 transition-opacity">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/browse" className="hover:opacity-60 transition-opacity">
                Browse
              </Link>
              {category.departments && (
                <>
                  <span className="mx-2">/</span>
                  <Link
                    href={`/department/${category.departments.slug}`}
                    className="hover:opacity-60 transition-opacity"
                  >
                    {category.departments.name}
                  </Link>
                </>
              )}
              <span className="mx-2">/</span>
              <span className="text-black">{category.name}</span>
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
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="font-serif text-3xl font-bold mb-4">
                {category.name}
              </h1>
              <p className="font-sans text-[#333333] mb-8">
                No bestseller data available for this category yet.
              </p>
              {category.amazon_url && (
                <a
                  href={category.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-medium hover:opacity-80 transition-opacity"
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
        <section className="border-t border-[#e5e5e5] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-xl font-bold mb-4">
              About This Category
            </h2>
            <p className="font-sans text-[#333333] mb-6">
              This product is the current #1 bestseller in Amazon&apos;s {category.name} category.
              Rankings are updated frequently to ensure you always see the top choice.
            </p>

            {category.amazon_url && (
              <a
                href={category.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-sans text-sm hover:opacity-60 transition-opacity"
              >
                View full category on Amazon
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
