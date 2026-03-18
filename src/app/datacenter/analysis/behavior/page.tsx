'use client'
import { useState } from 'react'
import { 
  TrendingUp, Users, Clock, CheckCircle2, 
  Search, Filter, ArrowUpRight, ArrowDownRight,
  ChevronRight, Info, Star
} from 'lucide-react'

export default function PaymentBehaviorPage() {
  const [timeRange, setTimeRange] = useState('3months')

  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER SECTION --- */}
      <header className="flex justify-between items-end max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            Behavior <span className="text-indigo-600">Intelligence</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3">
            วิเคราะห์วินัยการเงินและพฤติกรรมการชำระเงินรายบุคคล
          </p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {['1Month', '3Months', 'All Time'].map((range) => (
            <button 
              key={range}
              onClick={() => setTimeRange(range.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                timeRange === range.toLowerCase() ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      {/* --- 📊 TOP KPI CARDS (THE PULSE) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <AnalysisCard label="อัตราจ่ายตรงเวลา" value="84.2%" trend="+2.4%" icon={CheckCircle2} color="indigo" />
        <AnalysisCard label="เลทเฉลี่ย (วัน)" value="3.5 Days" trend="-1.2" icon={Clock} color="amber" />
        <AnalysisCard label="คะแนนวินัยรวม" value="78/100" trend="+5" icon={Star} color="emerald" />
        <AnalysisCard label="ยอดเก็บได้จริง" value="฿2.4M" trend="+12%" icon={TrendingUp} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 📈 CHART PLACEHOLDER (BEHAVIOR MAP) --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Payment Consistency</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">แนวโน้มการชำระเงินเปรียบเทียบรายเดือน</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> On-Time
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-2 h-2 rounded-full bg-rose-400" /> Late
              </div>
            </div>
          </div>
          
          {/* Placeholder for Chart.js or Recharts */}
          <div className="h-[300px] w-full bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center">
            <p className="text-slate-300 font-black italic uppercase tracking-widest text-xs">Behavioral Flow Chart Area</p>
          </div>
        </div>

        {/* --- 🏆 GRADING DISTRIBUTION --- */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden group">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-indigo-400 italic">Customer Grading</h3>
          <div className="space-y-6">
            <GradeRow label="Grade A (Excellent)" percent={45} color="bg-emerald-500" />
            <GradeRow label="Grade B (Good)" percent={30} color="bg-indigo-500" />
            <GradeRow label="Grade C (Warning)" percent={15} color="bg-amber-500" />
            <GradeRow label="Grade D (Critical)" percent={10} color="bg-rose-500" />
          </div>
          <p className="mt-10 text-[9px] text-slate-500 font-bold leading-relaxed uppercase border-t border-white/5 pt-6">
            *เกรดคำนวณอัตโนมัติจากความถี่ในการจ่ายล่าช้าและจำนวนวันที่เกินกำหนดสะสม 12 เดือนล่าสุด
          </p>
        </div>
      </div>

      {/* --- 📋 CUSTOMER LIST (ACTIONABLE ROSTER) --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Behavioral Analysis Ranking</h3>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search customer..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <button className="p-3 bg-slate-950 text-white rounded-2xl hover:bg-indigo-600 transition-all"><Filter size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4 px-4 font-black">Customer</th>
                <th className="pb-4 px-4 font-black text-center">Avg. Delay</th>
                <th className="pb-4 px-4 font-black text-center">Score</th>
                <th className="pb-4 px-4 font-black text-center">Grade</th>
                <th className="pb-4 px-4 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <CustomerRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function AnalysisCard({ label, value, trend, icon: Icon, color }: any) {
  const colors: any = {
    indigo: 'text-indigo-600 bg-indigo-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50'
  }
  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none mb-3">{value}</h3>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}

function GradeRow({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function CustomerRow() {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all uppercase">
            JD
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none mb-1 uppercase tracking-tight">John Doe</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase italic">Contract #AR-9921</p>
          </div>
        </div>
      </td>
      <td className="py-5 px-4 text-center font-bold text-xs text-slate-600 tracking-tighter uppercase">0.8 Days</td>
      <td className="py-5 px-4 text-center">
        <span className="text-xs font-black text-indigo-600 italic uppercase">92/100</span>
      </td>
      <td className="py-5 px-4 text-center">
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">Grade A</span>
      </td>
      <td className="py-5 px-4 text-right">
        <button className="p-2 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-300 hover:text-indigo-600">
          <ChevronRight size={18} />
        </button>
      </td>
    </tr>
  )
}