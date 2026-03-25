'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, MapPin, History, Activity, Box, Truck, 
  ChevronLeft, ChevronUp, Settings, LogOut, Languages, LayoutGrid,
  Package, ArrowLeftRight, Factory, AlertTriangle
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase' 
import Image from 'next/image'

export default function SidebarWarehouse() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('User')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  
  // 🚩 1. ตั้งค่าเริ่มต้นเป็น 'th'
  const [lang, setLang] = useState<'th' | 'en'>('th')

  useEffect(() => {
    fetchUser()
    
    // 🚩 2. ดึงภาษาที่เคยเลือกไว้จาก localStorage ถ้าไม่มีให้ใช้ 'th'
    const savedLang = localStorage.getItem('app_lang') as 'th' | 'en'
    if (savedLang) {
      setLang(savedLang)
    }

    const savedUserId = localStorage.getItem('current_user_id')
    if (!savedUserId) return
    const channel = supabase
      .channel(`warehouse-sidebar-${savedUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'employees', filter: `id=eq.${savedUserId}` }, 
      () => { fetchUser() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // 🚩 3. ฟังก์ชันสลับภาษาพร้อมบันทึกค่าลง localStorage
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'th' : 'en'
    setLang(newLang)
    localStorage.setItem('app_lang', newLang)
  }

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

  const translations = {
    en: { 
      dashboard: 'Warehouse Dashboard', hub: 'Module Hub', 
      p_master: 'Product Master', stock: 'Inventory Stock', receiving: 'Goods Receiving', 
      m_log: 'Movement Log', b_warehouse: 'Branch Warehouse', supplier: 'Suppliers', 
      transfer: 'Stock Transfer', ai_warehouse: 'AI Analysis', alert: 'Alert System',
      account: 'Account Settings', logout: 'Log out system', lang: 'Switch to Thai' 
    },
    th: { 
      dashboard: 'ภาพรวมคลังสินค้า', hub: 'ศูนย์รวมโมดูล', 
      p_master: 'ข้อมูลสินค้าหลัก', stock: 'สต็อกคงเหลือ', receiving: 'รับสินค้าเข้า', 
      m_log: 'ประวัติเคลื่อนไหว', b_warehouse: 'คลังแยกสาขา', supplier: 'ผู้ผลิต/คู่ค้า', 
      transfer: 'โอนย้ายสินค้า', ai_warehouse: 'AI วิเคราะห์คลัง', alert: 'ระบบแจ้งเตือน',
      account: 'ตั้งค่าบัญชี', logout: 'ออกจากระบบ', lang: 'สลับเป็นภาษาอังกฤษ' 
    }
  }
  const t = translations[lang]

  const menuItems = [
    { 
      label: 'Control Center', 
      items: [
        { icon: LayoutDashboard, label: t.dashboard, path: '/warehouse' }
      ] 
    },
    { 
      label: 'Logistics & Inventory', 
      items: [
        { icon: Package, label: t.p_master, path: '/warehouse/inventory' },
        { icon: Box, label: t.stock, path: '/warehouse/stock' },
        { icon: Truck, label: t.receiving, path: '/warehouse/receive' },
        { icon: History, label: t.m_log, path: '/warehouse/movements' },
        { icon: MapPin, label: t.b_warehouse, path: '/warehouse/branches' },
        { icon: Factory, label: t.supplier, path: '/warehouse/suppliers' },
        { icon: ArrowLeftRight, label: t.transfer, path: '/warehouse/transfer' },
      ] 
    },
    { 
      label: 'Intelligence System', 
      items: [
        { icon: Activity, label: t.ai_warehouse, path: '/warehouse/analysis' },
        { icon: AlertTriangle, label: t.alert, path: '/warehouse/alerts' },
      ] 
    }
  ]

  const logoUrl = "https://ypmsrjhflwpdmfrqgupa.supabase.co/storage/v1/object/sign/image/arwipLogo%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ODc1YjdjMy05NjY2LTQyOTEtYjY3Zi04YjVlZTU5NDg4Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28gKDEpLnBuZyIsImlhdCI6MTc3MzgyMzcyMSwiZXhwIjoxODA1MzU5NzIxfQ.tWYxJyoxX8ERjn1_LHuPb7dFnW_wKGkQ3t7F7xsopSw"

  return (
    <aside className={`sticky top-0 h-screen flex flex-col bg-slate-950 border-r border-white/5 transition-all duration-500 z-50 shrink-0 ${isMinimized ? 'w-20' : 'w-64'}`}>
      
      <div className={`flex flex-col items-center justify-center w-full overflow-hidden shrink-0 transition-all duration-500 ${isMinimized ? 'py-6' : 'pt-7 px-6 pb-4'}`}>
        <div className={`relative transition-all duration-500 ${isMinimized ? 'w-10 h-10' : 'w-full h-12'}`}>
          <Image src={logoUrl} alt="Logo" fill priority className="object-contain" />
        </div>
      </div>

      {!isMinimized && <div className="mx-6 border-b border-white/5 mb-4" />}

      <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide space-y-6">
        {menuItems.map((group, index) => (
          <div key={group.label} className="w-full">
            {!isMinimized ? (
              <div className="flex items-center gap-2 px-4 mb-3">
                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{group.label}</h3>
              </div>
            ) : (
              index !== 0 && <div className="mx-auto w-6 border-t border-white/10 my-4" />
            )}
            
            <div className={`flex flex-col items-center gap-1`}>
              {group.items.map((item) => {
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className={`group relative rounded-xl transition-all duration-300 flex items-center ${isMinimized ? 'w-12 h-12 justify-center' : 'w-full px-4 py-2.5 gap-3'} ${isActive ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <item.icon size={18} className={`${isActive ? 'text-indigo-600' : 'group-hover:text-white'}`} />
                    {!isMinimized && <span className="text-[12px] font-semibold uppercase truncate">{item.label}</span>}
                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-l-full shadow-[0_0_15px_rgba(79,70,229,1)]" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 bg-slate-950 mt-auto border-t border-white/5 space-y-3 pb-4">
        <div className={`w-full flex items-center ${isMinimized ? 'flex-col gap-3' : 'gap-2 px-1'}`}>
          <button onClick={() => router.push('/portal')} className={`flex items-center justify-center h-9 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all ${isMinimized ? 'w-10' : 'flex-1'}`}>
            <LayoutGrid size={16} />
            {!isMinimized && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.1em]">{t.hub}</span>}
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 hover:border-indigo-500 text-slate-500 hover:text-white transition-all bg-white/5">
            <ChevronLeft size={16} className={`${isMinimized ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="w-full">
          <button 
            onClick={() => isMinimized ? setIsMinimized(false) : setIsAccountOpen(!isAccountOpen)}
            className={`flex items-center transition-all ${isMinimized ? 'w-12 h-12 justify-center mx-auto' : 'w-full px-3 py-3 bg-white/5 rounded-2xl gap-3'}`}
          >
            <div className={`shrink-0 flex items-center justify-center overflow-hidden rounded-xl ${isMinimized ? 'w-10 h-10' : 'w-9 h-9 bg-indigo-600'}`}>
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="Profile" /> : <span className="text-white font-bold text-sm uppercase italic">{userName.charAt(0)}</span>}
            </div>
            {!isMinimized && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Access</p>
                <p className="text-[11px] font-bold text-white uppercase truncate">{userRole || 'Authorized Staff'}</p>
              </div>
            )}
            {!isMinimized && <ChevronUp size={14} className={`text-slate-500 transition-transform ${isAccountOpen ? '' : 'rotate-180'}`} />}
          </button>

          {!isMinimized && (
            <div className={`grid transition-all duration-500 ${isAccountOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
              <div className="overflow-hidden px-1 space-y-1">
                {/* 🚩 แก้ไขจุดเรียกสลับภาษา */}
                <button onClick={toggleLanguage} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-indigo-400 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all"><Languages size={14} /> {t.lang}</button>
                <button onClick={() => router.push('/portal/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider transition-all"><Settings size={14} /> {t.account}</button>
                <button onClick={() => { localStorage.clear(); window.location.href = '/login' }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-rose-500/5 text-[10px] font-bold uppercase tracking-wider transition-all"><LogOut size={14} /> {t.logout}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </aside>
  )
}