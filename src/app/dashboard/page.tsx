'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { TrendingUp, Users, MapPin, AlertCircle, Clock } from 'lucide-react'

export default function DashboardOverview() {
  const [employee, setEmployee] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const savedUserId = localStorage.getItem('current_user_id')
      const { data } = await supabase.from('employees').select('*').eq('id', savedUserId).single()
      if (data) setEmployee(data)
    }
    fetchProfile()
  }, [])

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium mt-1">ยินดีต้อนรับกลับมา, {employee?.full_name || 'Admin'}</p>
        </div>
        
        {/* Profile Tag */}
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-[22px] shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-blue-600 rounded-[16px] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
            {employee?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">{employee?.full_name}</p>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{employee?.role}</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Customers" value="1,245" change="+12.5%" icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Total Branches" value="12" change="0%" icon={MapPin} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Avg Credit Score" value="742" change="+3.2%" icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Pending Tasks" value="18" change="-4%" icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-[35px] p-8 shadow-sm border border-slate-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Clock size={20} className="text-blue-600" /> Recent Activities
            </h3>
            <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            <ActivityItem title="New Customer Registered" time="2 mins ago" desc="สมชาย รักดี ได้ลงทะเบียนในระบบ Data Center" />
            <ActivityItem title="Credit Score Updated" time="1 hour ago" desc="AI ทำการวิเคราะห์เครดิตของ กัญญารัตน์ ใหม่ (+15 points)" />
            <ActivityItem title="Inventory Alert" time="3 hours ago" desc="สาขาปทุมธานี แจ้งเตือนสินค้าสต็อกต่ำ" />
          </div>
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-xl shadow-slate-200">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all text-left px-6">
              ➕ Add New Employee
            </button>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all text-left px-6">
              📊 Export Credit Report
            </button>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm transition-all text-center">
              Launch AI Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
function StatCard({ label, value, change, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-50">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{value}</h3>
      <p className={`text-[11px] font-bold mt-3 ${change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
        {change} <span className="text-slate-300 font-medium ml-1">since last month</span>
      </p>
    </div>
  )
}

function ActivityItem({ title, time, desc }: any) {
  return (
    <div className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <span className="text-[10px] font-medium text-slate-400">{time}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}