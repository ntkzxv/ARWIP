'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase' 

import { 
  Zap, Search, Banknote, RefreshCcw, 
  CheckCircle2, AlertCircle, ArrowLeft, 
  ChevronRight, User, Loader2
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

  // 2. ดึงค่างวดที่ยังไม่จ่าย
  const fetchUnpaid = async (customerId: string) => {
    const { data, error } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_contracts!inner(customer_id, contract_status)
      `)
      .eq('installment_contracts.customer_id', customerId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
    
    if (error) console.error('Fetch Error:', error)
    setUnpaidPayments(data || [])
  }

  // 3. ฟังก์ชันจำลองการจ่ายเงิน (เวอร์ชันแก้ไขใหม่ ✨)
const handlePay = async (payment: any) => {
    if (!selectedCustomer) return;
    setLoading(true)
    try {
      // Step A: อัปเดตงวดที่เลือกเป็น 'paid'
      const { error: payError } = await supabase
        .from('installment_payments')
        .update({ 
          status: 'paid', 
          paid_at: new Date().toISOString() 
        })
        .eq('id', payment.id)

      if (payError) throw payError

      // Step B: บันทึกลง Recent Table (credit_history) 
      // 💡 แก้ไข: ลบ 'notes' ออก และเปลี่ยน 'staff_id' เป็น null เพื่อเลี่ยงปัญหา UUID
      const { error: historyErr } = await supabase
        .from('credit_history')
        .insert({
          customer_id: selectedCustomer.id,
          customer_name: selectedCustomer.full_name,
          amount: payment.amount,
          type: 'topup', // จ่ายเงินเข้าถือเป็นรายรับ (Topup)
          status: 'completed',
          staff_id: null, // 🚩 แก้ไขจาก "TEST_SYSTEM" เป็น null เพื่อป้องกัน Error UUID
          created_at: new Date().toISOString()
        })
      
      if (historyErr) throw historyErr

      // Step C: ตรวจสอบว่าในสัญญานี้ยังเหลืองวดค้างอีกไหม
      const { data: remaining } = await supabase
        .from('installment_payments')
        .select('id')
        .eq('contract_id', payment.contract_id)
        .eq('status', 'pending')

      // ถ้าไม่เหลืองวดค้างแล้ว ให้ปิดสัญญาเป็น 'completed'
      if (!remaining || remaining.length === 0) {
        await supabase
          .from('installment_contracts')
          .update({ contract_status: 'completed' })
          .eq('id', payment.contract_id)
      }
      
      Swal.fire({
        title: 'จ่ายเงินสำเร็จ!',
        text: 'ประวัติการเงินถูกบันทึกลงหน้า Accounting เรียบร้อย',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      // โหลดข้อมูลใหม่เพื่อให้รายการที่จ่ายแล้วหายไป
      fetchUnpaid(selectedCustomer.id)
      
    } catch (e: any) { 
      console.error(e)
      Swal.fire('เกิดข้อผิดพลาด', e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // 4. ฟังก์ชัน Reset ข้อมูล
  const handleReset = async (contractId: string) => {
    const confirm = await Swal.fire({
      title: 'ต้องการ Reset ข้อมูล?',
      text: "งวดที่จ่ายไปแล้วจะกลับเป็น 'ค้างชำระ' ทั้งหมด",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน Reset',
      cancelButtonText: 'ยกเลิก'
    })

    if (!confirm.isConfirmed) return;
    
    setLoading(true)
    try {
      await supabase.from('installment_payments').update({ status: 'pending', paid_at: null }).eq('contract_id', contractId)
      await supabase.from('installment_contracts').update({ contract_status: 'active' }).eq('id', contractId)
      // ล้างประวัติใน credit_history ของลูกค้านี้ด้วยเพื่อให้หน้า Recent สะอาด
      await supabase.from('credit_history').delete().eq('customer_id', selectedCustomer.id).eq('type', 'topup')
      
      fetchUnpaid(selectedCustomer.id)
      Swal.fire('Reset สำเร็จ', 'ข้อมูลกลับเป็นสถานะเริ่มต้นแล้ว', 'success')
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <Zap size={28} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Simulator</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Database Status Tester</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-800 hover:text-white transition-all">
            <ArrowLeft size={16} />
            <span className="text-xs font-black uppercase">Dashboard</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-[30px] shadow-xl flex gap-2 border border-slate-100">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้าที่ต้องการทดสอบ..."
            className="flex-1 px-8 py-5 bg-transparent font-bold text-slate-700 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-10 bg-slate-900 text-white font-black rounded-[22px] uppercase text-xs hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin text-white" /> : 'Search'}
          </button>
        </div>

        {/* Results */}
        {!selectedCustomer && customers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4">
            {customers.map(c => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedCustomer(c); fetchUnpaid(c.id); }} 
                className="bg-white p-7 rounded-[35px] border border-slate-100 flex justify-between items-center cursor-pointer hover:border-orange-500 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-none">{c.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{c.id_card}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-orange-500" />
              </div>
            ))}
          </div>
        )}

        {/* Payment Manager */}
        {selectedCustomer && (
          <div className="space-y-6 animate-in zoom-in-95">
            <div className="bg-[#1e1e2d] text-white p-10 rounded-[50px] flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] mb-2">Manage Payment For</p>
                <h2 className="text-3xl font-black tracking-tight">{selectedCustomer.full_name}</h2>
              </div>
              <button 
                onClick={() => { setSelectedCustomer(null); setUnpaidPayments([]); }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Change User
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6">รายการที่ค้างชำระ (Pending)</h3>
              
              {unpaidPayments.length > 0 ? (
                unpaidPayments.map((p) => (
                  <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-orange-200 transition-all">
                    <div className="flex gap-8 items-center">
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center font-black text-xl group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        {p.installment_number}
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter">฿{Number(p.amount).toLocaleString()}</p>
                        <p className="text-[10px] font-black text-orange-500 uppercase mt-1">Due: {new Date(p.due_date).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        disabled={loading}
                        onClick={() => handlePay(p)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-3xl text-[11px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {loading ? 'Processing...' : 'จ่ายเงินทดสอบ'}
                      </button>
                      <button 
                        onClick={() => handleReset(p.contract_id)}
                        className="p-4 text-slate-200 hover:text-rose-500 transition-colors"
                        title="Reset Contract"
                      >
                        <RefreshCcw size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[50px] text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">จ่ายครบหมดแล้ว!</h4>
                  <p className="text-slate-400 text-sm mt-2">ตอนนี้ข้อมูลในหน้าประวัติลูกค้าจะกลายเป็น <span className="text-slate-800 font-bold">สีเทา (Completed)</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}