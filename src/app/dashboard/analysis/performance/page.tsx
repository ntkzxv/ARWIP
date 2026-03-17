'use client'
import { useState } from 'react'
import { 
  Users, ShoppingBag, Truck, Wrench, Calculator, 
  Search, Calendar, Filter, Star, Clock, 
  CheckCheck, // 🚩 แก้ไขจาก CheckDouble เป็น CheckCheck
  AlertCircle, TrendingUp, Globe, ChevronRight
} from 'lucide-react'

export default function ComprehensivePerformance() {
  const [activeDept, setActiveDept] = useState('ALL')

  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end max-w-7xl mx-auto gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            Business <span className="text-indigo-600">Unit</span> Pulse
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            วิเคราะห์ประสิทธิภาพพนักงานรายแผนก: ขาย • บัญชี • ช่าง • ขนส่ง
          </p>
        </div>

        {/* --- 📁 DEPARTMENT TABS --- */}
        <div className="flex bg-white p-2 rounded-[25px] shadow-sm border border-slate-100 gap-1 overflow-x-auto max-w-full no-scrollbar">
          <TabBtn label="All" active={activeDept === 'ALL'} onClick={() => setActiveDept('ALL')} icon={Users} />
          <TabBtn label="Sales" active={activeDept === 'SALES'} onClick={() => setActiveDept('SALES')} icon={ShoppingBag} />
          <TabBtn label="Online" active={activeDept === 'ONLINE'} onClick={() => setActiveDept('ONLINE')} icon={Globe} />
          <TabBtn label="Tech" active={activeDept === 'TECH'} onClick={() => setActiveDept('TECH')} icon={Wrench} />
          <TabBtn label="Logistics" active={activeDept === 'LOG'} onClick={() => setActiveDept('LOG')} icon={Truck} />
          <TabBtn label="Account" active={activeDept === 'ACC'} onClick={() => setActiveDept('ACC')} icon={Calculator} />
        </div>
      </header>

      {/* --- 📈 STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <StatCard label="Service Score" value="4.8/5" sub="ความพึงพอใจลูกค้า" icon={Star} color="amber" />
        <StatCard label="Delivery SLA" value="98.5%" sub="ส่งตรงเวลา 24 ชม." icon={Clock} color="emerald" />
        <StatCard label="Inventory Acc." value="99.9%" sub="สต็อกแม่นยำ" icon={CheckCheck} color="indigo" />
        <StatCard label="Errors/Late" value="0.2%" sub="อัตราการตีคืนสินค้า" icon={AlertCircle} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 🏆 LEADERBOARD --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Staff Productivity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">อันดับพนักงานแยกตามผลงานของแต่ละแผนก</p>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                    type="text" 
                    placeholder="ค้นหาพนักงาน..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold border-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
          </div>

          <div className="space-y-4">
            <RoleRow name="สมชาย แซ่ตั้ง" role="พนักงานติดตั้ง" metric="4.9 CSAT" sub="ติดแอร์ 24 เครื่อง/เดือน" status="Top" />
            <RoleRow name="วิไล พรหมดี" role="บัญชี" metric="0 Error" sub="เคลียร์ยอดเงินสด 1.2M" status="Normal" />
            <RoleRow name="นที สายน้ำ" role="พนักงานออนไลน์" metric="฿850K" sub="Response Rate 1.2 min" status="Top" />
            <RoleRow name="อำนาจ มั่นคง" role="พนักงานส่ง" metric="100% On-Time" sub="ระยะทางรวม 1,200 กม." status="Normal" />
            <RoleRow name="จริยา วงศ์ดี" role="พนักงานขาย" metric="฿1.5M" sub="ยอดขายสูงสุดรายเดือน" status="Normal" />
          </div>
        </div>

        {/* --- ⏱️ LIVE PULSE --- */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-indigo-400 italic">Business Live Pulse</h3>
           <div className="space-y-6 relative z-10 overflow-y-auto no-scrollbar">
              <PulseLine dept="LOG" action="ส่งตู้เย็นให้คุณวิชัยสำเร็จ" time="2 นาทีที่แล้ว" color="bg-emerald-500" />
              <PulseLine dept="ACC" action="กระทบยอดโอนเงินสำเร็จ" time="15 นาทีที่แล้ว" color="bg-indigo-400" />
              <PulseLine dept="TECH" action="ติดตั้งแอร์เสร็จ (บางนา)" time="22 นาทีที่แล้ว" color="bg-amber-400" />
              <PulseLine dept="SALE" action="เปิดบิลผ่อนทีวีใหม่" time="1 ชม. ที่แล้ว" color="bg-rose-400" />
              <PulseLine dept="ONL" action="ตอบแชทลูกค้าครบทุกคิว" time="2 ชม. ที่แล้ว" color="bg-sky-400" />
           </div>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function TabBtn({ label, active, onClick, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[18px] transition-all whitespace-nowrap ${
        active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-transparent text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={14} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  )
}

function RoleRow({ name, role, metric, sub, status }: any) {
  return (
    <div className="flex items-center justify-between p-5 rounded-[25px] bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 font-bold text-slate-400 text-xs shadow-sm group-hover:bg-slate-950 group-hover:text-white transition-all">
           {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-950 text-sm italic">{name}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-slate-900">{sub}</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase italic">Activity Volume</p>
        </div>
        <div className="text-right min-w-[100px]">
          <p className={`text-sm font-black italic ${status === 'Top' ? 'text-indigo-600' : 'text-slate-600'}`}>{metric}</p>
          <div className={`h-1 w-full rounded-full mt-1 ${status === 'Top' ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        </div>
        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
      </div>
    </div>
  )
}

function PulseLine({ dept, action, time, color }: any) {
    return (
        <div className="flex gap-4 items-start border-l border-white/5 pl-4 relative pb-4">
            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${color}`} />
            <div>
                <p className="text-[11px] font-bold leading-tight">
                    <span className="opacity-40 font-black mr-2 text-[9px]">[{dept}]</span>
                    {action}
                </p>
                <p className="text-[8px] font-bold opacity-30 uppercase mt-1">{time}</p>
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
    const themes: any = {
      emerald: 'text-emerald-600 bg-emerald-50',
      indigo: 'text-indigo-600 bg-indigo-50',
      amber: 'text-amber-600 bg-amber-50',
      rose: 'text-rose-600 bg-rose-50'
    }
    return (
      <div className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${themes[color]}`}>
          <Icon size={18} />
        </div>
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none">{value}</h3>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 italic">{sub}</p>
      </div>
    )
}