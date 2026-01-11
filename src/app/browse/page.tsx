import { createServerClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import type { Department } from '@/lib/supabase/types';

async function getDepartments() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching departments:', error);
    return [] as Department[];
  }

  return data || ([] as Department[]);
}

export default async function BrowsePage() {
  const departments = await getDepartments();

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-[#e5e5e5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Browse Departments
            </h1>
            <p className="font-sans text-[#333333] max-w-2xl">
              Explore {departments.length} departments and discover the #1 bestseller in each category.
            </p>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {departments.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/department/${dept.slug}`}
                  className="group block border border-[#e5e5e5] hover:border-black transition-colors p-6"
                >
                  <h2 className="font-serif text-lg font-bold mb-2 group-hover:opacity-70 transition-opacity">
                    {dept.name}
                  </h2>
                  <p className="font-sans text-sm text-[#333333]">
                    View #1 bestsellers
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
