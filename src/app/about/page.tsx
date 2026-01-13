import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h1 className="font-serif text-5xl font-bold mb-6">
              The Best Choice Is No Choice
            </h1>
            <p className="text-lg text-gray-600">
              We believe the paradox of choice makes shopping harder, not easier.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 space-y-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">What We Do</h2>
              <p className="text-gray-600 leading-relaxed">
                One Option shows you only the #1 bestselling product in every Amazon category.
                No comparisons. No endless scrolling. No decision fatigue.
                Just the single product that more people bought than any other.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">Why It Works</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Amazon&apos;s bestseller rankings are based on actual sales data, updated hourly.
                When a product reaches #1, it means more people chose it than any alternative.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Studies show too many choices lead to decision paralysis and buyer&apos;s remorse.
                By showing you only the winner, we eliminate that friction entirely.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-4">How It Works</h2>
              <ol className="text-gray-600 space-y-4">
                <li className="flex gap-4">
                  <span className="w-6 h-6 border border-black text-center text-sm font-bold flex-shrink-0">1</span>
                  <span>We track Amazon&apos;s bestseller rankings across thousands of categories.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 border border-black text-center text-sm font-bold flex-shrink-0">2</span>
                  <span>We identify the #1 product in each category based on actual sales.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 border border-black text-center text-sm font-bold flex-shrink-0">3</span>
                  <span>We present these products with a direct link to purchase.</span>
                </li>
              </ol>
            </div>

            <div className="border-t pt-12">
              <h2 className="font-serif text-2xl font-bold mb-4">Affiliate Disclosure</h2>
              <p className="text-gray-600 leading-relaxed">
                One Option is a participant in the Amazon Services LLC Associates Program,
                an affiliate advertising program designed to provide a means for sites to
                earn advertising fees by advertising and linking to Amazon.com.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">Ready to Shop Smarter?</h2>
            <p className="text-gray-300 mb-8">Browse our curated selection of #1 bestsellers.</p>
            <Link
              href="/browse"
              className="inline-flex px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Start Browsing
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
