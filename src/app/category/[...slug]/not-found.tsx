import Link from 'next/link';

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Category not found
        </h1>
        <p className="text-gray-600 mb-8">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/browse"
          className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition"
        >
          Browse categories
        </Link>
      </div>
    </div>
  );
}
