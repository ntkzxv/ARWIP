'use client'
import { useState } from 'react'
import { Phone, MessageSquare, Home, Save, X, Calendar, Hash, ChevronRight } from 'lucide-react'

export default function CollectionLogModal({ item, onClose, onSave }: any) {
  const [note, setNote] = useState('')
  const [method, setMethod] = useState('phone')
  const [promiseDate, setPromiseDate] = useState('')

  const methods = [
    { id: 'phone', label: 'Call', icon: Phone },
    { id: 'line', label: 'Line', icon: MessageSquare },
    { id: 'visit', label: 'Visit', icon: Home },
  ]

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* --- 🟢 HEADER --- */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
               <Save size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">บันทึกติดตาม</h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Recording Log</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* --- 💵 INFO ROW --- */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">งวดที่</p>
              <div className="flex items-center gap-2 text-slate-900">
                <Hash size={14} className="text-emerald-500" />
                <span className="font-black italic text-lg">{item.installment_number}</span>
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl shadow-inner">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1 text-right">ยอดค้างชำระ</p>
              <p className="text-lg font-black text-white text-right tracking-tighter">
                <span className="text-emerald-400 text-xs mr-1 font-bold">฿</span>
                {Number(item.amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* --- 📱 CHANNEL --- */}
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-100">
            {methods.map((m) => {
              const isActive = method === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                    ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <m.icon size={16} strokeWidth={isActive ? 3 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* --- 📝 LOG DETAIL --- */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">รายละเอียด</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุรายละเอียดการเจรจา..."
              className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white text-slate-800 text-sm font-bold resize-none transition-all placeholder:text-slate-300"
            />
          </div>

        {/* --- 📅 PROMISE DATE (แก้ไข: ปรับ Placeholder ให้ไม่เป็นตัวหนา) --- */}
        <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 italic">วันนัดชำระครั้งถัดไป</label>
        <div className="relative group flex items-center">
            
            {/* 🖱️ ส่วนแสดงผล (หน้ากาก) */}
            <div 
            onClick={(e) => {
                const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                if (input && 'showPicker' in input) {
                input.showPicker();
                }
            }}
            className={`w-full py-3.5 pl-12 pr-12 rounded-2xl border-2 transition-all flex items-center text-[13px] uppercase shadow-inner cursor-pointer select-none ${
                promiseDate 
                ? 'border-slate-900 bg-white text-slate-900 font-black' // เมื่อเลือกวันแล้ว: ตัวหนา + สีเข้ม
                : 'border-transparent bg-slate-50 text-slate-300 font-medium' // เมื่อเป็น Placeholder: ตัวปกติ + สีจาง
            }`}
            >
            {/* ไอคอนปฏิทิน */}
            <div className="absolute left-4 text-slate-400 group-hover:text-emerald-500 transition-colors">
                <Calendar size={20} />
            </div>

            {/* ข้อความวันที่: ถ้ายังไม่เลือกจะแสดง MM / DD / YYYY แบบตัวบาง */}
            {promiseDate ? new Date(promiseDate).toLocaleDateString('en-US') : 'MM / DD / YYYY'}
            </div>

            {/* 🕵️ Hidden Input Date */}
            <input 
            type="date"
            value={promiseDate}
            onChange={(e) => setPromiseDate(e.target.value)}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />

            {/* ❌ ปุ่มกากบาทล้างวันที่ */}
            {promiseDate && (
            <button 
                onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPromiseDate('');
                }}
                className="absolute right-4 p-1.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all z-20 active:scale-90 shadow-sm border border-rose-100"
            >
                <X size={14} strokeWidth={3} />
            </button>
            )}
        </div>
        </div>

          {/* --- 🏁 ACTIONS --- */}
          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={() => onSave({ method, note, promiseDate })}
              className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              บันทึกข้อมูล
              <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-2 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-slate-600 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}