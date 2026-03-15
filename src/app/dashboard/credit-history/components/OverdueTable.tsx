'use client'
import { AlertCircle, Calendar, ChevronRight, Smartphone, TrendingDown } from 'lucide-react'

export default function OverdueTable({ data }: { data: any[] }) {
  // ฟังก์ชันคำนวณจำนวนวันที่ค้างชำระ
  const getDaysOverdue = (dueDate: string) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-separate border-spacing-y-4 px-10 table-fixed">
        <tbody className="text-slate-900">
          {data.length > 0 ? data.map((item, index) => {
            const days = getDaysOverdue(item.due_date);
            
            return (
              <tr 
                key={item.id || index} 
                className="group bg-white hover:bg-rose-50/20 transition-all duration-500 shadow-sm hover:shadow-xl rounded-[35px] hover:-translate-y-1 border-2 border-slate-100/60 hover:border-rose-200"
              >
                {/* 1. ไอคอนแจ้งเตือนอันตราย (Rose Theme) */}
                <td className="py-9 pl-12 rounded-l-[35px] w-[130px] align-middle">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-[22px] flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-sm shadow-rose-100">
                        <AlertCircle size={22} strokeWidth={2.5} className={days > 7 ? "animate-pulse" : ""} />
                      </div>
                    </div>
                    <div className="h-10 w-[2px] bg-slate-100 group-hover:bg-rose-100" />
                  </div>
                </td>

                {/* 2. รายละเอียดลูกค้า */}
                <td className="py-9 align-middle w-[22%] pl-2">
                  <div className="flex flex-col">
                    <span className="text-[20px] font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors">
                      {item.customer_name}
                    </span>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100/50">
                        Overdue Payment
                      </span>
                    </div>
                  </div>
                </td>

                {/* 3. ยอดค้างชำระ (Italic + Rose) */}
                <td className="py-9 align-middle w-[18%]">
                  <div className="flex flex-col items-end pr-10 border-r border-slate-100 h-12 justify-center">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none font-sans">Total Debt</span>
                    <div className="flex items-baseline gap-1 leading-none">
                      <span className="text-[24px] font-black text-rose-600 tracking-tighter italic">
                        {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-black text-slate-900 uppercase">THB</span>
                    </div>
                  </div>
                </td>

                {/* 4. จำนวนวันที่ค้าง (Timeline) */}
                <td className="py-9 align-middle w-[22%] pl-10">
                  <div className="flex flex-col h-12 justify-center">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none font-sans">Overdue Duration</span>
                    <div className="flex items-center gap-3 leading-none h-[24px]">
                      <div className={`px-3 py-1 rounded-lg font-black text-[14px] transition-colors ${
                        days > 7 ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {days} วัน
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
                      <span className="text-[12px] font-bold text-slate-400 italic">
                         ตั้งแต่ {new Date(item.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 5. ข้อมูลสินค้า & งวด (ล็อกระนาบ + เส้นแบ่งหน้า Term) */}
                <td className="py-9 pr-12 rounded-r-[35px] flex-1 align-middle">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8 pl-10 h-10 w-full max-w-[320px]">
                      
                      {/* Asset ID */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest font-sans">Asset ID</span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Smartphone size={12} className="opacity-40 shrink-0" />
                          <span className="text-[13px] font-black font-mono truncate">
                            {item.product_id || '---'}
                          </span>
                        </div>
                      </div>
                      
                      {/* ส่วนของ "งวดที่ค้าง" ย้ายเส้นแบ่งมาไว้ตรงนี้ */}
                      <div className="flex flex-col items-center w-20 shrink-0 border-l-2 border-slate-100 pl-6">
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest text-center font-sans">Term</span>
                        <span className="text-[20px] font-black text-rose-600 text-center tracking-tighter italic leading-none">
                          {item.installment_number || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-inner shrink-0 ml-4">
                        <ChevronRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={6} className="py-40 text-center">
                <div className="flex flex-col items-center gap-3">
                  <TrendingDown size={40} className="text-slate-100" />
                  <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-[10px] font-sans">
                    Clean History - No Overdue
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}