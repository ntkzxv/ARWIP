'use client'
import { AlertCircle } from 'lucide-react'

export default function OverdueTable({ data }: { data: any[] }) {
  const getDaysOverdue = (dueDate: string) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ยอดค้าง</th>
          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ค้างมาแล้ว</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((item) => {
          const days = getDaysOverdue(item.due_date);
          return (
            <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
              <td className="px-8 py-5">
                <AlertCircle size={20} className="text-rose-500 animate-pulse" />
              </td>
              <td className="px-8 py-5 font-bold text-slate-700">{item.customer_name}</td>
              <td className="px-8 py-5 text-right font-black text-rose-600">฿{Number(item.amount).toLocaleString()}</td>
              <td className="px-8 py-5 text-center">
                <span className="text-rose-500 font-black text-xs uppercase bg-rose-50 px-3 py-1 rounded-lg">
                  {days} วัน
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )
}