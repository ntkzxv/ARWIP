'use client'

import { useEffect, useState } from 'react'

export default function RecentTable({ data: initialData }: { data?: any[] }) {
  // 1. สร้าง State ภายในเพื่อรองรับการอัปเดตข้อมูล
  const [transactions, setTransactions] = useState<any[]>(initialData || [])

  // 2. [Option] หากในอนาคตต้องการให้ดึงจาก Database โดยตรงเมื่อโหลดหน้า
  // สามารถใส่ Logic การ Fetch ข้อมูลที่นี่ได้
  useEffect(() => {
    if (initialData) {
      setTransactions(initialData)
    }
  }, [initialData])

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-separate border-spacing-y-4 px-10 table-fixed">
        <tbody className="text-slate-900">
          {transactions.length > 0 ? transactions.map((item, index) => (
            <tr 
              key={item.id || index} 
              className="group bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md rounded-[30px]"
            >
              {/* 1. ลำดับ */}
              <td className="py-10 pl-12 rounded-l-[30px] w-[120px] align-middle">
                <div className="flex items-center gap-6">
                  <span className="text-xl font-black text-indigo-600 tracking-tighter">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="h-8 w-[2px] bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                </div>
              </td>

              {/* 2. ชื่อลูกค้า */}
              <td className="py-10 align-middle w-[20%] pl-2">
                <div className="flex flex-col justify-center">
                  <span className="text-[22px] font-black text-slate-900 tracking-tight leading-none truncate">
                    {item.customer_name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold mt-1.5 opacity-80 tracking-widest uppercase">
                    # {item.bank_ref || 'REF-XXXXXX'} 
                  </span>
                </div>
              </td>

              {/* 3. ราคา (ลงท้ายด้วย THA) */}
              <td className="py-10 align-middle w-[18%]">
                <div className="flex flex-col items-end pr-8 border-r border-slate-200">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5">Amount</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[22px] font-black text-slate-950 tracking-tighter leading-none">
                      {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[12px] font-black text-indigo-950 uppercase tracking-wider">THA</span>
                  </div>
                </div>
              </td>

              {/* 4. วันที่ และ เวลา */}
              <td className="py-10 align-middle w-[22%] pl-8">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Payment Date</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[17px] font-black text-slate-900 tracking-tight uppercase">
                      {new Date(item.created_at).toLocaleDateString('en-GB')}
                    </span>
                    <div className="w-[1px] h-3 bg-slate-200"></div>
                    <span className="text-[13px] font-bold text-slate-500 tracking-tight whitespace-nowrap">
                      {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                </div>
              </td>

              {/* 5. ส่วนท้าย: ID และ งวด */}
              <td className="py-10 pr-12 rounded-r-[30px] flex-1 align-middle">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-12 pl-8 border-l border-slate-100 h-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">Product ID</span>
                      <span className="text-[14px] font-black text-slate-600 font-mono tracking-tighter uppercase">
                        {item.product_id || 'N/A'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-300 uppercase mb-1.5 tracking-widest">งวด</span>
                      <span className="text-[14px] font-black text-indigo-600 tracking-tighter">
                        {item.installment_number || '-'}
                      </span>
                    </div>
                  </div>

                  {/* ช่องเขียว */}
                  <div className="flex items-center">
                    <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 rounded-[12px] border-2 border-emerald-200 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-700 text-[11px] font-black tracking-tight whitespace-nowrap uppercase">
                        ชำระค่างวด
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="py-40 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-xs">
                No Transactions Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}