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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight group-hover:opacity-70 transition-opacity">
              One Option
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/browse"
              className="relative font-sans text-sm font-medium text-gray-700 hover:text-black transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all hover:after:w-full"
            >
              Browse
            </Link>
            <Link
              href="/about"
              className="relative font-sans text-sm font-medium text-gray-700 hover:text-black transition-colors after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-black after:transition-all hover:after:w-full"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-48 pb-4' : 'max-h-0'
          }`}
        >
          <nav className="pt-4 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <Link
                href="/browse"
                className="font-sans text-base font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Departments
              </Link>
              <Link
                href="/about"
                className="font-sans text-base font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
