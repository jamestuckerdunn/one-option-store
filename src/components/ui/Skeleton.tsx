interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="w-full h-full skeleton" />
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        {/* Category */}
        <Skeleton className="h-3 w-20" />

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Price and rating */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductHeroSkeleton() {
  return (
    <section className="bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image skeleton */}
          <div className="aspect-square rounded-3xl overflow-hidden">
            <div className="w-full h-full skeleton" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            {/* Badge */}
            <Skeleton className="h-8 w-40 rounded-full" />

            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-4/5" />
              <Skeleton className="h-12 w-2/3" />
            </div>

            {/* Rating */}
            <Skeleton className="h-6 w-48" />

            {/* Price */}
            <Skeleton className="h-14 w-32" />

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-14 w-40 rounded-xl" />
              <Skeleton className="h-14 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DepartmentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DepartmentGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DepartmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
