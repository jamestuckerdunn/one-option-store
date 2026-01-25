// Product extraction from Amazon Best Sellers pages
import type { Page } from 'puppeteer';
import { randomDelay } from './scraper';

export interface ScrapedProduct {
  asin: string;
  name: string;
  price: number | null;
  imageUrl: string | null;
  amazonUrl: string;
  rating: number | null;
  reviewCount: number | null;
}

// Extract ASIN from Amazon URL
function extractAsin(url: string): string | null {
  // Patterns for ASIN extraction
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/asin\/([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  return null;
}

// Parse price string to number
function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Parse rating string to number
function parseRating(ratingStr: string | null): number | null {
  if (!ratingStr) return null;
  const match = ratingStr.match(/(\d+\.?\d*)/);
  if (match) {
    const num = parseFloat(match[1]);
    return isNaN(num) ? null : num;
  }
  return null;
}

// Parse review count string to number
function parseReviewCount(countStr: string | null): number | null {
  if (!countStr) return null;
  // Handle formats like "1,234", "1.2K", "1.2M"
  const cleaned = countStr.replace(/[^0-9.KkMm]/g, '');
  if (cleaned.toLowerCase().endsWith('k')) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  if (cleaned.toLowerCase().endsWith('m')) {
    return Math.round(parseFloat(cleaned) * 1000000);
  }
  const num = parseInt(cleaned.replace(/,/g, ''), 10);
  return isNaN(num) ? null : num;
}

export async function extractBestseller(
  page: Page,
  categoryUrl: string
): Promise<ScrapedProduct | null> {
  console.log(`Extracting #1 bestseller from: ${categoryUrl}`);

  try {
    await page.goto(categoryUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for product grid to load
    await randomDelay(2000, 4000);

    // Extract the #1 bestseller product
    const productData = await page.evaluate(() => {
      // Look for the first product card (rank #1)
      const selectors = [
        // New grid layout
        '[data-asin]:first-of-type',
        'div[id^="p13n-asin-index-"]:first-child',
        '.zg-grid-general-faceout:first-child',
        // Old list layout
        '.zg-item-immersion:first-child',
        '#zg-ordered-list li:first-child',
      ];

      let productCard: Element | null = null;
      for (const selector of selectors) {
        productCard = document.querySelector(selector);
        if (productCard) break;
      }

      if (!productCard) {
        // Try to find any product link
        const anyProduct = document.querySelector(
          'a[href*="/dp/"][href*="amazon.com"]'
        );
        if (anyProduct) {
          return {
            productUrl: (anyProduct as HTMLAnchorElement).href,
            name: anyProduct.textContent?.trim() || null,
            priceStr: null,
            ratingStr: null,
            reviewCountStr: null,
            imageUrl: null,
          };
        }
        return null;
      }

      // Extract product link
      const linkEl = productCard.querySelector(
        'a[href*="/dp/"], a.a-link-normal[href*="amazon.com"]'
      ) as HTMLAnchorElement;
      const productUrl = linkEl?.href || null;

      // Extract product name
      const nameEl = productCard.querySelector(
        '.p13n-sc-truncate, ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, .a-link-normal span, a[href*="/dp/"] span'
      );
      const name = nameEl?.textContent?.trim() || null;

      // Extract price
      const priceEl = productCard.querySelector(
        '.p13n-sc-price, ._cDEzb_p13n-sc-price_3mJ9Z, .a-price .a-offscreen, span.a-price span'
      );
      const priceStr = priceEl?.textContent?.trim() || null;

      // Extract rating
      const ratingEl = productCard.querySelector(
        '.a-icon-star-small, .a-icon-alt, i.a-icon-star'
      );
      const ratingStr =
        ratingEl?.getAttribute('aria-label') ||
        ratingEl?.textContent?.trim() ||
        null;

      // Extract review count
      const reviewEl = productCard.querySelector(
        '.a-size-small:last-child, span.a-size-small[aria-label*="stars"]'
      );
      const reviewCountStr = reviewEl?.textContent?.trim() || null;

      // Extract image
      const imageEl = productCard.querySelector(
        'img.a-dynamic-image, img[src*="images-amazon.com"]'
      ) as HTMLImageElement;
      const imageUrl = imageEl?.src || null;

      return {
        productUrl,
        name,
        priceStr,
        ratingStr,
        reviewCountStr,
        imageUrl,
      };
    });

    if (!productData || !productData.productUrl) {
      console.log('Could not extract product data from page');
      return null;
    }

    const asin = extractAsin(productData.productUrl);
    if (!asin) {
      console.log('Could not extract ASIN from URL:', productData.productUrl);
      return null;
    }

    const product: ScrapedProduct = {
      asin,
      name: productData.name || `Product ${asin}`,
      price: parsePrice(productData.priceStr),
      imageUrl: productData.imageUrl,
      amazonUrl: `https://www.amazon.com/dp/${asin}`,
      rating: parseRating(productData.ratingStr),
      reviewCount: parseReviewCount(productData.reviewCountStr),
    };

    console.log(`Extracted: ${product.name} (${asin})`);
    return product;
  } catch (error) {
    console.error(
      'Error extracting bestseller:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

// Fetch additional product details from product page (optional, slower)
export async function enrichProductDetails(
  page: Page,
  product: ScrapedProduct
): Promise<ScrapedProduct> {
  try {
    await page.goto(product.amazonUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    await randomDelay(2000, 3000);

    const details = await page.evaluate(() => {
      // Get full product title
      const titleEl = document.querySelector('#productTitle, #title span');
      const name = titleEl?.textContent?.trim() || null;

      // Get price
      const priceEl = document.querySelector(
        '#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen, #corePrice_feature_div .a-offscreen'
      );
      const priceStr = priceEl?.textContent?.trim() || null;

      // Get rating
      const ratingEl = document.querySelector(
        '#acrPopover, .a-icon-star-small .a-icon-alt'
      );
      const ratingStr =
        ratingEl?.getAttribute('title') ||
        ratingEl?.textContent?.trim() ||
        null;

      // Get review count
      const reviewEl = document.querySelector('#acrCustomerReviewText');
      const reviewCountStr = reviewEl?.textContent?.trim() || null;

      // Get main image
      const imageEl = document.querySelector(
        '#landingImage, #imgBlkFront, #main-image'
      ) as HTMLImageElement;
      const imageUrl = imageEl?.src || null;

      return { name, priceStr, ratingStr, reviewCountStr, imageUrl };
    });

    return {
      ...product,
      name: details.name || product.name,
      price: parsePrice(details.priceStr) || product.price,
      rating: parseRating(details.ratingStr) || product.rating,
      reviewCount: parseReviewCount(details.reviewCountStr) || product.reviewCount,
      imageUrl: details.imageUrl || product.imageUrl,
    };
  } catch (error) {
    console.error(
      'Error enriching product:',
      error instanceof Error ? error.message : error
    );
    return product;
  }
}
