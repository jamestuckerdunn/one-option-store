import type { MetadataRoute } from 'next';
import { getDepartments, getBestsellers } from '@/lib/db';

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

  // Dynamic pages
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // Department pages
    const departments = await getDepartments();
    for (const dept of departments) {
      dynamicPages.push({
        url: `${baseUrl}/department/${dept.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }

    // Product and category pages from bestsellers
    const bestsellers = await getBestsellers();
    const seenProducts = new Set<string>();
    const seenCategories = new Set<string>();

    for (const item of bestsellers) {
      // Product pages
      if (!seenProducts.has(item.product.asin)) {
        seenProducts.add(item.product.asin);
        dynamicPages.push({
          url: `${baseUrl}/product/${item.product.asin}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }

      // Category pages
      if (!seenCategories.has(item.category.full_slug)) {
        seenCategories.add(item.category.full_slug);
        dynamicPages.push({
          url: `${baseUrl}/category/${item.category.full_slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [...staticPages, ...dynamicPages];
}
