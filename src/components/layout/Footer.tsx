import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-gray-900 font-bold text-lg">1</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold">One Option</span>
                <span className="text-[10px] text-gray-500 tracking-wider uppercase">Curated Bestsellers</span>
              </div>
            </Link>
            <p className="text-gray-400 mt-6 text-sm leading-relaxed max-w-sm">
              The best choice is no choice. We curate Amazon&apos;s #1 bestseller in every category,
              so you can shop with confidence and save time.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Navigate
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="relative inline-block text-gray-400 hover:text-white transition text-sm link-animate">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="relative inline-block text-gray-400 hover:text-white transition text-sm link-animate">
                  Browse Departments
                </Link>
              </li>
              <li>
                <Link href="/about" className="relative inline-block text-gray-400 hover:text-white transition text-sm link-animate">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              How It Works
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                <span className="text-gray-400">We track Amazon&apos;s bestseller rankings daily</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                <span className="text-gray-400">We curate only the #1 product in each category</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                <span className="text-gray-400">You shop with confidence</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
            <div className="flex items-center gap-6">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Updated weekly
              </p>
              <p className="text-xs text-gray-600">
                &copy; {new Date().getFullYear()} One Option
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
