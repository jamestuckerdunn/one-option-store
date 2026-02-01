/**
 * JSON-LD structured data components for SEO.
 * Implements Schema.org markup for better search engine understanding.
 */

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}

/**
 * Organization schema for the website.
 */
export function OrganizationSchema({
  name = 'One Option',
  url = 'https://oneoptionstore.com',
  logo = 'https://oneoptionstore.com/logo.png',
  description = 'Curated Amazon bestsellers - one top-rated product per category',
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: [
      'https://twitter.com/OneOptionStore',
      'https://facebook.com/OneOptionStore',
      'https://instagram.com/OneOptionStore',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

/**
 * Website schema with search action.
 */
export function WebsiteSchema({
  name = 'One Option',
  url = 'https://oneoptionstore.com',
  searchUrl = 'https://oneoptionstore.com/search?q={search_term_string}',
}: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb schema for navigation paths.
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string;
  sku: string; // ASIN
  url: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
  brand?: string;
  category?: string;
}

/**
 * Product schema for individual product pages.
 */
export function ProductSchema({
  name,
  description,
  image,
  sku,
  url,
  price,
  priceCurrency = 'USD',
  availability = 'InStock',
  rating,
  reviewCount,
  brand,
  category,
}: ProductSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    sku,
    url,
  };

  if (description) {
    schema.description = description;
  }

  if (image) {
    schema.image = image;
  }

  if (brand) {
    schema.brand = {
      '@type': 'Brand',
      name: brand,
    };
  }

  if (category) {
    schema.category = category;
  }

  // Add offers if price is available
  if (price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency,
      availability: `https://schema.org/${availability}`,
      url,
    };
  }

  // Add aggregate rating if available
  if (rating !== undefined && reviewCount !== undefined && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      reviewCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

/**
 * FAQ schema for category pages or FAQ sections.
 */
export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName?: string;
}

/**
 * Article schema for blog posts.
 */
export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  url,
  authorName = 'One Option Team',
}: ArticleSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    datePublished,
    url,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'One Option',
      logo: {
        '@type': 'ImageObject',
        url: 'https://oneoptionstore.com/logo.png',
      },
    },
  };

  if (description) {
    schema.description = description;
  }

  if (image) {
    schema.image = image;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ItemListSchemaProps {
  name: string;
  description?: string;
  items: Array<{
    name: string;
    url: string;
    image?: string;
    position: number;
  }>;
}

/**
 * ItemList schema for category pages showing multiple products.
 */
export function ItemListSchema({ name, description, items }: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      url: item.url,
      name: item.name,
      image: item.image,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
