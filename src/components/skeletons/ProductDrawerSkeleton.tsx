'use client'

export default function ProductDrawerSkeleton() {
  return (
    <div className="p-10 space-y-10 animate-pulse font-sans">
      {/* 🖼️ ส่วนรูปภาพและข้อมูลเบื้องต้น */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="w-44 h-44 bg-slate-100 rounded-[2.5rem]" />
        
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-slate-100 rounded-2xl" />
            <div className="h-4 w-32 bg-indigo-50 rounded-md" />
          </div>
          
          <div className="grid grid-cols-2 gap-y-8 pt-6 border-t border-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-2 w-16 bg-slate-50 rounded" />
                <div className="h-5 w-24 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📍 ส่วนรายละเอียด และ พื้นที่จัดเก็บ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-slate-100 rounded ml-1" />
          <div className="h-32 bg-slate-50 rounded-[2rem]" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-24 bg-slate-100 rounded ml-1" />
          <div className="h-32 bg-indigo-50/30 rounded-[2rem]" />
        </div>
      </div>

      {/* 📊 ส่วนตารางประวัติ */}
      <div className="space-y-5">
        <div className="flex justify-between items-center px-1">
          <div className="h-6 w-48 bg-slate-100 rounded-lg" />
          <div className="h-3 w-20 bg-slate-50 rounded" />
        </div>
        <div className="h-40 bg-white border border-slate-50 rounded-[2.5rem]" />
      </div>
    </div>
  )
}