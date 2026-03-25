'use client'

export default function ReceiveSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-pulse font-sans">
      {/* ฝั่งซ้าย */}
      <div className="xl:col-span-7 space-y-10">
        <div className="bg-white p-10 rounded-[3.5rem] h-40 shadow-sm border border-slate-50"></div>
        <div className="bg-white p-10 rounded-[3.5rem] h-80 shadow-sm border border-slate-50"></div>
      </div>
      {/* ฝั่งขวา */}
      <div className="xl:col-span-5">
        <div className="bg-white p-12 rounded-[4.5rem] h-[500px] shadow-sm border border-slate-100"></div>
      </div>
    </div>
  )
}