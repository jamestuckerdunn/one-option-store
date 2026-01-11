import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e5e5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <span className="font-serif text-lg font-bold">One Option</span>
            <p className="font-sans text-xs text-[#333333] mt-1">
              The best choice is no choice.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/browse"
              className="font-sans text-xs hover:opacity-60 transition-opacity"
            >
              Browse
            </Link>
            <Link
              href="/about"
              className="font-sans text-xs hover:opacity-60 transition-opacity"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
          <p className="font-sans text-xs text-[#333333] text-center">
            As an Amazon Associate, we earn from qualifying purchases.
            Product rankings are updated frequently.
          </p>
        </div>
      </div>
    </footer>
  );
}
