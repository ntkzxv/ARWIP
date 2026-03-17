'use client'
import { User, History, CreditCard, Users, ShieldCheck, ClipboardList } from 'lucide-react' // 🚩 เพิ่ม ClipboardList

export default function Sidebar({ activeTab, setActiveTab, customerScore }: any) {
  const menuItems = [
    { id: 'personal', label: 'ข้อมูลส่วนตัว', icon: <User size={18} /> },
    { id: 'guarantor', label: 'ผู้ค้ำประกัน', icon: <Users size={18} /> },    
    { id: 'history', label: 'ประวัติการซื้อ', icon: <History size={18} /> },
    { id: 'installment', label: 'รายละเอียดการผ่อน', icon: <CreditCard size={18} /> },
    // 🚩 เพิ่มเมนูใหม่เข้าไปที่นี่
    { id: 'collection_logs', label: 'ประวัติการติดตาม', icon: <ClipboardList size={18} /> },
  ]

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* 💳 Credit Score Card - Premium Theme */}
      <div className="bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Score</p>
            <p className="text-xl font-black text-slate-900">{customerScore}%</p>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${customerScore >= 50 ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-red-500 shadow-lg shadow-red-200'} animate-pulse`} />
      </div>

      {/* 🧭 Navigation Menu - Indigo & Slate Theme */}
      <nav className="bg-white rounded-[30px] p-3 shadow-sm border border-slate-100">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${
                  isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {item.icon}
                </span>
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  )
}