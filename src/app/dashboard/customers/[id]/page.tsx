'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, MapPin, Briefcase, Phone, 
  CreditCard, ShieldCheck, History, Users, Calendar, 
  ChevronRight, BadgeDollarSign, Mail
} from 'lucide-react'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFullDetail = async () => {
      setLoading(true)
      // 1. ดึงข้อมูลลูกค้า + สาขา
      const { data: custData } = await supabase
        .from('customers')
        .select(`*, branches(branch_name)`)
        .eq('id', id)
        .single()

      // 2. ดึงสัญญาผ่อน + ข้อมูลผู้ค้ำ + รายการขาย
      const { data: contractData } = await supabase
        .from('installment_contracts')
        .select(`
          *,
          sales_transactions(product_name, unit_price, employee_id, employees(full_name)),
          guarantors(*)
        `)
        .eq('customer_id', id)

      if (custData) setCustomer(custData)
      if (contractData) setContracts(contractData)
      setLoading(false)
    }
    fetchFullDetail()
  }, [id])

  if (loading) return <div className="p-20 text-center font-bold">กำลังดึงข้อมูลเชิงลึก...</div>
  if (!customer) return <div className="p-20 text-center font-bold text-red-500">ไม่พบข้อมูลลูกค้าท่านนี้</div>

  return (
    <div className="p-6 md:p-10 lg:ml-10 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Profile</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID: {customer.id_card}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 💳 Left Column: ข้อมูลส่วนตัวและเครดิต */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[30px] flex items-center justify-center text-4xl font-black mb-4 shadow-xl shadow-blue-100">
                {customer.full_name?.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-slate-800">{customer.full_name}</h2>
              <p className="text-blue-600 font-bold text-sm mb-6 uppercase tracking-tighter">@{customer.line_id || 'no-line'}</p>
              
              <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] ${
                customer.financial_status === 'good' ? 'bg-emerald-50 text-emerald-600' : 
                customer.financial_status === 'fair' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                Credit Status: {customer.financial_status}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">Contact & Work</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl text-blue-500"><Phone size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Phone</p><p className="text-sm font-bold text-slate-700">{customer.phone}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl text-orange-500"><Briefcase size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Workplace</p><p className="text-sm font-bold text-slate-700">{customer.work_place}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-xl text-emerald-500"><MapPin size={18}/></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase">Address</p><p className="text-sm font-bold text-slate-700 leading-relaxed">{customer.current_address}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Right Column: สัญญาผ่อนและผู้ค้ำ */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#1e1e2d] rounded-[45px] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <BadgeDollarSign className="text-blue-400" size={32} />
                   <h2 className="text-2xl font-black italic">Active Contracts</h2>
                </div>
                
                {contracts.length > 0 ? (
                  contracts.map((con) => (
                    <div key={con.id} className="bg-white/5 rounded-[30px] p-8 border border-white/10 space-y-8 mb-6">
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Product</p>
                            <h4 className="text-2xl font-black">{con.sales_transactions?.product_name}</h4>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Remaining</p>
                             <p className="text-2xl font-black text-emerald-400">฿{Number(con.total_loan_amount).toLocaleString()}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                          <div><p className="text-[9px] font-bold text-slate-500 uppercase">Term</p><p className="font-black">{con.period_months} Months</p></div>
                          <div><p className="text-[9px] font-bold text-slate-500 uppercase">Monthly</p><p className="font-black text-blue-400">฿{Number(con.monthly_payment).toLocaleString()}</p></div>
                          <div><p className="text-[9px] font-bold text-slate-500 uppercase">Due Day</p><p className="font-black">Every {con.due_day}th</p></div>
                       </div>

                       {/* 🛡️ ผู้ค้ำประกัน (Guarantor) */}
                       {con.guarantors && (
                         <div className="bg-white/5 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-default">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center"><Users size={18}/></div>
                               <div>
                                  <p className="text-[9px] font-bold text-slate-500 uppercase">Guarantor</p>
                                  <p className="text-sm font-black">{con.guarantors.full_name} ({con.guarantors.relationship})</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{con.guarantors.phone}</p>
                               </div>
                            </div>
                            <div className="text-right hidden md:block">
                               <p className="text-[9px] font-bold text-slate-500 uppercase">ID Card</p>
                               <p className="text-[10px] font-black text-slate-300">{con.guarantors.id_card}</p>
                            </div>
                         </div>
                       )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 font-bold italic">ยังไม่มีประวัติการทำสัญญาผ่อนชำระ</p>
                )}
             </div>
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>

      </div>
    </div>
  )
}