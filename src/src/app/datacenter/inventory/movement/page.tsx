'use client'
import { 
  ArrowUpRight, ArrowDownRight, ArrowLeftRight, 
  Search, Filter, FileText, Download, Clock, 
  LayoutList, MapPin, User
} from 'lucide-react'

export default function StockMovementTablePage() {
  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER --- */}
      <header className="flex justify-between items-end max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            Movement <span className="text-indigo-600">Logs</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-3">
            บันทึกการเคลื่อนย้ายทรัพย์สินรายวัน • PRODUCT-CENTRIC AUDIT VIEW
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase italic hover:bg-slate-50 transition-all shadow-sm">
          <Download size={14} /> Export XLS
        </button>
      </header>

      {/* --- 📊 SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <SummaryCard label="Inbound (Today)" value="24" color="emerald" icon={ArrowDownRight} />
        <SummaryCard label="Outbound (Today)" value="15" color="rose" icon={ArrowUpRight} />
        <SummaryCard label="Transfer" value="8" color="indigo" icon={ArrowLeftRight} />
      </div>

      {/* --- 📋 MOVEMENT TABLE --- */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
           <div className="flex items-center gap-4">
              <LayoutList className="text-indigo-600" size={20} />
              <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Inventory Ledger</h3>
           </div>
           
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search product, SN, or staff..." 
                    className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl text-[11px] font-bold border-none"
                 />
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-950 hover:text-white transition-all">
                <Filter size={18} />
              </button>
           </div>
        </div>

        {/* --- THE TABLE --- */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-4 px-6 w-[80px] text-center">Type</th>
                <th className="pb-4 px-4 min-w-[380px]">Product Information</th>
                <th className="pb-4 px-4 w-[240px]">Route Path</th>
                <th className="pb-4 px-4 w-[160px]">Date / Time</th>
                <th className="pb-4 px-4 w-[150px]">Handler</th>
                <th className="pb-4 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <TableRow 
                type="IN" 
                name="Mitsubishi Heavy Duty Inverter 12000 BTU รุ่น SRK13VNS-W1 (Premium White Edition)" 
                sn="SN-MIT-88219902"
                from="Supplier Logistics" to="Warehouse (Zone A)"
                date="17 Mar 2026" time="10:45 AM"
                handler="สมชาย"
              />
              <TableRow 
                type="OUT" 
                name="Samsung QLED 4K Smart TV 65 Inch รุ่น QA65Q65BAKXXT + Home Theater Set" 
                sn="SN-SAM-99021142"
                from="Warehouse (Zone B)" to="ลูกค้า: คุณกิตติศักดิ์ (#AR-101)"
                date="17 Mar 2026" time="09:15 AM"
                handler="นที (ขนส่ง)"
              />
              <TableRow 
                type="TRANS" 
                name="LG Inverter 2 Doors 14.2Q รุ่น GN-B392PLGB Linear Compressor" 
                sn="SN-LG-REF-0045"
                from="คลังสำนักงาน" to="สาขาปทุมธานี"
                date="16 Mar 2026" time="15:20 PM"
                handler="วิชัย (ช่าง)"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function SummaryCard({ label, value, color, icon: Icon }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    indigo: 'text-indigo-600 bg-indigo-50'
  }
  return (
    <div className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:shadow-lg">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color]}`}>
        <Icon size={28} />
      </div>
    </div>
  )
}

function TableRow({ type, name, sn, from, to, date, time, handler }: any) {
  const config: any = {
    IN: { color: 'text-emerald-500 bg-emerald-50', icon: ArrowDownRight },
    OUT: { color: 'text-rose-500 bg-rose-50', icon: ArrowUpRight },
    TRANS: { color: 'text-indigo-500 bg-indigo-50', icon: ArrowLeftRight }
  }
  const Icon = config[type].icon

  return (
    <tr className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0">
      {/* 1. Type (หน้าสุด) */}
      <td className="py-6 px-6 text-center">
        <div className={`w-10 h-10 rounded-xl inline-flex items-center justify-center shadow-sm ${config[type].color}`}>
          <Icon size={20} />
        </div>
      </td>

      {/* 2. Product Name (กว้างพิเศษ) */}
      <td className="py-6 px-4">
        <div className="flex flex-col max-w-[450px]">
          <span className="text-[13px] font-black text-slate-950 uppercase italic tracking-tighter leading-snug line-clamp-1 group-hover:line-clamp-none">
            {name}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">S/N: {sn}</span>
        </div>
      </td>

      {/* 3. Route */}
      <td className="py-6 px-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
             {from}
          </span>
          <span className="text-[10px] font-black text-indigo-600 uppercase italic mt-0.5">
             → {to}
          </span>
        </div>
      </td>

      {/* 4. Date / Time (วางตำแหน่งนี้อ่านง่ายสุดเพื่อสรุปเหตุการณ์) */}
      <td className="py-6 px-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-slate-900 italic uppercase leading-none">{date}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1.5">
            <Clock size={10} /> {time}
          </span>
        </div>
      </td>

      {/* 5. Handler */}
      <td className="py-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[9px] font-black">
            {handler.charAt(0)}
          </div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tighter">{handler}</span>
        </div>
      </td>

      {/* 6. Action */}
      <td className="py-6 px-4 text-right">
        <button className="p-2.5 text-slate-300 hover:text-slate-950 transition-colors">
          <FileText size={18} />
        </button>
      </td>
    </tr>
  )
}