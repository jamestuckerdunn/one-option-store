// Category tree discovery from Amazon Best Sellers
import type { Page } from 'puppeteer';
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

// Extract department/category from Amazon bestseller URL
function extractSlugFromUrl(url: string): string {
  // Example: /Best-Sellers-Electronics/zgbs/electronics
  // or /gp/bestsellers/electronics/ref=...
  const match = url.match(/(?:zgbs|bestsellers)\/([^\/\?]+)/);
  if (match) {
    return match[1];
  }
  // Fallback: extract from full path
  const pathMatch = url.match(/Best-Sellers[^\/]*\/zgbs\/([^\/\?]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  return '';
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

  // Wait for department links to load
  await page.waitForSelector('div[role="group"] a, div[role="treeitem"] a', {
    timeout: 30000,
  });

  // Extract department links from the left sidebar
  const deptData = await page.evaluate(() => {
    const results: { name: string; href: string }[] = [];

    // Try multiple selectors for department navigation
    const selectors = [
      'div[role="group"] a[href*="zgbs"]',
      'div[role="treeitem"] a[href*="zgbs"]',
      'ul.zg_browseRoot a[href*="zgbs"]',
      '#zg_browseRoot a[href*="zgbs"]',
      'div._p13n-zg-nav-tree-all_style_zg-browse-group__88fbz a',
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
            href.includes('zgbs') &&
            !results.some((r) => r.href === href)
          ) {
            results.push({ name, href });
          }
        });
        break;
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

    // Extract subcategory links
    const subcatData = await page.evaluate(() => {
      const results: { name: string; href: string; level: number }[] = [];

      // Look for nested category links
      const treeItems = document.querySelectorAll(
        'div[role="treeitem"], div[role="group"] div[role="treeitem"]'
      );
      treeItems.forEach((item) => {
        const link = item.querySelector('a[href*="zgbs"]') as HTMLAnchorElement;
        if (link) {
          const name = link.textContent?.trim();
          // Determine nesting level by counting parent groups
          let level = 1;
          let parent = item.parentElement;
          while (parent) {
            if (
              parent.getAttribute('role') === 'group' ||
              parent.classList.contains('zg_browseRoot')
            ) {
              level++;
            }
            parent = parent.parentElement;
          }
          if (name && link.href) {
            results.push({ name, href: link.href, level: Math.min(level, 3) });
          }
        }
      });

      // Fallback: look for any bestseller links in sidebar
      if (results.length === 0) {
        const allLinks = document.querySelectorAll(
          'a[href*="zgbs/"]:not([href*="ref=zg"])'
        );
        allLinks.forEach((link) => {
          const anchor = link as HTMLAnchorElement;
          const name = anchor.textContent?.trim();
          if (name && anchor.href && !results.some((r) => r.href === anchor.href)) {
            results.push({ name, href: anchor.href, level: 2 });
          }
        });
      }

      return results;
    });

    for (const subcat of subcatData) {
      const catSlug = extractSlugFromUrl(subcat.href) || slugify(subcat.name);
      if (catSlug && catSlug !== departmentSlug) {
        const fullSlug = `${departmentSlug}/${catSlug}`;
        if (!categories.some((c) => c.fullSlug === fullSlug)) {
          categories.push({
            name: subcat.name,
            slug: catSlug,
            url: subcat.href,
            departmentName,
            departmentSlug,
            fullSlug,
            level: subcat.level,
          });
        }
      }
    }

    console.log(
      `Found ${categories.length} subcategories in ${departmentName}`
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

    // Limit categories per department if specified
    const catsToAdd = maxCategoriesPerDept
      ? subcats.slice(0, maxCategoriesPerDept)
      : subcats;

    allCategories.push(...catsToAdd);

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
  const fs = require('fs');
  fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
  console.log(`Saved ${categories.length} categories to ${filePath}`);
}

export function loadCategoryList(filePath: string): Category[] {
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
