'use client'
import { ShoppingBag, User, Tag, TicketPercent, Banknote } from 'lucide-react'

export default function CashForm({ formData, setFormData, errors = {}, InputField }: any) {
  
  // ✅ ฟังก์ชันช่วยคำนวณราคาขายสุทธิอัตโนมัติ
  const handlePriceChange = (field: string, value: any) => {
    const marketPrice = field === 'market_price' ? parseFloat(value) || 0 : parseFloat(formData.market_price) || 0;
    const discount = field === 'discount' ? parseFloat(value) || 0 : parseFloat(formData.discount) || 0;
    
    const netPrice = marketPrice - discount;

    setFormData((p: any) => ({
      ...p,
      [field]: value,
      unit_price: netPrice > 0 ? netPrice.toString() : "0" 
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in zoom-in-95">
      <div className="space-y-8">
        {/* --- ส่วนข้อมูลสินค้า --- */}
        <div className="space-y-6">
          <InputField 
            label="รหัสสินค้า (Product ID)" 
            value={formData.product_id} 
            error={errors?.product_id} 
            onChange={(v:any) => setFormData((p:any) => ({...p, product_id: v}))} 
            placeholder="ระบุรหัสสินค้า"
          />
          <InputField 
            label="ชื่อสินค้า" 
            value={formData.product_name} 
            error={errors?.product_name} 
            onChange={(v:any) => setFormData((p:any) => ({...p, product_name: v}))} 
            placeholder="ระบุชื่อสินค้า"
          />

          {/* --- ส่วนราคา (3 ช่อง) --- */}
          <div className="p-6 rounded-[30px] border border-slate-100 space-y-4 bg-white/50">
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="ราคาเริ่มต้น (ปกติ)" 
                type="number"
                icon={<Tag size={16}/>}
                value={formData.market_price} 
                error={errors?.market_price}
                onChange={(v:any) => handlePriceChange('market_price', v)} 
              />
              <InputField 
                label="ส่วนลด (บาท)" 
                type="number"
                icon={<TicketPercent size={16}/>}
                value={formData.discount} 
                error={errors?.discount}
                onChange={(v:any) => handlePriceChange('discount', v)} 
              />
            </div>
            <InputField 
              label="ราคาขายสุทธิ (Net Price)" 
              type="number" 
              icon={<Banknote size={16}/>}
              className="bg-white border-2 border-emerald-100 shadow-md h-16 text-xl font-black text-emerald-700"
              value={formData.unit_price} 
              error={errors?.unit_price}
              readOnly={true} 
              onChange={() => {}} 
            />
          </div>
        </div>

        {/* --- ส่วนข้อมูลพนักงานขาย --- */}
        <div className="p-8 rounded-[30px] border border-slate-100 space-y-6 bg-white/50">
          <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <User size={16}/> ข้อมูลพนักงานขาย
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="รหัสพนักงาน" 
              value={formData.staff_id} 
              error={errors?.staff_id}
              // ✅ ปรับเป็นตัวพิมพ์ใหญ่เพื่อดึงข้อมูลจาก login_id ใน DB
              onChange={(v: any) => setFormData((p:any) => ({...p, staff_id: v}))} 
              placeholder="เช่น ST001"
            />
            <InputField 
              label="ชื่อพนักงานผู้ขาย" 
              value={formData.staff_name} 
              error={errors?.staff_name}
              readOnly={true}
              className="bg-slate-50 cursor-not-allowed"
              onChange={(v: any) => setFormData((p:any) => ({...p, staff_name: v}))} 
              placeholder="ดึงข้อมูลอัตโนมัติ..."
            />
          </div>
        </div>
      </div>

      {/* --- ส่วนแสดงยอดรวม (ฝั่งขวา) --- */}
      <div className="relative group h-full min-h-[500px] flex items-center justify-center animate-in zoom-in-95 duration-700">
        
        {/* Background Layer: แสงสีเขียวมรกตจางๆ ด้านหลัง */}
        <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full transform scale-90"></div>

        {/* Main Card: สรุปยอดเงินสด */}
        <div className="relative w-full bg-white rounded-[50px] border border-emerald-100 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col items-center p-10 pt-16">
          
          {/* ไอคอนด้านบน */}
          <div className="relative mb-12">
            <div className="p-8 bg-emerald-50 text-emerald-500 rounded-full shadow-inner">
              <ShoppingBag size={56} strokeWidth={2} />
            </div>
          </div>

          {/* หัวข้อ */}
          <div className="text-center space-y-2 mb-12">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">ชำระเงินสด</h3>
            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em]">Cash Transaction</p>
          </div>

          {/* กล่องสรุปราคา */}
          <div className="w-full space-y-8 px-4">
            
            {/* ราคาปกติ (ถ้ามีส่วนลดถึงจะโชว์) */}
            {parseFloat(formData.discount) > 0 && (
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ราคาปกติ</span>
                <span className="text-slate-500 text-lg font-bold line-through">
                  ฿{(parseFloat(formData.market_price) || 0).toLocaleString()}
                </span>
              </div>
            )}

            {/* แถบส่วนลดพิเศษ */}
            {parseFloat(formData.discount) > 0 && (
              <div className="flex justify-between items-center px-5 py-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-600">
                  <TicketPercent size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">ส่วนลดที่ได้รับ</span>
                </div>
                <span className="text-emerald-600 font-black text-lg">
                  - ฿{(parseFloat(formData.discount) || 0).toLocaleString()}
                </span>
              </div>
            )}

            {/* เส้นคั่นออกแบบให้ดูเบาบาง */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full"></div>

            {/* ยอดที่ต้องชำระ */}
            <div className="text-center py-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">ยอดชำระสุทธิทั้งสิ้น</p>
              <div className="flex items-start justify-center">
                <span className="text-3xl font-black text-emerald-500 mt-2 mr-2">฿</span>
                <div className="text-8xl font-black text-slate-900 tracking-tighter">
                  {(parseFloat(formData.unit_price) || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ข้อความกำกับด้านล่าง */}
          <div className="mt-auto pt-10 text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Ready to Finalize Transaction
          </div>

        </div>
      </div>
    </div>
  )
}