'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <span className="font-serif text-xl font-bold">One Option</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm text-gray-600 hover:text-black transition">
              Browse
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-black transition">
              About
            </Link>
            <a
              href="https://amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Shop Now
            </a>
          </nav>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 bg-black transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-black transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-black transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link
                href="/browse"
                className="py-3 px-4 text-lg rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/about"
                className="py-3 px-4 text-lg rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <a
                href="https://amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-black text-white text-lg font-medium rounded-lg text-center"
              >
                Shop Now
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
