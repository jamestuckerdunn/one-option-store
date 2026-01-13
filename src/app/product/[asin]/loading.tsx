import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <nav className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Skeleton className="h-4 w-32" />
          </div>
        </nav>

        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />

              <div className="space-y-6">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-32 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>

                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />

                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-14 w-32" />

                <Skeleton className="h-14 w-full rounded-xl sm:w-48" />

                <div className="pt-8 border-t space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="pt-8 border-t flex gap-6">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
