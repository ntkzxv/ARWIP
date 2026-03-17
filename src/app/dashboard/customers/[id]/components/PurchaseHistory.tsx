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

  const formatDateSimple = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // --- 🔴 หน้ารายละเอียด (Detail View) แก้ไขเฉพาะส่วนนี้ ---
  if (selectedItem) {
    const isCash = selectedItem.type === 'cash';
    const sale = isCash ? selectedItem : (selectedItem.sales_transactions || {});
    const netPrice = Number(sale.unit_price || 0);
    const grandTotal = Number(isCash ? netPrice : selectedItem.total_purchase_price);

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
        <button 
          onClick={() => setSelectedItem(null)} 
          className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase transition-all mb-4"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> กลับสู่รายการทั้งหมด
        </button>

        {/* --- 💎 1. ปรับปรุง Header Card ใหม่ (Compact & Clean) --- */}
        <div className="relative overflow-hidden bg-slate-950 rounded-[40px] shadow-2xl border border-white/5">
          {/* แสงฟุ้ง Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] -mr-20 -mt-20 rounded-full" />
          
          <div className="relative z-10 p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              <div className="flex items-center gap-6">
                {/* Icon Container */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[22px] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                    <Box size={30} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isCash ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  </div>
                </div>

                {/* Info Area (ตัวหนังสือตรง สระไม่เบียด) */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${
                      isCash 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {isCash ? 'Cash Payment' : 'Installment Active'}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      REF: {selectedItem.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-snug">
                    {sale.product_name}
                  </h2>
                </div>
              </div>

              {/* Price Section (ฝั่งขวา) */}
              <div className="w-full lg:w-auto flex flex-col items-start lg:items-end border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">ยอดรวมที่ชำระทั้งสิ้น</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-indigo-500">฿</span>
                  <span className="text-3xl lg:text-4xl font-black text-white tracking-tighter tabular-nums">
                    {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- ส่วนที่เหลือ (Grid ข้อมูล) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* ข้อมูลสินค้า */}
          <div className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-5 mb-6">
                <Tag size={14} className="text-indigo-600"/> Product Specification
              </h3>
              <div className="space-y-8">
                <DetailItem label="ชื่อสินค้า" value={sale.product_name || 'N/A'} icon={<Package size={16}/>} fullWidth size="text-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                  <DetailItem label="รหัสสินค้า" value={sale.product_id || 'N/A'} icon={<Hash size={14}/>} />
                  <DetailItem label="ประเภท" value={isCash ? 'ซื้อเงินสด' : 'ผ่อนชำระ'} icon={<Zap size={14}/>} />
                  <DetailItem label="วันที่" value={formatDateSimple(sale.created_at)} icon={<Calendar size={14}/>} />
                  <DetailItem label="เวลา" value={new Date(sale.created_at).toLocaleTimeString('th-TH') + ' น.'} icon={<Clock size={14}/>} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 opacity-30">
              <p className="text-[10px] font-black text-slate-900 font-mono uppercase tracking-tighter">UID: {selectedItem.id}</p>
            </div>
          </div>

          {/* 🚩 Financial Summary (ปรับปรุงขนาดฟอนต์ให้ใหญ่ขึ้น) */}
          <div className="bg-white rounded-[35px] border border-slate-100 p-8 shadow-sm flex flex-col">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-5 mb-6">
              <Banknote size={14} className="text-indigo-600"/> Financial Summary
            </h3>
            <div className="space-y-6 flex-1 text-sm font-bold">
              <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[11px]">
                <span>ราคาสินค้าสุทธิ</span>
                <span className="text-slate-950 text-base">฿{netPrice.toLocaleString()}</span>
              </div>
              {!isCash && (
                <>
                  <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[11px]">
                    <span>เงินดาวน์</span>
                    <span className="text-rose-600 text-base">- ฿{Number(selectedItem.down_payment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[11px]">
                    <span>ดอกเบี้ยจัดเก็บ</span>
                    <span className="text-slate-950 text-base">฿{Number(selectedItem.total_interest || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-50 text-right">
              <p className="text-[10px] font-black text-indigo-600 uppercase mb-0.5 tracking-widest">ยอดรวมสุทธิ</p>
              <p className="text-4xl font-black text-slate-950 tracking-tighter">฿{grandTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* สาขาและพนักงาน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm">
               <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Store size={20}/>
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Branch Location</p>
                  <p className="text-lg font-black text-slate-950 truncate uppercase">{branchName}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-indigo-50/30 rounded-[30px] border border-indigo-100 shadow-sm">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <User size={20}/>
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Staff In-Charge</p>
                  <p className="text-lg font-black text-slate-900 truncate uppercase">{sale.staff_name || 'Admin'}</p>
               </div>
            </div>
        </div>
      </div>
    );
  }

  // --- 🔵 หน้าหลัก (Card View) --- (คงไว้เหมือนเดิม ไม่มีการแก้ไข)
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">รายการประวัติการซื้อ</p>
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

      <div className="grid grid-cols-1 gap-3">
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

function DetailItem({ label, value, icon, fullWidth = false, size = "text-base" }: any) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${fullWidth ? 'md:col-span-2' : ''}`}>
        <div className="text-indigo-600 mt-1 shrink-0 bg-indigo-50 p-2 rounded-lg">{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className={`font-black text-slate-900 truncate uppercase ${fullWidth ? (size === "text-base" ? "text-2xl" : size) : 'text-base'}`}>
            {value}
          </p>
        </div>
    </div>
  );
}