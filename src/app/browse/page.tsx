import Link from 'next/link';
import Image from 'next/image';
import { getDepartmentsWithCount, getBestsellersByDepartment } from '@/lib/db';
import { logger } from '@/lib/logger';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SearchBar } from '@/components/ui/SearchBar';

export const revalidate = 3600;

// Department icon mapping for visual interest
const departmentIcons: Record<string, string> = {
  'appliances': 'M19 21H5V3h14v18zM17 5H7v14h10V5zm-4 7h-2v4h2v-4z',
  'arts-crafts-sewing': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'automotive': 'M5 11l1.5-4.5h11L19 11M3 15h2m14 0h2M6 15h12v4H6v-4zM8 19v2m8-2v2',
  'baby': 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'beauty': 'M12 3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2zm5 8V5c0-2.76-2.24-5-5-5S7 2.24 7 5v6c0 2.76 2.24 5 5 5s5-2.24 5-5zm-5 11c-3.87 0-7-3.13-7-7h2c0 2.76 2.24 5 5 5s5-2.24 5-5h2c0 3.87-3.13 7-7 7z',
  'books': 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
  'electronics': 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  'clothing': 'M21.6 18.2L13 11.75v-.91c1.65-.49 2.8-2.17 2.43-4.05-.26-1.31-1.3-2.4-2.61-2.7C10.54 3.57 8.5 5.3 8.5 7.5h2c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .84-.69 1.52-1.53 1.5-.54-.01-.97.45-.97.99v1.76L2.4 18.2c-.77.58-.36 1.8.6 1.8h18c.96 0 1.37-1.22.6-1.8z',
  'computers': 'M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z',
  'garden': 'M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z',
  'grocery': 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
  'health': 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
  'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'movies': 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z',
  'music': 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  'office': 'M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm0 12H4V6h5.17l2 2H20v10zm-2-6H6v-2h12v2zm-4 4H6v-2h8v2z',
  'pet': 'M4.5 9.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M9 5.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M15 5.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M19.5 9.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.17-.85-1.86-.86-1.67 0-2.94 1.03-4 3s-2.63 5.95-1 7.95c.53.65 1.21 1.08 2.05 1.08.5 0 1.14-.08 1.95-.36 1.01-.35 2.01-.35 3.02 0 .81.27 1.45.35 1.95.35.84 0 1.52-.43 2.05-1.08 1.63-2 .33-6.97-1.68-8.17z',
  'software': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  'sports': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM5.61 16.78C4.6 15.45 4 13.8 4 12s.6-3.45 1.61-4.78C7.06 8.31 8 10.05 8 12s-.94 3.69-2.39 4.78zm4.74-7.9L12 7l1.65 1.88-1.65 2-1.65-2zm6.64 8.11c-1.2-1.08-2.06-2.79-2.06-4.99 0-2.2.86-3.91 2.06-4.99C18.57 8.58 20 10.13 20 12s-1.43 3.42-3.01 4.99z',
  'tools': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  'toys': 'M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-1.8C18 6.57 15.35 4 12 4s-6 2.57-6 6.2c0 2.34 1.95 5.44 6 9.14 4.05-3.7 6-6.8 6-9.14z',
  'video-games': 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
};

function getDepartmentIcon(slug: string): string {
  return departmentIcons[slug] || 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5';
}

export default async function BrowsePage() {
  const [departments, departmentProducts] = await Promise.all([
    getDepartmentsWithCount().catch((error) => {
      logger.error('Failed to fetch departments', error);
      return [];
    }),
    getBestsellersByDepartment(1).catch((error) => {
      logger.error('Failed to fetch department products', error);
      return [];
    }),
  ]);

  // Create a map of department to first product image
  const deptImageMap = new Map<string, string | null>();
  for (const group of departmentProducts) {
    if (group.products.length > 0 && group.products[0].product.image_url) {
      deptImageMap.set(group.department.id, group.products[0].product.image_url);
    }
  }

  const totalProducts = departments.reduce((sum, d) => sum + d.productCount, 0);
  const activeDepartments = departments.filter((d) => d.productCount > 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 pattern-grid opacity-30" />
          <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text animate-slide-up">
                Browse All Departments
              </h1>
              <p className="text-xl text-gray-500 mb-8 animate-slide-up stagger-1" style={{ opacity: 0 }}>
                Explore {departments.length} departments with {totalProducts.toLocaleString()} bestselling products.
                Each one is the #1 choice in its category.
              </p>

              {/* Search Bar */}
              <div className="max-w-lg animate-slide-up stagger-2" style={{ opacity: 0 }}>
                <SearchBar size="large" placeholder="Search departments & products..." />
              </div>
            </div>
          </div>
        </section>

        {/* Departments Grid */}
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 stagger-fade">
              {activeDepartments.map((dept) => {
                const productImage = deptImageMap.get(dept.id);

                return (
                  <Link
                    key={dept.id}
                    href={`/department/${dept.slug}`}
                    className="group relative rounded-2xl overflow-hidden card-hover"
                  >
                    <article className="relative h-full">
                      {/* Background with product preview or gradient */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 image-container">
                        {productImage && (
                          <Image
                            src={productImage}
                            alt=""
                            fill
                            className="object-contain p-8 opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

                        {/* Icon */}
                        <div className="absolute top-4 right-4 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getDepartmentIcon(dept.slug)} />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h2 className="font-serif text-xl font-bold mb-2 group-hover:text-gray-700 transition">
                          {dept.name}
                        </h2>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {dept.productCount} {dept.productCount === 1 ? 'product' : 'products'}
                          </p>
                          <span className="inline-flex items-center text-sm font-medium text-gray-500 group-hover:text-black transition">
                            Explore
                            <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="font-serif text-4xl font-bold mb-2">{departments.length}</p>
                <p className="text-gray-500 text-sm">Departments</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold mb-2">{totalProducts.toLocaleString()}</p>
                <p className="text-gray-500 text-sm">Products</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold mb-2">100%</p>
                <p className="text-gray-500 text-sm">#1 Bestsellers</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-4xl font-bold mb-2">Daily</p>
                <p className="text-gray-500 text-sm">Updates</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
