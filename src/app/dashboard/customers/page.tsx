'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MapPin, ShieldCheck, AlertTriangle, 
  XCircle, Filter, Loader2, CreditCard, RotateCcw
} from 'lucide-react'

// ✅ 1. ย้ายฟังก์ชันมาไว้ตรงนี้เพื่อให้เรียกใช้ได้ทั่วไฟล์
const getCreditLevel = (score: number) => {
  const s = score || 50; // ถ้าไม่มีคะแนนให้ตั้งเป็น 50 (ปานกลาง)
  if (s >= 90) return { label: 'ดีเยี่ยม', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  if (s >= 80) return { label: 'ดี', color: 'bg-green-50 text-green-600 border-green-100' };
  if (s >= 70) return { label: 'ค่อนข้างดี', color: 'bg-lime-50 text-lime-600 border-lime-100' };
  if (s >= 50) return { label: 'ปานกลาง', color: 'bg-blue-50 text-blue-600 border-blue-100' };
  if (s >= 40) return { label: 'ต่ำ', color: 'bg-orange-50 text-orange-600 border-orange-100' };
  if (s >= 20) return { label: 'เสี่ยง', color: 'bg-red-50 text-red-500 border-red-100' };
  return { label: 'แย่', color: 'bg-red-100 text-red-700 border-red-200' };
};

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterCredit, setFilterCredit] = useState('all')
  const [filterInstallment, setFilterInstallment] = useState('all')

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterBranch('all')
    setFilterCredit('all')
    setFilterInstallment('all')
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: custData } = await supabase
        .from('customers')
        .select(`*, branches(branch_name), installment_contracts(count)`)
        .order('full_name', { ascending: true })
      
      const { data: branchData } = await supabase.from('branches').select('*')

      if (custData) setCustomers(custData)
      if (branchData) setBranches(branchData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || cust.phone.includes(searchTerm)
    const matchesBranch = filterBranch === 'all' || cust.home_branch_id === filterBranch
    
    // ✅ กรองตามคะแนนเครดิต (ถ้าคุณต้องการกรองตามช่วงคะแนน)
    let matchesCredit = true
    if (filterCredit !== 'all') {
        const score = cust.credit_score || 50
        if (filterCredit === 'good') matchesCredit = score >= 80
        if (filterCredit === 'fair') matchesCredit = score >= 50 && score < 80
        if (filterCredit === 'poor') matchesCredit = score < 50
    }
    
    const hasActiveContract = (cust.installment_contracts?.[0]?.count || 0) > 0
    let matchesInstallment = true
    if (filterInstallment === 'active') matchesInstallment = hasActiveContract
    if (filterInstallment === 'none') matchesInstallment = !hasActiveContract

    return matchesSearch && matchesBranch && matchesCredit && matchesInstallment
  })

  // ✅ 2. แก้ไขฟังก์ชันแสดง Badge ให้ดึงข้อมูลจาก getCreditLevel
  const renderCreditBadge = (score: number) => {
    const credit = getCreditLevel(score);
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${credit.color}`}>
          {credit.label}
        </span>
        <span className="text-[9px] text-slate-400 font-bold">{score || 50}%</span>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe] lg:ml-10">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-8 p-6 md:p-10 lg:ml-10 font-sans">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">รายชื่อลูกค้า</h1>
          <p className="text-slate-500 text-sm">จัดการข้อมูลลูกค้าและ Credit Scoring</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/customers/add')}
          className="bg-[#1e1e2d] text-white px-6 py-3 rounded-[18px] font-black text-xs flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg uppercase"
        >
          <Plus size={18} /> เพิ่มลูกค้าใหม่
        </button>
      </header>

      {/* --- FILTER SECTION --- */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(searchTerm || filterBranch !== 'all' || filterCredit !== 'all' || filterInstallment !== 'all') && (
              <button onClick={handleResetFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><RotateCcw size={18} /></button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-[60%]">
            <select className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                <option value="all">ทุกสาขา</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
            </select>

            <select className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={filterCredit} onChange={(e) => setFilterCredit(e.target.value)}>
                <option value="all">ระดับเครดิตทั้งหมด</option>
                <option value="good">เกรดดี (80%+)</option>
                <option value="fair">เกรดปานกลาง (50%+)</option>
                <option value="poor">เกรดต่ำ (ต่ำกว่า 50)</option>
            </select>

            <select className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={filterInstallment} onChange={(e) => setFilterInstallment(e.target.value)}>
                <option value="all">สถานะสัญญา: ทั้งหมด</option>
                <option value="active">มีสัญญาผ่อน</option>
                <option value="none">ซื้อสด</option>
            </select>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] border-b-2 border-slate-100">
                <th className="pb-4 px-6">ลูกค้า</th>
                <th className="pb-4 px-6">สาขา</th>
                <th className="pb-4 px-6 text-center">ระดับเครดิต (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((cust) => (
                <tr 
                  key={cust.id} 
                  onClick={() => router.push(`/dashboard/customers/${cust.id}`)}
                  className="group cursor-pointer hover:bg-slate-50/50 transition-all"
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {cust.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{cust.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-bold">{cust.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-sm font-bold text-slate-600">{cust.branches?.branch_name || '-'}</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    {/* ✅ 3. ส่งค่า credit_score เข้าไปแสดงผล */}
                    {renderCreditBadge(cust.credit_score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}