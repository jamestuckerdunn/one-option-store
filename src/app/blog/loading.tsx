export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-5 w-96 max-w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[16/9] bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
