'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Users, UserCircle, MapPin, 
  History, Fingerprint, ArrowLeftRight, 
  ChevronUp, LogOut, Settings
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'
import Image from 'next/image'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  useEffect(() => {
    const fetchUserRole = async () => {
      const savedUserId = localStorage.getItem('current_user_id')
      if (savedUserId) {
        const { data } = await supabase.from('employees').select('role').eq('id', savedUserId).single()
        if (data) setUserRole(data.role)
      }
    }
    fetchUserRole()
  }, [])

  const handleToggleSidebar = () => {
    const newMinimizedState = !isMinimized
    setIsMinimized(newMinimizedState)
    if (newMinimizedState) {
      setIsAccountOpen(false)
    }
  }

  const handleAccountClick = () => {
    if (isMinimized) {
      setIsMinimized(false)
      setIsAccountOpen(true)
    } else {
      setIsAccountOpen(!isAccountOpen)
    }
  }

  const menuItems = [
    { label: 'Main', items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Customers', path: '/dashboard/customers' },
      { icon: History, label: 'Credit History', path: '/dashboard/credit-history' },
    ]},
    { label: 'System', items: [
      { icon: UserCircle, label: 'Employees', path: '/dashboard/employees', isRestricted: true },
      { icon: MapPin, label: 'Branches', path: '/dashboard/branches' },
    ]}
  ]

  const logoUrl = "https://yksehgfsltzngnhqrdiv.supabase.co/storage/v1/object/sign/image/arwipLogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMDllMzQzNy0zMDk4LTRhOTctYmUwMy03Njg5YzYyMGYxODEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28ucG5nIiwiaWF0IjoxNzczMzc1Mjc1LCJleHAiOjE4MDQ5MTEyNzV9.Ut4rli1RoY0hE0rp7QHs2vR9lVhwRG6TwQcJKDyrUJA"

  return (
    <aside className={`sticky top-0 h-screen flex flex-col bg-slate-950 border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-50 shrink-0 relative ${
      isMinimized ? 'w-16 rounded-r-2xl' : 'w-64'
    }`}>
      
      {/* 🚀 Logo Section - ปรับความสูงใหม่ให้กระชับขึ้น */}
      <div className={`flex flex-col items-center justify-center w-full overflow-hidden shrink-0 transition-all duration-500 ${isMinimized ? 'py-4 px-1' : 'py-6 px-4'}`}>
        <div className={`relative transition-all duration-500 ease-in-out ${isMinimized ? 'w-14 h-14' : 'w-full h-24'}`}>
          <Image
            src={logoUrl}
            alt="Arwip Logo"
            fill
            priority
            className="object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* 📂 Navigation Area */}
      <nav className="flex-1 px-2.5 space-y-6 overflow-y-auto no-scrollbar overflow-x-hidden w-full">
        {menuItems.map((group, index) => (
          <div key={group.label} className="space-y-1.5 w-full">
            {!isMinimized ? (
              <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] px-4 mb-2">{group.label}</h3>
            ) : (
              index !== 0 && <div className="mx-2 mb-4 border-t border-white/5 opacity-50" />
            )}
            
            <div className="space-y-1 w-full flex flex-col items-center">
              {group.items.map((item) => {
                const isLocked = item.isRestricted && userRole === 'staff'
                const isActive = pathname === item.path

                return (
                  <button
                    key={item.label}
                    onClick={() => !isLocked && router.push(item.path)}
                    disabled={isLocked}
                    className={`group relative rounded-xl transition-all duration-300 flex items-center ${
                      isMinimized ? 'w-11 h-11 justify-center' : 'w-full px-4 py-3 gap-3'
                    } ${
                      isActive 
                      ? 'bg-white text-slate-950 shadow-lg' 
                      : isLocked ? 'opacity-10 cursor-not-allowed' : 'text-slate-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className={`${isActive ? 'text-indigo-600' : 'group-hover:text-white'} shrink-0 transition-colors`} />
                    {!isMinimized && <span className="text-[13px] font-bold tracking-tight">{item.label}</span>}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-indigo-600 rounded-l-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 👤 Footer Section */}
      <div className="p-2.5 space-y-3 bg-slate-950 mt-auto w-full flex flex-col items-center pb-8 shrink-0">
        
        {/* 🚩 Toggle Button */}
        <div className={`w-full flex ${isMinimized ? 'justify-center' : 'justify-end px-1'}`}>
          <button 
            onClick={handleToggleSidebar}
            className="flex items-center justify-center transition-all duration-300 rounded-full border-2 border-indigo-600/30 hover:border-indigo-500 bg-slate-900 text-indigo-400 hover:text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] w-9 h-9 cursor-pointer active:scale-90"
          >
            <ArrowLeftRight size={14} className={`transition-transform duration-500 ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* 👤 Account Section */}
        <div className="w-full space-y-2">
          <button 
            onClick={handleAccountClick}
            className={`flex items-center transition-all duration-300 ${
              isMinimized 
                ? 'w-11 h-11 justify-center mx-auto rounded-xl bg-indigo-600 shadow-lg hover:scale-105 active:scale-95' 
                : 'w-full px-3.5 py-3 bg-white/5 rounded-2xl border border-white/5 gap-3 hover:border-indigo-500/30'
            }`}
          >
            <div className={`shrink-0 flex items-center justify-center text-white ${isMinimized ? '' : 'w-8 h-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20'}`}>
              <Fingerprint size={18} />
            </div>
            {!isMinimized && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[8px] font-black text-slate-600 uppercase leading-none mb-1 tracking-widest">Access Level</p>
                  <p className="text-[11px] font-black text-white uppercase truncate tracking-tighter">{userRole || '...'}</p>
                </div>
                <ChevronUp size={12} className={`text-slate-600 transition-transform duration-300 ${isAccountOpen ? '' : 'rotate-180'}`} />
              </>
            )}
          </button>

          {!isMinimized && isAccountOpen && (
            <div className="px-1 space-y-1 animate-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={() => router.push('/dashboard/account')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all text-xs font-bold"
              >
                <Settings size={14} /> Account
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login' }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-bold"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* 📄 Terms & Conditions */}
        {!isMinimized && (
          <div className="w-full px-3 pt-4 border-t border-white/5 animate-in fade-in duration-500">
            <button 
              onClick={() => router.push('/terms')}
              className="text-slate-700 hover:text-indigo-400 transition-colors flex items-center gap-2 text-[8px] font-bold uppercase tracking-tighter w-full"
            >
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <span>Terms & Conditions</span>
            </button>
            <p className="text-[7px] text-slate-800 mt-1 pl-3 uppercase tracking-tighter">
              © 2026 Arwip Data Solution
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}