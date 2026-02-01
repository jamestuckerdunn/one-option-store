'use client';

interface TrustBadgeProps {
  variant?: 'verified' | 'updated' | 'bestseller' | 'reviews';
  count?: number;
  className?: string;
}

export function TrustBadge({ variant = 'verified', count, className = '' }: TrustBadgeProps) {
  const badges = {
    verified: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      text: 'Verified #1',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    updated: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Updated daily',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    bestseller: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      text: '#1 Bestseller',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    reviews: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      text: count ? `${count.toLocaleString()} reviews` : 'Customer reviews',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const badge = badges[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${badge.color} ${className}`}
    >
      {badge.icon}
      {badge.text}
    </span>
  );
}

interface TrustBadgeGroupProps {
  showVerified?: boolean;
  showUpdated?: boolean;
  reviewCount?: number;
  className?: string;
}

export function TrustBadgeGroup({
  showVerified = true,
  showUpdated = true,
  reviewCount,
  className = '',
}: TrustBadgeGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showVerified && <TrustBadge variant="verified" />}
      {showUpdated && <TrustBadge variant="updated" />}
      {reviewCount && reviewCount > 0 && <TrustBadge variant="reviews" count={reviewCount} />}
    </div>
  );
}
