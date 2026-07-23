'use client'
import { 
  Box, Search, BarChart3, Clock, 
  ShieldCheck, ArrowRightLeft, MapPin, 
  Info, Smartphone, User, Link as LinkIcon,
  Refrigerator, Tv, Zap
} from 'lucide-react'

export default function StockMonitoringPage() {
  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      {/* --- 👑 HEADER (Read-Only Mode) --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end max-w-7xl mx-auto gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-5xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
               Stock <span className="text-indigo-600">Surveillance</span>
             </h1>
             <div className="px-3 py-1 bg-slate-950 text-white text-[8px] font-black uppercase rounded-full tracking-[0.2em] animate-pulse">
                Live Sync
             </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            ติดตามสถานะทรัพย์สินและวิเคราะห์ข้อมูลสต็อกแบบ Read-Only
          </p>
        </div>

        <div className="bg-white px-6 py-4 rounded-[25px] border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-slate-500">Warehouse App Connected</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-200" />
           <p className="text-[10px] font-black uppercase text-indigo-600 italic">Last Sync: 1 min ago</p>
        </div>
      </header>

      {/* --- 📊 FINANCIAL & ASSET STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <MonitorCard label="มูลค่าทรัพย์สินรวม" value="฿14.2M" sub="Market Value" icon={BarChart3} color="indigo" />
        <MonitorCard label="จำนวนเครื่องว่าง" value="128" sub="พร้อมขาย/ส่งมอบ" icon={Box} color="emerald" />
        <MonitorCard label="สินค้าอยู่กับลูกค้า" value="942" sub="อยู่ระหว่างสัญญาเช่าซื้อ" icon={User} color="amber" />
        <MonitorCard label="รอการตรวจสอบ" value="5" sub="Pending PDI / Repair" icon={Clock} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* --- 📦 DETAILED ASSET LIST --- */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-950 italic uppercase tracking-tighter">Asset Registry</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">สรุปตำแหน่งและสถานะสัญญาของสินค้าทุกชิ้นในระบบ</p>
             </div>
             <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text" 
                  placeholder="ค้นหา Serial หรือ เลขสัญญา..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-[10px] font-bold border-none" 
                  readOnly 
                />
             </div>
          </div>

          <div className="space-y-4">
             <AssetRow 
               name="Mitsubishi Inverter 12000 BTU" 
               id="SN-882910" 
               status="With Customer" 
               location="สัญญา #AR-9901" 
               icon={Zap}
             />
             <AssetRow 
               name="Samsung QLED 65" 
               id="SN-TV-4421" 
               status="In Warehouse" 
               location="คลังหลัก (โซน B2)" 
               icon={Tv}
             />
             <AssetRow 
               name="LG 2 Doors 14.2Q" 
               id="SN-REF-1120" 
               status="Pending PDI" 
               location="รอพนักงานตรวจสภาพ" 
               icon={Refrigerator}
             />
          </div>
        </div>

        {/* --- ⏱️ LIVE FEED FROM WAREHOUSE APP --- */}
        <div className="lg:col-span-4 bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden">
           <div className="flex items-center gap-2 mb-8">
              <Smartphone size={16} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Warehouse Activity</h3>
           </div>
           
           <div className="space-y-8 relative z-10">
              <ActivityItem 
                user="สมชาย (คลัง)" 
                action="สแกนรับสินค้าเข้า 5 ชิ้น" 
                time="2 นาทีที่แล้ว" 
                type="in" 
              />
              <ActivityItem 
                user="วิชัย (ช่าง)" 
                action="เบิกสินค้าออกไปส่ง (AR-9901)" 
                time="15 นาทีที่แล้ว" 
                type="out" 
              />
              <ActivityItem 
                user="นที (ตรวจสภาพ)" 
                action="อัปโหลดผล PDI (ผ่าน)" 
                time="1 ชม. ที่แล้ว" 
                type="pdi" 
              />
           </div>

           <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] font-black uppercase text-slate-500">App Performance</p>
                 <span className="text-emerald-500 text-[10px] font-black">Stable</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed uppercase italic">
                * ข้อมูลทั้งหมดถูกดึงมาจากระบบคลังสินค้าโดยตรง ไม่สามารถแก้ไขจากหน้าจอนี้ได้
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

// --- 🏷️ SUB-COMPONENTS ---

function MonitorCard({ label, value, sub, icon: Icon, color }: any) {
  const themes: any = {
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50'
  }
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${themes[color]}`}>
          <Icon size={22} />
       </div>
       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
       <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter">{value}</h3>
       <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">{sub}</p>
    </div>
  )
}

function AssetRow({ name, id, status, location, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[30px] border border-transparent hover:border-slate-100 transition-all">
       <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
             <Icon size={16} />
          </div>
          <div>
             <h4 className="text-sm font-black text-slate-900 uppercase italic leading-none">{name}</h4>
             <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">S/N: {id}</p>
          </div>
       </div>
       <div className="flex items-center gap-12">
          <div className="text-center">
             <p className={`text-[10px] font-black uppercase ${status === 'With Customer' ? 'text-amber-600' : 'text-emerald-600'}`}>{status}</p>
             <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-tighter">{location}</p>
          </div>
          <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
             <LinkIcon size={18} />
          </button>
       </div>
    </div>
  )
}

function ActivityItem({ user, action, time, type }: any) {
    const colors: any = { in: 'bg-emerald-500', out: 'bg-rose-500', pdi: 'bg-indigo-500' }
    return (
        <div className="flex gap-4 items-start relative pb-6 border-l border-white/5 pl-4">
            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${colors[type]}`} />
            <div>
                <p className="text-[11px] font-bold leading-tight"><span className="text-indigo-400">{user}</span> {action}</p>
                <p className="text-[9px] font-black opacity-30 uppercase mt-1.5">{time}</p>
            </div>
        </div>
    )
}