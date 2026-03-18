'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, MapPin, UserCircle, 
  ChevronDown, Lock, Building2,
  Loader2
} from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [isBranchOpen, setIsBranchOpen] = useState(false)

  const roleHierarchy: { [key: string]: number } = { 'admin': 1, 'supervisor': 2, 'manager': 3, 'staff': 4 }

  const fetchEmployees = async () => {
    const { data: empData } = await supabase.from('employees').select('*, branches(branch_name)')
    if (empData) {
      const dataWithTimestamp = empData.map(emp => ({
        ...emp,
        avatar_url: emp.avatar_url ? `${emp.avatar_url}?t=${Date.now()}` : null
      }))
      const sortedData = [...dataWithTimestamp].sort((a, b) => (roleHierarchy[a.role] || 99) - (roleHierarchy[b.role] || 99))
      setEmployees(sortedData)
    }
  }

  useEffect(() => {
    const initPage = async () => {
      setLoading(true)
      const savedUserId = localStorage.getItem('current_user_id')
      const { data: userData } = await supabase.from('employees').select('*, branches(branch_name)').eq('id', savedUserId).single()
      
      if (!userData || roleHierarchy[userData.role] > 3) {
        router.push('/datacenter/dashboard'); return
      }
      setCurrentUser(userData)
      await fetchEmployees()
      const { data: branchData } = await supabase.from('branches').select('*')
      if (branchData) setBranches(branchData)
      setLoading(false)
    }
    initPage()

    const channel = supabase
      .channel('employee-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        fetchEmployees()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  const filteredEmployees = employees.filter(emp => {
    const userRole = currentUser?.role?.toLowerCase();
    const isHighLevel = userRole === 'admin' || userRole === 'supervisor';
    const isNotLookingAtAdmin = userRole === 'admin' ? true : emp.role?.toLowerCase() !== 'admin';
    const passHierarchy = (roleHierarchy[emp.role?.toLowerCase()] || 99) >= (roleHierarchy[userRole] || 99);
    const passBranchFilter = selectedBranch === 'all' ? true : emp.branch_id === selectedBranch;
    const passBranchAccess = isHighLevel ? true : emp.branch_id === currentUser.branch_id;
    const matchesSearch = emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp?.login_id?.toLowerCase().includes(searchTerm.toLowerCase());

    return isNotLookingAtAdmin && passHierarchy && passBranchFilter && passBranchAccess && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10 font-sans pl-30 pr-15 bg-[#F4F7FE] min-h-screen">
      
      {/* --- HEADER (Show Instantly) --- */}
      <header className="flex justify-between items-center shrink-0 animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            employees<span className="text-indigo-600"> list</span>
          </h1>
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Personnel Intelligence Directory
          </p>
        </div>
      </header>

      {/* --- FILTERS (Show Instantly) --- */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0 animate-in fade-in delay-100">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, ID or position..." 
            className="w-full pl-14 pr-6 py-5 bg-white border-none rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-bold shadow-sm shadow-slate-200/50 italic" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="relative w-full md:w-72">
          <button 
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="w-full bg-white px-6 py-5 rounded-[24px] shadow-sm shadow-slate-200/50 flex items-center justify-between group hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-indigo-600" />
              <span className="text-sm font-black uppercase italic tracking-tighter text-slate-700">
                {selectedBranch === 'all' ? 'All Branches' : branches.find(b => b.id === selectedBranch)?.branch_name}
              </span>
            </div>
            <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 ${isBranchOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBranchOpen && (
            <div className="absolute top-full mt-3 w-full bg-white rounded-[24px] shadow-2xl shadow-slate-200 border border-slate-50 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => { setSelectedBranch('all'); setIsBranchOpen(false); }} className="w-full px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">All Branches</button>
              {branches.map(b => (
                <button key={b.id} onClick={() => { setSelectedBranch(b.id); setIsBranchOpen(false); }} className="w-full px-6 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">{b.branch_name}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-100/50 flex-1 flex flex-col overflow-hidden relative min-h-[500px]">
        {loading ? (
          <SkeletonEmployeeTable rows={6} />
        ) : (
          <div className="overflow-y-auto flex-1 custom-scrollbar animate-in fade-in duration-500">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                  <th className="py-8 px-10 border-b border-slate-50">Identity Info</th>
                  <th className="py-8 px-10 border-b border-slate-50">Role & Branch</th>
                  <th className="py-8 px-10 text-center border-b border-slate-50">System Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((emp) => {
                  const isReadOnly = currentUser?.role === 'supervisor';
                  return (
                    <tr key={emp.id} onClick={() => !isReadOnly && router.push(`/datacenter/employees/${emp.id}`)} className={`group transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-indigo-50/30'}`}>
                      <td className="py-6 px-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-[22px] bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner border-2 border-white transition-all group-hover:shadow-lg ${!isReadOnly && 'group-hover:border-indigo-600'}`}>
                            {emp.avatar_url ? <img src={emp.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle size={28} className="text-slate-300" />}
                          </div>
                          <div>
                            <p className="text-[15px] font-black text-slate-900 uppercase italic tracking-tighter leading-none">{emp.full_name}</p>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] mt-2">ID: {emp.login_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-10">
                        <div className="space-y-1.5 italic">
                          <p className="text-[11px] font-black text-slate-700 uppercase leading-none">{emp.position || 'Standard Staff'}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tight">
                            <MapPin size={12} className="text-indigo-400" /> {emp.branches?.branch_name || 'Global'}
                          </p>
                        </div>
                      </td>
                      <td className="py-6 px-10 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border italic ${
                          emp.role === 'admin' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          emp.role === 'supervisor' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
                          emp.role === 'manager' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}>
                          {isReadOnly && <Lock size={10} className="text-slate-300" />}
                          <span className="text-[9px] font-black uppercase tracking-widest">{emp.role}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 2px solid white; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
      `}</style>
    </div>
  )
}

// 🚩 Component สำหรับ Skeleton พนักงาน
function SkeletonEmployeeTable({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="flex gap-10 p-10 bg-slate-50/50">
        <div className="h-2 bg-slate-200 rounded-full w-32"></div>
        <div className="h-2 bg-slate-200 rounded-full w-32"></div>
        <div className="h-2 bg-slate-200 rounded-full w-32 ml-auto"></div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-10 p-8 border-b border-slate-50">
          <div className="w-16 h-16 bg-slate-100 rounded-[22px] shrink-0"></div>
          <div className="flex-1 space-y-3">
             <div className="h-4 bg-slate-100 rounded-lg w-48"></div>
             <div className="h-2 bg-slate-50 rounded-full w-24"></div>
          </div>
          <div className="flex-1 space-y-2">
             <div className="h-3 bg-slate-50 rounded-full w-32"></div>
             <div className="h-2 bg-slate-50 rounded-full w-20"></div>
          </div>
          <div className="w-24 h-9 bg-slate-50 rounded-xl shrink-0"></div>
        </div>
      ))}
    </div>
  )
}