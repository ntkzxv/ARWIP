'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, BadgeDollarSign, 
  Loader2, CheckCircle2, Wallet, Users, Calendar
} from 'lucide-react'

export default function AddCustomerFullPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [purchaseType, setPurchaseType] = useState<'cash' | 'installment'>('installment')
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    // 1. Customers
    full_name: '', id_card: '', phone: '', line_id: '',
    occupation: '', work_place: '', monthly_income: '',
    current_address: '', financial_status: 'fair', home_branch_id: '',
    birth_date: '',
    // 2. Sales & Contract
    product_id: '', product_name: '', unit_price: '', 
    down_payment: '', 
    period_months: '', 
    due_day: '5', interest_rate: '1.5',
    first_payment_date: '',
    // 3. Guarantors
    g_full_name: '', g_id_card: '', g_phone: '', 
    g_relationship: '', g_occupation: '', g_work_place: '', 
    g_monthly_income: '', g_address: ''
  })

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*')
      if (data) setBranches(data)
    }
    fetchBranches()
  }, [])

  // ✅ แก้ไขระบบดึงข้อมูล: จัดการ Format วันที่ให้รองรับ Input type="date"
  const checkExistingCustomer = async (idCard: string) => {
    if (idCard.length === 13) {
      const { data } = await supabase.from('customers').select('*').eq('id_card', idCard).maybeSingle()
      if (data) {
        setIsExistingCustomer(true)
        
        // จัดรูปแบบวันที่ให้เป็น YYYY-MM-DD เพื่อให้ Input Date ดึงค่าไปแสดงได้
        let formattedBirthDate = ''
        if (data.birth_date) {
          formattedBirthDate = data.birth_date.split('T')[0] 
        }

        setFormData(prev => ({
          ...prev, 
          id_card: idCard, 
          full_name: data.full_name || '', 
          phone: data.phone || '',
          line_id: data.line_id || '',
          occupation: data.occupation || '', 
          monthly_income: data.monthly_income || '',
          current_address: data.current_address || '', 
          home_branch_id: data.home_branch_id || '',
          birth_date: formattedBirthDate // ✅ ดึงค่าวันเกิดที่จัด Format แล้ว
        }))
        setErrors({})
      } else { 
        setIsExistingCustomer(false) 
      }
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    if (step === 1) {
      if (!formData.id_card || formData.id_card.length < 13) newErrors.id_card = "ระบุเลขบัตร 13 หลัก"
      if (!formData.full_name) newErrors.full_name = "ระบุชื่อ-นามสกุล"
      if (!formData.phone) newErrors.phone = "ระบุเบอร์โทรศัพท์"
      if (!formData.line_id) newErrors.line_id = "ระบุ LINE ID"
      if (!formData.home_branch_id) newErrors.home_branch_id = "โปรดเลือกสาขา"
      if (!formData.birth_date) newErrors.birth_date = "ระบุวันเกิด"
      if (!formData.current_address) newErrors.current_address = "ระบุที่อยู่ปัจจุบัน"
    } 
    
    if (step === 2) {
      if (!formData.product_id) newErrors.product_id = "ระบุรหัสสินค้า"
      if (!formData.product_name) newErrors.product_name = "ระบุชื่อสินค้า"
      if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) newErrors.unit_price = "ระบุราคา"
      if (!formData.occupation) newErrors.occupation = "ระบุอาชีพ"
      if (!formData.monthly_income) newErrors.monthly_income = "ระบุรายได้"
      
      if (purchaseType === 'installment') {
        if (!formData.first_payment_date) newErrors.first_payment_date = "ระบุวันที่เริ่มผ่อน"
        if (formData.down_payment === '') newErrors.down_payment = "ระบุเงินดาวน์"
        if (!formData.period_months) newErrors.period_months = "โปรดเลือกงวดผ่อน"
      }
    }

    if (step === 3 && purchaseType === 'installment') {
      if (!formData.g_full_name) newErrors.g_full_name = "ระบุชื่อผู้ค้ำ"
      if (!formData.g_id_card || formData.g_id_card.length < 13) newErrors.g_id_card = "ระบุเลขบัตร 13 หลัก"
      if (!formData.g_phone) newErrors.g_phone = "ระบุเบอร์โทร"
      if (!formData.g_relationship) newErrors.g_relationship = "ระบุความสัมพันธ์"
      if (!formData.g_work_place) newErrors.g_work_place = "ระบุสถานที่ทำงาน"
      if (!formData.g_monthly_income) newErrors.g_monthly_income = "ระบุรายได้"
      if (!formData.g_address) newErrors.g_address = "ระบุที่อยู่"
      if (!formData.g_occupation) newErrors.g_occupation = "ระบุอาชีพ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => { if (validateStep()) { setStep(step + 1); window.scrollTo(0, 0); } }

  const calculateInstallment = () => {
    const price = parseFloat(formData.unit_price) || 0
    const down = parseFloat(formData.down_payment) || 0
    const months = parseInt(formData.period_months) || 1
    const rate = parseFloat(formData.interest_rate) || 0
    const loanAmount = price - down
    const totalWithInterest = Math.round((loanAmount * (1 + (rate / 100) * months)) * 100) / 100
    const monthlyPayment = Math.round((totalWithInterest / months) * 100) / 100
    return { totalWithInterest, monthlyPayment }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    const employeeId = localStorage.getItem('current_user_id') 

    let customerId: string = ""
    try {
      if (isExistingCustomer) {
        const { data, error } = await supabase.from('customers').update({
            occupation: formData.occupation, monthly_income: formData.monthly_income, 
            current_address: formData.current_address, birth_date: formData.birth_date,
            line_id: formData.line_id
        }).eq('id_card', formData.id_card).select().single()
        if (error) throw error
        customerId = data.id
      } else {
        const { data: newCust, error: custErr } = await supabase.from('customers').insert([{
          full_name: formData.full_name, id_card: formData.id_card, phone: formData.phone,
          line_id: formData.line_id, occupation: formData.occupation, monthly_income: formData.monthly_income,
          current_address: formData.current_address, financial_status: formData.financial_status,
          home_branch_id: formData.home_branch_id, birth_date: formData.birth_date
        }]).select().single()
        if (custErr) throw custErr
        customerId = newCust.id
      }

      const { data: sale, error: saleErr } = await supabase.from('sales_transactions').insert([{
        customer_id: customerId, employee_id: employeeId,
        product_id: formData.product_id, product_name: formData.product_name,
        unit_price: formData.unit_price, transaction_type: purchaseType,
        status: 'success', branch_id: formData.home_branch_id
      }]).select().single()
      if (saleErr) throw saleErr

      if (purchaseType === 'installment') {
        const { totalWithInterest, monthlyPayment } = calculateInstallment()
        const { data: contract, error: contErr } = await supabase.from('installment_contracts').insert([{
          transaction_id: sale.id, customer_id: customerId,
          down_payment: formData.down_payment || 0, total_loan_amount: totalWithInterest,
          period_months: formData.period_months, monthly_payment: monthlyPayment,
          due_day: formData.due_day, interest_rate: formData.interest_rate,
          start_date: formData.first_payment_date, contract_status: 'active'
        }]).select().single()
        if (contErr) throw contErr

        if (formData.g_full_name) {
          await supabase.from('guarantors').insert([{
            contract_id: contract.id, full_name: formData.g_full_name, id_card: formData.g_id_card,
            phone: formData.g_phone, relationship: formData.g_relationship, 
            occupation: formData.g_occupation, work_place: formData.g_work_place,
            monthly_income: formData.g_monthly_income, address: formData.g_address
          }])
        }
      }
      alert('บันทึกข้อมูลสำเร็จ!'); router.push('/dashboard/customers')
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  return (
    <div className="p-6 md:p-12 lg:ml-16 space-y-10 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white rounded-3xl shadow-sm text-slate-400 hover:text-slate-600 transition-all"><ArrowLeft size={24} /></button>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">ทำรายการใหม่</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-[50px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex h-1.5 bg-slate-50">
          <div className={`flex-1 transition-all duration-500 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          <div className={`flex-1 transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          {purchaseType === 'installment' && <div className={`flex-1 transition-all duration-500 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />}
        </div>

        <div className="p-12">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><User size={24}/></div>
                  <h2 className="text-2xl font-black text-slate-800">ข้อมูลลูกค้า</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="เลขบัตรประชาชน" error={errors.id_card} value={formData.id_card} onChange={(v:any) => { setFormData(prev => ({...prev, id_card: v})); checkExistingCustomer(v); }} placeholder="13 หลัก" maxLength={13} />
                <InputField label="ชื่อ-นามสกุล" error={errors.full_name} value={formData.full_name} onChange={(v:any) => setFormData(prev => ({...prev, full_name: v}))} disabled={isExistingCustomer} />
                <InputField label="เบอร์โทรศัพท์" error={errors.phone} value={formData.phone} onChange={(v:any) => setFormData(prev => ({...prev, phone: v}))} />
                <InputField label="LINE ID" error={errors.line_id} value={formData.line_id} onChange={(v:any) => setFormData(prev => ({...prev, line_id: v}))} placeholder="ไอดีไลน์ลูกค้า" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar size={14}/> วันเกิด</label>
                  <input type="date" className={`w-full p-5 bg-slate-50 rounded-[22px] border-2 font-bold text-sm outline-none transition-all ${errors.birth_date ? 'border-red-400 bg-red-50' : 'border-transparent'}`} value={formData.birth_date} onChange={(e) => setFormData(prev => ({...prev, birth_date: e.target.value}))}/>
                  {errors.birth_date && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-tight">{errors.birth_date}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกสาขา</label>
                  <select className={`w-full p-5 bg-slate-50 rounded-[22px] border-2 font-bold text-sm outline-none appearance-none transition-all ${errors.home_branch_id ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                    value={formData.home_branch_id} onChange={(e) => setFormData(prev => ({...prev, home_branch_id: e.target.value}))}>
                    <option value="">เลือกสาขาต้นสังกัด...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                  </select>
                </div>
              </div>
              <InputField label="ที่อยู่ปัจจุบัน" error={errors.current_address} value={formData.current_address} onChange={(v:any) => setFormData(prev => ({...prev, current_address: v}))} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><BadgeDollarSign size={24}/></div>
                  <h2 className="text-2xl font-black text-slate-800">รายละเอียดสินค้า & การผ่อน</h2>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-full shadow-inner">
                  <button onClick={() => setPurchaseType('installment')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all ${purchaseType === 'installment' ? 'bg-[#1e1e2d] text-white shadow-lg' : 'text-slate-400'}`}>ผ่อนชำระ</button>
                  <button onClick={() => setPurchaseType('cash')} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase transition-all ${purchaseType === 'cash' ? 'bg-[#1e1e2d] text-white shadow-lg' : 'text-slate-400'}`}>ซื้อเงินสด</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <InputField label="รหัสสินค้า (ID)" error={errors.product_id} value={formData.product_id} onChange={(v:any) => setFormData(prev => ({...prev, product_id: v}))} />
                  <InputField label="ชื่อสินค้า" error={errors.product_name} value={formData.product_name} onChange={(v:any) => setFormData(prev => ({...prev, product_name: v}))} />
                  <InputField label="ราคา (บาท)" error={errors.unit_price} type="number" value={formData.unit_price} onChange={(v:any) => setFormData(prev => ({...prev, unit_price: v}))} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="อาชีพ" error={errors.occupation} value={formData.occupation} onChange={(v:any) => setFormData(prev => ({...prev, occupation: v}))} />
                    <InputField label="รายได้ต่อเดือน" error={errors.monthly_income} type="number" value={formData.monthly_income} onChange={(v:any) => setFormData(prev => ({...prev, monthly_income: v}))} />
                  </div>
                </div>

                {purchaseType === 'installment' && (
                  <div className="space-y-6 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar size={14}/> วันที่เริ่มผ่อนชำระ (งวดแรก)</label>
                      <input type="date" className={`w-full p-5 bg-white rounded-[22px] border-2 font-bold text-sm outline-none transition-all ${errors.first_payment_date ? 'border-red-400 bg-red-50' : 'border-transparent'}`} value={formData.first_payment_date} onChange={(e) => setFormData(prev => ({...prev, first_payment_date: e.target.value}))}/>
                      {errors.first_payment_date && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-tight">{errors.first_payment_date}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="เงินดาวน์" error={errors.down_payment} type="number" value={formData.down_payment} onChange={(v:any) => setFormData(prev => ({...prev, down_payment: v}))} />
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">งวดผ่อน</label>
                        <select className={`w-full p-5 bg-white rounded-[22px] border-2 font-bold text-sm shadow-sm outline-none transition-all ${errors.period_months ? 'border-red-400 bg-red-50' : 'border-transparent'}`} 
                          value={formData.period_months} onChange={(e) => setFormData(prev => ({...prev, period_months: e.target.value}))}>
                          <option value="">เลือกงวด...</option>
                          {[6, 12, 18, 24, 36].map(m => <option key={m} value={m}>{m} งวด</option>)}
                        </select>
                        {errors.period_months && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-tight">{errors.period_months}</p>}
                      </div>
                    </div>
                    <div className="bg-[#1e1e2d] rounded-[30px] p-8 text-white mt-4 text-center">
                      <p className="text-emerald-400 text-3xl font-black">฿{calculateInstallment().monthlyPayment.toLocaleString()}</p>
                      <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest mt-1">ค่างวดต่อเดือน</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Users size={24}/></div>
                <h2 className="text-2xl font-black text-slate-800">ข้อมูลผู้ค้ำประกัน</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField label="ชื่อ-นามสกุลผู้ค้ำ" error={errors.g_full_name} value={formData.g_full_name} onChange={(v:any) => setFormData(prev => ({...prev, g_full_name: v}))} />
                <InputField label="เลขบัตรประชาชนผู้ค้ำ" error={errors.g_id_card} value={formData.g_id_card} onChange={(v:any) => setFormData(prev => ({...prev, g_id_card: v}))} maxLength={13} />
                <InputField label="เบอร์โทรผู้ค้ำ" error={errors.g_phone} value={formData.g_phone} onChange={(v:any) => setFormData(prev => ({...prev, g_phone: v}))} />
                <InputField label="ความสัมพันธ์" error={errors.g_relationship} value={formData.g_relationship} onChange={(v:any) => setFormData(prev => ({...prev, g_relationship: v}))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <InputField label="อาชีพผู้ค้ำ" error={errors.g_occupation} value={formData.g_occupation} onChange={(v:any) => setFormData(prev => ({...prev, g_occupation: v}))} />
                <InputField label="สถานที่ทำงาน" error={errors.g_work_place} value={formData.g_work_place} onChange={(v:any) => setFormData(prev => ({...prev, g_work_place: v}))} />
                <InputField label="รายได้ต่อเดือน" error={errors.g_monthly_income} type="number" value={formData.g_monthly_income} onChange={(v:any) => setFormData(prev => ({...prev, g_monthly_income: v}))} />
              </div>
              <InputField label="ที่อยู่ปัจจุบันของผู้ค้ำ" error={errors.g_address} value={formData.g_address} onChange={(v:any) => setFormData(prev => ({...prev, g_address: v}))} />
            </div>
          )}

          <div className="mt-16 flex justify-between items-center pt-10 border-t border-slate-100">
            <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all active:scale-95">Back</button>
            <button onClick={() => step < (purchaseType === 'installment' ? 3 : 2) ? handleNext() : handleSubmit()} disabled={loading} className="bg-blue-600 text-white px-14 py-5 rounded-full font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 min-w-[180px]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : step < (purchaseType === 'installment' ? 3 : 2) ? "Next" : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', maxLength, disabled = false, error }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} maxLength={maxLength} placeholder={placeholder} disabled={disabled}
        className={`w-full p-5 bg-slate-50 rounded-[22px] border-2 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all 
          ${error ? 'border-red-400 bg-red-50 text-red-900' : 'border-transparent focus:border-blue-500'} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-tight">{error}</p>}
    </div>
  )
}