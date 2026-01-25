import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';
import { getAffiliateUrl } from '@/lib/affiliate';

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
  const affiliateUrl = getAffiliateUrl(amazonUrl);
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="aspect-square relative bg-white rounded-3xl shadow-lg overflow-hidden order-2 lg:order-1">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-contain p-10"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span>#1</span>
              <span>Bestseller in {categoryName}</span>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight mb-6">{name}</h1>

            {rating !== null && (
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={rating} size="md" />
                <span className="text-gray-500">
                  {rating.toFixed(1)} ({reviewCount?.toLocaleString()} reviews)
                </span>
              </div>
            )}

            {price !== null && (
              <p className="text-5xl font-bold mb-8">${price.toFixed(2)}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition"
              >
                Buy on Amazon
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                href={`/product/${asin}`}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 font-semibold rounded-xl hover:border-black transition"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
