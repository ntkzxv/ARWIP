'use client'
import { Construction, ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  pageName?: string
}

export default function UnderConstruction({ pageName = 'หน้านี้' }: Props) {
  const router = useRouter()

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      
      {/* Icon Graphic */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-amber-50 rounded-3xl border border-amber-100 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
          <Construction size={48} className="animate-bounce" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
          <RefreshCw size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md space-y-3 mb-8">
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-4 py-1.5 rounded-full uppercase tracking-widest">
          System Notice
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {pageName} อยู่ระหว่างการปรับปรุง
        </h2>
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          ฟีเจอร์นี้กำลังได้รับการพัฒนาและจะเปิดใช้งานในเร็วๆ
        </p>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
      >
        <ArrowLeft size={16} /> ย้อนกลับหน้าเดิม
      </button>

    </div>
  )
}