import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="inline-block group">
                <span className="font-serif text-2xl font-bold tracking-tight group-hover:opacity-70 transition-opacity">
                  One Option
                </span>
              </Link>
              <p className="font-sans text-sm text-gray-500 mt-3 max-w-xs">
                The best choice is no choice. Discover the #1 bestseller in every Amazon category.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
                Explore
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/browse"
                    className="font-sans text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Browse Departments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="font-sans text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4">
                How It Works
              </h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">
                We track Amazon&apos;s bestseller rankings and show you only the #1 product in each category.
                No endless scrolling, no comparison paralysis.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-gray-400 text-center sm:text-left">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
            <p className="font-sans text-xs text-gray-400">
              Rankings updated frequently
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
