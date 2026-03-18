'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { MapPin, Store, Loader2, Users, Package } from 'lucide-react'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      // ไม่ต้อง setLoading(true) ทุกครั้งถ้ามีข้อมูลเก่าอยู่แล้ว (ช่วยให้กดกลับมาแล้วเห็นทันที)
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*, employees(count)')
          .order('branch_code', { ascending: true })
          .limit(10) // ดึงข้อมูลเผื่อไว้

        if (data) setBranches(data)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBranches()
  }, [])

  return (
    <div className="p-6 md:p-12 lg:ml-16 space-y-12 min-h-screen">
      
      {/* --- HEADER --- */}
      <header className="max-w-6xl mx-auto animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            branch<span className="text-indigo-600">units</span>
          </h1>
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Branch Information System
          </p>
        </div>
      </header>

      {/* --- GRID AREA --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-6xl mx-auto">
        
        {/* 🚩 ถ้ากำลังโหลด และยังไม่มีข้อมูล ให้โชว์ Skeleton (โครงร่างเทา) */}
        {loading && branches.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          // 🚩 ถ้าข้อมูลมาแล้ว หรือมีข้อมูลเดิมอยู่ ให้โชว์ Card จริง
          branches.map((branch) => (
            <div 
              key={branch.id} 
              className="bg-white rounded-[50px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {/* เนื้อหา Card เดิมของคุณ... (Copy ของเดิมมาวางตรงนี้ได้เลย) */}
              <div className="flex justify-between items-start mb-10">
                <div className="w-20 h-20 bg-[#1e1e2d] text-white rounded-[30px] flex items-center justify-center shadow-xl">
                  <Store size={32} />
                </div>
                <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] border border-blue-100 italic">
                  {branch.branch_code}
                </span>
              </div>
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none uppercase">
                  {branch.branch_name}
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin size={20} className="text-blue-500" />
                  <span className="text-base font-bold italic">{branch.location || 'BANGKOK, TH'}</span>
                </div>
              </div>
              {/* Stats Box... */}
              <div className="grid grid-cols-2 gap-6 mt-12 relative z-10">
                <StatBox icon={Users} label="Team Size" value={branch.employees?.[0]?.count || 0} unit="Staff" color="blue" />
                <StatBox icon={Package} label="Operation" value="Active" unit="" color="emerald" isStatus />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 🚩 Component สำหรับ "โครงร่างปลอม" (Skeleton)
function SkeletonCard() {
  return (
    <div className="bg-white rounded-[50px] p-10 border border-slate-50 shadow-sm min-h-[420px] animate-pulse">
      <div className="flex justify-between mb-10">
        <div className="w-20 h-20 bg-slate-100 rounded-[30px]" />
        <div className="w-24 h-8 bg-slate-50 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <div className="w-3/4 h-12 bg-slate-100 rounded-2xl" />
        <div className="w-1/2 h-6 bg-slate-50 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="h-32 bg-slate-50 rounded-[40px]" />
        <div className="h-32 bg-slate-50 rounded-[40px]" />
      </div>
    </div>
  )
}

// แยก StatBox ออกมาเพื่อความสะอาดของโค้ด
function StatBox({ icon: Icon, label, value, unit, color, isStatus }: any) {
    const colors: any = {
        blue: 'text-blue-500',
        emerald: 'text-emerald-500'
    }
    return (
        <div className="bg-slate-50/80 p-8 rounded-[40px] border border-slate-100 flex flex-col justify-center min-h-[140px] hover:bg-white transition-colors group">
            <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Icon size={18} className={colors[color]} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <p className={`font-black leading-none ${isStatus ? 'text-3xl ' + colors[color] : 'text-4xl text-slate-800'}`}>
                    {value}
                </p>
                {unit && <span className="text-sm font-black text-slate-400 uppercase italic">{unit}</span>}
            </div>
        </div>
    )
}