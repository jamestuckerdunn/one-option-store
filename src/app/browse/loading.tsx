import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BrowseLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="flex-1">
        <section className="bg-gray-50 border-b py-12">
          <div className="max-w-7xl mx-auto px-6">
            <Skeleton className="h-12 w-80 mb-3" />
            <Skeleton className="h-6 w-60" />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={`browse-skeleton-${i}`} className="p-6 rounded-2xl bg-white border">
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
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
