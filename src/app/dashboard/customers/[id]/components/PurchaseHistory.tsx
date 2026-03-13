'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../utils/supabase' 
import { 
  ShoppingBag, Calendar, Clock, ChevronLeft, Banknote, 
  Store, Hash, Tag, Box, User, Zap, Package
} from 'lucide-react'

export default function PurchaseHistory({ contracts, sales }: any) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [branchName, setBranchName] = useState<string>('กำลังโหลด...');

  const allHistory = [
    ...(contracts || []).map((c: any) => ({ ...c, type: 'installment' })),
    ...(sales?.filter((s: any) => s.transaction_type === 'cash') || []).map((s: any) => ({ ...s, type: 'cash' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  useEffect(() => {
    if (!selectedItem) return;
    async function fetchBranch() {
      const bId = selectedItem.branch_id || selectedItem.sales_transactions?.branch_id || selectedItem.home_branch_id;
      if (!bId) { setBranchName('ไม่ระบุสาขา'); return; }
      const { data } = await supabase.from('branches').select('branch_name').eq('id', bId).single();
      if (data) setBranchName(data.branch_name);
    }
    fetchBranch();
  }, [selectedItem]);

  // ฟังก์ชันจัดรูปแบบวันที่ วว/ดด/ปป
  const formatDateSimple = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  if (selectedItem) {
    const isCash = selectedItem.type === 'cash';
    const sale = isCash ? selectedItem : (selectedItem.sales_transactions || {});
    const netPrice = Number(sale.unit_price || 0);
    const grandTotal = Number(isCash ? netPrice : selectedItem.total_purchase_price);

    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-10">
        <button 
          onClick={() => setSelectedItem(null)} 
          className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase transition-all mb-4"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> กลับสู่รายการทั้งหมด
        </button>

        {/* 1. Header Card */}
        <div className="bg-slate-900 rounded-[50px] p-10 text-white relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
            <div className="flex gap-6 items-center">
            {/* ไอคอนสี Indigo ตัดกับพื้นหลังดำ */}
            <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Box size={36} />
            </div>
            <div className="space-y-1">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isCash ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
                {isCash ? 'Cash Purchase' : 'Installment Plan'}
                </span>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{sale.product_name}</h2>
            </div>
            </div>
        </div>
        
        {/* ตัด Background Decoration ออกเพื่อให้เป็นสีพื้นนิ่งๆ พรีเมียม */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. ข้อมูลสินค้า (Specification) - ปรับปรุง Layout */}
          <div className="bg-white rounded-[45px] border border-slate-100 p-10 shadow-sm relative flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-6 mb-8">
                <Tag size={16} className="text-indigo-600"/> Product Specification
              </h3>
              
              <div className="space-y-10">
                {/* 🚩 ชื่อสินค้า: บรรทัดเดียวเต็มๆ */}
                <DetailItem label="ชื่อสินค้า" value={sale.product_name || 'N/A'} icon={<Package size={16}/>} fullWidth size="text-3 1xl" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                  {/* รหัสสินค้า: ขยับลงมาบรรทัดใหม่ */}
                  <DetailItem label="รหัสสินค้า (Product ID)" value={sale.product_id || 'N/A'} icon={<Hash size={16}/>} />
                  <DetailItem label="ประเภทการซื้อ" value={isCash ? 'ซื้อเงินสด' : 'ผ่อนชำระ'} icon={<Zap size={16}/>} />
                  {/* วันที่: รูปแบบ วว/ดด/ปป */}
                  <DetailItem label="วันที่ซื้อ" value={formatDateSimple(sale.created_at)} icon={<Calendar size={16}/>} />
                  <DetailItem label="เวลาบันทึก" value={new Date(sale.created_at).toLocaleTimeString('th-TH') + ' น.'} icon={<Clock size={16}/>} />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-50 flex justify-between items-center opacity-40">
 
              <p className="text-[10.5px] font-black text-slate-900 font-mono uppercase px-10">REF {selectedItem.id}</p>
            </div>
          </div>

          {/* 3. สรุปยอดค่าใช้จ่าย (Financial) */}
          <div className="bg-white rounded-[45px] border border-slate-100 p-10 shadow-sm flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-6 mb-8">
              <Banknote size={16} className="text-indigo-600"/> Financial Summary
            </h3>
            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center text-slate-400 font-black text-[11px] uppercase tracking-widest">
                <span>ราคาสินค้าสุทธิ</span>
                <span className="text-slate-900 text-sm font-bold">฿{netPrice.toLocaleString()}</span>
              </div>
              {!isCash && (
                <>
                  <div className="flex justify-between items-center text-slate-400 font-black text-[11px] uppercase tracking-widest">
                    <span>เงินดาวน์</span>
                    <span className="text-red-500 text-sm font-bold">- ฿{Number(selectedItem.down_payment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 font-black text-[11px] uppercase tracking-widest">
                    <span>ดอกเบี้ยรวม</span>
                    <span className="text-slate-900 text-sm font-bold">฿{Number(selectedItem.total_interest || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100 text-right space-y-1">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em]">ยอดรวมที่ชำระทั้งสิ้น</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">฿{grandTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 4. กล่องสาขาและพนักงาน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex items-center gap-5 p-6 bg-white rounded-[35px] border border-slate-100 shadow-sm">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0">
                 <Store size={24}/>
              </div>
              <div className="min-w-0 flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">สาขาที่ทำรายการ</p>
                 <p className="text-xl font-black text-slate-900 truncate">{branchName}</p>
              </div>
           </div>
           <div className="flex items-center gap-5 p-6 bg-indigo-50/50 rounded-[35px] border border-indigo-100 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                 <User size={24}/>
              </div>
              <div className="min-w-0 flex-1">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">พนักงานผู้ดูแล</p>
                 <p className="text-xl font-black text-slate-900 truncate">{sale.staff_name || 'ไม่ระบุชื่อ'}</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- 🔵 หน้าหลัก (Card View) ---
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-indigo-600 rounded-full"></div>
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none mb-1">History</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">รายการทั้งหมด</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">
              {contracts.filter((c: any) => c.contract_status !== 'completed').length} ดำเนินการ
            </span>
            <span className="text-[12px] font-black text-slate-300">/</span>
            <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
              {allHistory.length} ทั้งหมด
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allHistory.map((item: any) => {
          const isCash = item.type === 'cash';
          const sale = isCash ? item : (item.sales_transactions || {});
          const isCompleted = isCash || item.contract_status === 'completed';
          const grandTotal = Number(isCash ? sale.unit_price : item.total_purchase_price);

          const cardStyle = isCompleted 
            ? 'bg-slate-100 border-slate-200 opacity-80' 
            : 'bg-white border-slate-50 hover:border-indigo-500 hover:shadow-xl';

          return (
            <div key={item.id} onClick={() => setSelectedItem(item)} className={`group relative rounded-[45px] border-2 p-8 transition-all duration-300 cursor-pointer overflow-hidden ${cardStyle}`}>
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white bg-slate-900 shrink-0">
                    {isCash ? <Banknote size={27} className="text-white" /> : <ShoppingBag size={26} className="text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                        {isCash ? 'ซื้อเงินสด' : 'ผ่อนชำระ'}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                        <Calendar size={10} /> {formatDateSimple(sale.created_at)}
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{sale.product_name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ยอดรวมสัญญา</p>
                  <p className={`text-3xl font-black tracking-tighter ${isCompleted ? 'text-slate-600' : 'text-indigo-600'}`}>฿{grandTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// UI Helper: เพิ่มพารามิเตอร์ size เข้าไป
function DetailItem({ label, value, icon, fullWidth = false, size = "text-base" }: any) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${fullWidth ? 'md:col-span-2' : ''}`}>
       <div className="text-indigo-600 mt-1 shrink-0">{icon}</div>
       <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          {/* ใช้ size ที่รับมาเพื่อกำหนดขนาดฟอนต์ */}
          <p className={`font-black text-slate-900 truncate ${fullWidth ? (size === "text-base" ? "text-2xl" : size) : 'text-base'}`}>
            {value}
          </p>
       </div>
    </div>
  );
}