'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { Search, Shield, Loader2, MapPin } from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // 👑 ลำดับสิทธิ์ (Admin = 1, Manager = 2, Staff = 3)
  const roleHierarchy: { [key: string]: number } = {
    'admin': 1,
    'manager': 2,
    'staff': 3
  }

  useEffect(() => {
    const initPage = async () => {
      setLoading(true)
      const savedUserId = localStorage.getItem('current_user_id')
      const { data: userData } = await supabase.from('employees').select('*').eq('id', savedUserId).single()
      
      // ✅ แก้ไข: อนุญาตให้ Manager (Level 2) เข้าใช้งานได้ด้วย
      if (!userData || roleHierarchy[userData.role] > 2) {
        router.push('/dashboard'); return
      }
      setCurrentUser(userData)

      const { data: empData } = await supabase.from('employees').select('*, branches(branch_name)').order('role', { ascending: true })
      if (empData) setEmployees(empData)
      setLoading(false)
    }
    initPage()
  }, [router])

  const filteredEmployees = employees.filter(emp => {
    const userRole = currentUser?.role
    const userLevel = roleHierarchy[userRole] || 99
    const targetLevel = roleHierarchy[emp.role] || 99

    // 🛡️ กฎการมองเห็นใหม่:
    // 1. ห้ามเห็น Admin เด็ดขาด (ถ้าคนดูไม่ใช่ Admin เอง)
    const isNotLookingAtAdmin = userRole === 'admin' ? true : emp.role !== 'admin'
    
    // 2. ระดับสิทธิ์ต้องเท่ากันหรือต่ำกว่า (Manager ห้ามเห็น Admin, Staff ห้ามเห็น Manager)
    const passHierarchy = targetLevel >= userLevel
    
    // 3. กฎสาขา: Admin เห็นหมด / Manager เห็นเฉพาะสาขาตัวเอง
    const passBranch = userRole === 'admin' ? true : emp.branch_id === currentUser.branch_id
    
    // 4. ค้นหาชื่อหรือ ID
    const matchesSearch = emp?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         emp?.login_id?.toLowerCase().includes(searchTerm.toLowerCase())

    return isNotLookingAtAdmin && passHierarchy && passBranch && matchesSearch
  })

    if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe] lg:ml-10">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">รายชื่อพนักงาน</h1>
        <p className="text-slate-500 text-sm">
          {currentUser?.role === 'admin' ? 'จัดการข้อมูลพนักงานทุกสาขา' : `รายชื่อพนักงาน - สาขา ${currentUser?.branches?.branch_name || ''}`}
        </p>
      </header>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ ID พนักงาน..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
            <tr className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] border-b-2 border-slate-100">
            <th className="pb-4 px-6">พนักงาน</th>
            <th className="pb-4 px-6">ตำแหน่ง / สาขา</th>
            <th className="pb-4 px-6 text-center">สิทธิ์</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => router.push(`/dashboard/employees/${emp.id}`)} 
                    className="group cursor-pointer hover:bg-slate-50/50 transition-all"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden">
                          {emp.avatar_url ? (
                            <img src={emp.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">{emp.full_name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{emp.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {emp.login_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm font-bold text-slate-600">{emp.position || 'Staff'}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10}/> {emp.branches?.branch_name || 'ไม่ระบุสาขา'}
                      </p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        emp.role === 'admin' ? 'bg-red-50 text-red-600' : 
                        emp.role === 'manager' ? 'bg-amber-50 text-amber-600' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-slate-400 font-bold">ไม่พบรายชื่อพนักงาน</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}