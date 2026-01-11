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
      <article className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Product Image - THE ONLY COLOR */}
        <div className="aspect-square relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info - B&W ONLY */}
        <div className="p-5 space-y-3">
          {/* Category Badge */}
          {categoryName && (
            <span className="inline-block text-[10px] font-sans font-medium uppercase tracking-widest text-gray-500">
              {categoryName}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-sans text-sm font-semibold leading-snug line-clamp-2 text-gray-900 group-hover:text-gray-600 transition-colors">
            {name}
          </h3>

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between pt-2">
            {price !== null ? (
              <span className="font-sans text-xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            ) : (
              <span className="font-sans text-sm text-gray-400">Price unavailable</span>
            )}

            {rating !== null && (
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                <svg className="w-3.5 h-3.5 fill-gray-900" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-sans text-xs font-medium text-gray-700">
                  {rating.toFixed(1)}
                </span>
                {reviewCount !== null && (
                  <span className="font-sans text-xs text-gray-400">
                    ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(0)}k` : reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      </article>
    </Link>
  );
}
