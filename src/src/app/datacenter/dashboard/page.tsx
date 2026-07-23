'use client'
import React from 'react'
import { 
  ShieldAlert, TrendingUp, Activity, Target, 
  ChevronRight, Calendar, User, ArrowUpRight,
  AlertCircle, CheckCircle2, MoreHorizontal
} from 'lucide-react'

export default function AdvancedRiskDashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-10 pl-32 pr-16 text-slate-950 font-sans">
      
      {/* --- HEADER: Professional Style --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">v3.2 Stable</span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Updated: Just Now</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
            Risk<span className="text-indigo-600"> Intelligence</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-3 rounded-[30px] border border-white shadow-xl">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
               </div>
             ))}
          </div>
          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
          <button className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
            Generate Report
          </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: MAIN RISK ANALYSIS (4 COLS) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 🍩 The Ring Graph You Like: Risk Segmentation */}
          <div className="bg-white p-10 rounded-[50px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Risk Segment</h3>
              <MoreHorizontal className="text-slate-300 cursor-pointer" />
            </div>

            {/* Pure CSS Donut Chart */}
            <div className="relative w-56 h-56 mx-auto mb-10 group-hover:scale-105 transition-transform duration-700">
              <svg className="w-full h-full -rotate-90">
                <circle cx="112" cy="112" r="95" stroke="#F1F5F9" strokeWidth="22" fill="transparent" />
                {/* High Risk (Rose) */}
                <circle cx="112" cy="112" r="95" stroke="#F43F5E" strokeWidth="24" fill="transparent" strokeDasharray="597" strokeDashoffset="500" strokeLinecap="round" className="drop-shadow-md" />
                {/* Medium Risk (Amber) */}
                <circle cx="112" cy="112" r="95" stroke="#FBBF24" strokeWidth="24" fill="transparent" strokeDasharray="597" strokeDashoffset="400" strokeLinecap="round" className="opacity-80" />
                {/* Low Risk (Indigo) */}
                <circle cx="112" cy="112" r="95" stroke="#6366F1" strokeWidth="24" fill="transparent" strokeDasharray="597" strokeDashoffset="250" strokeLinecap="round" />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                <span className="text-5xl font-black tracking-tighter text-slate-950">84<span className="text-xl">%</span></span>
                <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">Healthy</p>
              </div>
            </div>

            {/* Legend with Details */}
            <div className="space-y-4">
               <RiskLegend label="Low Risk" value="65%" color="bg-indigo-500" desc="Customers with good behavior" />
               <RiskLegend label="Medium Risk" value="12%" color="bg-amber-400" desc="Slightly delayed payments" />
               <RiskLegend label="High Risk" value="23%" color="bg-rose-500" desc="Critical! Immediate action" />
            </div>
          </div>

          {/* Forecast Mini Card */}
          <div className="bg-indigo-600 p-8 rounded-[45px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">7-Day Forecast</p>
              <h2 className="text-4xl font-black italic tracking-tighter">฿452,000</h2>
              <div className="flex items-center gap-2 mt-4 text-indigo-200">
                <TrendingUp size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">+18% Confidence Rate</span>
              </div>
            </div>
            <Activity className="absolute -right-10 -bottom-10 text-indigo-500 opacity-20 group-hover:scale-110 transition-transform duration-1000" size={200} />
          </div>
        </div>

        {/* RIGHT PANEL: PERFORMANCE & ANALYTICS (8 COLS) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceCard label="Collection Rate" value="92.4%" icon={Target} color="indigo" />
            <PerformanceCard label="System Efficiency" value="88.0%" icon={Activity} color="emerald" />
          </div>

          {/* Warehouse & Intelligence Wide View */}
          <div className="bg-white p-10 rounded-[50px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-white">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Intelligence <span className="text-slate-300">Live Trend</span></h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily recovery and performance analysis</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-950 transition-colors"><Calendar size={20}/></button>
              </div>
            </div>

            {/* Mock Detailed Bar Chart */}
            <div className="flex items-end gap-5 h-72 px-4 mb-6">
               {[40, 60, 45, 90, 65, 80, 55, 75, 95, 40, 30, 85].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer">
                    <div className="relative w-full">
                       <div className="w-full bg-slate-50 rounded-2xl h-72 absolute bottom-0 opacity-40"></div>
                       <div className="w-full bg-slate-900 rounded-2xl transition-all duration-700 absolute bottom-0 group-hover:bg-indigo-600" style={{height: `${h}%`}}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">฿{h}k</div>
                       </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase">{i+1}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Critical Actions Table */}
          <div className="bg-white p-10 rounded-[50px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-white">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Immediate Actions <span className="text-rose-500 ml-2">●</span></h3>
                <button className="text-[10px] font-black uppercase text-indigo-600">View All Risk Accounts</button>
             </div>
             <div className="space-y-4">
                <ActionRow name="ไส้กรอก แดง" amount="฿8,500" period="3 Months Overdue" status="Critical" />
                <ActionRow name="สมศักดิ์ รักดี" amount="฿12,400" period="2 Months Overdue" status="Warning" />
                <ActionRow name="วิภา พารวย" amount="฿4,200" period="1 Month Overdue" status="Normal" />
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function RiskLegend({ label, value, color, desc }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-all cursor-default group">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-10 rounded-full ${color} group-hover:scale-110 transition-transform`} />
        <div>
          <p className="text-xs font-black uppercase tracking-tighter text-slate-950">{label}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{desc}</p>
        </div>
      </div>
      <span className="text-lg font-black italic text-slate-950">{value}</span>
    </div>
  )
}

function PerformanceCard({ label, value, icon: Icon, color }: any) {
  const isIndigo = color === 'indigo';
  return (
    <div className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-xl transition-all">
       <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter">{value}</h2>
          <div className="flex items-center gap-1 text-emerald-500">
            <ArrowUpRight size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase">Above average</span>
          </div>
       </div>
       <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${isIndigo ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'} group-hover:rotate-12 transition-transform shadow-inner`}>
          <Icon size={32} />
       </div>
    </div>
  )
}

function ActionRow({ name, amount, period, status }: any) {
    const isCritical = status === 'Critical';
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-300'}`}>
                    {name[0]}
                </div>
                <div>
                    <p className="text-sm font-black uppercase text-slate-950">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{period}</p>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-xs font-black text-slate-950 uppercase">{amount}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Balance</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCritical ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-300 border border-slate-100'}`}>
                    <ChevronRight size={18} strokeWidth={3} />
                </div>
            </div>
        </div>
    )
}