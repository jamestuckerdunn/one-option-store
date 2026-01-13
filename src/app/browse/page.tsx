import Link from 'next/link';
import { getDepartments } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const revalidate = 3600; // Revalidate every hour

export default async function BrowsePage() {
  const departments = await getDepartments().catch(() => []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h1 className="font-serif text-5xl font-bold mb-4">Browse Departments</h1>
            <p className="text-lg text-gray-600">
              Explore {departments.length} departments and find the #1 bestseller in each category.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {departments.map((dept) => (
                <Link
                  key={dept.id}
                  href={`/department/${dept.slug}`}
                  className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition"
                >
                  <h2 className="font-serif text-xl font-bold mb-2">{dept.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    View bestsellers
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
