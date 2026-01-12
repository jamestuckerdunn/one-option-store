import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const HOW_IT_WORKS_STEPS = [
  "We track Amazon's bestseller rankings across thousands of categories.",
  "We identify the #1 product in each category based on actual sales.",
  "We present these products to you with a direct link to purchase.",
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1">
        <section className="border-b border-[#e5e5e5]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
              The Best Choice Is No Choice
            </h1>
            <p className="font-sans text-lg text-[#333333]">
              We believe that the paradox of choice makes shopping harder, not easier.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">What We Do</h2>
                <p className="font-sans text-[#333333] leading-relaxed">
                  One Option shows you only the #1 bestselling product in every Amazon category.
                  No comparisons. No endless scrolling. No decision fatigue.
                  Just the single product that more people bought than any other.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">Why It Works</h2>
                <p className="font-sans text-[#333333] leading-relaxed mb-4">
                  Amazon&apos;s bestseller rankings are based on actual sales data, updated hourly.
                  When a product reaches #1, it means more people chose it than any alternative.
                  That&apos;s the wisdom of the crowd in action.
                </p>
                <p className="font-sans text-[#333333] leading-relaxed">
                  Studies show that too many choices lead to decision paralysis and buyer&apos;s remorse.
                  By showing you only the winner, we eliminate that friction entirely.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">How It Works</h2>
                <ul className="font-sans text-[#333333] space-y-4">
                  {HOW_IT_WORKS_STEPS.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-6 h-6 border border-black text-center text-sm font-bold mr-4 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#e5e5e5] pt-12">
                <h2 className="font-serif text-2xl font-bold mb-4">Affiliate Disclosure</h2>
                <p className="font-sans text-[#333333] leading-relaxed">
                  One Option is a participant in the Amazon Services LLC Associates Program,
                  an affiliate advertising program designed to provide a means for sites to
                  earn advertising fees by advertising and linking to Amazon.com. As an Amazon
                  Associate, we earn from qualifying purchases.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e5e5e5] bg-black text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold mb-4">Ready to Shop Smarter?</h2>
            <p className="font-sans text-[#e5e5e5] mb-8">
              Browse our curated selection of #1 bestsellers.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-sm font-medium hover:opacity-80 transition-opacity"
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
