'use client'
import { BellRing, Calendar, ChevronRight, Smartphone } from 'lucide-react'

export default function NoticeTable({ data, onRowClick }: { data: any[], onRowClick: (item: any) => void }) {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-separate border-spacing-y-4 px-10 table-fixed">
        <tbody className="text-slate-900">
          {data.length > 0 ? data.map((item, index) => (
            <tr 
              key={item.id || index} 
              onClick={() => onRowClick(item)}
              className="group bg-white hover:bg-orange-50/20 transition-all duration-500 shadow-sm hover:shadow-xl rounded-[35px] hover:-translate-y-1 border-2 border-slate-100/60 hover:border-orange-200 cursor-pointer"
            >
              {/* 1. Icon Section */}
              <td className="py-9 pl-12 rounded-l-[35px] w-[130px] align-middle">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-[22px] flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <BellRing size={22} strokeWidth={2.5} />
                  </div>
                  <div className="h-10 w-[2px] bg-slate-100 group-hover:bg-orange-100" />
                </div>
              </td>

              {/* 2. Customer Name */}
              <td className="py-9 align-middle w-[22%] pl-2">
                <div className="flex flex-col">
                  <span className="text-[20px] font-black text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                    {item.customer_name}
                  </span>
                  <div className="flex items-center gap-2 mt-2.5">
                    {(() => {
                      const diffTime = new Date(item.due_date).getTime() - new Date().setHours(0,0,0,0);
                      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      return (
                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-100/50">
                          {remainingDays > 0 
                            ? `อีก ${remainingDays} วันครบกำหนด` 
                            : remainingDays === 0 
                              ? 'ครบกำหนดวันนี้' 
                              : 'เลยกำหนดชำระ'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </td>

              {/* 3. Amount Section */}
              <td className="py-9 align-middle w-[18%]">
                <div className="flex flex-col items-end pr-10 border-r border-slate-100 h-12 justify-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Required</span>
                  <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-[24px] font-black text-slate-950 tracking-tighter">
                      {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-black text-orange-500 uppercase">THB</span>
                  </div>
                </div>
              </td>

              {/* 4. Timeline Section */}
              <td className="py-9 align-middle w-[20%] pl-10">
                <div className="flex flex-col h-12 justify-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Due Date</span>
                  <div className="flex items-center gap-3 leading-none h-[24px]">
                    <span className="text-[16px] font-black text-slate-800 tracking-tight">
                      {new Date(item.due_date).toLocaleDateString('th-TH', { 
                        day: '2-digit', month: 'short', year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </td>

              {/* 5. Product ID & Term (ปรับตามที่คุณขอ ✨) */}
              <td className="py-9 pr-12 rounded-r-[35px] flex-1 align-middle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8 pl-10 h-10 w-full max-w-[320px]">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">Product ID</span>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Smartphone size={12} className="opacity-40 shrink-0 text-orange-500" />
                        <span className="text-[13px] font-black font-mono truncate uppercase">
                          {item.product_id || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center w-20 shrink-0 border-l-2 border-slate-100 pl-6">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest text-center">Term</span>
                      <span className="text-[20px] font-black text-orange-500 text-center tracking-tighter italic leading-none">
                        {item.installment_number || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-inner shrink-0 ml-4">
                    <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={6} className="py-40 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">No Pending Notices</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}