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
                <div className="flex gap-0.5">
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
