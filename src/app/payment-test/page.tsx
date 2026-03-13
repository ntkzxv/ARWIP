'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase' 

import { 
  Zap, Search, Banknote, RefreshCcw, 
  CheckCircle2, AlertCircle, ArrowLeft, 
  ChevronRight, User, Loader2, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function PaymentTestPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [unpaidPayments, setUnpaidPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // 1. ค้นหาลูกค้า
  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,id_card.ilike.%${searchTerm}%`)
    
    if (error) console.error('Search Error:', error)
    setCustomers(data || [])
    setSelectedCustomer(null)
    setIsSearching(false)
  }

  // 2. ดึงรายการงวดที่ค้างจ่าย (แก้ไขให้ดึงรหัสสินค้ามาด้วย ✨)
  const fetchUnpaid = async (customerId: string) => {
    const { data, error } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_contracts!inner(
          customer_id, 
          contract_status,
          sales_transactions (
            product_id
          )
        )
      `)
      .eq('installment_contracts.customer_id', customerId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
    
    if (error) console.error('Fetch Error:', error)
    setUnpaidPayments(data || [])
  }

  // 3. ฟังก์ชันจำลองการจ่ายเงิน (เชื่อมข้อมูลข้าม Table ✨)
  const handlePay = async (payment: any) => {
    if (!selectedCustomer) return;
    setLoading(true)
    
    try {
      // สุ่มเลขบิลธนาคาร
      const dateTag = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase(); 
      const bankRef = `BNK-${dateTag}-${randomSuffix}`;

      // Step A: อัปเดตสถานะงวดบิลในตารางจ่ายเงิน
      const { error: payError } = await supabase
        .from('installment_payments')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString(),
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', payment.id)

      if (payError) throw payError

      // Step B: บันทึกลง credit_history (เชื่อมข้อมูลจาก payment ไปใส่ ✨)
      const { error: historyErr } = await supabase
        .from('credit_history')
        .insert({
          customer_id: selectedCustomer.id,
          customer_name: selectedCustomer.full_name,
          amount: payment.amount,
          type: 'topup',
          status: 'completed',
          staff_id: null,
          bank_ref: bankRef,
          // ดึง product_id จากก้อนที่ Join มาใส่ในตารางใหม่
          product_id: payment.installment_contracts?.sales_transactions?.product_id || 'N/A',
          // ดึงเลขงวดมาใส่
          installment_number: payment.installment_number,
          created_at: new Date().toISOString()
        })
      
      if (historyErr) throw historyErr

      // Step C: ตรวจสอบเพื่อปิดสัญญา
      const { data: remaining } = await supabase
        .from('installment_payments')
        .select('id')
        .eq('contract_id', payment.contract_id)
        .eq('status', 'pending')

      if (!remaining || remaining.length === 0) {
        await supabase
          .from('installment_contracts')
          .update({ contract_status: 'completed' })
          .eq('id', payment.contract_id)
      }
      
      Swal.fire({
        title: 'จ่ายเงินสำเร็จ!',
        html: `บันทึกประวัติเรียบร้อย<br><small class="text-slate-400 font-mono">${bankRef}</small>`,
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      })

      fetchUnpaid(selectedCustomer.id)
      
    } catch (e: any) { 
      console.error(e)
      Swal.fire('Error', e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // 4. ฟังก์ชัน Reset (สำหรับเทส)
  const handleReset = async (contractId: string) => {
    const result = await Swal.fire({
      title: 'Reset ข้อมูล?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน'
    })

    if (!result.isConfirmed) return;
    
    setLoading(true)
    try {
      await supabase.from('installment_payments').update({ status: 'pending', paid_at: null, paid_date: null }).eq('contract_id', contractId)
      await supabase.from('installment_contracts').update({ contract_status: 'active' }).eq('id', contractId)
      await supabase.from('credit_history').delete().eq('customer_id', selectedCustomer.id)
      fetchUnpaid(selectedCustomer.id)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <CreditCard size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Simulator</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Database Bridge Connector</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white transition-all font-black text-xs uppercase tracking-widest">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-2 rounded-[35px] shadow-xl flex gap-2 border border-slate-50">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า หรือ เลขบัตรประชาชน..."
            className="flex-1 px-8 py-5 bg-transparent font-bold text-slate-700 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-10 bg-indigo-600 text-white font-black rounded-[25px] uppercase text-xs hover:bg-indigo-700 transition-all"
          >
            {isSearching ? <Loader2 className="animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* List Customers */}
        {!selectedCustomer && customers.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedCustomer(c); fetchUnpaid(c.id); }} 
                className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center cursor-pointer hover:border-indigo-500 hover:shadow-2xl transition-all group"
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
                <ChevronRight className="text-slate-200 group-hover:text-indigo-500 transition-all" />
              </div>
            ))}
          </div>
        )}

        {/* Manage Payment */}
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="bg-[#1e1e2d] text-white p-12 rounded-[55px] flex justify-between items-center shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Customer Selected</p>
                <h2 className="text-4xl font-black tracking-tight">{selectedCustomer.full_name}</h2>
              </div>
              <button 
                onClick={() => { setSelectedCustomer(null); setUnpaidPayments([]); }}
                className="relative z-10 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border border-white/10"
              >
                Change User
              </button>
            </div>

            <div className="space-y-4">
              {unpaidPayments.length > 0 ? (
                unpaidPayments.map((p) => (
                  <div key={p.id} className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                    <div className="flex gap-10 items-center">
                      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[25px] flex items-center justify-center font-black text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {p.installment_number}
                      </div>
                      <div>
                        <p className="text-3xl font-black text-slate-800 tracking-tighter">฿{Number(p.amount).toLocaleString()}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase mt-2 tracking-widest">Due Date: {new Date(p.due_date).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        disabled={loading}
                        onClick={() => handlePay(p)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[25px] text-[12px] font-black uppercase shadow-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'จ่ายเงินจำลอง'}
                      </button>
                      <button 
                        onClick={() => handleReset(p.contract_id)}
                        className="p-5 text-slate-200 hover:text-rose-500 transition-colors"
                        title="Reset ทุกงวด"
                      >
                        <RefreshCcw size={22} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-24 rounded-[55px] text-center border-4 border-dashed border-slate-50">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">ชำระครบถ้วนแล้ว</h4>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}