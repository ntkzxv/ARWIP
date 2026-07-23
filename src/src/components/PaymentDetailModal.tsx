'use client'
import { X, User, CheckCircle2, BellRing, ShieldCheck, Copy, FileText, AlertTriangle, SearchCode, Timer, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PaymentDetailModal({ item, onClose }: { item: any, onClose: () => void }) {
  const router = useRouter();
  if (!item) return null;

  // ✨ Logic การเช็คสถานะ
  const isPaid = ['paid', 'completed', 'success'].includes(item.status?.toLowerCase()) || !!item.paid_at; 
  const isPaidLate = isPaid && item.paid_at && item.due_date && new Date(item.paid_at).setHours(0,0,0,0) > new Date(item.due_date).setHours(0,0,0,0);
  const isOverdue = !isPaid && new Date(item.due_date) < new Date(new Date().setHours(0,0,0,0));
  
  // 🚩 กำหนดธีมสี
  let statusBadge = "Payment Reminder";
  let iconColor = "text-orange-400"; 

  if (isPaid) {
    statusBadge = "Transaction Verified";
    // 🟢 บังคับให้หัวบิลเป็นสีเขียว Emerald เสมอเมื่อจ่ายแล้ว เพื่อความสะอาดตา
    iconColor = "text-emerald-400"; 
  } else if (isOverdue) {
    statusBadge = "Overdue Alert";
    iconColor = "text-rose-400";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Section: พื้นหลังสีเข้มคงที่ */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
              {isPaid ? (
                <CheckCircle2 size={28} strokeWidth={2.5} className="text-emerald-400" />
              ) : isOverdue ? (
                <AlertTriangle size={28} strokeWidth={2.5} className="text-rose-400" />
              ) : (
                <BellRing size={28} strokeWidth={2.5} className="text-orange-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className={`${isPaid ? 'text-emerald-400' : isOverdue ? 'text-rose-400' : 'text-orange-400'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                    {statusBadge}
                </p>
                
                {/* 🚩 Badge ระบุสถานะย่อย - ใช้สี Amber สำหรับจ่ายย้อนหลังที่นี่ที่เดียว */}
                {isPaid && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${isPaidLate ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {isPaidLate ? 'ชำระย้อนหลัง' : 'ชำระตรงเวลา'}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                {isPaid ? "ชำระเงินเรียบร้อย" : (isOverdue ? "เกินกำหนดชำระ" : "ใกล้นัดชำระค่างวด")}
              </h2>
            </div>
          </div>

          <div className="bg-white/10 rounded-[2rem] p-6 border border-white/20 backdrop-blur-sm text-center">
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
                    {item.paid_at || item.due_date || item.created_at
                      ? new Date(isPaid ? (item.paid_at || item.created_at) : item.due_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'ไม่ระบุวันที่'}
                  </p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">งวดที่</p>
                  <p className="text-[15px] font-black text-slate-900 italic">{item.installment_number || '-'}</p>
               </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {isPaid ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
              {/* 🚩 กรอบใบเสร็จ: ใช้สี Amber เฉพาะเมื่อจ่ายเลท */}
              <div className={`p-5 rounded-[2rem] border border-dashed transition-all ${isPaidLate ? 'bg-amber-50/50 border-amber-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className={`flex items-center gap-2 ${isPaidLate ? 'text-amber-600' : 'text-emerald-600'}`}>
                      <ShieldCheck size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Transaction Verified</span>
                    </div>
                    
                    {/* 🚩 แสดงสถานะการจ่ายในกรอบบิลด้วยสี Amber */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${isPaidLate ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {isPaidLate ? <Timer size={10}/> : <Check size={10}/>}
                      {isPaidLate ? 'Late Settled' : 'On Time'}
                    </div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bank Reference</p>
                <p className="font-mono text-[13px] font-bold text-slate-700">{item.bank_ref || 'TRX-PAYMENT-SYSTEM'}</p>
              </div>
              <button className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <FileText size={16} /> พิมพ์ใบเสร็จรับเงิน
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => {
                  if (item.customer_id) {
                    router.push(`/datacenter/customers/${item.customer_id}?tab=personal`);
                    onClose();
                  } else {
                    alert("ไม่พบข้อมูลรหัสลูกค้า");
                  }
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all active:scale-95"
              >
                <SearchCode size={16} /> Trace Customer Profile
              </button>
              
              <button 
                className={`w-full py-4 ${isOverdue ? 'bg-rose-500' : 'bg-orange-500'} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform`}
                onClick={() => alert('ส่งแจ้งเตือนแล้ว')}
              >
                <BellRing size={16} /> {isOverdue ? 'แจ้งเตือนค้างชำระ' : 'ส่งข้อความเตือนนัดชำระ'}
              </button>
            </div>
          )}

          <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">
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
        <p className="text-[15px] font-black text-slate-800 truncate leading-none">{value || '-'}</p>
      </div>
    </div>
  )
}