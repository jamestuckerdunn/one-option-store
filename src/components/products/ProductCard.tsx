import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';

interface ProductCardProps {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  categoryName?: string;
  categorySlug?: string;
  size?: 'default' | 'compact';
}

export default function ProductCard({
  asin,
  name,
  price,
  imageUrl,
  rating,
  reviewCount,
  categoryName,
  size = 'default',
}: ProductCardProps) {
  const isCompact = size === 'compact';

  return (
    <Link href={`/product/${asin}`} className="group block">
      <article className="rounded-2xl bg-white border border-gray-100 hover:border-gray-200 overflow-hidden card-hover">
        <div className={`relative bg-gradient-to-br from-gray-50 to-white ${isCompact ? 'aspect-[4/3]' : 'aspect-square'}`}>
          <div className={`absolute z-10 bg-black text-white rounded-full flex items-center justify-center font-bold ${isCompact ? 'top-2 left-2 w-6 h-6 text-[10px]' : 'top-3 left-3 w-7 h-7 text-xs'}`}>
            #1
          </div>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className={`object-contain ${isCompact ? 'p-4' : 'p-6'}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <svg className={isCompact ? 'w-12 h-12' : 'w-16 h-16'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className={isCompact ? 'p-3' : 'p-4'}>
          {categoryName && (
            <p className={`text-gray-400 uppercase tracking-wide mb-1.5 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
              {categoryName}
            </p>
          )}

          <h3 className={`font-serif font-semibold leading-snug line-clamp-2 mb-3 group-hover:text-gray-600 transition ${isCompact ? 'text-sm' : ''}`}>
            {name}
          </h3>

          <div className="flex items-end justify-between">
            {price !== null ? (
              <span className={`font-bold ${isCompact ? 'text-lg' : 'text-xl'}`}>
                ${price.toFixed(2)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">Check price</span>
            )}

            {rating !== null && (
              <div className="text-right">
                <StarRating rating={rating} size="sm" />
                {reviewCount !== null && (
                  <span className="text-xs text-gray-400 block">
                    {reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(0)}k` : reviewCount}
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
