import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getBestsellerByCategory, getDepartmentBySlug } from '@/lib/db';
import { isValidSlug } from '@/lib/validation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductHero from '@/components/products/ProductHero';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export const revalidate = 300; // Revalidate every 5 minutes

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug.every(isValidSlug)) return {};

  const fullSlug = slug.join('/');
  const category = await getCategoryBySlug(fullSlug);
  if (!category) return {};

  const product = await getBestsellerByCategory(category.id);

  return {
    title: `#1 Bestseller in ${category.name}`,
    description: product
      ? `${product.name} - The current #1 bestselling product in ${category.name} on Amazon.`
      : `Discover the #1 bestselling product in ${category.name}.`,
    openGraph: {
      title: `#1 Bestseller in ${category.name} | One Option Store`,
      description: product
        ? `${product.name} - The #1 bestseller in ${category.name}.`
        : `Discover the #1 bestseller in ${category.name}.`,
      images: product?.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  if (!slug.every(isValidSlug)) notFound();

  const fullSlug = slug.join('/');

  const category = await getCategoryBySlug(fullSlug);
  if (!category) notFound();

  const product = await getBestsellerByCategory(category.id);
  const department = await getDepartmentBySlug(slug[0]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Browse', href: '/browse' },
          ...(department ? [{ label: department.name, href: `/department/${department.slug}` }] : []),
          { label: category.name }
        ]} />

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
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <span className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 text-xs font-semibold uppercase rounded-full mb-6">
                Coming Soon
              </span>
              <h1 className="font-serif text-5xl font-bold mb-4">{category.name}</h1>
              <p className="text-lg text-gray-500">
                No bestseller data available for this category yet.
              </p>
            </div>
          </section>
        )}

        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl font-bold mb-4">About This Category</h2>
              <p className="text-gray-600 leading-relaxed">
                This product is the current #1 bestseller in Amazon&apos;s {category.name} category.
                Rankings are updated regularly to ensure you see the top choice.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
