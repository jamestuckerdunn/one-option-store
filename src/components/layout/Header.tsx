'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight leading-none">
                One Option
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
                Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/browse"
              className="relative px-5 py-2.5 font-sans text-sm font-medium text-gray-600 hover:text-black transition-all duration-300 rounded-xl hover:bg-gray-50 group"
            >
              <span className="relative z-10">Browse</span>
              <span className="absolute inset-x-0 bottom-1.5 h-0.5 bg-black scale-x-0 group-hover:scale-x-50 transition-transform duration-300" />
            </Link>
            <Link
              href="/about"
              className="relative px-5 py-2.5 font-sans text-sm font-medium text-gray-600 hover:text-black transition-all duration-300 rounded-xl hover:bg-gray-50 group"
            >
              <span className="relative z-10">About</span>
              <span className="absolute inset-x-0 bottom-1.5 h-0.5 bg-black scale-x-0 group-hover:scale-x-50 transition-transform duration-300" />
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <a
              href="https://amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 flex items-center gap-2"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-3 -mr-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col items-center justify-center gap-1.5">
              <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            mobileMenuOpen ? 'max-h-72 pb-6 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <Link
                href="/browse"
                className="font-sans text-lg font-medium py-4 px-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-between group"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Departments
                <svg className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="font-sans text-lg font-medium py-4 px-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-between group"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
                <svg className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="https://amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 py-4 px-5 bg-black text-white font-sans text-lg font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop on Amazon
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
