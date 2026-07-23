'use client'
import React from 'react'

// 🚩 ออกแบบให้เป็น Minimal & Premium Intelligence
export default function SharedLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-20 w-full animate-in fade-in duration-500">
      
      {/* 🌌 Ambient Glow ขนาดเล็กเพื่อให้ดูมีมิติ */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Spinner แบบ Modern Custom */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-[22px]"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-[22px] border-t-transparent animate-spin"></div>
        </div>
      </div>

      {/* Typography */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em] ml-[0.6em] block">
          Synchronizing Data
        </span>
        <div className="w-32 h-[1px] bg-slate-100 mx-auto relative overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 bg-indigo-600 w-full animate-loading-slide"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-slide {
          animation: loading-slide 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

{/* <div className="mt-10">
          {loading ? (
             <SharedLoading /> // 🚩 เรียกใช้ตรงนี้ ตำแหน่งจะคงที่ทุกหน้า
          ) : (
             <div className="grid">...Content...</div>
          )}
       </div>
    </div> */}