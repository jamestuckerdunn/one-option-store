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
        <div className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="font-sans text-sm text-[#333333]">
              <Link href="/" className="hover:opacity-60 transition-opacity">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/browse" className="hover:opacity-60 transition-opacity">
                Browse
              </Link>
              <span className="mx-2">/</span>
              <span className="text-black">{department.name}</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <section className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              {department.name}
            </h1>
            <p className="font-sans text-[#333333]">
              {subcategories.length} {subcategories.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </section>

        {/* Featured Product (if main category has one) */}
        {mainCategory?.bestseller_rankings?.[0]?.products && (
          <section className="border-b border-[#e5e5e5] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-bold mb-6">
                #1 in {department.name}
              </h2>
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
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-bold mb-8">
              Categories in {department.name}
            </h2>

            {subcategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.full_slug}`}
                    className="group block border border-[#e5e5e5] hover:border-black transition-colors p-6"
                  >
                    <h3 className="font-serif text-lg font-bold mb-2 group-hover:opacity-70 transition-opacity">
                      {category.name}
                    </h3>
                    {category.bestseller_rankings?.[0]?.products && (
                      <p className="font-sans text-sm text-[#333333] line-clamp-1">
                        #1: {category.bestseller_rankings[0].products.name}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[#333333]">
                No subcategories available yet.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
