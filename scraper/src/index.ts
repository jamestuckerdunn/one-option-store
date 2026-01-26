// Main entry point for the Amazon Bestseller scraper
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables (scraper .env takes precedence)
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

import { createScraper, randomDelay } from './scraper';
import {
  discoverAllCategories,
  saveCategoryList,
  loadCategoryList,
} from './categories';
import { extractBestseller } from './products';
import { createApiClient, ProductPayload } from './api';

const CATEGORIES_FILE = path.join(__dirname, '../data/categories.json');
const STATE_FILE = path.join(__dirname, '../data/scraper-state.json');

interface ScraperState {
  lastRun: string;
  categoriesProcessed: number;
  productsSubmitted: number;
  errors: string[];
  lastCategoryIndex: number;
}

function ensureDataDir(): void {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadState(): ScraperState {
  ensureDataDir();
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    lastRun: '',
    categoriesProcessed: 0,
    productsSubmitted: 0,
    errors: [],
    lastCategoryIndex: 0,
  };
}

function saveState(state: ScraperState): void {
  ensureDataDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function discoverCategories(): Promise<void> {
  console.log('\n=== Category Discovery ===\n');

  const scraper = createScraper({ headless: true });

  try {
    await scraper.launch();
    const page = await scraper.newPage();

    // Discover all categories (departments + level-2 + level-3)
    // The function handles fallback to department-level internally
    const categories = await discoverAllCategories(page);

    if (categories.length === 0) {
      console.log('\nWARNING: No categories found! Check selectors.');
      return;
    }

    // Save to file
    ensureDataDir();
    saveCategoryList(categories, CATEGORIES_FILE);

    // Log summary by level
    const level1 = categories.filter(c => c.level === 1).length;
    const level2 = categories.filter(c => c.level === 2).length;
    const level3 = categories.filter(c => c.level === 3).length;

    console.log(`\n=== Discovery Complete ===`);
    console.log(`Level 1 (Departments): ${level1}`);
    console.log(`Level 2 (Subcategories): ${level2}`);
    console.log(`Level 3 (Sub-subcategories): ${level3}`);
    console.log(`Total: ${categories.length} categories saved.`);
  } finally {
    await scraper.close();
  }
}

async function scrapeProducts(
  batchSize = 50,
  startIndex = 0
): Promise<void> {
  console.log('\n=== Product Scraping ===\n');

  // Load categories
  const categories = loadCategoryList(CATEGORIES_FILE);
  if (categories.length === 0) {
    console.error(
      'No categories found. Run discovery first: npm run discover'
    );
    return;
  }

  // Load state
  const state = loadState();
  const resumeIndex = startIndex || state.lastCategoryIndex;
  console.log(
    `Resuming from category index ${resumeIndex}, batch size ${batchSize}`
  );

  // Initialize API client
  let apiClient;
  try {
    apiClient = createApiClient();
  } catch (error) {
    console.error(
      'Failed to initialize API client:',
      error instanceof Error ? error.message : error
    );
    return;
  }

  const scraper = createScraper({ headless: true });

  try {
    await scraper.launch();
    const page = await scraper.newPage();

    // Process categories in batch
    const endIndex = Math.min(resumeIndex + batchSize, categories.length);
    console.log(
      `Processing categories ${resumeIndex + 1} to ${endIndex} of ${categories.length}`
    );

    let productsSubmitted = 0;
    const errors: string[] = [];

    for (let i = resumeIndex; i < endIndex; i++) {
      const category = categories[i];
      console.log(
        `\n[${i + 1}/${categories.length}] ${category.departmentName} > ${category.name}`
      );

      // Random delay between categories
      if (i > resumeIndex) {
        await randomDelay(8000, 15000);
      }

      try {
        // Extract bestseller product
        const product = await extractBestseller(page, category.url);

        if (product) {
          // Build API payload
          const payload: ProductPayload = {
            department: {
              name: category.departmentName,
              slug: category.departmentSlug,
            },
            category: {
              name: category.name,
              slug: category.slug,
              fullSlug: category.fullSlug,
            },
            product: {
              asin: product.asin,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              amazonUrl: product.amazonUrl,
              rating: product.rating,
              reviewCount: product.reviewCount,
            },
          };

          // Submit to API
          const response = await apiClient.submitProduct(payload);
          if (response.success) {
            console.log(`  ✓ Submitted: ${product.name}`);
            productsSubmitted++;
          } else {
            console.log(`  ✗ API error: ${response.error}`);
            errors.push(`${category.fullSlug}: ${response.error}`);
          }
        } else {
          console.log(`  ✗ No product found`);
          errors.push(`${category.fullSlug}: No product found`);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Error: ${msg}`);
        errors.push(`${category.fullSlug}: ${msg}`);
      }

      // Update state after each category
      state.lastCategoryIndex = i + 1;
      state.categoriesProcessed++;
      state.productsSubmitted += productsSubmitted > 0 ? 1 : 0;
      state.lastRun = new Date().toISOString();
      saveState(state);
    }

    // Summary
    console.log('\n=== Batch Complete ===');
    console.log(`Categories processed: ${endIndex - resumeIndex}`);
    console.log(`Products submitted: ${productsSubmitted}`);
    console.log(`Errors: ${errors.length}`);

    if (endIndex < categories.length) {
      console.log(
        `\nNext batch starts at index ${endIndex}. Run again to continue.`
      );
    } else {
      console.log(`\nAll ${categories.length} categories processed!`);
      // Reset for next full run
      state.lastCategoryIndex = 0;
      saveState(state);
    }
  } finally {
    await scraper.close();
  }
}

async function fullScrape(): Promise<void> {
  console.log('\n=== Full Scrape (Discovery + Products) ===\n');

  // First, discover categories
  await discoverCategories();

  // Then scrape products (first batch)
  await scrapeProducts(100, 0);
}

// CLI entry point
async function main(): Promise<void> {
  const command = process.argv[2] || 'scrape';

  console.log(`One Option Store - Amazon Bestseller Scraper`);
  console.log(`Command: ${command}`);
  console.log(`Time: ${new Date().toISOString()}`);

  switch (command) {
    case 'discover':
      await discoverCategories();
      break;

    case 'scrape':
      const batchSize = parseInt(process.argv[3] || '50', 10);
      const startIndex = parseInt(process.argv[4] || '0', 10);
      await scrapeProducts(batchSize, startIndex);
      break;

    case 'full':
      await fullScrape();
      break;

    default:
      console.log(`
Usage:
  npm run discover           - Discover all Amazon bestseller categories
  npm run scrape [batch] [start] - Scrape products (default: batch=50, start=0)
  npm run full               - Full discovery + first batch scrape

Environment variables required:
  ADMIN_API_URL or NEXT_PUBLIC_SITE_URL - API base URL
  ADMIN_SECRET - API authentication secret
`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
