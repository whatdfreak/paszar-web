export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8 md:pt-28 md:pb-12">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-10 border-b border-stone-200 pb-4 md:pb-8">
          <div className="h-10 md:h-14 w-48 md:w-64 bg-stone-100 animate-pulse"></div>
        </div>

        <div className="flex gap-16">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="space-y-10">
              <div>
                <div className="h-4 w-24 bg-stone-100 animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 w-full bg-stone-100 animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-4 w-24 bg-stone-100 animate-pulse mb-6"></div>
                <div className="h-20 w-full bg-stone-100 animate-pulse"></div>
              </div>
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
              <div className="h-4 w-24 bg-stone-100 animate-pulse lg:hidden"></div>
              <div className="h-4 w-32 bg-stone-100 animate-pulse hidden lg:block"></div>
              <div className="h-4 w-24 bg-stone-100 animate-pulse ml-auto"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-[4/5] bg-stone-100 animate-pulse mb-4"></div>
                  <div className="h-3 w-16 bg-stone-100 animate-pulse mb-2"></div>
                  <div className="h-4 w-3/4 bg-stone-100 animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-stone-100 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
