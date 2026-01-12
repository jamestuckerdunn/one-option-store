'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Errors should be logged to an error reporting service in production
  }, [error]);

  return (
    <PageLayout>
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-3xl mb-8">
            <span className="text-4xl font-bold">!</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Something went wrong
          </h1>

          <p className="font-sans text-lg text-gray-500 mb-10 max-w-lg mx-auto">
            We encountered an unexpected error. Please try again, and if the problem persists, contact support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-sans text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-sans text-sm font-semibold rounded-xl hover:border-black transition-all duration-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
