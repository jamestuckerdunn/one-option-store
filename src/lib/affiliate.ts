// Amazon affiliate URL utility

const AFFILIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'jtuckerdunn01-20';

/**
 * Appends the Amazon affiliate tag to a URL.
 * Handles URLs that already have query parameters.
 */
export function getAffiliateUrl(amazonUrl: string): string {
  if (!amazonUrl) return amazonUrl;

  try {
    const url = new URL(amazonUrl);

    // Only modify Amazon URLs
    if (!url.hostname.includes('amazon.')) {
      return amazonUrl;
    }

    // Add or update the affiliate tag
    url.searchParams.set('tag', AFFILIATE_TAG);

    return url.toString();
  } catch {
    // If URL parsing fails, append manually
    const separator = amazonUrl.includes('?') ? '&' : '?';
    return `${amazonUrl}${separator}tag=${AFFILIATE_TAG}`;
  }
}

/**
 * Track affiliate click event for analytics
 */
export function trackAffiliateClick(asin: string, categoryName?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      event_category: 'affiliate',
      event_label: asin,
      asin: asin,
      category: categoryName || 'unknown',
    });
  }
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
