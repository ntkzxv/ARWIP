'use client'

export default function RegistrySkeleton() {
  return (
    <div className="p-10 space-y-12 animate-pulse font-sans">
      {/* ส่วนหัว Identity */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-100 rounded-md"></div>
            <div className="h-2 w-20 bg-slate-50 rounded-md"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="md:col-span-2 h-20 bg-slate-50/50 rounded-2xl border border-slate-50"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50/50 rounded-2xl border border-slate-50"></div>
          ))}
        </div>
      </div>

      <hr className="border-slate-50" />

      {/* ส่วน Inventory */}
      <div className="space-y-8">
        <div className="h-8 w-48 bg-slate-100 rounded-lg"></div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}