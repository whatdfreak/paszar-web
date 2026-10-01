export default function Loading() {
  return (
    <main className="bg-white min-h-screen pt-20 md:pt-24 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 md:mb-8 h-4 w-48 bg-stone-100 animate-pulse"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images Skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/5] w-full bg-stone-100 animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-stone-100 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="lg:py-10">
            <div className="h-4 w-24 bg-stone-100 animate-pulse mb-4"></div>
            <div className="h-10 md:h-12 w-3/4 bg-stone-100 animate-pulse mb-6"></div>
            <div className="h-6 w-32 bg-stone-100 animate-pulse mb-10"></div>
            
            <div className="h-px w-full bg-stone-100 mb-10"></div>
            
            <div className="space-y-3 mb-10">
              <div className="h-4 w-full bg-stone-100 animate-pulse"></div>
              <div className="h-4 w-full bg-stone-100 animate-pulse"></div>
              <div className="h-4 w-3/4 bg-stone-100 animate-pulse"></div>
            </div>

            <div className="h-px w-full bg-stone-100 mb-10"></div>

            <div className="h-12 w-full bg-stone-100 animate-pulse mb-4"></div>
            <div className="h-12 w-full bg-stone-100 animate-pulse mb-4"></div>
            <div className="h-12 w-full bg-stone-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
