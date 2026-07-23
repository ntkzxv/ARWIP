'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase' 
import { 
  Zap, Banknote, RefreshCcw, CheckCircle2, 
  ArrowLeft, ChevronRight, User, Loader2,
  Smartphone, Users
} from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function PaymentTestPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [unpaidPayments, setUnpaidPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingCustomers, setFetchingCustomers] = useState(true)
  
  const [payMethod, setPayMethod] = useState<'cash' | 'transfer'>('transfer')

  // 1. ดึงรายชื่อลูกค้าเฉพาะคนที่มีบิลค้างชำระ (Pending)
  useEffect(() => {
    const fetchActiveCustomers = async () => {
      setFetchingCustomers(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id, 
            full_name, 
            id_card,
            installment_contracts!inner (
              id,
              installment_payments!inner (id, status)
            )
          `)
          .eq('installment_contracts.installment_payments.status', 'pending')

        if (error) throw error

        // กรองเอาเฉพาะ Unique Customers เพราะลูกค้า 1 คนอาจมีหลายสัญญา/หลายบิล
        const uniqueCustomers = data?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setCustomers(uniqueCustomers || [])
      } catch (e) {
        console.error('Fetch Customers Error:', e)
      } finally {
        setFetchingCustomers(false)
      }
    }
    fetchActiveCustomers()
  }, [])

  // 2. ดึงรายการงวดที่ค้างจ่ายของลูกค้าที่เลือก
  const fetchUnpaid = async (customerId: string) => {
    const { data, error } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_contracts!inner(
          customer_id, 
          sales_transactions (product_id)
        )
      `)
      .eq('installment_contracts.customer_id', customerId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
    
    setUnpaidPayments(data || [])
    if (error) console.error(error)
  }

  const handlePay = async (payment: any) => {
    if (!selectedCustomer) return;
    setLoading(true)
    try {
      const dateTag = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase(); 
      const bankRef = payMethod === 'transfer' ? `TRF-${dateTag}-${randomSuffix}` : `CASH-${dateTag}-${randomSuffix}`;

      await supabase.from('installment_payments').update({ 
        status: 'paid', 
        paid_at: new Date().toISOString(),
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: payMethod 
      }).eq('id', payment.id)

      await supabase.from('credit_history').insert({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.full_name,
        amount: payment.amount,
        type: 'topup',
        status: 'completed',
        bank_ref: bankRef,
        product_id: payment.installment_contracts?.sales_transactions?.product_id || 'N/A',
        installment_number: payment.installment_number,
        notes: `จ่ายผ่าน: ${payMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}`,
        created_at: new Date().toISOString()
      })

      Swal.fire({ title: 'สำเร็จ!', icon: 'success', timer: 1000, showConfirmButton: false })
      fetchUnpaid(selectedCustomer.id)
    } catch (e: any) { 
      Swal.fire('Error', e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Zap size={24} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Simulator</h1>
          </div>
          <Link href="/datacenter/dashboard" className="px-5 py-2.5 bg-white rounded-xl border font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Dashboard</Link>
        </div>

        {/* ส่วนแสดงรายชื่อลูกค้า (ถ้ายังไม่ได้เลือกใคร) */}
        {!selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Users size={20} className="text-slate-400" />
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">เลือกคนผ่อนที่ต้องการจ่ายเงิน</h2>
            </div>
            
            {fetchingCustomers ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={40} /></div>
            ) : customers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {customers.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setSelectedCustomer(c); fetchUnpaid(c.id); }} 
                    className="bg-white p-6 rounded-[30px] border border-slate-100 flex justify-between items-center cursor-pointer hover:border-indigo-500 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <User size={28} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-xl leading-none">{c.full_name}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">ID: {c.id_card}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">ติดผ่อน</span>
                      <ChevronRight className="text-slate-200 group-hover:text-indigo-500 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <p className="font-black text-slate-400 uppercase text-xs">ไม่มีลูกค้าค้างผ่อนในขณะนี้</p>
              </div>
            )}
          </div>
        )}

        {/* ส่วนแสดงบิล (เมื่อเลือกลูกค้าแล้ว) */}
        {selectedCustomer && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            {/* ปุ่มเปลี่ยนวิธีจ่าย */}
            <div className="bg-white p-4 rounded-[30px] shadow-lg border border-slate-100 flex gap-4">
              <button onClick={() => setPayMethod('transfer')} className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[22px] font-black uppercase text-xs transition-all ${payMethod === 'transfer' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                <Smartphone size={20} /> โอนเงิน
              </button>
              <button onClick={() => setPayMethod('cash')} className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[22px] font-black uppercase text-xs transition-all ${payMethod === 'cash' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                <Banknote size={20} /> เงินสด
              </button>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[45px] flex justify-between items-center shadow-xl">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Customer</p>
                <h2 className="text-3xl font-black">{selectedCustomer.full_name}</h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-[10px] font-black transition-all border border-white/5">กลับหน้าหลัก</button>
            </div>

            <div className="space-y-4">
              {unpaidPayments.length > 0 ? unpaidPayments.map((p) => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-sm hover:border-indigo-200 transition-all">
                  <div>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">฿{Number(p.amount).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">งวดที่ {p.installment_number} • {new Date(p.due_date).toLocaleDateString('th-TH')}</p>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => handlePay(p)}
                    className={`px-10 py-5 rounded-[25px] text-[12px] font-black uppercase shadow-lg transition-all active:scale-95 ${payMethod === 'transfer' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                  >
                    {loading ? '...' : `จ่ายด้วย${payMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}`}
                  </button>
                </div>
              )) : (
                <div className="bg-white p-24 rounded-[55px] text-center">
                  <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
                  <h4 className="text-2xl font-black text-slate-800">จ่ายครบถ้วนแล้ว</h4>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}