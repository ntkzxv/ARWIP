'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Users, UserCircle, MapPin, 
  History, Bell, LineChart, ShieldAlert, 
  BarChart3, Activity, Box, Truck, 
  ClipboardCheck, ChevronLeft, ChevronUp, 
  Settings, LogOut, Languages, LayoutGrid
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
  
  // 🚩 1. ตั้งค่าเริ่มต้นเป็นภาษาไทย
  const [lang, setLang] = useState<'th' | 'en'>('th')

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
        setUserAvatar(data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null)
      }
    }
  }

  useEffect(() => {
    fetchUser()

    // 🚩 2. ดึงภาษาที่เคยเลือกไว้จาก localStorage
    const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
    if (savedLang) {
      setLang(savedLang)
    }

    const savedUserId = localStorage.getItem('current_user_id')
    if (!savedUserId) return
    const channel = supabase
      .channel(`sidebar-user-${savedUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'employees', filter: `id=eq.${savedUserId}` }, 
      () => { fetchUser() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // 🚩 3. ฟังก์ชันสลับภาษาพร้อมบันทึกค่า
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'th' : 'en'
    setLang(newLang)
    localStorage.setItem('app_lang', newLang)
  }

  const translations = {
    en: { dashboard: 'Dashboard Overview', hub: 'Module Hub', employees: 'Employee Team', branches: 'Branch Units', customers: 'Customer List', history: 'Credit History', notif: 'Notifications', behavior: 'Payment Behavior', risk: 'Risk Analysis', perf: 'Performance', forecast: 'Forecast Analysis', stock: 'Stock Inventory', move: 'Stock Movement', audit: 'PDI Inspection', account: 'Account Settings', logout: 'Log out system', lang: 'Switch to Thai' },
    th: { dashboard: 'แผงควบคุมหลัก', hub: 'ศูนย์รวมโมดูล', employees: 'ทีมพนักงาน', branches: 'หน่วยงานสาขา', customers: 'รายชื่อลูกค้า', notif: 'การแจ้งเตือน', history: 'ประวัติเครดิต', behavior: 'พฤติกรรมการจ่าย', risk: 'วิเคราะห์ความเสี่ยง', perf: 'ประสิทธิภาพงาน', forecast: 'พยากรณ์ล่วงหน้า', stock: 'คลังสินค้าคงเหลือ', move: 'รายการเคลื่อนย้าย', audit: 'ตรวจเช็ค PDI', account: 'ตั้งค่าบัญชี', logout: 'ออกจากระบบ', lang: 'สลับเป็นภาษาอังกฤษ' }
  }
  const t = translations[lang]

  const menuItems = [
    { label: 'Command Center', items: [{ icon: LayoutDashboard, label: t.dashboard, path: '/datacenter/dashboard' }] },
    { label: 'Human Resources', items: [{ icon: UserCircle, label: t.employees, path: '/datacenter/employees', isRestricted: true }, { icon: MapPin, label: t.branches, path: '/datacenter/branches' }] },
    { label: 'Customer Relations', items: [{ icon: Users, label: t.customers, path: '/datacenter/customers' },{ icon: History, label: t.history, path: '/datacenter/credit-history' }, { icon: Bell, label: t.notif, path: '/datacenter/notifications' }] },
    { label: 'Intelligence', items: [{ icon: LineChart, label: t.behavior, path: '/datacenter/analysis/behavior' }, { icon: ShieldAlert, label: t.risk, path: '/datacenter/analysis/risk' }, { icon: BarChart3, label: t.perf, path: '/datacenter/analysis/performance' }, { icon: Activity, label: t.forecast, path: '/datacenter/analysis/forecast' }] },
    { label: 'Warehouse Control', items: [{ icon: Box, label: t.stock, path: '/datacenter/inventory' }, { icon: Truck, label: t.move, path: '/datacenter/inventory/movement' }, { icon: ClipboardCheck, label: t.audit, path: '/datacenter/inventory/inspection' }] }
  ]

  const logoUrl = "https://ypmsrjhflwpdmfrqgupa.supabase.co/storage/v1/object/sign/image/arwipLogo%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ODc1YjdjMy05NjY2LTQyOTEtYjY3Zi04YjVlZTU5NDg4Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28gKDEpLnBuZyIsImlhdCI6MTc3MzgyMzcyMSwiZXhwIjoxODA1MzU5NzIxfQ.tWYxJyoxX8ERjn1_LHuPb7dFnW_wKGkQ3t7F7xsopSw"

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
    setIsAccountOpen(false) 
  }

  return (
    <aside className={`sticky top-0 h-screen flex flex-col bg-slate-950 border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 shrink-0 ${isMinimized ? 'w-20' : 'w-64'}`}>
      
      {/* LOGO AREA */}
      <div className={`flex flex-col items-center justify-center w-full overflow-hidden shrink-0 transition-all duration-500 ${isMinimized ? 'py-6' : 'pt-7 px-6 pb-4'}`}>
        <div className={`relative transition-all duration-500 ${isMinimized ? 'w-10 h-10' : 'w-full h-12'}`}>
          <Image src={logoUrl} alt="Logo" fill priority className="object-contain" />
        </div>
      </div>

      {!isMinimized && <div className="mx-6 border-b border-white/5 mb-4" />}

      {/* MENU ITEMS */}
      <nav className={`flex-1 px-3 overflow-y-auto scrollbar-hide w-full transition-all duration-500 ${isMinimized ? 'space-y-6' : 'space-y-6'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menuItems.map((group, index) => {
          const visibleItems = group.items.filter(item => {
            if (userRole === 'admin' || userRole === 'supervisor') return true;
            if (userRole === 'manager') return group.label === 'Human Resources' || group.label === 'Customer Relations';
            return !item.isRestricted; 
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="w-full">
              {!isMinimized ? (
                <div className="flex items-center gap-2 px-4 mb-3 animate-in fade-in duration-500">
                  <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap">{group.label}</h3>
                </div>
              ) : (
                index !== 0 && <div className="mx-auto w-6 border-t border-white/10 my-4 transition-all duration-500" />
              )}
              
              <div className={`flex flex-col items-center transition-all duration-500 ${isMinimized ? 'gap-3' : 'gap-1'}`}>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      className={`group relative rounded-xl transition-all duration-300 flex items-center ${isMinimized ? 'w-12 h-12 justify-center' : 'w-full px-4 py-2.5 gap-3'} ${isActive ? 'bg-white text-slate-950 shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <item.icon size={18} className={`${isActive ? 'text-indigo-600' : 'group-hover:text-white'} shrink-0 transition-colors duration-300`} />
                      
                      {!isMinimized && (
                        <span className="text-[13px] font-semibold uppercase tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                          {item.label}
                        </span>
                      )}

                      {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-l-full shadow-[0_0_15px_rgba(79,70,229,1)]" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ACCOUNT & CONTROL AREA */}
      <div className="p-3 bg-slate-950 mt-auto w-full pb-4 shrink-0 border-t border-white/5 space-y-3">
        
        <div className={`w-full flex items-center ${isMinimized ? 'flex-col gap-3 items-center' : 'items-center gap-2 px-1'}`}>
          <button 
            onClick={() => router.push('/portal')}
            className={`flex items-center justify-center gap-3 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all duration-300 group ${isMinimized ? 'w-10 order-1' : 'flex-1 order-1'}`}
          >
            <LayoutGrid size={16} className="group-hover:rotate-90 transition-transform duration-500" />
            {!isMinimized && <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-none">{t.hub}</span>}
          </button>

          <button 
            onClick={handleToggleMinimize} 
            className={`flex items-center justify-center h-9 rounded-xl border border-white/10 hover:border-indigo-500 text-slate-500 hover:text-white transition-all duration-300 active:scale-75 bg-white/5 ${isMinimized ? 'w-10 order-2' : 'w-9 shrink-0 order-2'}`}
          >
            <ChevronLeft size={16} className={`transition-transform duration-500 ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="w-full space-y-2">
          {isMinimized && <div className="mx-auto w-6 border-t border-white/10 mb-2" />}

          <button 
            onClick={() => isMinimized ? handleToggleMinimize() : setIsAccountOpen(!isAccountOpen)}
            className={`flex items-center transition-all duration-500 overflow-hidden ${
              isMinimized 
                ? 'w-12 h-12 justify-center mx-auto' 
                : 'w-full px-3 py-3 bg-white/5 rounded-2xl border border-white/5 gap-3 hover:bg-white/10 active:scale-95'
            }`}
          >
            <div className={`shrink-0 flex items-center justify-center overflow-hidden transition-all duration-500 ${
              isMinimized 
                ? 'w-10 h-10 rounded-xl border border-white/10 shadow-lg bg-slate-900' 
                : 'w-9 h-9 rounded-xl bg-indigo-600 border border-white/5 shadow-inner'
            }`}>
              {userAvatar ? (
                <img src={userAvatar} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="text-white font-bold text-sm uppercase italic">{userName.charAt(0)}</span>
              )}
            </div>

            {!isMinimized && (
              <div className="min-w-0 flex-1 text-left h-9 flex flex-col justify-center">
                <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5 tracking-widest leading-none">System Access</p>
                <div className="min-h-[14px] flex items-center">
                  {!userRole && userName === 'User' ? (
                    <div className="w-16 h-2 bg-white/10 rounded-full animate-pulse" />
                  ) : (
                    <p className="text-[11px] font-bold text-white uppercase truncate tracking-tight animate-in fade-in duration-700">
                      {userRole || 'Authorized Staff'}
                    </p>
                  )}
                </div>
              </div>
            )}
            {!isMinimized && (
              <ChevronUp 
                size={14} 
                className={`text-slate-500 transition-transform duration-500 ${isAccountOpen ? '' : 'rotate-180'}`} 
              />
            )}
          </button>

          {!isMinimized && (
            <div className={`grid transition-all duration-500 ease-in-out ${isAccountOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
              <div className="overflow-hidden px-1 space-y-1">
                {/* 🚩 แก้ไขจุดเรียกใช้ฟังก์ชัน toggleLanguage */}
                <button onClick={toggleLanguage} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-indigo-400 hover:bg-white/5 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-wider transition-all"><Languages size={14} /> {t.lang}</button>
                <button onClick={() => router.push('/portal/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all"><Settings size={14} /> {t.account}</button>
                <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-rose-500/5 text-[10px] font-bold uppercase tracking-wider transition-all"><LogOut size={14} /> {t.logout}</button>
              </div>
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