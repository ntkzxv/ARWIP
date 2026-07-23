'use client'

export default function AccountSettingsSkeleton() {
  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen animate-pulse">
      <header className="max-w-4xl mx-auto space-y-3">
        <div className="w-64 h-10 bg-slate-200 rounded-xl"></div>
        <div className="w-48 h-4 bg-slate-200 rounded-md"></div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2">
          <div className="w-32 h-12 bg-white rounded-2xl shadow-sm"></div>
          <div className="w-32 h-12 bg-white rounded-2xl shadow-sm"></div>
        </div>

        <div className="bg-white rounded-[40px] p-10 border border-slate-100 min-h-[500px] space-y-10">
          <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
            <div className="w-28 h-28 rounded-[35px] bg-slate-100"></div>
            <div className="space-y-4">
              <div className="w-48 h-8 bg-slate-100 rounded-lg"></div>
              <div className="flex gap-3">
                <div className="w-20 h-6 bg-slate-100 rounded-xl"></div>
                <div className="w-32 h-6 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="w-24 h-3 bg-slate-50 rounded"></div>
                <div className="w-full h-16 bg-slate-50 rounded-[22px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}