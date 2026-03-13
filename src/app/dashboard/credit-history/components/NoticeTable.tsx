'use client'
import { BellRing, Calendar } from 'lucide-react'

export default function NoticeTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ยอดที่ต้องจ่าย</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">กำหนดชำระ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
            <td className="px-8 py-5">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">Pending</span>
            </td>
            <td className="px-8 py-5 font-bold text-slate-700">{item.customer_name}</td>
            <td className="px-8 py-5 text-right font-black text-indigo-600">฿{Number(item.amount).toLocaleString()}</td>
            <td className="px-8 py-5 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs">
                <Calendar size={14} /> {new Date(item.due_date).toLocaleDateString('th-TH')}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}