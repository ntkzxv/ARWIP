'use client'
import { X, Wallet, Calendar, Hash, Smartphone, CheckCircle2, Copy, User, ShieldCheck, AlertCircle, BellRing, Package, FileText } from 'lucide-react'

export default function PaymentDetailModal({ item, onClose }: { item: any, onClose: () => void }) {
  if (!item) return null;

  // ตรวจสอบสถานะการจ่ายเงิน
  const isPaid = !!item.created_at; 
  const isOverdue = item.status === 'pending' && new Date(item.due_date) < new Date(new Date().setHours(0,0,0,0));
  
  // กำหนดธีมตามสถานะ
  let themeColor = "bg-orange-500";
  let statusText = "ใกล้นัดชำระค่างวด";
  let statusBadge = "Payment Reminder";
  let iconColor = "text-orange-400";

  if (isPaid) {
    themeColor = "bg-emerald-500";
    statusText = "ชำระเงินเรียบร้อย";
    statusBadge = "Transaction Verified";
    iconColor = "text-emerald-400";
  } else if (isOverdue) {
    themeColor = "bg-rose-500";
    statusText = "เกินกำหนดชำระ";
    statusBadge = "Overdue Alert";
    iconColor = "text-rose-400";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 ${themeColor} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
              {isPaid ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <BellRing size={28} strokeWidth={2.5} />}
            </div>
            <div>
              <p className={`${iconColor} text-[10px] font-black uppercase tracking-[0.2em]`}>{statusBadge}</p>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">{statusText}</h2>
            </div>
          </div>

          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10 backdrop-blur-sm text-center">
            <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2">
              {isPaid ? 'ยอดที่ชำระแล้ว' : 'ยอดที่ต้องชำระ'}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black italic tracking-tighter">
                {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-bold opacity-60">THB</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <DetailRow icon={User} label="ชื่อลูกค้า" value={item.customer_name} />
            
            <div className="flex items-center justify-between px-2">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isPaid ? 'วันที่ชำระเงิน' : 'วันครบกำหนด'}
                  </p>
                  <p className="text-[15px] font-black text-slate-800">
                    {new Date(item.created_at || item.due_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">งวดที่</p>
                  <p className="text-[15px] font-black text-slate-900 italic">{item.installment_number || '-'}</p>
               </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* 🚩 ส่วนรายละเอียดเฉพาะของ RecentTable (isPaid === true) */}
          {isPaid ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
              <div className="p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 border-dashed">
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2 text-emerald-600">
                      <ShieldCheck size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bank Verified</span>
                   </div>
                   <Copy size={14} className="text-slate-300 hover:text-emerald-500 cursor-pointer" />
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bank Reference</p>
                      <p className="font-mono text-[13px] font-bold text-slate-700">{item.bank_ref || 'TRX-SIM-99201'}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Asset ID</p>
                      <p className="font-mono text-[13px] font-bold text-slate-700">{item.product_id || '---'}</p>
                   </div>
                </div>
              </div>
              <button className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2">
                <FileText size={16} /> พิมพ์ใบเสร็จรับเงิน
              </button>
            </div>
          ) : (
            /* ส่วนของ Notice / Overdue (ยังไม่โชว์รายละเอียดเชิงลึก) */
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                 <p className="text-[11px] font-bold text-slate-400">กดปุ่มด้านล่างเพื่อส่งการแจ้งเตือนถึงลูกค้า</p>
              </div>
              <button 
                className={`w-full py-4 ${isOverdue ? 'bg-rose-500' : 'bg-orange-500'} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2`}
                onClick={() => alert('ส่งคำเตือนเรียบร้อย!')}
              >
                <BellRing size={16} /> ส่งข้อความแจ้งเตือน (Manual)
              </button>
            </div>
          )}

          <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 px-2">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[15px] font-black text-slate-800 truncate leading-none">{value}</p>
      </div>
    </div>
  )
}