'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MapPin, RotateCcw, ChevronRight, Building2, ShieldCheck, CreditCard,
  Hash, ChevronDown, Check
} from 'lucide-react'

// --- HELPER FUNCTIONS ---
const getCreditLevel = (score: number) => {
  const s = score || 50;
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
        .select(`
          *, 
          branches(branch_name), 
          sales_transactions (transaction_type)
        `)
        .order('full_name', { ascending: true })
      
      const { data: branchData } = await supabase.from('branches').select('*')
      if (custData) setCustomers(custData)
      if (branchData) setBranches(branchData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cust.phone?.includes(searchTerm);
    const matchesBranch = filterBranch === 'all' || cust.home_branch_id === filterBranch;
    
    let matchesCredit = true;
    if (filterCredit !== 'all') {
        const score = cust.credit_score || 50;
        if (filterCredit === 'good') matchesCredit = score >= 80;
        if (filterCredit === 'fair') matchesCredit = score >= 50 && score < 80;
        if (filterCredit === 'poor') matchesCredit = score < 50;
    }
    
    const transactions = cust.sales_transactions || [];
    let matchesInstallment = true;
    if (filterInstallment === 'active') {
      matchesInstallment = transactions.some((t: any) => t.transaction_type === 'installment');
    } else if (filterInstallment === 'none') {
      matchesInstallment = transactions.some((t: any) => t.transaction_type === 'cash');
    }

    return matchesSearch && matchesBranch && matchesCredit && matchesInstallment;
  });

  return (
    /* 🚩 แก้ไข: ลบ pl-30 pr-15 ออก เปลี่ยนเป็น Responsive Padding (p-4 sm:p-6 lg:p-8) พร้อม min-w-0 */
    <div className="w-full min-w-0 space-y-6 pb-10 font-sans bg-[#F4F7FE] min-h-screen">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-in fade-in duration-700">
        <div className="space-y-1">
          {/* ลบ italic เพื่อให้อ่านง่ายและเรียบหรูขึ้น */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase leading-none">
            CUSTOMERS<span className="text-indigo-600"> LIST</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            TOTAL CUSTOMER INTELLIGENCE DATABASE
          </p>
        </div>
        <button 
          onClick={() => router.push('/datacenter/customers/add')}
          className="w-full sm:w-auto bg-slate-900 text-white px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg uppercase active:scale-95"
        >
          <Plus size={18} /> เพิ่มลูกค้าใหม่
        </button>
      </header>

      {/* --- FILTERS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm animate-in fade-in delay-100">
        <div className="lg:col-span-5 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ หรือ เบอร์โทร..." 
            className="w-full pl-14 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl outline-none text-sm font-semibold placeholder:text-slate-300" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {searchTerm && (
            <button onClick={handleResetFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
              <RotateCcw size={16} />
            </button>
          )}
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CustomSelect value={filterBranch} onChange={setFilterBranch} icon={Building2} label="ทุกสาขา" options={branches.map(b => ({ value: b.id, label: b.branch_name }))} />
          <CustomSelect value={filterCredit} onChange={setFilterCredit} icon={ShieldCheck} label="ระดับเครดิต" options={[{ value: 'good', label: 'เกรดดี (80%+)' }, { value: 'fair', label: 'เกรดปานกลาง' }, { value: 'poor', label: 'เกรดต่ำ' }]} />
          <CustomSelect value={filterInstallment} onChange={setFilterInstallment} icon={CreditCard} label="สถานะสัญญา" options={[{ value: 'active', label: 'มีสัญญาผ่อน' }, { value: 'none', label: 'ซื้อสด' }]} />
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden min-h-[500px] flex flex-col transition-all duration-700">
        {loading ? (
          <SkeletonCustomerTable rows={8} />
        ) : (
          /* 🚩 ครอบด้วย w-full overflow-x-auto เพื่อรองรับการสไลด์ในจอเล็กไม่ให้ขอบแตก */
          <div className="w-full overflow-x-auto animate-in fade-in duration-500">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50">
                  <th className="py-6 px-6 sm:px-8 border-b border-slate-100 min-w-[220px]">Customer Identity</th>
                  <th className="py-6 px-6 sm:px-8 border-b border-slate-100 text-center min-w-[140px]">Contact</th>
                  <th className="py-6 px-6 sm:px-8 border-b border-slate-100 min-w-[240px]">Location Details</th>
                  <th className="py-6 px-6 sm:px-8 border-b border-slate-100 text-center min-w-[120px]">Analysis</th>
                  <th className="py-6 px-6 sm:px-8 border-b border-slate-100 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map((cust) => {
                  const credit = getCreditLevel(cust.credit_score);
                  return (
                    <tr 
                      key={cust.id} 
                      onClick={() => router.push(`/datacenter/customers/${cust.id}`)} 
                      className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                    >
                      {/* 1. Identity */}
                      <td className="py-5 px-6 sm:px-8 relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-extrabold group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0 uppercase text-base">
                            {cust.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* 🚩 ใส่ whitespace-nowrap ป้องกันตัวหนังสือตัดลงแนวตั้ง */}
                            <p className="text-base font-bold text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                              {cust.full_name}
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-100 group-hover:bg-indigo-200 transition-colors hidden sm:block" />
                      </td>

                      {/* 2. Contact */}
                      <td className="py-5 px-6 sm:px-8 text-center relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                        <p className="text-slate-600 font-bold text-sm tracking-wide leading-none whitespace-nowrap">
                          {cust.phone || '-'}
                        </p>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-100 group-hover:bg-indigo-200 transition-colors hidden sm:block" />
                      </td>

                      {/* 3. Location */}
                      <td className="py-5 px-6 sm:px-8 relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                        <div className="flex flex-col gap-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-600 truncate max-w-[200px]">
                            {cust.current_address || 'ไม่ระบุที่อยู่ปัจจุบัน'}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-70">
                             <Hash size={11} className="text-indigo-500" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                               {cust.branches?.branch_name || 'Global'}
                             </span>
                          </div>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-100 group-hover:bg-indigo-200 transition-colors hidden sm:block" />
                      </td>

                      {/* 4. Analysis Badge */}
                      <td className="py-5 px-6 sm:px-8 text-center border-b border-slate-50 group-hover:border-transparent transition-colors">
                          <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${credit.color} shadow-sm min-w-[90px] whitespace-nowrap`}>
                            {credit.label}
                          </span>
                      </td>

                      {/* 5. Chevron Button */}
                      <td className="py-5 px-6 sm:px-8 text-right border-b border-slate-50 group-hover:border-transparent transition-colors">
                         <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md transition-all">
                            <ChevronRight size={18} />
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
    </div>
  )
}

// Skeleton Component
function SkeletonCustomerTable({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="grid grid-cols-5 gap-4 p-6 bg-slate-50/50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-2 bg-slate-200 rounded-full w-20"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-8 p-6 border-b border-slate-50">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl shrink-0"></div>
          <div className="flex-1 space-y-2">
             <div className="h-3.5 bg-slate-100 rounded-lg w-40"></div>
             <div className="h-2 bg-slate-50 rounded-full w-20"></div>
          </div>
          <div className="h-3 bg-slate-50 rounded-full w-28"></div>
          <div className="flex-1 h-3 bg-slate-50 rounded-full w-36"></div>
          <div className="w-20 h-7 bg-slate-50 rounded-xl shrink-0"></div>
        </div>
      ))}
    </div>
  )
}

function CustomSelect({ value, onChange, icon: Icon, label, options }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt: any) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : label;

  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl text-[11px] font-bold uppercase outline-none text-slate-600 flex items-center justify-between hover:bg-slate-100 transition-all shadow-sm"
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
        <span className="truncate pr-2">{displayLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { onChange('all'); setIsOpen(false); }} 
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-between ${value === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {label}
              {value === 'all' && <Check size={14} className="text-indigo-500" />}
            </button>
            {options.map((opt: any) => (
              <button 
                key={opt.value} 
                onClick={() => { onChange(opt.value); setIsOpen(false); }} 
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-between ${value === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-indigo-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}