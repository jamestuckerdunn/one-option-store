import Image from 'next/image';
import Link from 'next/link';

interface ProductHeroProps {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  amazonUrl: string;
  rating: number | null;
  reviewCount: number | null;
  categoryName: string;
}

export default function ProductHero({
  asin,
  name,
  price,
  imageUrl,
  amazonUrl,
  rating,
  reviewCount,
  categoryName,
}: ProductHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Product Image - THE ONLY COLOR */}
          <div className="relative">
            <div className="aspect-square relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-contain p-8 lg:p-12"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-100 rounded-full -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gray-50 rounded-full -z-10" />
          </div>

          {/* Product Info - B&W ONLY */}
          <div className="flex flex-col">
            {/* Badge */}
            <div className="mb-6">
              <span className="badge-pulse inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full shadow-lg">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                #1 in {categoryName}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900">
              {name}
            </h1>

            {/* Rating */}
            {rating !== null && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(rating) ? 'fill-gray-900' : 'fill-gray-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-sans text-base text-gray-600">
                  {rating.toFixed(1)} <span className="text-gray-400">({reviewCount?.toLocaleString()} reviews)</span>
                </span>
              </div>
            )}

            {/* Price */}
            {price !== null && (
              <div className="mt-8">
                <span className="font-sans text-5xl lg:text-6xl font-bold text-gray-900">
                  ${price.toFixed(2)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Buy on Amazon
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                href={`/product/${asin}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-200"
              >
                View Details
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-sans text-sm">Verified #1</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-sans text-sm">Updated frequently</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
