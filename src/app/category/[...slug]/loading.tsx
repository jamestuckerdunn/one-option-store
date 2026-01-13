import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoryLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <nav className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Skeleton className="h-4 w-64" />
          </div>
        </nav>

        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse order-2 lg:order-1" />
              <div className="order-1 lg:order-2 space-y-6">
                <Skeleton className="h-8 w-48 rounded-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-14 w-48" />
                <div className="flex gap-4">
                  <Skeleton className="h-14 flex-1 rounded-xl" />
                  <Skeleton className="h-14 flex-1 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
