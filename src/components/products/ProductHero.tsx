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
    <section className="relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-gray-100/80 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gray-100/60 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Product Image */}
          <div className="relative order-2 lg:order-1">
            {/* Main image container */}
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border border-gray-200/50 scale-[1.15]" />
              <div className="absolute inset-0 rounded-full border border-gray-200/30 scale-[1.3]" />

              {/* Main image */}
              <div className="relative aspect-square bg-white rounded-[40px] shadow-2xl shadow-black/10 overflow-hidden border border-gray-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-contain p-10 lg:p-14"
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

              {/* Floating elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black rounded-3xl -z-10 opacity-5" />
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gray-200 rounded-2xl -z-10" />

              {/* Stats card floating on image */}
              {rating !== null && (
                <div className="absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl shadow-black/10 p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 fill-white" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold">{rating.toFixed(1)}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{reviewCount?.toLocaleString()} reviews</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col order-1 lg:order-2">
            {/* Category Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-xl shadow-black/20">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">#1</span>
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Bestseller in {categoryName}
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight text-gray-900 mb-8">
              {name}
            </h1>

            {/* Rating Stars */}
            {rating !== null && (
              <div className="flex items-center gap-4 mb-10">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${star <= Math.round(rating) ? 'fill-black' : 'fill-gray-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-sans text-lg text-gray-500">
                  {rating.toFixed(1)} from {reviewCount?.toLocaleString()} reviews
                </span>
              </div>
            )}

            {/* Price */}
            {price !== null && (
              <div className="mb-12">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Price</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-6xl lg:text-7xl font-bold text-gray-900">
                    ${Math.floor(price)}
                  </span>
                  <span className="font-sans text-3xl font-bold text-gray-400">
                    .{((price % 1) * 100).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-black text-white font-sans text-base font-semibold rounded-2xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1"
              >
                <span>Buy on Amazon</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <Link
                href={`/product/${asin}`}
                className="flex-1 inline-flex items-center justify-center px-8 py-5 bg-white border-2 border-gray-200 text-gray-900 font-sans text-base font-semibold rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-300"
              >
                View Details
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Verified #1</div>
                  <div className="text-sm text-gray-500">Amazon Bestseller</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Updated Daily</div>
                  <div className="text-sm text-gray-500">Always Current</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
