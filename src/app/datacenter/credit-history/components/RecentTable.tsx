'use client'
import { Wallet, CheckCircle2, ChevronRight, Hash, Smartphone } from 'lucide-react'

interface RecentTableProps {
  data: any[]
  onRowClick?: (item: any) => void
}

export default function RecentTable({ data, onRowClick }: RecentTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-300 font-bold uppercase tracking-[0.3em] text-xs">
          No Recent Transactions Found
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="min-w-[900px] space-y-3">
        {data.map((item, index) => {
          const formattedAmount = Number(item.amount || item.amount_paid || 0).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          const dateObj = item.created_at || item.paid_at ? new Date(item.created_at || item.paid_at) : null
          const formattedDate = dateObj
            ? dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
            : '---'
          const formattedTime = dateObj
            ? dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : '--:--'

          return (
            <div
              key={item.id || index}
              onClick={() => onRowClick && onRowClick(item)}
              className="group bg-white hover:bg-emerald-50/20 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl p-4 sm:p-5 border border-slate-100/60 hover:border-emerald-200 cursor-pointer flex items-center justify-between gap-4"
            >
              {/* 1. Status Icon & Customer Name / Bank Ref */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Wallet size={20} />
                  </div>
                  <CheckCircle2 size={14} className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate whitespace-nowrap">
                    {item.customer_name || 'ไม่ระบุชื่อ'}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5 text-slate-400 text-xs font-mono">
                    <Hash size={10} className="shrink-0" />
                    <span className="truncate uppercase">{item.bank_ref || item.transaction_code || 'TRX-PAYMENT'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Received Amount */}
              <div className="text-center min-w-[150px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  RECEIVED
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg font-black text-slate-900">
                    ฿{formattedAmount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">
                    THB
                  </span>
                </div>
              </div>

              {/* 3. Timeline Date & Time */}
              <div className="text-center min-w-[160px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  TIMELINE
                </span>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm font-bold text-slate-700">
                    {formattedDate}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-400">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* 4. Product ID */}
              <div className="text-center min-w-[140px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  PRODUCT ID
                </span>
                <div className="flex items-center justify-center gap-1 text-slate-600">
                  <Smartphone size={12} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold font-mono uppercase">
                    {item.product_id || 'N/A'}
                  </span>
                </div>
              </div>

              {/* 5. Term */}
              <div className="text-center min-w-[90px] whitespace-nowrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  TERM
                </span>
                <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg">
                  {item.installment_number ? `งวดที่ ${item.installment_number}` : '-'}
                </span>
              </div>

              {/* 6. Action Icon */}
              <div className="shrink-0 pl-2">
                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all">
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