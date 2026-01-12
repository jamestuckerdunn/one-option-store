import Image from 'next/image';
import Link from 'next/link';
import { StarRating, ImagePlaceholderIcon, StarIcon, ShieldCheckIcon, ClockIcon, ArrowRightIcon } from '@/components/ui';

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

function formatPrice(price: number): { dollars: string; cents: string } {
  return {
    dollars: Math.floor(price).toString(),
    cents: ((price % 1) * 100).toFixed(0).padStart(2, '0'),
  };
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
  const formattedPrice = price !== null ? formatPrice(price) : null;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-gray-100/80 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gray-100/60 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full border border-gray-200/50 scale-[1.15]" />
              <div className="absolute inset-0 rounded-full border border-gray-200/30 scale-[1.3]" />

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
                    <ImagePlaceholderIcon className="w-32 h-32" />
                  </div>
                )}
              </div>

              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-black rounded-3xl -z-10 opacity-5" />
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gray-200 rounded-2xl -z-10" />

              {rating !== null && (
                <div className="absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl shadow-black/10 p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                      <StarIcon className="w-5 h-5 fill-white" filled />
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

          <div className="flex flex-col order-1 lg:order-2">
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

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight text-gray-900 mb-8">
              {name}
            </h1>

            {rating !== null && (
              <div className="flex items-center gap-4 mb-10">
                <StarRating rating={rating} size="lg" />
                <span className="font-sans text-lg text-gray-500">
                  {rating.toFixed(1)} from {reviewCount?.toLocaleString()} reviews
                </span>
              </div>
            )}

            {formattedPrice && (
              <div className="mb-12">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Price</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-6xl lg:text-7xl font-bold text-gray-900">
                    ${formattedPrice.dollars}
                  </span>
                  <span className="font-sans text-3xl font-bold text-gray-400">
                    .{formattedPrice.cents}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-black text-white font-sans text-base font-semibold rounded-2xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1"
              >
                <span>Buy on Amazon</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href={`/product/${asin}`}
                className="flex-1 inline-flex items-center justify-center px-8 py-5 bg-white border-2 border-gray-200 text-gray-900 font-sans text-base font-semibold rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-300"
              >
                View Details
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Verified #1</div>
                  <div className="text-sm text-gray-500">Amazon Bestseller</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-gray-600" />
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
