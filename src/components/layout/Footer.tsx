import Link from 'next/link';

const HOW_IT_WORKS_STEPS = [
  "We track Amazon's bestseller rankings across all categories",
  "We show only the #1 product - the crowd's verified choice",
  "You buy with confidence - no endless comparisons needed",
] as const;

export default function Footer() {
  return (
    <footer className="relative bg-black text-white mt-auto overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-black font-bold text-xl">1</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight">
                    One Option
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">
                    Store
                  </span>
                </div>
              </Link>
              <p className="font-sans text-base text-gray-400 mt-6 max-w-sm leading-relaxed">
                The best choice is no choice. Discover the #1 bestseller in every Amazon category. Stop comparing, start deciding.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-6">
                Explore
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/browse"
                    className="text-base text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    Browse Departments
                    <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-base text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    About Us
                    <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-6">
                How It Works
              </h3>
              <div className="space-y-4">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Rankings updated daily
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
