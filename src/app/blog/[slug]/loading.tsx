export default function BlogPostLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-gray-100 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-12 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {[100, 95, 80, 100, 88, 75, 92, 100, 85, 78, 95, 90].map((width, i) => (
            <div
              key={i}
              className="h-5 bg-gray-200 rounded animate-pulse"
              style={{ width: `${width}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
