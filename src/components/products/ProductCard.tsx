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
      <article className="rounded-2xl bg-white border hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden">
        <div className="aspect-square relative bg-gray-50">
          <div className="absolute top-3 left-3 z-10 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
            #1
          </div>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-contain p-6"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-4">
          {categoryName && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{categoryName}</p>
          )}

          <h3 className="font-serif font-semibold leading-snug line-clamp-2 mb-3 group-hover:text-gray-600 transition">
            {name}
          </h3>

          <div className="flex items-end justify-between">
            {price !== null ? (
              <span className="text-xl font-bold">${price.toFixed(2)}</span>
            ) : (
              <span className="text-sm text-gray-400">Check price</span>
            )}

            {rating !== null && (
              <div className="text-right">
                <StarRating rating={rating} size="sm" />
                {reviewCount !== null && (
                  <span className="text-xs text-gray-400">
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
