'use client'
import { BellRing, ChevronRight, Smartphone } from 'lucide-react'

export default function NoticeTable({ data, onRowClick }: { data: any[], onRowClick: (item: any) => void }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
        No Pending Notices
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="min-w-[800px] space-y-3">
        {data.map((item, index) => {
          const diffTime = new Date(item.due_date).getTime() - new Date().setHours(0,0,0,0);
          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return (
            <div 
              key={item.id || index} 
              onClick={() => onRowClick(item)}
              className="group bg-white hover:bg-amber-50/30 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl p-4 sm:p-5 border border-slate-100/60 hover:border-amber-200 cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-[220px]">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <BellRing size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate whitespace-nowrap">
                    {item.customer_name || 'ไม่ระบุชื่อ'}
                  </h4>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold border border-amber-100 whitespace-nowrap">
                    {remainingDays > 0 ? `อีก ${remainingDays} วันครบกำหนด` : remainingDays === 0 ? 'ครบกำหนดวันนี้' : 'เลยกำหนดชำระ'}
                  </span>
                </div>
              </div>

              <div className="text-center min-w-[140px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Required</span>
                <span className="text-lg font-black text-slate-900">
                  ฿{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-center min-w-[140px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Due Date</span>
                <span className="text-sm font-bold text-slate-700">
                  {item.due_date ? new Date(item.due_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>

              <div className="flex items-center gap-6 min-w-[180px] justify-end">
                <div className="text-right whitespace-nowrap">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Product ID / Term</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Smartphone size={12} className="text-amber-500" />
                    <span className="text-xs font-bold font-mono text-slate-600">{item.product_id || 'N/A'}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">T.{item.installment_number || '-'}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-300 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}