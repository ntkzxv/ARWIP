'use client'
import { CheckCircle2, Wallet, ArrowUpRight, Smartphone, Hash } from 'lucide-react'

// กำหนด Interface ให้ชัดเจน
interface RecentTableProps {
  data: any[];
  onRowClick: (item: any) => void;
}

export default function RecentTable({ data, onRowClick }: RecentTableProps) {
  // เช็คเบื้องต้นว่ามีข้อมูลไหม
  if (!data || data.length === 0) {
    return (
      <div className="py-40 text-center">
        <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px] font-sans">
          No Recent Transactions Found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-separate border-spacing-y-4 px-10 table-fixed">
        <tbody className="text-slate-900">
          {data.map((item, index) => (
            <tr 
              key={item.id || index} 
              onClick={() => onRowClick(item)}
              className="group bg-white hover:bg-slate-50/50 transition-all duration-500 shadow-sm hover:shadow-xl rounded-[35px] hover:-translate-y-1 border-2 border-slate-100/60 hover:border-indigo-100 cursor-pointer"
            >
              {/* 1. Icon Section */}
              <td className="py-9 pl-12 rounded-l-[35px] w-[130px] align-middle">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[22px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Wallet size={22} strokeWidth={2.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100" />
                </div>
              </td>

              {/* 2. Customer Name (เช็คชื่อ Field ให้ตรงกับ DB) */}
              <td className="py-9 align-middle w-[22%] pl-2">
                <div className="flex flex-col">
                  <span className="text-[20px] font-black text-slate-900 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">
                    {item.customer_name || 'ไม่ระบุชื่อ'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Hash size={10} className="text-slate-300" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                      {item.bank_ref || 'TRX-PAYMENT'} 
                    </span>
                  </div>
                </div>
              </td>

              {/* 3. Amount Section */}
              <td className="py-9 align-middle w-[18%]">
                <div className="flex flex-col items-end pr-10 border-r border-slate-100 h-12 justify-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Received</span>
                  <div className="flex items-baseline gap-1 leading-none">
                    <span className="text-[24px] font-black text-slate-950 tracking-tighter italic">
                      {Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase font-sans">THB</span>
                  </div>
                </div>
              </td>

              {/* 4. Timeline (วันที่ไทย + ปี ค.ศ.) */}
              <td className="py-9 align-middle w-[22%] pl-10">
                <div className="flex flex-col h-12 justify-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Timeline</span>
                  <div className="flex items-center gap-3 leading-none h-[24px]">
                    <span className="text-[16px] font-black text-slate-800 tracking-tight">
                      {item.created_at 
                        ? new Date(item.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '---'}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                    <span className="text-[14px] font-bold text-slate-400 italic">
                      {item.created_at 
                        ? new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) 
                        : '--:--'}
                    </span>
                  </div>
                </div>
              </td>

              {/* 5. Term & Button */}
              <td className="py-9 pr-12 rounded-r-[35px] flex-1 align-middle">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8 pl-10 h-10 w-full max-w-[320px]">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">Asset ID</span>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Smartphone size={12} className="opacity-40" />
                        <span className="text-[13px] font-black font-mono truncate">{item.product_id || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center w-20 shrink-0 border-l-2 border-slate-100 pl-6">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">Term</span>
                      <span className="text-[20px] font-black text-emerald-600 italic leading-none">
                        {item.installment_number || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                    <ArrowUpRight size={18} strokeWidth={3} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}