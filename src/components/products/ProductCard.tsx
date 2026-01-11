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
  categorySlug,
}: ProductCardProps) {
  return (
    <Link href={`/product/${asin}`} className="group block">
      <article className="border border-[#e5e5e5] hover:border-black transition-colors">
        {/* Product Image - THE ONLY COLOR */}
        <div className="aspect-square relative bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#333333]">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info - B&W ONLY */}
        <div className="p-4 border-t border-[#e5e5e5]">
          {/* Category Badge */}
          {categoryName && (
            <span className="inline-block text-xs font-sans uppercase tracking-wider text-[#333333] mb-2">
              {categoryName}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-sans text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
            {name}
          </h3>

          {/* Price and Rating */}
          <div className="mt-3 flex items-center justify-between">
            {price !== null && (
              <span className="font-sans text-lg font-bold">
                ${price.toFixed(2)}
              </span>
            )}

            {rating !== null && (
              <div className="flex items-center gap-1">
                <span className="font-sans text-xs text-[#333333]">
                  {rating.toFixed(1)}
                </span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {reviewCount !== null && (
                  <span className="font-sans text-xs text-[#333333]">
                    ({reviewCount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
