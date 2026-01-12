import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse order-2 lg:order-1" />
              <div className="order-1 lg:order-2 space-y-6">
                <div className="h-8 w-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-14 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />
            <ProductGridSkeleton count={8} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
