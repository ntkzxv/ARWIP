'use client'

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10 animate-pulse font-sans">
      
      {/* 📦 Section 1: Main Product Card Skeleton */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-14 flex flex-col lg:flex-row gap-16">
        
        {/* รูปภาพและ SKU */}
        <div className="lg:w-[380px] space-y-6">
           <div className="aspect-square bg-slate-50 rounded-[2.5rem] border border-slate-50"></div>
           <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-slate-50 rounded-2xl"></div>
              <div className="h-14 bg-slate-50 rounded-2xl"></div>
           </div>
        </div>

        {/* ข้อมูลเนื้อหา */}
        <div className="flex-1 space-y-8 py-2">
           <div className="space-y-4">
              <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
              <div className="h-16 w-3/4 bg-slate-100 rounded-2xl"></div>
              <div className="h-4 w-full bg-slate-50 rounded-md"></div>
              <div className="h-4 w-2/3 bg-slate-50 rounded-md"></div>
           </div>

           {/* สเปก */}
           <div className="grid grid-cols-3 gap-10 py-10 border-y border-slate-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                   <div className="h-3 w-16 bg-slate-50 rounded"></div>
                   <div className="h-5 w-24 bg-slate-100 rounded"></div>
                </div>
              ))}
           </div>

           {/* สาขา และ ยอดคงเหลือ */}
           <div className="flex justify-between items-end pt-4">
              <div className="h-16 w-48 bg-slate-50 rounded-3xl"></div>
              <div className="space-y-2">
                 <div className="h-3 w-20 bg-slate-50 rounded ml-auto"></div>
                 <div className="h-14 w-32 bg-slate-100 rounded-xl"></div>
              </div>
           </div>
        </div>
      </div>

      {/* 📊 Section 2: Pricing & History Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 h-[400px] bg-white border border-slate-50 rounded-[2.5rem] p-10 space-y-6">
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
            <div className="h-32 bg-indigo-50/30 rounded-[2rem]"></div>
            <div className="space-y-3">
               {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-50 rounded-2xl"></div>)}
            </div>
         </div>
         <div className="lg:col-span-8 h-[400px] bg-white border border-slate-50 rounded-[2.5rem]">
            <div className="p-8 border-b border-slate-50 flex justify-between">
               <div className="h-4 w-40 bg-slate-100 rounded"></div>
               <div className="h-4 w-20 bg-slate-50 rounded"></div>
            </div>
            <div className="p-10 space-y-6">
               {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-slate-50/50 rounded-xl"></div>)}
            </div>
         </div>
      </div>
    </div>
  )
}