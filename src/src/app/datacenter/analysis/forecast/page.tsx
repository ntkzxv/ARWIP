'use client'
import { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Sparkles, AlertTriangle, 
  Info, Calendar, ShoppingCart, Wallet, 
  ArrowUpRight, ArrowDownRight, Package, ShieldAlert,
  ChevronRight, BarChart3, LineChart, Timer
} from 'lucide-react'

export default function ForecastAnalysisPage() {
  const [forecastPeriod, setForecastPeriod] = useState('30')

  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER & SIMULATION --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end max-w-7xl mx-auto gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            Financial <span className="text-indigo-600">Projection</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
            ระบบพยากรณ์กระแสเงินสดและวิเคราะห์ความเสี่ยงสต็อกสินค้า <Sparkles size={12} className="text-indigo-500" />
          </p>
        </div>

        <div className="flex bg-white p-2 rounded-[25px] shadow-sm border border-slate-100 items-center gap-4">
          <div className="flex gap-1">
            {['30', '60', '90'].map((d) => (
              <button 
                key={d}
                onClick={() => setForecastPeriod(d)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  forecastPeriod === d ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <button className="pr-4 pl-2 py-2 text-indigo-600 text-[10px] font-black uppercase italic flex items-center gap-2 hover:translate-x-1 transition-transform">
            Run AI Simulation <ArrowUpRight size={14} />
          </button>
        </div>
      </header>

      {/* --- 💰 MAIN FINANCIAL CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <ForecastCard 
          label="รายรับคาดการณ์ (Next 30D)" 
          value="฿3,840,000" 
          sub="ความแม่นยำ 94% (จากสถิติจ่ายจริง)"
          icon={Wallet} 
          color="indigo" 
        />
        <ForecastCard 
          label="ต้นทุนสินค้า & ดำเนินงาน" 
          value="฿2,120,000" 
          sub="รวมค่าคอมมิชชันทีมช่างและขนส่ง"
          icon={Package} 
          color="rose" 
        />
        <ForecastCard 
          label="กำไรสุทธิคาดการณ์" 
          value="฿1,720,000" 
          sub="หักลบความเสี่ยงหนี้เสีย (Bad Debt) 3.5%"
          icon={TrendingUp} 
          color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 📈 CASH FLOW TIMELINE --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Liquid Capital Forecast</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">กระแสเงินสดหมุนเวียนล่วงหน้า (หักลบรายจ่ายคงที่แล้ว)</p>
            </div>
          </div>
          <div className="h-[300px] w-full bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-100 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/50 to-indigo-50/0 group-hover:translate-x-full duration-1000 transition-transform" />
            <p className="text-slate-300 font-black italic uppercase tracking-[0.2em] text-[10px]">Financial Flow Graph Area (Interactive)</p>
          </div>
        </div>

        {/* --- ⚠️ SMART INSIGHTS --- */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden h-full">
           <div className="flex items-center gap-2 mb-8">
              <Sparkles className="text-indigo-400" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">AI Strategy Advisor</h3>
           </div>
           
           <div className="space-y-8">
              <InsightBlock 
                title="จังหวะสั่งสินค้า" 
                text="แอร์รุ่น Inverter-X กำลังเข้าสู่ High Season สต็อกที่มีพอขายแค่ 5 วัน แนะนำให้สั่งด่วน"
                status="urgent"
              />
              <InsightBlock 
                title="ความเสี่ยงสต็อก" 
                text="พัดลมไอเย็น มีแนวโน้มขายช้าลง 40% เนื่องจากกำลังเข้าหน้าฝน แนะนำให้เริ่มจัดโปรโมชั่น"
                status="warning"
              />
              <InsightBlock 
                title="โอกาสทางการขาย" 
                text="ลูกค้ากลุ่มผ่อนทีวีใกล้ครบสัญญา 15 ราย มีกำลังซื้อสูง แนะนำให้ส่งโปรฯ เครื่องซักผ้าใหม่ไปให้"
                status="opportunity"
              />
           </div>
        </div>
      </div>

      {/* --- 📦 DEEP DIVE: INVENTORY RISK ANALYSIS --- */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 px-4">
           <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
           <div>
              <h3 className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Smart Inventory <span className="text-indigo-600">Health</span></h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">วิเคราะห์ความคุ้มค่าของการถือครองสินค้าแต่ละหมวด</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <RiskCard 
              type="EVERGREEN"
              title="ตู้เย็น & เครื่องซักผ้า"
              risk="LOW"
              analysis="ยอดขายสม่ำเสมอ ไม่ขึ้นกับกระแสเทคโนโลยี เงินจมยาก"
              advice="สั่งเพิ่ม 20% เพื่อรองรับโปรโมชั่นต้นเดือน"
              color="emerald"
           />
           <RiskCard 
              type="SEASONAL"
              title="แอร์ & พัดลมไอเย็น"
              risk="MEDIUM"
              analysis="ขายดีเฉพาะหน้าร้อน อีก 22 วันจะเข้าหน้าฝน (Weather Data)"
              advice="ระบายสต็อกเดิมให้หมด ห้ามสั่งสินค้าเพิ่มเกิน 5 เครื่อง"
              color="amber"
           />
           <RiskCard 
              type="TREND-BASED"
              title="TV & สมาร์ทโฟน"
              risk="HIGH"
              analysis="รุ่นใหม่ 2026 กำลังจะออก รุ่นปัจจุบันจะตกรุ่นและราคาตกทันที"
              advice="ห้ามสั่งเพิ่มเด็ดขาด และควรลดราคา 15% เพื่อล้างสต็อก"
              color="rose"
           />
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ COMPONENTS ---

function ForecastCard({ label, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    rose: 'bg-white text-slate-950 border-slate-100',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200'
  }
  return (
    <div className={`p-10 rounded-[40px] border shadow-xl transition-all hover:scale-[1.02] relative overflow-hidden group ${colors[color]}`}>
      <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:rotate-12 transition-transform">
         <Icon size={120} />
      </div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${color === 'rose' ? 'text-slate-400' : 'text-white/60'}`}>{label}</p>
      <h3 className="text-4xl font-black italic tracking-tighter leading-none mb-4">{value}</h3>
      <p className={`text-[9px] font-bold uppercase ${color === 'rose' ? 'text-slate-300' : 'text-white/40'}`}>{sub}</p>
    </div>
  )
}

function InsightBlock({ title, text, status }: any) {
    const icons: any = {
        urgent: <Timer size={16} className="text-rose-500" />,
        warning: <AlertTriangle size={16} className="text-amber-500" />,
        opportunity: <TrendingUp size={16} className="text-emerald-500" />
    }
    return (
        <div className="group border-l border-white/10 pl-6 space-y-2 hover:border-indigo-500 transition-all">
            <div className="flex items-center gap-2">
                {icons[status]}
                <h4 className="text-[11px] font-black uppercase tracking-tighter text-white">{title}</h4>
            </div>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{text}</p>
        </div>
    )
}

function RiskCard({ type, title, risk, analysis, advice, color }: any) {
    const themes: any = {
        emerald: 'border-emerald-100 bg-white text-emerald-600',
        amber: 'border-amber-100 bg-white text-amber-600',
        rose: 'border-rose-100 bg-white text-rose-600'
    }
    return (
        <div className={`p-8 rounded-[40px] border-2 shadow-sm flex flex-col h-full hover:shadow-lg transition-all ${themes[color]}`}>
            <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black tracking-widest uppercase px-3 py-1 bg-slate-900 text-white rounded-full">{type}</span>
                <div className="flex items-center gap-1">
                    <ShieldAlert size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{risk} RISK</span>
                </div>
            </div>
            <h4 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter mb-4">{title}</h4>
            <div className="flex-1 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Market Analysis</p>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{analysis}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : color === 'amber' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className="text-[8px] font-black uppercase mb-2">Recommendation</p>
                    <p className="text-[11px] font-black uppercase leading-relaxed italic">{advice}</p>
                </div>
            </div>
            <button className="mt-8 w-full py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                Apply Action Plan
            </button>
        </div>
    )
}