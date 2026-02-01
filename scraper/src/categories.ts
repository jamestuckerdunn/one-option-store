// Category tree discovery from Amazon Best Sellers
import type { Page } from 'puppeteer';
import * as fs from 'fs';
import { randomDelay } from './scraper';

export interface Category {
  name: string;
  slug: string;
  url: string;
  departmentName: string;
  departmentSlug: string;
  fullSlug: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract department/category slug from Amazon bestseller URL
// Example URLs:
// - /gp/bestsellers/electronics (level 1)
// - /zgbs/electronics/502394 (level 2 - Camera & Photo)
// - /zgbs/electronics/502394/281052 (level 3 - Digital Cameras)
function extractSlugFromUrl(url: string): string {
  // Try to extract the main category slug
  const match = url.match(/(?:zgbs|bestsellers)\/([a-z0-9-]+)/i);
  if (match) {
    return match[1];
  }
  return '';
}

// Extract the numeric category ID from URL (for deeper levels)
// Note: Currently unused but kept for potential future use with deeper category levels
function _extractCategoryId(url: string): string | null {
  // Match /zgbs/department/123456 or /zgbs/department/123456/789012
  const match = url.match(/zgbs\/[^\/]+\/(\d+)/);
  return match ? match[1] : null;
}

export async function discoverDepartments(
  page: Page
): Promise<{ name: string; slug: string; url: string }[]> {
  console.log('Discovering departments from Best Sellers page...');

  const departments: { name: string; slug: string; url: string }[] = [];

  // Navigate to main bestsellers page
  await page.goto('https://www.amazon.com/gp/bestsellers', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  // Wait for page to load
  await randomDelay(3000, 5000);

  // Extract department links from the left sidebar
  // Amazon's current structure uses classes like zg-browse-item, zg-browse-group
  const deptData = await page.evaluate(() => {
    const results: { name: string; href: string }[] = [];

    // Modern Amazon selectors (2024+)
    const selectors = [
      // Primary: list items with browse class
      '[class*="zg-browse-item"] a[href*="zgbs"]',
      'li[class*="zg-browse"] a[href*="zgbs"]',
      // Fallback: any link in browse navigation
      '[class*="browse-root"] a[href*="zgbs"]',
      '[class*="browse-group"] a[href*="zgbs"]',
      // Legacy selectors
      'div[role="treeitem"] a[href*="zgbs"]',
      'div[role="group"] a[href*="zgbs"]',
    ];

    for (const selector of selectors) {
      const links = document.querySelectorAll(selector);
      if (links.length > 0) {
        links.forEach((link) => {
          const anchor = link as HTMLAnchorElement;
          const name = anchor.textContent?.trim();
          const href = anchor.href;
          if (
            name &&
            href &&
            name !== 'Any Department' &&
            (href.includes('zgbs') || href.includes('bestsellers')) &&
            !results.some((r) => r.href === href)
          ) {
            results.push({ name, href });
          }
        });
        if (results.length > 0) break;
      }
    }

    return results;
  });

  for (const dept of deptData) {
    const slug = extractSlugFromUrl(dept.href) || slugify(dept.name);
    if (slug && !departments.some((d) => d.slug === slug)) {
      departments.push({
        name: dept.name,
        slug,
        url: dept.href,
      });
    }
  }

  console.log(`Found ${departments.length} departments`);
  return departments;
}

// Convert departments directly to categories (simpler approach)
export function departmentsToCategories(
  departments: { name: string; slug: string; url: string }[]
): Category[] {
  return departments.map((dept) => ({
    name: dept.name,
    slug: dept.slug,
    url: dept.url,
    departmentName: dept.name,
    departmentSlug: dept.slug,
    fullSlug: dept.slug, // Top-level category
    level: 1,
  }));
}

export async function discoverSubcategories(
  page: Page,
  departmentUrl: string,
  departmentName: string,
  departmentSlug: string
): Promise<Category[]> {
  console.log(`Discovering subcategories for ${departmentName}...`);
  const categories: Category[] = [];

  try {
    await page.goto(departmentUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for category tree to load
    await randomDelay(2000, 4000);

    // Extract level-2 subcategory links from sidebar
    // Amazon uses classes like zg-browse-item for category links
    const level2Data = await page.evaluate((_deptSlug: string) => {
      const results: { name: string; href: string }[] = [];

      // Modern Amazon selectors
      const selectors = [
        '[class*="zg-browse-item"] a[href*="zgbs"]',
        'li[class*="zg-browse"] a[href*="zgbs"]',
        '[class*="browse-group"] a[href*="zgbs"]',
      ];

      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);
        links.forEach((link) => {
          const anchor = link as HTMLAnchorElement;
          const name = anchor.textContent?.trim();
          const href = anchor.href;

          // Skip "Any Department" and the current department
          if (
            name &&
            href &&
            name !== 'Any Department' &&
            href.includes('zgbs') &&
            !results.some((r) => r.href === href)
          ) {
            // Check if this is a subcategory (has numeric ID in URL)
            // e.g., /zgbs/electronics/502394 has ID 502394
            const hasNumericId = /zgbs\/[^\/]+\/\d+/.test(href);
            if (hasNumericId) {
              results.push({ name, href });
            }
          }
        });
        if (results.length > 0) break;
      }

      return results;
    }, departmentSlug);

    console.log(`  Found ${level2Data.length} level-2 subcategories`);

    // Collect all level-2 URLs to exclude when finding level-3
    const level2Urls = new Set(level2Data.map(l => l.href));

    // For each level-2 subcategory, discover level-3 subcategories
    for (const level2 of level2Data) {
      const level2Slug = slugify(level2.name);

      // Add level-2 category
      const level2FullSlug = `${departmentSlug}/${level2Slug}`;
      if (!categories.some((c) => c.fullSlug === level2FullSlug)) {
        categories.push({
          name: level2.name,
          slug: level2Slug,
          url: level2.href,
          departmentName,
          departmentSlug,
          fullSlug: level2FullSlug,
          level: 2,
        });
      }

      // Navigate to level-2 page to find level-3 subcategories
      await randomDelay(3000, 6000);

      try {
        await page.goto(level2.href, {
          waitUntil: 'networkidle2',
          timeout: 60000,
        });
        await randomDelay(2000, 4000);

        // Extract level-3 subcategories - these are links with numeric IDs
        // that we haven't seen as level-2 categories
        const level3Data = await page.evaluate((level2UrlsArray: string[]) => {
          const results: { name: string; href: string }[] = [];
          const excludeUrls = new Set(level2UrlsArray);

          const selectors = [
            '[class*="zg-browse-item"] a[href*="zgbs"]',
            'li[class*="zg-browse"] a[href*="zgbs"]',
          ];

          for (const selector of selectors) {
            const links = document.querySelectorAll(selector);
            links.forEach((link) => {
              const anchor = link as HTMLAnchorElement;
              const name = anchor.textContent?.trim();
              const href = anchor.href;

              // Get base URL without query params for comparison
              const baseHref = href.split('?')[0].split('/ref=')[0];

              if (
                name &&
                href &&
                name !== 'Any Department' &&
                href.includes('zgbs') &&
                !results.some((r) => r.href === href)
              ) {
                // Level-3 categories have numeric IDs but aren't in level-2 set
                const hasNumericId = /zgbs\/[^\/]+\/\d+/.test(href);
                const isNotLevel2 = !Array.from(excludeUrls).some(
                  url => url.split('?')[0].split('/ref=')[0] === baseHref
                );

                if (hasNumericId && isNotLevel2) {
                  results.push({ name, href });
                }
              }
            });
            if (results.length > 0) break;
          }

          return results;
        }, Array.from(level2Urls));

        // Add level-3 categories
        for (const level3 of level3Data) {
          const level3Slug = slugify(level3.name);
          const level3FullSlug = `${departmentSlug}/${level2Slug}/${level3Slug}`;

          if (!categories.some((c) => c.fullSlug === level3FullSlug)) {
            categories.push({
              name: level3.name,
              slug: level3Slug,
              url: level3.href,
              departmentName,
              departmentSlug,
              fullSlug: level3FullSlug,
              level: 3,
            });
          }
        }

        if (level3Data.length > 0) {
          console.log(`    ${level2.name}: ${level3Data.length} level-3 subcategories`);
        }
      } catch (navError) {
        console.error(`    Error navigating to ${level2.name}:`,
          navError instanceof Error ? navError.message : navError);
      }
    }

    console.log(
      `Found ${categories.length} total subcategories in ${departmentName}`
    );
  } catch (error) {
    console.error(
      `Error discovering subcategories for ${departmentName}:`,
      error instanceof Error ? error.message : error
    );
  }

  return categories;
}

export async function discoverAllCategories(
  page: Page,
  maxDepartments?: number,
  maxCategoriesPerDept?: number
): Promise<Category[]> {
  const allCategories: Category[] = [];

  // First, get all departments
  const departments = await discoverDepartments(page);
  const deptsToProcess = maxDepartments
    ? departments.slice(0, maxDepartments)
    : departments;

  console.log(`Processing ${deptsToProcess.length} departments...`);

  for (let i = 0; i < deptsToProcess.length; i++) {
    const dept = deptsToProcess[i];
    console.log(
      `\n[${i + 1}/${deptsToProcess.length}] Processing department: ${dept.name}`
    );

    // Random delay between departments
    if (i > 0) {
      await randomDelay(5000, 10000);
    }

    const subcats = await discoverSubcategories(
      page,
      dept.url,
      dept.name,
      dept.slug
    );

    // If no subcategories found, add the department as a level-1 category
    if (subcats.length === 0) {
      console.log(`  No subcategories found, adding department as category`);
      allCategories.push({
        name: dept.name,
        slug: dept.slug,
        url: dept.url,
        departmentName: dept.name,
        departmentSlug: dept.slug,
        fullSlug: dept.slug,
        level: 1,
      });
    } else {
      // Limit categories per department if specified
      const catsToAdd = maxCategoriesPerDept
        ? subcats.slice(0, maxCategoriesPerDept)
        : subcats;

      allCategories.push(...catsToAdd);
    }

    console.log(
      `Total categories so far: ${allCategories.length}`
    );
  }

  return allCategories;
}

export function saveCategoryList(
  categories: Category[],
  filePath: string
): void {
  fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
  console.log(`Saved ${categories.length} categories to ${filePath}`);
}

export function loadCategoryList(filePath: string): Category[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
