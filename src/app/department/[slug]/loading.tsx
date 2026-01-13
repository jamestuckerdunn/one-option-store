import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function DepartmentLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <nav className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Skeleton className="h-4 w-48" />
          </div>
        </nav>

        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-40" />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="max-w-sm">
              <ProductCardSkeleton />
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
