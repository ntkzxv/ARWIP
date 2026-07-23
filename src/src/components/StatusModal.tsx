'use client'
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: 'success' | 'error' | 'warning' | 'loading'; // เพิ่ม loading
  title: string;
  subtitle: string;
  confirmText?: string;
}

export default function StatusModal({ 
  isOpen, onClose, onConfirm, type, title, subtitle, confirmText 
}: StatusModalProps) {
  if (!isOpen) return null;

  // ตั้งค่าสีและไอคอนตามประเภท
  const config = {
    success: {
      icon: <CheckCircle2 size={40} />,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      btnColor: 'hover:bg-emerald-600',
    },
    error: {
      icon: <XCircle size={40} />,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      btnColor: 'hover:bg-rose-600',
    },
    warning: {
      icon: <AlertTriangle size={40} />,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      btnColor: 'hover:bg-amber-600',
    },
    loading: {
      icon: <Loader2 size={40} className="animate-spin" />, // ไอคอนหมุน
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      btnColor: 'hidden', // ซ่อนปุ่มตอนโหลด
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 font-sans">
      {/* 🌑 Backdrop: ค่อยๆ มืดขึ้นและเบลอพื้นหลัง */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={type !== 'loading' ? onClose : undefined} 
      />
      
      {/* 📦 Modal Card: สไลด์ขึ้นมาจากล่าง + ขยายตัวนุ่มๆ */}
      <div className="
        relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl 
        border border-slate-100 text-center
        animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out
      ">
        {/* ส่วนไอคอน */}
        <div className={`w-20 h-20 ${config.bgColor} ${config.iconColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner`}>
           {config.icon}
        </div>
        
        {/* หัวข้อและคำอธิบาย */}
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8 uppercase tracking-widest px-4">
          {subtitle}
        </p>

        {/* ปุ่มกด (ซ่อนเมื่อโหลด) */}
        {type !== 'loading' && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
             <button 
               onClick={onConfirm || onClose} 
               className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${config.btnColor}`}
             >
               {confirmText || 'ตกลง'}
             </button>
             
             {type === 'warning' && (
               <button 
                 onClick={onClose} 
                 className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:text-slate-900 transition-all active:scale-95"
               >
                 ยกเลิก
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}