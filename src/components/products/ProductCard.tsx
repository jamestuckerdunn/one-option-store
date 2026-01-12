import Image from 'next/image';
import Link from 'next/link';
import { StarRating, ImagePlaceholderIcon } from '@/components/ui';

interface ProductCardProps {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  categoryName?: string;
}

function formatReviewCount(count: number): string {
  return count >= 1000 ? `${Math.round(count / 1000)}k reviews` : `${count} reviews`;
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-3xl" />

        <div className="absolute top-4 left-4 z-20">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-xs font-bold">#1</span>
          </div>
        </div>

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
              <ImagePlaceholderIcon />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 bg-white relative">
          {categoryName && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-black rounded-full" />
              <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-500">
                {categoryName}
              </span>
            </div>
          )}

          <h3 className="font-serif text-base font-semibold leading-snug line-clamp-2 text-gray-900 group-hover:text-gray-600 transition-colors duration-300">
            {name}
          </h3>

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
                <StarRating rating={rating} size="sm" />
                {reviewCount !== null && (
                  <span className="text-[10px] text-gray-400 mt-1">
                    {formatReviewCount(reviewCount)}
                  </span>
                )}
              </div>
            )}
          </div>

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
