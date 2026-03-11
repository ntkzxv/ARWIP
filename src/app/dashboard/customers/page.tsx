'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MapPin, ShieldCheck, AlertTriangle, 
  XCircle, Filter, Loader2, CreditCard, RotateCcw
} from 'lucide-react'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // States สำหรับการ Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBranch, setFilterBranch] = useState('all')
  const [filterCredit, setFilterCredit] = useState('all')
  const [filterInstallment, setFilterInstallment] = useState('all')

  // ✅ ฟังก์ชัน Reset Filter ทั้งหมด
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
    const matchesCredit = filterCredit === 'all' || cust.financial_status === filterCredit
    
    const hasActiveContract = (cust.installment_contracts?.[0]?.count || 0) > 0
    let matchesInstallment = true
    if (filterInstallment === 'active') matchesInstallment = hasActiveContract
    if (filterInstallment === 'none') matchesInstallment = !hasActiveContract

    return matchesSearch && matchesBranch && matchesCredit && matchesInstallment
  })

  const renderCreditBadge = (status: string) => {
    switch (status) {
      case 'good': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">เครดิตดี</span>
      case 'fair': return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">เครดิตปานกลาง</span>
      case 'poor': return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">เครดิตแย่</span>
      default: return <span className="text-slate-400 font-bold">-</span>
    }
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center lg:ml-10">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-8 p-6 md:p-10 lg:ml-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">รายชื่อลูกค้า</h1>
          <p className="text-slate-500 text-sm">จัดการข้อมูลลูกค้าและประวัติการผ่อนชำระแยกตามสาขา</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/customers/add')}
          className="bg-[#1e1e2d] text-white px-6 py-3 rounded-[18px] font-black text-xs flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 uppercase"
        >
          <Plus size={18} /> เพิ่มลูกค้าใหม่
        </button>
      </header>

      {/* --- FILTER SECTION --- */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          
          {/* ค้นหาชื่อ + ปุ่ม Reset */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ เบอร์โทร..."
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* 🔄 ปุ่ม Reset Filter */}
            {(searchTerm || filterBranch !== 'all' || filterCredit !== 'all' || filterInstallment !== 'all') && (
              <button 
                onClick={handleResetFilters}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                title="ล้างตัวกรอง"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-[60%]">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold appearance-none text-slate-600"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="all">ทุกสาขา</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold appearance-none text-slate-600"
                value={filterCredit}
                onChange={(e) => setFilterCredit(e.target.value)}
              >
                <option value="all">ระดับทั้งหมด</option>
                <option value="good">เครดิตดี</option>
                <option value="fair">เครดิตปานกลาง</option>
                <option value="poor">เครดิตแย่</option>
              </select>
            </div>

            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold appearance-none text-slate-600"
                value={filterInstallment}
                onChange={(e) => setFilterInstallment(e.target.value)}
              >
                <option value="all">ทั้งหมด</option>
                <option value="active">ลูกค้าที่มีสัญญาผ่อน</option>
                <option value="none">ลูกค้าซื้อเงินสด</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] border-b-2 border-slate-100">
                <th className="pb-4 px-6">ลูกค้า</th>
                <th className="pb-4 px-6">สาขา / สัญญา</th>
                <th className="pb-4 px-6 text-center">ระดับเครดิต</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => router.push(`/dashboard/customers/${cust.id}`)}
                    className="group cursor-pointer hover:bg-slate-50/50 transition-all"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                          <span className="text-lg">{cust.full_name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{cust.full_name}</p>
                          <p className="text-[11px] text-slate-400 font-bold tracking-tight">
                            {cust.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm font-bold text-slate-600 leading-tight">{cust.branches?.branch_name || 'ไม่ระบุสาขา'}</p>
                      <p className="text-[10px] text-blue-500 flex items-center gap-1 font-black uppercase tracking-tighter">
                        <CreditCard size={10}/> สัญญา: {cust.installment_contracts?.[0]?.count || 0}
                      </p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {renderCreditBadge(cust.financial_status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-slate-400 font-bold italic">ไม่พบรายชื่อลูกค้าที่ค้นหา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}