import { getDepartments, type Department } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BrowsePage() {
  let departments: Department[] = [];

  try {
    departments = await getDepartments();
  } catch (error) {
    console.error('Error fetching departments:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Browse Departments
            </h1>
            <p className="font-sans text-lg text-gray-600 max-w-2xl">
              Explore {departments.length} departments and discover the #1 bestseller in each category.
            </p>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {departments.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/department/${dept.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-0" />
                  <div className="relative">
                    <h2 className="font-serif text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">
                      {dept.name}
                    </h2>
                    <p className="font-sans text-sm text-gray-500 flex items-center gap-1">
                      View #1 bestsellers
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </div>
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
