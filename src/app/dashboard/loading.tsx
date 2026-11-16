export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-soft-enter">
      {/* Top Bar Skeleton */}
      <div className="bg-white border-b border-slate-200 h-16 px-5 md:px-6 flex items-center justify-between">
        <div className="h-3.5 w-32 rounded skeleton-shimmer" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-56 rounded-lg hidden sm:block skeleton-shimmer" />
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
        </div>
      </div>

      <div className="p-5 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-6 w-36 rounded skeleton-shimmer" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-lg skeleton-shimmer" />
            <div className="h-8 w-20 rounded-lg skeleton-shimmer" />
            <div className="h-8 w-20 rounded-lg skeleton-shimmer" />
          </div>
          <div className="h-8 w-28 rounded-lg skeleton-shimmer" />
        </div>

        {/* Stat Strip Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl h-24 grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 p-4 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded skeleton-shimmer" />
            <div className="h-6 w-16 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-2 pl-4">
            <div className="h-3 w-24 rounded skeleton-shimmer" />
            <div className="h-6 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-2 pl-4 hidden lg:block">
            <div className="h-3 w-20 rounded skeleton-shimmer" />
            <div className="h-6 w-14 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-2 pl-4 hidden lg:block">
            <div className="h-3 w-24 rounded skeleton-shimmer" />
            <div className="h-6 w-12 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
          <div className="h-8 rounded-lg skeleton-shimmer" />
          <div className="h-10 rounded-lg skeleton-shimmer" />
          <div className="h-10 rounded-lg skeleton-shimmer" />
          <div className="h-10 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
