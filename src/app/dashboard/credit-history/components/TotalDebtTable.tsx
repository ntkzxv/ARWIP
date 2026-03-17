'use client'
import React, { useState } from 'react'
import { 
  Landmark, Package, ChevronRight, 
  Hash, Calculator, Box, Calendar
} from 'lucide-react'

export default function TotalDebtTable({ data }: { data: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-40 text-center relative z-10">
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] font-sans">
          No Debt Records Found
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full overflow-hidden font-sans">
      <table className="w-full border-separate border-spacing-y-4 px-10 table-fixed">
        <tbody>
          {data.map((item, index) => {
            const rowId = item.customer_id ? `debt-${item.customer_id}-${index}` : `debt-idx-${index}`;
            const isExpanded = expandedId === rowId;

            return (
              <React.Fragment key={rowId}>
                {/* --- 👤 Card Header --- */}
                <tr 
                  onClick={() => toggleExpand(rowId)}
                  className={`group bg-white hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl rounded-[35px] border-2 ${isExpanded ? 'border-slate-900 bg-slate-50/40' : 'border-slate-100/60 hover:border-slate-300'} cursor-pointer relative z-10`}
                >
                  <td className="py-9 pl-12 rounded-l-[35px] w-[130px] align-middle">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-500'}`}>
                          <Landmark size={22} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-100" />
                    </div>
                  </td>

                  <td className="py-9 align-middle w-[25%] pl-2">
                    <div className="flex flex-col">
                      <span className={`text-[20px] font-black tracking-tight leading-none transition-colors ${isExpanded ? 'text-slate-900' : 'text-slate-800'}`}>
                        {item.customer_name || 'ไม่ระบุชื่อ'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isExpanded ? 'text-slate-900' : 'text-slate-400'}`}>
                          {isExpanded ? 'Close View' : 'Check Details'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-9 align-middle w-[15%]">
                    <div className="flex flex-col items-center border-x border-slate-100 h-12 justify-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Remaining</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[24px] font-black text-slate-900 tracking-tighter">{item.remaining_installments}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">งวด</span>
                      </div>
                    </div>
                  </td>

                  {/* 4. Total Amount Section (🚩 แก้ไข: เพิ่ม THB ด้านหลัง) */}
                  <td className="py-9 align-middle w-[25%] pr-10">
                    <div className="flex flex-col items-end pr-10 border-r border-slate-100 h-12 justify-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Debt Balance</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-[26px] font-black tracking-tighter ${isExpanded ? 'text-slate-900' : 'text-slate-700'}`}>
                          ฿{Number(item.total_remaining_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] font-black uppercase ${isExpanded ? 'text-slate-900' : 'text-slate-400'}`}>THB</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-9 pr-12 rounded-r-[35px] flex-1 align-middle">
                    <div className="flex items-center justify-end">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner shrink-0 ml-4 ${
                        isExpanded ? 'bg-slate-900 text-white rotate-90 shadow-md scale-110' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:rotate-45'
                      }`}>
                        <ChevronRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </td>
                </tr>

                {/* --- 📝 Timeline Detail Section --- */}
                {isExpanded && (
                  <tr className="animate-in slide-in-from-top-8 fade-in duration-700">
                    <td colSpan={5} className="px-10 pb-8 -mt-10">
                      <div className="bg-slate-50/80 rounded-b-[45px] border-x-2 border-b-2 border-slate-200 pt-16 pb-8 px-12 shadow-inner">
                        <div className="flex items-center gap-3 mb-8 px-2">
                           <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Pending Items Tracking History</span>
                        </div>

                        <div className="space-y-8 relative">
                          {item.product_list?.map((prod: any, idx: number) => (
                            <div key={`${rowId}-prod-${idx}`} className="relative flex gap-6 group/item">
                              {idx !== item.product_list.length - 1 && (
                                <div className="absolute left-[23px] top-12 bottom-[-32px] w-[2px] bg-slate-200 border-dashed" />
                              )}
                              <div className="relative z-10 shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover/item:border-slate-900 transition-colors">
                                <Box size={20} className="text-slate-400 group-hover/item:text-slate-900" />
                              </div>
                              <div className="flex-1 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm group-hover/item:border-slate-900 group-hover/item:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Product</span>
                                    <h4 className="text-[16px] font-black text-slate-900 uppercase leading-none">{prod.product_name}</h4>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-slate-100 text-slate-900 text-[10px] font-black px-3 py-1 rounded-lg border border-slate-200 uppercase">
                                      {prod.count} งวดที่เหลือ
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                  <div className="flex items-center gap-1.5">
                                    <Hash size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{prod.product_id}</span>
                                  </div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-[18px] font-black text-slate-900 tracking-tight">฿{Number(prod.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase">THB</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary Footer Box (🚩 แก้ไข: เพิ่ม THB ด้านหลัง) */}
                        <div className="mt-10 pt-8 border-t border-dashed border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4 px-6">
                           <div className="flex items-center gap-3 text-slate-400">
                              <Calendar size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Data as of {new Date().toLocaleDateString('th-TH')}</span>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Final Outstanding</p>
                                <div className="flex items-baseline gap-1">
                                  <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">
                                    ฿{Number(item.total_remaining_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                  <span className="text-[12px] font-black text-slate-400 uppercase">THB</span>
                                </div>
                              </div>
                              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg">
                                <Calculator size={20} />
                              </div>
                           </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}