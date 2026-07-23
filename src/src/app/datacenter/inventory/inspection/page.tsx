'use client'
import { 
  ShieldCheck, Search, Filter, Camera, 
  CheckCircle2, XCircle, Clock, Smartphone,
  ChevronRight, FileText, Image as ImageIcon,
  Zap, Tv, Refrigerator
} from 'lucide-react'

export default function PDIInspectionPage() {
  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end max-w-7xl mx-auto gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            PDI <span className="text-indigo-600">Inspection</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3">
            ประวัติการตรวจสภาพสินค้าก่อนส่งมอบ • QUALITY ASSURANCE LOGS
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-[25px] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={18} />
              <span className="text-[10px] font-black uppercase text-slate-500 italic">QA Integrity: 100% Passed</span>
           </div>
        </div>
      </header>

      {/* --- 📊 INSPECTION STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspected Today</p>
              <h3 className="text-3xl font-black text-slate-950 italic">12 Units</h3>
           </div>
           <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Camera size={28} />
           </div>
        </div>
        <div className="bg-emerald-500 p-8 rounded-[35px] text-white shadow-xl shadow-emerald-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Pass Rate</p>
              <h3 className="text-3xl font-black italic">98.2%</h3>
           </div>
           <CheckCircle2 size={40} className="opacity-40" />
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Rejected / Repair</p>
              <h3 className="text-3xl font-black text-slate-950 italic">2 Units</h3>
           </div>
           <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <XCircle size={28} />
           </div>
        </div>
      </div>

      {/* --- 📋 INSPECTION TABLE --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
           <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Inspection Registry</h3>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search by SN or Inspector..." 
                    className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl text-[11px] font-bold border-none"
                 />
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-950 transition-all"><Filter size={18} /></button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="pb-6 px-4">Result</th>
                <th className="pb-6 px-4">Product Info</th>
                <th className="pb-6 px-4">Photos</th>
                <th className="pb-6 px-4">Inspector / Date</th>
                <th className="pb-6 px-4">Contract Reference</th>
                <th className="pb-6 px-4 text-right">View Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <InspectionRow 
                result="PASS"
                name="LG Inverter 7.4Q Refrigerator"
                sn="SN-LG-88219"
                photoCount={4}
                user="นที (QA Specialist)"
                date="17 Mar 2026 | 10:15"
                contract="#AR-10921"
                icon={Refrigerator}
              />
              <InspectionRow 
                result="FAIL"
                name="Samsung QLED 65 Inch"
                sn="SN-SAM-99021"
                photoCount={2}
                user="วิชัย (ช่างคลัง)"
                date="17 Mar 2026 | 09:00"
                contract="N/A (Stock Check)"
                icon={Tv}
              />
              <InspectionRow 
                result="PASS"
                name="Mitsubishi Heavy Duty 12000 BTU"
                sn="SN-MIT-00451"
                photoCount={5}
                user="นที (QA Specialist)"
                date="16 Mar 2026 | 14:30"
                contract="#AR-10885"
                icon={Zap}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function InspectionRow({ result, name, sn, photoCount, user, date, contract, icon: Icon }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 transition-all">
      <td className="py-6 px-4">
        <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter ${result === 'PASS' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {result === 'PASS' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {result}
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-slate-950 group-hover:text-white transition-all">
            <Icon size={14} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-950 uppercase italic leading-none">{name}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">S/N: {sn}</p>
          </div>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl w-fit">
          <ImageIcon size={12} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-600">{photoCount}</span>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700 leading-none">{user}</span>
          <span className="text-[9px] font-bold text-slate-300 uppercase mt-1 flex items-center gap-1">
            <Clock size={8} /> {date}
          </span>
        </div>
      </td>
      <td className="py-6 px-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
          {contract}
        </span>
      </td>
      <td className="py-6 px-4 text-right">
        <button className="p-2.5 text-slate-300 hover:text-slate-950 transition-colors">
          <FileText size={20} />
        </button>
      </td>
    </tr>
  )
}