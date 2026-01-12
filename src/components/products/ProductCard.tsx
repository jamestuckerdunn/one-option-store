import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  categoryName?: string;
  categorySlug?: string;
}

export default function ProductCard({
  asin,
  name,
  price,
  imageUrl,
  rating,
  reviewCount,
  categoryName,
}: ProductCardProps) {
  return (
    <Link href={`/product/${asin}`} className="group block">
      <article className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 transition-all duration-500">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-3xl" />

        {/* Number 1 Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-xs font-bold">#1</span>
          </div>
        </div>

        {/* Product Image */}
        <div className="aspect-[4/5] relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-8 group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4 bg-white relative">
          {/* Category */}
          {categoryName && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-black rounded-full" />
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
                {categoryName}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-serif text-base font-semibold leading-snug line-clamp-2 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
            {name}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col">
              {price !== null ? (
                <>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Price</span>
                  <span className="font-sans text-2xl font-bold text-gray-900">
                    ${price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-sans text-sm text-gray-400">Check price</span>
              )}
            </div>

            {rating !== null && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${star <= Math.round(rating) ? 'fill-black' : 'fill-gray-200'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {reviewCount !== null ? (reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(0)}k reviews` : `${reviewCount} reviews`) : ''}
                </span>
              </div>
            )}
          </div>

          {/* View button that appears on hover */}
          <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <div className="py-3 bg-black text-white text-center text-sm font-semibold rounded-xl">
              View Details
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
