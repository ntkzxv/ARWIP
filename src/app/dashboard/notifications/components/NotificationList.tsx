'use client'
import React from 'react'
import { Box, ChevronRight, Clock, Timer } from 'lucide-react'
import { supabase } from '../../../../utils/supabase'
import Swal from 'sweetalert2'

export default function NotificationList({ items, activeTab, onItemClick, onRefresh, getRemainingTime }: any) {
  
  const handleNotifySMS = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('collection_logs').insert([{
        payment_id: item.id,
        contract_id: item.installment_contracts.id,
        contact_method: 'phone',
        result_note: activeTab === 'upcoming' 
          ? `[แจ้งเตือนล่วงหน้า] งวดที่ ${item.installment_number} ยอด ฿${Number(item.amount).toLocaleString()}`
          : `[แจ้งเตือน SMS] งวดที่ ${item.installment_number} ยอด ฿${Number(item.amount).toLocaleString()}`,
      }]);
      if (error) throw error;
      onRefresh();
      Swal.fire({ icon: 'success', title: 'สำเร็จ', timer: 1000, showConfirmButton: false });
    } catch (e) { console.error(e) }
  };

  if (items.length === 0) return (
    <div className="py-40 text-center flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
        <Box size={32} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">ไม่พบรายการในหมวดนี้</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {items.map((item: any, index: number) => {
        const isCooldown = activeTab === 'notified';
        const isUpcoming = activeTab === 'upcoming';
        const lastLog = item.collection_logs?.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return (
          <div 
            key={item.id} 
            onClick={() => onItemClick(item)} 
            // 🚩 ปรับ className ของ Card ให้มีการยกตัว (-translate-y-1) และ Transition ที่นุ่มนวล
            className="group bg-white rounded-[40px] border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-500 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-8 w-full md:w-3/5">
              <div className="relative shrink-0">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center font-black text-2xl transition-all duration-500 shadow-sm leading-none ${
                  isCooldown ? 'bg-slate-100 text-slate-400' : 'bg-slate-950 text-white group-hover:bg-slate-900'
                }`}>
                   <span className="mt-0.5">{item.installment_number}</span>
                </div>
                <div className={`absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-colors duration-500 ${
                  isCooldown ? 'bg-indigo-500' : isUpcoming ? 'bg-amber-500' : 'bg-rose-500'
                } text-white`}>
                  {isCooldown ? <Timer size={12} /> : <Clock size={12} />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`${isUpcoming ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'} text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-tight`}>
                    {isUpcoming ? 'ใกล้ครบกำหนด' : `ค้างสะสม ${item.total_overdue_count || 0} งวด`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ref: {item.installment_contracts?.sales_transactions?.product_id || 'N/A'}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter truncate leading-tight group-hover:text-slate-950 transition-colors">
                  {item.installment_contracts?.customers?.full_name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                   <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-tighter shadow-inner">
                      <Box size={11} className="text-slate-400" />
                      {item.installment_contracts?.sales_transactions?.product_name}
                   </span>
                   <span className={`text-[11px] font-black uppercase tracking-tight ${isUpcoming ? 'text-amber-600' : 'text-rose-500'}`}>
                      {isUpcoming ? 'ครบกำหนด: ' : 'เกินกำหนด: '} {new Date(item.due_date).toLocaleDateString('th-TH')}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 mt-6 md:mt-0 w-full md:w-auto justify-between border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-10">
               <div className="flex flex-col items-start md:items-end min-w-[140px]">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-widest leading-none">Required Payment</p>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <p className="text-2xl font-black text-slate-950 tracking-tighter">฿{Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    <p className="text-[10px] font-black text-slate-400">THB</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    disabled={isCooldown} 
                    onClick={(e) => handleNotifySMS(e, item)}
                    className={`px-8 py-4 rounded-[1.4rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                      isCooldown ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : isUpcoming ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    {isCooldown && lastLog ? `Relist in ${getRemainingTime(lastLog.created_at)}` : isUpcoming ? 'เตือนล่วงหน้า' : 'NOTIFY SMS'}
                  </button>
                  
                  {/* 🚩 แก้ไข: ลูกศรวงกลมให้มีการหมุน (rotate-45) และเปลี่ยนสีเมื่อชี้ (group-hover) */}
                  <div className={`w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 transition-all duration-500 shadow-inner group-hover:text-white group-hover:rotate-45 ${
                    isUpcoming ? 'group-hover:bg-slate-950' : 'group-hover:bg-slate-950'
                  }`}>
                    <ChevronRight size={18} strokeWidth={3} />
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}