'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, MapPin, Loader2, RotateCcw, ChevronRight, Building2, ShieldCheck, CreditCard, Phone,
  Hash,
  ChevronDown,
  Check
} from 'lucide-react'

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
          sales_transactions (
            transaction_type
          )
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
  
  // 🚩 Logic สำหรับเช็ค "สด" หรือ "ผ่อน" จาก sales_transactions
  const transactions = cust.sales_transactions || [];
  let matchesInstallment = true;

  if (filterInstallment === 'active') {
    // เลือกคนที่มีรายการขายแบบ 'installment' อย่างน้อย 1 รายการ
    matchesInstallment = transactions.some((t: any) => t.transaction_type === 'installment');
  } else if (filterInstallment === 'none') {
    // เลือกคนที่มีรายการขายแบบ 'cash' อย่างน้อย 1 รายการ
    matchesInstallment = transactions.some((t: any) => t.transaction_type === 'cash');
  }

  return matchesSearch && matchesBranch && matchesCredit && matchesInstallment;
});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  return (
    <div className="space-y-6 pb-10 font-sans pl-30 pr-15">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            customers<span className="text-indigo-600"> list</span>
          </h1>
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.3em]">
            รายละเอียดข้อมูลลูกค้าทั้งหมด
          </p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/customers/add')}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-[1.5rem] font-black text-xs flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg uppercase active:scale-95"
        >
          <Plus size={18} /> เพิ่มลูกค้าใหม่
        </button>
      </header>

      {/* --- FILTERS --- */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
  
  {/* ส่วน Search Bar คงเดิมเป๊ะ */}
  <div className="lg:col-span-5 relative group">
    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
    <input type="text" placeholder="ค้นหาชื่อ หรือ เบอร์โทร..." className="w-full pl-14 pr-12 py-4 bg-slate-50 border-none rounded-2xl outline-none text-sm font-bold placeholder:text-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    {searchTerm && <button onClick={handleResetFilters} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><RotateCcw size={16} /></button>}
  </div>

  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-3">
    
    {/* --- Custom Dropdown: สาขา --- */}
    <CustomSelect 
      value={filterBranch} 
      onChange={setFilterBranch} 
      icon={Building2} 
      label="ทุกสาขา"
      options={branches.map(b => ({ value: b.id, label: b.branch_name }))}
    />

    {/* --- Custom Dropdown: ระดับเครดิต --- */}
    <CustomSelect 
      value={filterCredit} 
      onChange={setFilterCredit} 
      icon={ShieldCheck} 
      label="ระดับเครดิต"
      options={[
        { value: 'good', label: 'เกรดดี (80%+)' },
        { value: 'fair', label: 'เกรดปานกลาง' },
        { value: 'poor', label: 'เกรดต่ำ' }
      ]}
    />

    {/* --- Custom Dropdown: สถานะสัญญา --- */}
    <CustomSelect 
      value={filterInstallment} 
      onChange={setFilterInstallment} 
      icon={CreditCard} 
      label="สถานะสัญญา"
      options={[
        { value: 'active', label: 'มีสัญญาผ่อน' },
        { value: 'none', label: 'ซื้อสด' }
      ]}
    />
  </div>
</div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="py-8 px-10 border-b border-slate-100 w-[35%] text-center">Customer Identity</th>
                <th className="py-8 px-10 border-b border-slate-100 text-center">Contact</th>
                <th className="py-8 px-10 border-b border-slate-100 w-[35%] text-center">Location Details</th>
                <th className="py-8 px-10 border-b border-slate-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((cust) => {
                const credit = getCreditLevel(cust.credit_score);
                return (
                  <tr 
                    key={cust.id} 
                    onClick={() => router.push(`/dashboard/customers/${cust.id}`)} 
                    className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                  >
                    
                    {/* 1. Identity Column - เพิ่ม border-b แบ่งแถว */}
                    <td className="py-6 px-10 relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                      <div className="flex items-center gap-5 w-full">
                        <div className="w-14 h-14 bg-slate-100 rounded-[20px] flex items-center justify-center text-slate-400 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm border-none shrink-0 uppercase font-sans">
                          {cust.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-[17px] font-black text-slate-900 uppercase tracking-tighter leading-none truncate group-hover:text-indigo-600 transition-colors font-sans">
                            {cust.full_name}
                          </p>
                        </div>
                      </div>
                      {/* ขีดกั้นแนวตั้งสั้นๆ */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 group-hover:bg-indigo-200 transition-colors" />
                    </td>

                    {/* 2. Contact Column - เพิ่ม border-b แบ่งแถว */}
                    <td className="py-6 px-10 text-center relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                      <p className="text-slate-600 font-black text-[13px] uppercase tracking-[0.1em] leading-none font-sans">
                        {cust.phone || '-'}
                      </p>
                      {/* ขีดกั้นแนวตั้งสั้นๆ */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 group-hover:bg-indigo-200 transition-colors" />
                    </td>

                    {/* 3. Location Column - เพิ่ม border-b แบ่งแถว */}
                    <td className="py-6 px-10 relative border-b border-slate-50 group-hover:border-transparent transition-colors">
                      <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                        <p className="text-[12px] font-bold text-slate-600 uppercase tracking-tight truncate font-sans">
                          {cust.current_address || 'ไม่ระบุที่อยู่ปัจจุบัน'}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0 opacity-60">
                           <Hash size={10} className="text-indigo-400" />
                           <span className="text-[10.3px] font-black text-slate-500 uppercase tracking-wider italic leading-none truncate font-sans">
                             {cust.branches?.branch_name || 'Global'}
                           </span>
                        </div>
                      </div>
                      {/* ขีดกั้นแนวตั้งสั้นๆ */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-slate-200 group-hover:bg-indigo-200 transition-colors" />
                    </td>

                    {/* 4. Analysis Column - เพิ่ม border-b แบ่งแถว */}
                    <td className="py-6 px-10 text-center border-b border-slate-50 group-hover:border-transparent transition-colors">
                        <span className={`inline-block px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${credit.color} shadow-sm min-w-[100px] font-sans`}>
                          {credit.label}
                        </span>
                    </td>

                    {/* 5. Action Column - เพิ่ม border-b แบ่งแถว */}
                    <td className="py-6 px-10 text-right border-b border-slate-50 group-hover:border-transparent transition-colors">
                       <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-md transition-all">
                          <ChevronRight size={20} />
                       </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 🔧 Helper Component: CustomSelect (ก๊อปปี้ไปวางท้ายไฟล์ได้เลย)
function CustomSelect({ value, onChange, icon: Icon, label, options }: any) {
  const [isOpen, setIsOpen] = useState(false);
  
  // หา Label ของค่าที่เลือกอยู่
  const selectedOption = options.find((opt: any) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : label;

  return (
    <div className="relative group">
      {/* 🚩 หน้าตา ComboBox ตอนปิด (คงความสวยงามเดิมไว้) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-11 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-[12px] font-black uppercase outline-none text-slate-600 flex items-center justify-between hover:bg-slate-100 transition-all shadow-sm"
      >
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
        <span className="truncate pr-2">{displayLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 🚩 หน้าตา List ตอนกดเปิด (โค้งมน โมเดิร์น ลอยอยู่เหนือเนื้อหา) */}
      {isOpen && (
        <>
          {/* Overlay จางๆ เพื่อปิดเมื่อคลิกข้างนอก */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full mt-2 w-full bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* ตัวเลือกเริ่มต้น (Reset) */}
            <button 
              onClick={() => { onChange('all'); setIsOpen(false); }}
              className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase flex items-center justify-between ${value === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {label}
              {value === 'all' && <Check size={14} className="text-indigo-500" />}
            </button>
            
            {/* รายการตัวเลือกอื่นๆ */}
            {options.map((opt: any) => (
              <button 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase flex items-center justify-between ${value === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
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