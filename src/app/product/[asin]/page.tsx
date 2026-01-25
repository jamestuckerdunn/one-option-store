import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductByAsin, getProductCategories } from '@/lib/db';
import { isValidAsin } from '@/lib/validation';
import { getAffiliateUrl } from '@/lib/affiliate';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { StarRating } from '@/components/ui/StarRating';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export const revalidate = 300; // Revalidate every 5 minutes

interface Props {
  params: Promise<{ asin: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { asin } = await params;
  if (!isValidAsin(asin)) return {};

  const product = await getProductByAsin(asin);
  if (!product) return {};

  const categories = await getProductCategories(product.id);
  const categoryNames = categories.map(c => c.name).join(', ');

  return {
    title: product.name,
    description: `${product.name} - #1 bestseller${categoryNames ? ` in ${categoryNames}` : ''}. ${product.rating ? `Rated ${product.rating}/5` : ''} ${product.price ? `$${product.price}` : ''}`.trim(),
    openGraph: {
      title: `${product.name} | One Option Store`,
      description: `#1 bestseller${categoryNames ? ` in ${categoryNames}` : ''} on Amazon.`,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { asin } = await params;

  if (!isValidAsin(asin)) notFound();

  const product = await getProductByAsin(asin);

  if (!product) notFound();

  const categories = await getProductCategories(product.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Product' }
        ]} />

        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div className="aspect-square relative bg-white rounded-3xl shadow-xl overflow-hidden border">
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
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.full_slug}`}
                        className="bg-black text-white px-4 py-2 text-xs font-semibold uppercase rounded-full hover:bg-gray-800 transition"
                      >
                        #1 in {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mb-6">
                  {product.name}
                </h1>

                {product.rating !== null && (
                  <div className="flex items-center gap-3 mb-6">
                    <StarRating rating={product.rating} size="md" />
                    <span className="text-gray-600">
                      {product.rating.toFixed(1)} ({product.review_count?.toLocaleString()} reviews)
                    </span>
                  </div>
                )}

                {product.price !== null && (
                  <p className="text-5xl font-bold mb-8">${product.price.toFixed(2)}</p>
                )}

                <a
                  href={getAffiliateUrl(product.amazon_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 transition w-full sm:w-auto justify-center"
                >
                  Buy on Amazon
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <div className="mt-10 pt-8 border-t">
                  <h2 className="font-serif text-lg font-bold mb-4">Why This Product?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    This is the #1 bestselling product in its category on Amazon.
                    We track rankings continuously to ensure you see the top choice.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t flex gap-6 text-gray-500 text-sm">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verified #1
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated regularly
                  </span>
                </div>

                <p className="mt-6 text-xs text-gray-400">ASIN: {product.asin}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
