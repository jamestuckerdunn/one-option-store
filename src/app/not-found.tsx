import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-bold text-gray-300">404</span>
          </div>

          <h1 className="font-serif text-4xl font-bold mb-4">Page Not Found</h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              Go Home
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 font-semibold rounded-xl hover:border-black transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
