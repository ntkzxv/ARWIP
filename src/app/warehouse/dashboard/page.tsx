'use client'
import { 
  Box, Truck, ClipboardCheck, AlertTriangle, 
  TrendingUp, ArrowUpRight, ArrowDownRight, MapPin 
} from 'lucide-react'

export default function WarehouseDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 🚩 Header Section */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
          Warehouse <span className="text-indigo-600">Command Center</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
          System Intelligence & Logistics Monitoring
        </p>
      </div>

      {/* 🚩 1. High-Level Stats (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory" 
          value="4,280" 
          unit="Units" 
          trend="+12%" 
          isUp={true} 
          icon={<Box size={20} />} 
          color="indigo" 
        />
        <StatCard 
          title="Out of Stock" 
          value="08" 
          unit="Items" 
          trend="Critical" 
          isUp={false} 
          icon={<AlertTriangle size={20} />} 
          color="rose" 
        />
        <StatCard 
          title="Pending PDI" 
          value="14" 
          unit="Vehicles" 
          trend="Action Required" 
          isUp={true} 
          icon={<ClipboardCheck size={20} />} 
          color="amber" 
        />
        <StatCard 
          title="Incoming" 
          value="25" 
          unit="Shipments" 
          trend="In Transit" 
          isUp={true} 
          icon={<Truck size={20} />} 
          color="blue" 
        />
      </div>

      {/* 🚩 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Branch Inventory Distribution (Left Side) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" /> Branch Distribution
              </h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Branches</button>
            </div>
            
            <div className="space-y-6">
              <BranchProgress name="Bangkok Central (HQ)" current={1450} max={2000} color="bg-indigo-600" />
              <BranchProgress name="Phuket Branch" current={420} max={800} color="bg-blue-500" />
              <BranchProgress name="Chiang Mai Unit" current={890} max={1000} color="bg-amber-500" />
              <BranchProgress name="Rayong Terminal" current={150} max={1500} color="bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Recent Movements (Right Side) */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Recent Movements</h3>
          <div className="flex-1 space-y-6">
            <ActivityItem type="IN" title="Honda Civic RS" desc="Received at BKK-HQ" time="10m ago" />
            <ActivityItem type="OUT" title="Premium Mats" desc="Sale - Order #882" time="45m ago" />
            <ActivityItem type="TRANS" title="Oil Filter A" desc="BKK to PKT" time="2h ago" />
            <ActivityItem type="IN" title="Mazda 3 Sedan" desc="Received at BKK-HQ" time="5h ago" />
          </div>
          <button className="w-full mt-8 py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">
            Full Movement Log
          </button>
        </div>

      </div>
    </div>
  )
}

// 🔧 Helper: StatCard
function StatCard({ title, value, unit, trend, isUp, icon, color }: any) {
  const colorMap: any = {
    indigo: 'text-indigo-600 bg-indigo-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50',
  }
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 group hover:shadow-xl transition-all duration-500">
      <div className={`w-12 h-12 ${colorMap[color]} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end gap-2 mb-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
        {trend}
      </div>
    </div>
  )
}

// 🔧 Helper: BranchProgress
function BranchProgress({ name, current, max, color }: any) {
  const percent = (current / max) * 100
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-slate-700 uppercase">{name}</span>
        <span className="text-[10px] font-bold text-slate-400">{current.toLocaleString()} / {max.toLocaleString()} Units</span>
      </div>
      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// 🔧 Helper: ActivityItem
function ActivityItem({ type, title, desc, time }: any) {
  return (
    <div className="flex gap-4 items-start border-l-2 border-slate-50 pl-4 relative">
      <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${
        type === 'IN' ? 'bg-emerald-500' : type === 'OUT' ? 'bg-rose-500' : 'bg-blue-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1 truncate">{title}</p>
        <p className="text-[10px] font-bold text-slate-400 truncate">{desc}</p>
      </div>
      <span className="text-[8px] font-black text-slate-300 uppercase whitespace-nowrap">{time}</span>
    </div>
  )
}