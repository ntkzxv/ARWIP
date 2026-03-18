'use client'
import { Calendar, BadgeDollarSign, Calculator, Percent, User, Tag, TicketPercent, Banknote } from 'lucide-react'

export default function InstallmentForm({ formData, setFormData, errors, InputField }: any) {
  
  // ✅ ฟังก์ชันคำนวณราคาขายสุทธิอัตโนมัติ (Net Price)
  const handleNetPriceCalculation = (field: string, value: any) => {
    const marketPrice = field === 'market_price' ? parseFloat(value) || 0 : parseFloat(formData.market_price) || 0;
    const discount = field === 'discount' ? parseFloat(value) || 0 : parseFloat(formData.discount) || 0;
    const netPrice = marketPrice - discount;

    setFormData((p: any) => ({
      ...p,
      [field]: value,
      unit_price: netPrice > 0 ? netPrice.toString() : "0" 
    }));
  };

  // ✅ ฟังก์ชันคำนวณค่างวดและดอกเบี้ย
  const getCalculation = () => {
    const unitPrice = parseFloat(formData.unit_price) || 0;
    const downPayment = parseFloat(formData.down_payment) || 0;
    const months = parseInt(formData.period_months) || 1;
    const interestRate = parseFloat(formData.interest_rate ?? 1.5); 

    const loanAmount = unitPrice - downPayment;
    const interestPerMonth = loanAmount * (interestRate / 100);
    const totalInterest = interestPerMonth * months;
    const totalContractPrice = loanAmount + totalInterest;
    const monthlyPayment = totalContractPrice / months;

    return {
      loanAmount,
      interestPerMonth,
      totalInterest,
      totalContractPrice,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      interestRate
    };
  };

  const calc = getCalculation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in zoom-in-95">
      
      {/* ⬅️ ฝั่งซ้าย: ข้อมูลสินค้า & ราคา */}
      <div className="p-6 rounded-[30px] border border-slate-100 space-y-4 bg-white/50">
      <div className="space-y-8">
        <div className="space-y-6">
          <InputField 
            label="รหัสสินค้า (PRODUCT ID)" 
            value={formData.product_id} 
            error={errors?.product_id} 
            onChange={(v:any) => setFormData((p:any) => ({...p, product_id: v}))} 
          />
          <InputField 
            label="ชื่อสินค้า" 
            value={formData.product_name} 
            error={errors?.product_name} 
            onChange={(v:any) => setFormData((p:any) => ({...p, product_name: v}))} 
          />
          
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="ราคาเริ่มต้น (ปกติ)" 
                type="number"
                icon={<Tag size={16}/>}
                value={formData.market_price} 
                error={errors?.market_price}
                onChange={(v:any) => handleNetPriceCalculation('market_price', v)} 
              />
              <InputField 
                label="ส่วนลด (บาท)" 
                type="number"
                icon={<TicketPercent size={16}/>}
                value={formData.discount} 
                error={errors?.discount}
                onChange={(v:any) => handleNetPriceCalculation('discount', v)} 
              />
            </div>
            
            <InputField 
              label="ราคาขายสุทธิ (Net Price)" 
              type="number" 
              icon={<Banknote size={16}/>}
              className="bg-white border-2 border-blue-100 shadow-md h-16 text-xl font-black"
              value={formData.unit_price} 
              error={errors?.unit_price}
              readOnly={true}
              onChange={() => {}} 
            />

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-widest">อัตราดอกเบี้ยต่อเดือน
              </label>
              <div className="relative group">
                <select 
                  className={`w-full p-4 pr-14 bg-white rounded-2xl font-black text-sm outline-none shadow-sm border transition-all appearance-none cursor-pointer ${
                    errors?.interest_rate ? 'border-red-500 bg-red-50 text-red-900' : 'border-transparent text-black focus:border-blue-200'
                  }`}
                  value={formData.interest_rate ?? "1.5"}
                  onChange={(e) => setFormData((p:any) => ({...p, interest_rate: e.target.value}))}
                >
                  <option value="0">0% (ไม่มีดอกเบี้ย)</option>
                  <option value="0.5">0.5% ต่อเดือน</option>
                  <option value="1.0">1.0% ต่อเดือน</option>
                  <option value="1.25">1.25% ต่อเดือน</option>
                  <option value="1.5">1.5% ต่อเดือน (มาตรฐาน)</option>
                  <option value="1.75">1.75% ต่อเดือน</option>
                  <option value="2.0">2.0% ต่อเดือน</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ➡️ ฝั่งขวา: รายละเอียดการชำระ & พนักงาน (รวมอยู่ในแผ่นขาวเดียว) */}
      <div className="space-y-8 bg-white p-10 rounded-[45px] border border-slate-100 transition-all">
        
        {/* ส่วนเงื่อนไขการผ่อน */}
        <div className="space-y-6">         
          <div className="grid grid-cols-2 gap-6">
            <InputField 
              label="เงินดาวน์" 
              type="number" 
              value={formData.down_payment} 
              error={errors?.down_payment}
              onChange={(v:any) => setFormData((p:any) => ({...p, down_payment: v}))} 
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 ">ระยะเวลา (เดือน)</label>
              <div className="relative group">
                <select 
                  className={`w-full p-4 pr-12 bg-white rounded-2xl shadow-sm font-bold text-sm outline-none border transition-all border-transparent appearance-none cursor-pointer ${
                    errors?.period_months ? 'border-red-500 bg-red-50' : 'border border-slate-100 focus:border-blue-200 text-slate-700'
                  }`}
                  value={formData.period_months} 
                  onChange={(e) => setFormData((p:any) => ({...p, period_months: e.target.value}))}
                >
                  <option value="">เลือกงวด...</option>
                  {[6, 12, 18, 24, 36].map(m => <option key={m} value={m}>{m} เดือน</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              {errors?.period_months && <p className="text-red-500 text-[9px] font-bold ml-2 uppercase animate-pulse">{errors.period_months}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">วันเริ่มผ่อนงวดแรก
            </label>
            <input 
              type="date" 
              className={`w-full p-4 bg-white rounded-2xl shadow-sm font-bold text-sm outline-none border transition-all border-transparent ${
                errors?.first_payment_date ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'
              }`} 
              value={formData.first_payment_date ?? ""} 
              onChange={(e) => setFormData((p:any) => ({...p, first_payment_date: e.target.value}))}
            />
            {errors?.first_payment_date && <p className="text-red-500 text-[9px] font-bold ml-2 uppercase animate-pulse">{errors.first_payment_date}</p>}
          </div>
        </div>

        {/* เส้นคั่นบางๆ */}
        <div className="h-px bg-slate-100 w-full my-4" />

        {/* ส่วนพนักงานขาย (อยู่ในแผ่นเดียวกันแล้ว) */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">ข้อมูลพนักงานผู้รับผิดชอบ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="รหัสพนักงาน" 
              value={formData.staff_id} 
              error={errors?.staff_id}
              onChange={(v: any) => setFormData((p:any) => ({...p, staff_id: v}))} 
              placeholder="กรอกรหัสพนันงาน"
            />
            <InputField 
              label="ชื่อพนักงาน" 
              value={formData.staff_name} 
              error={errors?.staff_name}
              readOnly={true}
              className="bg-slate-50 font-bold"
              onChange={(v: any) => setFormData((p:any) => ({...p, staff_name: v}))} 
              placeholder="ระบบอัตโนมัติ"
            />
          </div>
        </div>

      </div>
    </div>
  )
}