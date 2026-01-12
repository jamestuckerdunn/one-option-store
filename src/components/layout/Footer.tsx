import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">1</span>
              </div>
              <span className="font-serif text-xl font-bold">One Option</span>
            </Link>
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">
              The best choice is no choice. Discover the #1 bestseller in every Amazon category.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Navigate
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-white transition">
                  Browse Departments
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
              How It Works
            </h3>
            <ol className="space-y-3 text-sm text-gray-400">
              <li>1. We track Amazon&apos;s bestseller rankings</li>
              <li>2. We show only the #1 product in each category</li>
              <li>3. You buy with confidence</li>
            </ol>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Updated daily
          </p>
        </div>
      </div>
    </footer>
  );
}
