'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Users, UserCircle, MapPin, 
  History, Bell, LineChart, ShieldAlert, 
  BarChart3, Activity, Box, Truck, 
  ClipboardCheck, ChevronLeft, ChevronUp, 
  Settings, LogOut, Languages 
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'
import Image from 'next/image'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('User')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [lang, setLang] = useState<'th' | 'en'>('en')

  // 🚩 ฟังก์ชันสำหรับดึงข้อมูลพนักงาน (แยกออกมาเพื่อให้ Realtime เรียกใช้ได้)
  const fetchUser = async () => {
    const savedUserId = localStorage.getItem('current_user_id')
    if (savedUserId) {
      const { data } = await supabase
        .from('employees')
        .select('role, full_name, avatar_url')
        .eq('id', savedUserId)
        .single()
      
      if (data) {
        setUserRole(data.role?.toLowerCase()) 
        setUserName(data.full_name)
        // ใส่ Timestamp เพื่อแก้ปัญหา Browser จำรูปเก่า (Cache)
        setUserAvatar(data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null)
      }
    }
  }

  useEffect(() => {
    fetchUser() // ดึงข้อมูลครั้งแรกเมื่อโหลดหน้า

    const savedUserId = localStorage.getItem('current_user_id')
    if (!savedUserId) return

    // 📡 [เพิ่มระบบ Realtime] ฟังการเปลี่ยนแปลงเฉพาะแถวของตัวเอง
    const channel = supabase
      .channel(`sidebar-user-${savedUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employees',
          filter: `id=eq.${savedUserId}`,
        },
        () => {
          fetchUser() // เมื่อมีการ Update ใน DB ให้ดึงข้อมูลใหม่ทันที
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const translations = {
    en: { dashboard: 'Dashboard Overview', employees: 'Employee Team', branches: 'Branch Units', customers: 'Customer List', history: 'Credit History', notif: 'Notifications', behavior: 'Payment Behavior', risk: 'Risk Analysis', perf: 'Performance', forecast: 'Forecast Analysis', stock: 'Stock Inventory', move: 'Stock Movement', audit: 'PDI Inspection', account: 'Account Settings', logout: 'Log out system', lang: 'Switch to Thai' },
    th: { dashboard: 'แผงควบคุมหลัก', employees: 'ทีมพนักงาน', branches: 'หน่วยงานสาขา', customers: 'รายชื่อลูกค้า', notif: 'การแจ้งเตือน', history: 'ประวัติเครดิต', behavior: 'พฤติกรรมการจ่าย', risk: 'วิเคราะห์ความเสี่ยง', perf: 'ประสิทธิภาพงาน', forecast: 'พยากรณ์ล่วงหน้า', stock: 'คลังสินค้าคงเหลือ', move: 'รายการเคลื่อนย้าย', audit: 'ตรวจเช็ค PDI', account: 'ตั้งค่าบัญชี', logout: 'ออกจากระบบ', lang: 'สลับเป็นภาษาอังกฤษ' }
  }
  const t = translations[lang]

  const menuItems = [
    { label: 'Command Center', items: [{ icon: LayoutDashboard, label: t.dashboard, path: '/dashboard' }] },
    { label: 'Human Resources', items: [{ icon: UserCircle, label: t.employees, path: '/dashboard/employees', isRestricted: true }, { icon: MapPin, label: t.branches, path: '/dashboard/branches' }] },
    { label: 'Customer Relations', items: [{ icon: Users, label: t.customers, path: '/dashboard/customers' },{ icon: History, label: t.history, path: '/dashboard/credit-history' }, { icon: Bell, label: t.notif, path: '/dashboard/notifications' }] },
    { label: 'Intelligence', items: [{ icon: LineChart, label: t.behavior, path: '/dashboard/analysis/behavior' }, { icon: ShieldAlert, label: t.risk, path: '/dashboard/analysis/risk' }, { icon: BarChart3, label: t.perf, path: '/dashboard/analysis/performance' }, { icon: Activity, label: t.forecast, path: '/dashboard/analysis/forecast' }] },
    { label: 'Warehouse Control', items: [{ icon: Box, label: t.stock, path: '/dashboard/inventory' }, { icon: Truck, label: t.move, path: '/dashboard/inventory/movement' }, { icon: ClipboardCheck, label: t.audit, path: '/dashboard/inventory/inspection' }] }
  ]

  const logoUrl = "https://yksehgfsltzngnhqrdiv.supabase.co/storage/v1/object/sign/image/arwipLogo%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMDllMzQzNy0zMDk4LTRhOTctYmUwMy03Njg5YzYyMGYxODEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28gKDEpLnBuZyIsImlhdCI6MTc3MzY4NDk2OCwiZXhwIjoxODA1MjIwOTY4fQ.OAWMDYjIv_B2u8Q18VZiNCYRJpqpWReTpnqkT7xBSVU"

  return (
    <aside className={`sticky top-0 h-screen flex flex-col bg-slate-950 border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 shrink-0 ${isMinimized ? 'w-20' : 'w-64'}`}>
      
      {/* LOGO AREA */}
      <div className={`flex flex-col items-center justify-center w-full overflow-hidden shrink-0 transition-all duration-500 ${isMinimized ? 'py-6' : 'pt-7 px-6 pb-4'}`}>
        <div className={`relative transition-all duration-500 ${isMinimized ? 'w-14 h-14' : 'w-full h-12'}`}>
          <Image src={logoUrl} alt="Logo" fill priority className="object-contain" />
        </div>
      </div>

      {!isMinimized && <div className="mx-6 border-b border-white/5 mb-4" />}

      {/* MENU ITEMS */}
      <nav className={`flex-1 px-3 overflow-y-auto scrollbar-hide w-full transition-all duration-500 ${isMinimized ? 'space-y-4' : 'space-y-6'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menuItems.map((group, index) => {
          const visibleItems = group.items.filter(item => {
            if (userRole === 'admin') return true;
            if (userRole === 'supervisor') return true; 
            if (userRole === 'manager') return group.label === 'Human Resources' || group.label === 'Customer Relations';
            return !item.isRestricted; 
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="w-full">
              {!isMinimized ? (
                <div className="flex items-center gap-2 px-4 mb-3 animate-in fade-in duration-700">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] leading-none whitespace-nowrap">{group.label}</h3>
                </div>
              ) : (
                index !== 0 && <div className="mx-auto w-8 border-t border-white/10 my-4 transition-all duration-500" />
              )}
              
              <div className={`flex flex-col items-center transition-all duration-500 ${isMinimized ? 'gap-2.5' : 'gap-1'}`}>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      className={`group relative rounded-xl transition-all duration-300 flex items-center ${isMinimized ? 'w-12 h-12 justify-center' : 'w-full px-4 py-2.5 gap-3'} ${isActive ? 'bg-white text-slate-950 shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon size={18} className={`${isActive ? 'text-indigo-600' : 'group-hover:text-white'} shrink-0 transition-colors`} />
                      {!isMinimized && <span className="text-[13px] font-semibold uppercase tracking-tight truncate">{item.label}</span>}
                      {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-l-full shadow-[0_0_15px_rgba(79,70,229,1)]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ACCOUNT AREA */}
      <div className="p-3 bg-slate-950 mt-auto w-full pb-8 shrink-0 border-t border-white/5 space-y-4">
        <div className={`w-full flex ${isMinimized ? 'justify-center' : 'justify-end px-1'}`}>
          <button onClick={() => setIsMinimized(!isMinimized)} className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/10 hover:border-indigo-500 text-slate-500 hover:text-white transition-all duration-300 active:scale-75">
            <ChevronLeft size={16} className={`transition-transform duration-500 ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="w-full space-y-2">
          <button 
            onClick={() => isMinimized ? setIsMinimized(false) : setIsAccountOpen(!isAccountOpen)}
            className={`flex items-center transition-all duration-500 overflow-hidden ${
              isMinimized 
                ? 'w-14 h-14 justify-center mx-auto rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500 shadow-lg group' 
                : 'w-full px-4 py-3 bg-white/5 rounded-2xl border border-white/5 gap-3 hover:border-indigo-500/30'
            }`}
          >
            <div className={`shrink-0 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner ${
              isMinimized ? 'w-12 h-12 rounded-lg' : 'w-8 h-8 rounded-lg bg-indigo-600'
            }`}>
              {userAvatar ? (
                <img src={userAvatar} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-white font-black text-sm uppercase">{userName.charAt(0)}</span>
              )}
            </div>

            {!isMinimized && (
              <div className="min-w-0 flex-1 text-left animate-in fade-in duration-500">
                <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5 tracking-widest">System Access</p>
                <p className="text-[11px] font-bold text-white uppercase truncate tracking-tight">{userRole || 'Unauthorized'}</p>
              </div>
            )}
            {!isMinimized && <ChevronUp size={14} className={`text-slate-500 transition-transform ${isAccountOpen ? '' : 'rotate-180'}`} />}
          </button>

          {!isMinimized && isAccountOpen && (
            <div className="px-1 space-y-1 animate-in slide-in-from-bottom-2 duration-300">
              <button onClick={() => setLang(lang === 'en' ? 'th' : 'en')} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-indigo-400 hover:bg-white/5 hover:text-indigo-300 text-[11px] font-bold uppercase transition-all">
                <Languages size={14} /> {t.lang}
              </button>
              <button onClick={() => router.push('/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:text-white text-[11px] font-bold uppercase transition-all">
                <Settings size={14} /> {t.account}
              </button>
              <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400/70 hover:text-red-400 text-[11px] font-bold uppercase transition-all">
                <LogOut size={14} /> {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </aside>
  )
}