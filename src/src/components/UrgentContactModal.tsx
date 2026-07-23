'use client'
import { useState } from 'react'
import { X, Zap, MessageSquare, PhoneCall, Hash, ChevronRight, AlertCircle } from 'lucide-react'
import { supabase } from '../utils/supabase'
import Swal from 'sweetalert2'

export default function UrgentContactModal({ item, onClose, onSave }: any) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async (method: string) => {
    if (!note) return Swal.fire('กรุณาระบุบันทึก', 'ต้องระบุรายละเอียดการติดตามด่วน', 'warning')
    setLoading(true)
    try {
      const { error } = await supabase.from('collection_logs').insert([{
        payment_id: item.id,
        contract_id: item.contract_id,
        contact_method: method,
        result_note: `[ติดตามด่วน] ${note}`,
      }])
      if (error) throw error
      onSave()
      onClose()
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1500, showConfirmButton: false })
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 border border-rose-100">
        
        {/* --- 🔴 HEADER (Urgent Mode) --- */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-rose-50 bg-rose-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse">
               <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-lg font-black text-rose-600 uppercase tracking-tighter italic">ติดตามด่วน</h2>
              <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none">Urgent Action Required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* --- 💵 INFO ROW (Compact) --- */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">งวดที่</p>
              <div className="flex items-center gap-2 text-slate-900">
                <Hash size={14} className="text-rose-500" />
                <span className="font-black italic text-lg">{item.installment_number}</span>
              </div>
            </div>
            <div className="bg-rose-600 p-4 rounded-2xl shadow-inner">
              <p className="text-[8px] font-black text-rose-200 uppercase mb-1 text-right">ยอดค้างชำระ</p>
              <p className="text-lg font-black text-white text-right tracking-tighter">
                <span className="text-rose-200 text-xs mr-1 font-bold">฿</span>
                {Number(item.amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* --- 👤 CUSTOMER NAME (Small Label) --- */}
          <div className="px-2">
            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">ลูกค้า</p>
            <p className="text-sm font-black text-slate-700 uppercase italic truncate">
              {item.installment_contracts?.customers?.full_name}
            </p>
          </div>

          {/* --- 📝 URGENT LOG DETAIL --- */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-rose-500 uppercase ml-2 flex items-center gap-1">
              <AlertCircle size={10} /> รายละเอียดปัญหาด่วน
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ติดต่อไม่ได้, ผิดนัดรุนแรง..."
              className="w-full h-28 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-rose-500/20 focus:bg-white text-slate-800 text-sm font-bold resize-none transition-all placeholder:text-slate-300 shadow-inner"
            />
          </div>

          {/* --- 🏁 ACTIONS (Stacked for Urgency) --- */}
          <div className="flex flex-col gap-2 pt-2">
            <button 
              disabled={loading}
              onClick={() => handleSave('phone')}
              className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <PhoneCall size={16} />
              บันทึกการโทรด่วน
            </button>
            <button 
              disabled={loading}
              onClick={() => handleSave('visit')}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-rose-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-rose-100"
            >
              <Zap size={16} fill="currentColor" />
              ติดตามด่วนพิเศษ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}