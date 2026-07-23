'use client'
import React, { useState } from 'react'
import { Landmark, ChevronRight, Box, Calculator, Calendar } from 'lucide-react'

export default function TotalDebtTable({ data }: { data: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
        No Debt Records Found
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="min-w-[800px] space-y-3">
        {data.map((item, index) => {
          const rowId = `debt-${item.customer_id}-${index}`;
          const isExpanded = expandedId === rowId;

          return (
            <div key={rowId} className="space-y-2">
              <div 
                onClick={() => setExpandedId(isExpanded ? null : rowId)}
                className={`group bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl p-4 sm:p-5 border ${isExpanded ? 'border-slate-900 bg-slate-50/50' : 'border-slate-100/60'} cursor-pointer flex items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-4 min-w-[220px]">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Landmark size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 truncate whitespace-nowrap">
                      {item.customer_name || 'ไม่ระบุชื่อ'}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {isExpanded ? 'Click to Close' : 'Click to View'}
                    </span>
                  </div>
                </div>

                <div className="text-center min-w-[120px] whitespace-nowrap">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Remaining</span>
                  <span className="text-sm font-bold text-slate-800">{item.remaining_installments} งวด</span>
                </div>

                <div className="text-center min-w-[160px] whitespace-nowrap">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Debt Balance</span>
                  <span className="text-lg font-black text-slate-900">
                    ฿{Number(item.total_remaining_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <ChevronRight size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-in fade-in duration-300">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">รายการสินค้าคงเหลือ</div>
                  <div className="space-y-2">
                    {item.product_list?.map((prod: any, idx: number) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Box size={18} className="text-slate-400 shrink-0" />
                          <div>
                            <h5 className="text-sm font-bold text-slate-800">{prod.product_name}</h5>
                            <span className="text-[10px] font-mono text-slate-400">{prod.product_id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-500 block">{prod.count} งวดที่เหลือ</span>
                          <span className="text-sm font-black text-slate-900">฿{Number(prod.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}