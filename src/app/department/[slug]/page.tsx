import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ProductData {
  asin: string;
  name: string;
  price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
}

interface CategoryWithRankings {
  id: string;
  name: string;
  slug: string;
  full_slug: string;
  depth: number;
  bestseller_rankings: Array<{
    id: string;
    products: ProductData | null;
  }>;
}

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
}

async function getDepartmentData(slug: string) {
  const supabase = createServerClient();

  // Get department
  const { data: deptData, error: deptError } = await supabase
    .from('departments')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (deptError || !deptData) {
    return null;
  }

  const department = deptData as DepartmentData;

  // Get categories with their bestseller products
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug,
      full_slug,
      depth,
      bestseller_rankings (
        id,
        products (
          asin,
          name,
          price,
          image_url,
          rating,
          review_count
        )
      )
    `)
    .eq('department_id', department.id)
    .order('name');

  if (catError) {
    console.error('Error fetching categories:', catError);
  }

  const categories = (catData || []) as unknown as CategoryWithRankings[];

  return {
    department,
    categories,
  };
}

export default async function DepartmentPage({ params }: Props) {
  const { slug } = await params;
  const data = await getDepartmentData(slug);

  if (!data) {
    notFound();
  }

  const { department, categories } = data;

  // Separate main category from subcategories
  const mainCategory = categories.find((c) => c.depth === 0);
  const subcategories = categories.filter((c) => c.depth === 1);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="font-sans text-sm text-gray-500 flex items-center gap-2">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/browse" className="hover:text-black transition-colors">
                Browse
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{department.name}</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
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

        {/* Featured Product (if main category has one) */}
        {mainCategory?.bestseller_rankings?.[0]?.products && (
          <section className="py-12 lg:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-sans font-semibold uppercase tracking-wider rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Featured
                </span>
                <h2 className="font-serif text-2xl font-bold">
                  #1 in {department.name}
                </h2>
              </div>
              <div className="max-w-sm">
                <ProductCard
                  asin={mainCategory.bestseller_rankings[0].products.asin}
                  name={mainCategory.bestseller_rankings[0].products.name}
                  price={mainCategory.bestseller_rankings[0].products.price}
                  imageUrl={mainCategory.bestseller_rankings[0].products.image_url}
                  rating={mainCategory.bestseller_rankings[0].products.rating}
                  reviewCount={mainCategory.bestseller_rankings[0].products.review_count}
                  categoryName={department.name}
                />
              </div>
            </div>
          </section>
        )}

        {/* Subcategories List */}
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
                    {category.bestseller_rankings?.[0]?.products ? (
                      <p className="font-sans text-sm text-gray-500 line-clamp-2">
                        #1: {category.bestseller_rankings[0].products.name}
                      </p>
                    ) : (
                      <p className="font-sans text-sm text-gray-400">
                        View bestseller
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-xs font-sans font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                      View category
                      <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-gray-500">
                  No subcategories available yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
