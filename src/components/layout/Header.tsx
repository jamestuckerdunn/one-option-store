'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold leading-tight">One Option</span>
              <span className="text-[10px] text-gray-400 leading-tight tracking-wider uppercase">Curated Bestsellers</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition"
            >
              Browse
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition"
            >
              About
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Link
              href="/browse"
              className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all hover:scale-105"
            >
              Shop Now
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-50 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`h-0.5 bg-black transition-all duration-300 origin-left ${
                  menuOpen ? 'rotate-45 w-[28px]' : 'w-6'
                }`}
              />
              <span
                className={`h-0.5 bg-black transition-all duration-300 ${
                  menuOpen ? 'opacity-0 w-0' : 'w-4'
                }`}
              />
              <span
                className={`h-0.5 bg-black transition-all duration-300 origin-left ${
                  menuOpen ? '-rotate-45 w-[28px]' : 'w-5'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              <Link
                href="/browse"
                className="py-3 px-4 text-lg rounded-xl hover:bg-gray-50 transition"
                onClick={() => setMenuOpen(false)}
              >
                Browse Departments
              </Link>
              <Link
                href="/about"
                className="py-3 px-4 text-lg rounded-xl hover:bg-gray-50 transition"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <div className="h-px bg-gray-100 my-2" />
              <Link
                href="/browse"
                className="py-3 px-4 bg-black text-white text-lg font-medium rounded-xl text-center"
                onClick={() => setMenuOpen(false)}
              >
                Shop Now
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
