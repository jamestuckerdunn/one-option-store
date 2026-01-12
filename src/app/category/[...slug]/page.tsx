import { getCategoryByFullSlug, getBestsellerForCategory, getDepartmentBySlug } from '@/lib/db';
import PageLayout from '@/components/layout/PageLayout';
import ProductHero from '@/components/products/ProductHero';
import { Breadcrumb, ClockIcon, ExternalLinkIcon } from '@/components/ui';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const fullSlug = slug.join('/');

  const category = await getCategoryByFullSlug(fullSlug);
  if (!category) {
    notFound();
  }

  const product = await getBestsellerForCategory(category.id);

  const departmentSlug = slug[0];
  const department = category.department_id
    ? await getDepartmentBySlug(departmentSlug)
    : null;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    ...(department ? [{ label: department.name, href: `/department/${department.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <PageLayout>
      <Breadcrumb items={breadcrumbItems} />

      {product ? (
        <ProductHero
          asin={product.asin}
          name={product.name}
          price={product.price}
          imageUrl={product.image_url}
          amazonUrl={product.amazon_url}
          rating={product.rating}
          reviewCount={product.review_count}
          categoryName={category.name}
        />
      ) : (
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full mb-6">
              <ClockIcon className="w-4 h-4" />
              Coming Soon
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {category.name}
            </h1>
            <p className="font-sans text-lg text-gray-500 mb-10 max-w-lg mx-auto">
              No bestseller data available for this category yet. Check back soon!
            </p>
            {category.amazon_url && (
              <a
                href={category.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                View on Amazon
                <ExternalLinkIcon className="ml-2 w-4 h-4" />
              </a>
            )}
          </div>
        </section>
      )}

      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold mb-4">About This Category</h2>
            <p className="font-sans text-gray-600 leading-relaxed mb-6">
              This product is the current #1 bestseller in Amazon&apos;s {category.name} category.
              Rankings are updated frequently to ensure you always see the top choice.
            </p>

            {category.amazon_url && (
              <a
                href={category.amazon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors group"
              >
                View full category on Amazon
                <ExternalLinkIcon className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
