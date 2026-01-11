import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ asin: string }>;
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

interface RankingData {
  id: string;
  is_current: boolean;
  became_number_one_at: string;
  categories: CategoryData | null;
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
  bestseller_rankings: RankingData[];
}

async function getProductData(asin: string): Promise<ProductData | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      asin,
      name,
      price,
      image_url,
      amazon_url,
      rating,
      review_count,
      bestseller_rankings (
        id,
        is_current,
        became_number_one_at,
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
      )
    `)
    .eq('asin', asin)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as ProductData;
}

export default async function ProductPage({ params }: Props) {
  const { asin } = await params;
  const product = await getProductData(asin);

  if (!product) {
    notFound();
  }

  // Get current rankings (categories where this is #1)
  const currentRankings = product.bestseller_rankings?.filter((r) => r.is_current) || [];

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
              <span className="text-black">Product</span>
            </nav>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Product Image */}
              <div className="aspect-square relative bg-white border border-[#e5e5e5]">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#333333]">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                {/* Category Badges */}
                {currentRankings.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentRankings.map((ranking) => (
                      <Link
                        key={ranking.id}
                        href={`/category/${ranking.categories?.full_slug}`}
                        className="inline-block border border-black px-3 py-1 text-xs font-sans uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                      >
                        #1 in {ranking.categories?.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Product Name */}
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating !== null && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(product.rating!) ? 'fill-black' : 'fill-[#e5e5e5]'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-sans text-sm text-[#333333]">
                      {product.rating.toFixed(1)} ({product.review_count?.toLocaleString()} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                {product.price !== null && (
                  <p className="mt-6 font-sans text-4xl font-bold">
                    ${product.price.toFixed(2)}
                  </p>
                )}

                {/* Buy Button */}
                <div className="mt-8">
                  <a
                    href={product.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-medium hover:opacity-80 transition-opacity w-full sm:w-auto"
                  >
                    Buy on Amazon
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-[#e5e5e5]">
                  <h2 className="font-serif text-lg font-bold mb-4">
                    Why This Product?
                  </h2>
                  <p className="font-sans text-[#333333]">
                    This is the #1 bestselling product in its category on Amazon.
                    We track bestseller rankings continuously to ensure you always
                    see the top choice based on actual sales data.
                  </p>
                </div>

                {/* ASIN */}
                <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                  <p className="font-sans text-xs text-[#333333]">
                    ASIN: {product.asin}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
