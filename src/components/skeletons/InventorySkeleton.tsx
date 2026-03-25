'use client'

export default function InventorySkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-sans">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 h-16 bg-white border border-slate-100 rounded-[2.5rem]"></div>
        <div className="w-40 h-16 bg-white border border-slate-100 rounded-[2.5rem]"></div>
      </div>

      {/* Main Table Skeleton */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 px-14">
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>

        {/* Category Rows Skeleton (สร้างมา 5 แถว) */}
        <div className="divide-y divide-slate-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-8 px-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-100 rounded-md"></div>
                  <div className="h-2 w-24 bg-slate-50 rounded-md"></div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-6 w-24 bg-slate-50 rounded-full"></div>
                <div className="w-5 h-5 bg-slate-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="p-10 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
          <div className="h-3 w-20 bg-slate-100 rounded ml-6"></div>
          <div className="flex gap-3 mr-6">
            <div className="h-12 w-28 bg-white border border-slate-100 rounded-[1.5rem]"></div>
            <div className="h-12 w-28 bg-white border border-slate-100 rounded-[1.5rem]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}