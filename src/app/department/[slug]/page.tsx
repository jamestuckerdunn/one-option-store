import { getDepartmentBySlug, getCategoriesWithProductsByDepartment } from '@/lib/db';
import PageLayout from '@/components/layout/PageLayout';
import ProductCard from '@/components/products/ProductCard';
import { Breadcrumb, ChevronRightIcon, CheckCircleIcon } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface DepartmentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params;

  const department = await getDepartmentBySlug(slug);
  if (!department) {
    notFound();
  }

  const categories = await getCategoriesWithProductsByDepartment(department.id);
  const mainCategory = categories.find((category) => category.depth === 0);
  const subcategories = categories.filter((category) => category.depth === 1);

  return (
    <PageLayout>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Browse', href: '/browse' },
          { label: department.name },
        ]}
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            {department.name}
          </h1>
          <p className="font-sans text-lg text-gray-500">
            {subcategories.length} {subcategories.length === 1 ? 'category' : 'categories'} with #1 bestsellers
          </p>
        </div>
      </section>

      {mainCategory?.product && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full">
                <CheckCircleIcon />
                Featured
              </span>
              <h2 className="font-serif text-2xl font-bold">#1 in {department.name}</h2>
            </div>
            <div className="max-w-sm">
              <ProductCard
                asin={mainCategory.product.asin}
                name={mainCategory.product.name}
                price={mainCategory.product.price}
                imageUrl={mainCategory.product.image_url}
                rating={mainCategory.product.rating}
                reviewCount={mainCategory.product.review_count}
                categoryName={department.name}
              />
            </div>
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-8">
            Categories in {department.name}
          </h2>

          {subcategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.full_slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full" />
                  <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-gray-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.product ? (
                    <p className="font-sans text-sm text-gray-500 line-clamp-2">
                      #1: {category.product.name}
                    </p>
                  ) : (
                    <p className="font-sans text-sm text-gray-400">View bestseller</p>
                  )}
                  <div className="mt-4 flex items-center text-xs font-sans font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    View category
                    <ChevronRightIcon className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="font-sans text-gray-500">No subcategories available yet.</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
