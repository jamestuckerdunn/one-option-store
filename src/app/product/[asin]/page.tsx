import { getProductWithCategories } from '@/lib/db';
import PageLayout from '@/components/layout/PageLayout';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  StarRating,
  Breadcrumb,
  ImagePlaceholderIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@/components/ui';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ asin: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { asin } = await params;
  const product = await getProductWithCategories(asin);

  if (!product) {
    notFound();
  }

  const categories = product.categories || [];

  return (
    <PageLayout>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Product' }]} />

      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="relative">
              <div className="aspect-square relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-8 lg:p-12"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ImagePlaceholderIcon className="w-32 h-32" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-100 rounded-full -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gray-50 rounded-full -z-10" />
            </div>

            <div className="flex flex-col">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.full_slug}`}
                      className="badge-pulse inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                    >
                      <CheckCircleIcon />
                      #1 in {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-gray-900">
                {product.name}
              </h1>

              {product.rating !== null && (
                <div className="mt-6 flex items-center gap-3">
                  <StarRating rating={product.rating} />
                  <span className="font-sans text-base text-gray-600">
                    {product.rating.toFixed(1)} <span className="text-gray-400">({product.review_count?.toLocaleString()} reviews)</span>
                  </span>
                </div>
              )}

              {product.price !== null && (
                <div className="mt-8">
                  <span className="font-sans text-5xl lg:text-6xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="mt-10">
                <a
                  href={product.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Buy on Amazon
                  <ExternalLinkIcon className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <h2 className="font-serif text-lg font-bold mb-4">Why This Product?</h2>
                <p className="font-sans text-gray-600 leading-relaxed">
                  This is the #1 bestselling product in its category on Amazon.
                  We track bestseller rankings continuously to ensure you always
                  see the top choice based on actual sales data.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon />
                    <span className="font-sans text-sm">Verified #1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon />
                    <span className="font-sans text-sm">Updated frequently</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-sans text-xs text-gray-400">ASIN: {product.asin}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
