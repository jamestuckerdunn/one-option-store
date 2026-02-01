'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchResultProduct {
  type: 'product';
  asin: string;
  name: string;
  price: number | null;
  image_url: string | null;
  rating: number | null;
}

interface SearchResultCategory {
  type: 'category';
  name: string;
  full_slug: string;
  department_name: string;
  product_count: number;
}

interface SearchResultDepartment {
  type: 'department';
  name: string;
  slug: string;
  product_count: number;
}

interface SearchResults {
  products: SearchResultProduct[];
  categories: SearchResultCategory[];
  departments: SearchResultDepartment[];
}

type SearchResult = SearchResultProduct | SearchResultCategory | SearchResultDepartment;

interface SearchBarProps {
  size?: 'default' | 'large';
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  size = 'default',
  placeholder = 'Search for any product...',
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Flatten results for keyboard navigation
  const flatResults: SearchResult[] = results
    ? [
        ...results.products,
        ...results.categories,
        ...results.departments,
      ]
    : [];

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToResult = useCallback((result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'product') {
      router.push(`/product/${result.asin}`);
    } else if (result.type === 'category') {
      router.push(`/category/${result.full_slug}`);
    } else if (result.type === 'department') {
      router.push(`/department/${result.slug}`);
    }
  }, [router]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || flatResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
          navigateToResult(flatResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, flatResults, selectedIndex, navigateToResult]);

  const isLarge = size === 'large';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all ${
            isLarge
              ? 'pl-14 pr-4 py-4 text-lg'
              : 'pl-11 pr-4 py-2.5 text-sm'
          }`}
        />
        <div className={`absolute left-0 top-0 bottom-0 flex items-center ${isLarge ? 'pl-5' : 'pl-4'}`}>
          {isLoading ? (
            <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
          ) : (
            <svg
              className={`text-gray-400 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && results && (flatResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Products
              </div>
              {results.products.map((product, idx) => {
                const globalIdx = idx;
                return (
                  <button
                    key={product.asin}
                    onClick={() => navigateToResult(product)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left ${
                      selectedIndex === globalIdx ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      {product.price && (
                        <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* Categories */}
          {results.categories.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Categories
              </div>
              {results.categories.map((category, idx) => {
                const globalIdx = results.products.length + idx;
                return (
                  <button
                    key={category.full_slug}
                    onClick={() => navigateToResult(category)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left ${
                      selectedIndex === globalIdx ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-gray-400">{category.department_name} &middot; {category.product_count} products</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}

          {/* Departments */}
          {results.departments.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Departments
              </div>
              {results.departments.map((department, idx) => {
                const globalIdx = results.products.length + results.categories.length + idx;
                return (
                  <button
                    key={department.slug}
                    onClick={() => navigateToResult(department)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left ${
                      selectedIndex === globalIdx ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{department.name}</p>
                      <p className="text-xs text-gray-400">{department.product_count} products</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {isOpen && results && flatResults.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="px-4 py-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
}
