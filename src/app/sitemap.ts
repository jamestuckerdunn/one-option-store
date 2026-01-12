import { MetadataRoute } from 'next';
import { getDepartments, getCurrentBestsellers } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oneoptionstore.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Department pages
  let departmentPages: MetadataRoute.Sitemap = [];
  try {
    const departments = await getDepartments();
    departmentPages = departments.map((dept) => ({
      url: `${baseUrl}/department/${dept.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch {
    // Continue without department pages if DB fails
  }

  // Product pages from current bestsellers
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const bestsellers = await getCurrentBestsellers();
    const uniqueProducts = new Map<string, { asin: string; categorySlug: string }>();

    bestsellers.forEach((item) => {
      if (!uniqueProducts.has(item.product.asin)) {
        uniqueProducts.set(item.product.asin, {
          asin: item.product.asin,
          categorySlug: item.category.full_slug,
        });
      }
    });

    productPages = Array.from(uniqueProducts.values()).map((product) => ({
      url: `${baseUrl}/product/${product.asin}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = bestsellers.map((item) => ({
      url: `${baseUrl}/category/${item.category.full_slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...departmentPages, ...productPages, ...categoryPages];
  } catch {
    // Return static pages if DB fails
    return [...staticPages, ...departmentPages, ...productPages];
  }
}
