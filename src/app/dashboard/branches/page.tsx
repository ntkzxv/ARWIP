'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { MapPin, Store, Loader2, Users, Package } from 'lucide-react'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*, employees(count)')
          .order('branch_code', { ascending: true })
          .limit(2)

        if (data) setBranches(data)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBranches()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  )

  return (
    /** * 🛡️ แก้ไข Layout: 
     * - เพิ่ม ml-14 ถึง ml-20 เพื่อดันเนื้อหาหลบ Sidebar (ปรับตามความกว้าง Sidebar จริง)
     * - ใช้ max-w-7xl เพื่อไม่ให้ข้อมูลแผ่กระจายจนเกินไปในจอ Wide
     */
    <div className="p-6 md:p-12 lg:ml-16 space-y-12 min-h-screen">
      
      {/* --- HEADER SECTION --- */}
      <header className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Branch Management</h1>
        <p className="text-slate-500 font-medium mt-2 text-base italic">
          ภาพรวมข้อมูลพนักงานและสถานะของแต่ละสาขา (Connected to Database)
        </p>
      </header>

      {/* --- BRANCH CARDS GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className="bg-white rounded-[50px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[420px]"
          >
            
            {/* ตกแต่งมุมขวาบนด้วย Glow Effect */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-700" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 bg-[#1e1e2d] text-white rounded-[30px] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-all duration-500">
                  <Store size={32} />
                </div>
                <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  {branch.branch_code}
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none">
                  {branch.branch_name}
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin size={20} className="text-blue-500" />
                  <span className="text-base font-bold">{branch.location || 'ประเทศไทย'}</span>
                </div>
              </div>
            </div>

            {/* 📊 STATS SECTION: ปรับขนาดให้เท่ากันและรองรับตัวเลขหลักสิบ/ร้อย */}
            <div className="grid grid-cols-2 gap-6 mt-12 relative z-10">
              
              {/* Box 1: Team Size */}
              <div className="bg-slate-50/80 p-8 rounded-[40px] border border-slate-100 flex flex-col justify-center min-h-[140px] hover:bg-white transition-colors">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Users size={18} className="text-blue-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Team Size</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-800 leading-none">
                    {branch.employees?.[0]?.count || 0}
                  </p>
                  <span className="text-sm font-black text-slate-400 uppercase">Staff</span>
                </div>
              </div>

              {/* Box 2: Operation Status */}
              <div className="bg-slate-50/80 p-8 rounded-[40px] border border-slate-100 flex flex-col justify-center min-h-[140px] hover:bg-white transition-colors">
                <div className="flex items-center gap-2 text-slate-400 mb-3">
                  <Package size={18} className="text-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Operation</span>
                </div>
                <p className="text-3xl font-black text-emerald-500 uppercase tracking-tight">
                  Active
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* พื้นที่ว่างด้านล่างเพื่อให้ Scroll แล้วไม่ติดขอบจอ */}
      <div className="h-20" />
    </div>
  )
}