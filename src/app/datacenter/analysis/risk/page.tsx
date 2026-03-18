'use client'
import { 
  ShieldAlert, AlertTriangle, Gavel, Radio, 
  TrendingDown, Search, ArrowRight, ShieldCheck,
  ChevronRight, Skull, Ghost
} from 'lucide-react'

export default function CreditRiskPage() {
  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER --- */}
      <header className="flex justify-between items-end max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            Risk <span className="text-rose-600">Surveillance</span>
          </h1>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
            ระบบเฝ้าระวังหนี้เสียและวิเคราะห์ความเสี่ยงระดับวิกฤต <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
        </div>
      </header>

      {/* --- 📊 RISK KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <RiskStatCard label="NPL Ratio" value="4.12%" desc="อัตราหนี้เสียสะสม" status="danger" icon={Skull} />
        <RiskStatCard label="At-Risk Principal" value="฿840K" desc="ยอดเงินต้นกลุ่มเสี่ยง" status="warning" icon={AlertTriangle} />
        <RiskStatCard label="Repossession Req." value="12" desc="เคสที่ต้องยึดรถ" status="danger" icon={Gavel} />
        <RiskStatCard label="Recovery Rate" value="68%" desc="อัตราการตามหนี้คืน" status="success" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 🔴 CRITICAL LIST (TOP PRIORITY) --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter flex items-center gap-3">
                <Radio className="text-rose-600 animate-pulse" size={20} /> High-Risk Watchlist
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">รายชื่อลูกค้าที่มีโอกาสเกิดหนี้เสียสูงสุด (ค้างชำระ 2-3 งวด)</p>
            </div>
            <button className="px-6 py-2 bg-rose-600 text-white text-[10px] font-black rounded-2xl hover:bg-rose-700 transition-all uppercase tracking-widest shadow-lg shadow-rose-200">
              Bulk Action
            </button>
          </div>

          <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
               <RiskRow key={i} />
             ))}
          </div>
        </div>

        {/* --- 📉 RISK PROJECTION --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-rose-500 italic">Loss Projection</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black italic tracking-tighter">฿125K</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-8">
              คาดการณ์ความเสียหายที่อาจเกิดขึ้นในอีก 30 วัน หากไม่มีการติดตาม
            </p>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                    <span>Risk Level: High</span>
                    <span className="text-rose-500">82%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[82%] h-full bg-rose-600 rounded-full" />
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Ghost size={14} /> Silent Defaulters
             </h3>
             <p className="text-xs font-bold text-slate-900 leading-relaxed">
                มีลูกค้า 8 รายที่ <span className="text-rose-600 underline">ปิดเครื่อง/ติดต่อไม่ได้</span> เกิน 7 วัน ระบบแนะนำให้ส่งทีมลงพื้นที่ด่วน
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function RiskStatCard({ label, value, desc, status, icon: Icon }: any) {
  const statusColors: any = {
    danger: 'text-rose-600 bg-rose-50',
    warning: 'text-amber-600 bg-amber-50',
    success: 'text-emerald-600 bg-emerald-50'
  }
  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${statusColors[status]}`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none mb-3">{value}</h3>
      <p className="text-[9px] font-bold text-slate-300 uppercase italic">{desc}</p>
    </div>
  )
}

function RiskRow() {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-rose-50/50 rounded-[30px] transition-all border border-transparent hover:border-rose-100 group">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-[18px] bg-rose-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-rose-200">
          !
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">บริษัท สมหวัง ขนส่ง จำกัด</h4>
          <div className="flex gap-3 mt-1">
             <span className="text-[9px] font-black text-rose-600 uppercase">Overdue: 65 Days</span>
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">|</span>
             <span className="text-[9px] font-black text-slate-400 uppercase">Amt: ฿45,200</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
           <p className="text-[9px] font-black text-rose-500 uppercase italic">High Probability of Default</p>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Contact: unreachable</p>
        </div>
        <button className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-slate-950 group-hover:text-white transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}