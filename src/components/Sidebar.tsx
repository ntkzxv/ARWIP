'use client'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Users, UserCircle, MapPin, 
  History, LogOut, Lock 
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // ดึง Role จากฐานข้อมูลเพื่อให้แม่นยำที่สุด
    const fetchUserRole = async () => {
      const savedUserId = localStorage.getItem('current_user_id')
      if (savedUserId) {
        const { data } = await supabase
          .from('employees')
          .select('role')
          .eq('id', savedUserId)
          .single()
        if (data) setUserRole(data.role)
      }
    }
    fetchUserRole()
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Customers', path: '/dashboard/customers' },
    { 
      icon: UserCircle, 
      label: 'Employees', 
      path: '/dashboard/employees',
      isRestricted: true // ระบุว่าเป็นเมนูที่จำกัดสิทธิ์
    },
    { icon: MapPin, label: 'Branches', path: '/dashboard/branches' },
    { icon: History, label: 'Credit History', path: '/dashboard/credit-history' },
  ]

  const handleNavigation = (path: string, isRestricted: boolean) => {
    // ถ้าเป็น staff และพยายามเข้าเมนูที่จำกัดสิทธิ์ ไม่ต้องให้ไปไหน
    if (isRestricted && userRole === 'staff') {
      return 
    }
    router.push(path)
  }

  return (
    <aside className="w-72 bg-[#1e1e2d] text-slate-400 p-6 flex flex-col shrink-0 shadow-xl min-h-screen">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
          AR
        </div>
        <div className="leading-none">
          <span className="text-white font-bold text-xl block tracking-tight">ARWIP</span>
          <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">DATA CENTER</span>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isLocked = item.isRestricted && userRole === 'staff'
          const isActive = pathname === item.path

          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path, !!item.isRestricted)}
              disabled={isLocked}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : isLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>

              {/* แสดงไอคอนแม่กุญแจถ้าถูก Block (เฉพาะ Staff เท่านั้นที่จะเห็น) */}
              {isLocked && (
                <Lock size={14} className="text-slate-600" />
              )}
            </button>
          )
        })}
      </nav>

      <button 
        onClick={() => { localStorage.clear(); window.location.href = '/login' }}
        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-bold mt-auto"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  )
}