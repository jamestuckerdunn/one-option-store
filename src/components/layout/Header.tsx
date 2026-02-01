'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler to toggle menu and close search (memoized for performance)
  const handleMenuToggle = useCallback(() => {
    setMenuOpen((prev) => !prev);
    setSearchOpen(false);
  }, []);

  // Handler to toggle search and close menu (memoized for performance)
  const handleSearchToggle = useCallback(() => {
    setSearchOpen((prev) => !prev);
    setMenuOpen(false);
  }, []);

  // Handler to close menu when a link is clicked
  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-gray-100 shadow-sm'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold leading-tight">One Option</span>
              <span className="text-[10px] text-gray-400 leading-tight tracking-wider uppercase hidden sm:block">Curated Bestsellers</span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar placeholder="Search products, categories..." />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="relative px-4 py-2 text-sm text-gray-600 hover:text-black rounded-lg transition link-animate"
            >
              Browse
            </Link>
            <Link
              href="/about"
              className="relative px-4 py-2 text-sm text-gray-600 hover:text-black rounded-lg transition link-animate"
            >
              About
            </Link>
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Link
              href="/browse"
              className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all btn-press"
            >
              Shop Now
            </Link>
          </nav>

          {/* Mobile Search & Menu Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-50 transition"
              onClick={handleSearchToggle}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2 -mr-2 rounded-lg hover:bg-gray-50 transition"
              onClick={handleMenuToggle}
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
        </div>

        {/* Mobile Search Bar */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            searchOpen ? 'max-h-20 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <SearchBar placeholder="Search products..." autoFocus={searchOpen} />
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
                onClick={handleMenuClose}
              >
                Browse Departments
              </Link>
              <Link
                href="/about"
                className="py-3 px-4 text-lg rounded-xl hover:bg-gray-50 transition"
                onClick={handleMenuClose}
              >
                About
              </Link>
              <div className="h-px bg-gray-100 my-2" />
              <Link
                href="/browse"
                className="py-3 px-4 bg-black text-white text-lg font-medium rounded-xl text-center btn-press"
                onClick={handleMenuClose}
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
