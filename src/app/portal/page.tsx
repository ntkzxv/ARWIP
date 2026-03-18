'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Package, ArrowRight, Zap, Settings } from 'lucide-react'

export default function PortalPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ให้เริ่มแอนิเมชันหลังจาก Component mount เล็กน้อย
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* 🌑 1. Transitional Overlay: แผ่นฟิล์มสีมืดที่ค่อยๆ จางออกเพื่อลดความแสบตา */}
      <div className={`absolute inset-0 bg-slate-950 z-50 pointer-events-none transition-opacity duration-1000 ease-out ${isReady ? 'opacity-0' : 'opacity-100'}`}></div>

      {/* 🪐 2. Ambient Glow: แสงครามจางๆ ด้านหลังเพื่อให้สีขาวไม่ดูเรียบจนเกินไป */}
      <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full transition-all duration-[2000ms] ${isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>

      {/* --- HEADER --- */}
      <div className={`text-center mb-16 space-y-4 relative z-10 transition-all duration-1000 delay-300 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="w-20 h-20 bg-indigo-600 rounded-[30px] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-100 group cursor-pointer hover:rotate-[360deg] transition-transform duration-1000">
           <Zap className="text-white" size={40} fill="white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
           Arwip<span className="text-indigo-600"> Intelligence</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Workspace Gateway</p>
      </div>

      {/* --- CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl relative z-10">
        
        {/* DATACENTER: โผล่มาเป็นลำดับที่ 1 */}
        <div className={`transition-all duration-1000 delay-[500ms] ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <SelectionCard 
             title="Datacenter"
             desc="Financial Intelligence, Risk Analysis, and Collection Control Center."
             icon={Database}
             bgIcon={Database}
             color="indigo"
             onClick={() => router.push('/datacenter/dashboard')}
          />
        </div>

        {/* WAREHOUSE: โผล่มาเป็นลำดับที่ 2 (ช้ากว่านิดนึงเพื่อให้ดูมีจังหวะ) */}
        <div className={`transition-all duration-1000 delay-[700ms] ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <SelectionCard 
             title="Warehouse"
             desc="Inventory Management, Stock Movement, and Asset Tracking System."
             icon={Package}
             bgIcon={Package}
             color="emerald"
             onClick={() => router.push('/warehouse/dashboard')}
          />
        </div>
      </div>

      {/* ⚙️ 3. Quick Settings Float: ปุ่มตั้งค่าแบบลอยจางๆ ด้านล่าง */}
      <button 
        onClick={() => router.push('/portal/settings')}
        className={`mt-16 flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all duration-500 delay-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <Settings size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Global Settings</span>
      </button>

    </div>
  )
}

function SelectionCard({ title, desc, icon: Icon, bgIcon: BgIcon, color, onClick }: any) {
  const colors: any = {
    indigo: {
      primary: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-600',
      shadow: 'hover:shadow-indigo-100',
      bgIcon: 'text-indigo-600'
    },
    emerald: {
      primary: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-600',
      shadow: 'hover:shadow-emerald-100',
      bgIcon: 'text-emerald-600'
    }
  };

  const theme = colors[color];

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white p-12 rounded-[55px] border-2 border-slate-50 transition-all duration-700 cursor-pointer shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] ${theme.border} ${theme.shadow} hover:-translate-y-3 overflow-hidden active:scale-95`}
    >
      {/* WATERMARK ICON: เนียนขึ้นด้วยการ Fade In พร้อมการ Scale */}
      <div className="absolute -right-8 -top-8 transition-all duration-1000 opacity-[0.02] group-hover:opacity-[0.08] group-hover:scale-125 group-hover:-rotate-6">
         <BgIcon size={260} strokeWidth={1} className={theme.bgIcon} />
      </div>

      {/* NEURAL TAG */}
      <div className="absolute top-12 right-12 flex flex-col items-end opacity-20 group-hover:opacity-60 transition-all">
        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-400">Node_Active</span>
        <div className={`h-[1px] w-8 ${theme.primary} mt-1 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500`}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* MAIN ICON: ขยายตัวนุ่มนวล */}
        <div className={`w-16 h-16 ${theme.primary} text-white rounded-[24px] flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 transition-all duration-500 group-hover:shadow-indigo-200`}>
          <Icon size={32} />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic leading-none">{title}</h2>
        <p className="text-slate-400 font-bold text-sm leading-relaxed mb-12 max-w-[240px] italic">
          {desc}
        </p>
        
        <div className={`mt-auto flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] ${theme.text}`}>
          Establish Connection <ArrowRight size={16} className="group-hover:translate-x-3 transition-transform duration-500" />
        </div>
      </div>
    </div>
  )
}