'use client'
import { ClipboardList, MessageSquare, Phone, Home, MessageCircle, Clock, Calendar } from 'lucide-react'

export default function CollectionHistoryTab({ logs }: { logs: any[] }) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone size={18} />;
      case 'line': return <MessageCircle size={18} />;
      case 'visit': return <Home size={18} />;
      default: return <MessageSquare size={18} />;
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'phone': return 'bg-blue-500';
      case 'line': return 'bg-emerald-500';
      case 'visit': return 'bg-purple-500';
      default: return 'bg-slate-900';
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-slate-200">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">Collection History</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={12} /> ประวัติการติดตามหนี้และสรุปการเจรจา
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center md:text-left">จำนวนการติดต่อ</p>
          <p className="text-xl font-black text-slate-900 text-center md:text-left">{logs.length} ครั้ง</p>
        </div>
      </div>

      {logs.length > 0 ? (
        <div className="relative ml-4 md:ml-7 border-l-2 border-slate-100 pl-8 md:pl-12 space-y-10 pb-10">
          {logs.map((log, index) => (
            <div key={log.id} className="relative group">
              {/* Dot on Timeline */}
              <div className={`absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-white transition-transform group-hover:scale-110 ${getMethodColor(log.contact_method)}`}>
                {getMethodIcon(log.contact_method)}
              </div>

              {/* Content Card */}
              <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {new Date(log.created_at).toLocaleDateString('th-TH', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getMethodColor(log.contact_method)}`} />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                        {log.contact_method === 'phone' ? 'โทรศัพท์' : log.contact_method === 'line' ? 'LINE' : 'ลงพื้นที่'}
                      </span>
                    </div>
                  </div>
                  
                  {log.promise_date && (
                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-3">
                       <Calendar size={14} className="text-amber-600" />
                       <div>
                         <p className="text-[8px] font-black text-amber-500 uppercase leading-none mb-1 text-right">วันนัดชำระ</p>
                         <p className="text-sm font-black text-amber-700 leading-none">
                           {new Date(log.promise_date).toLocaleDateString('th-TH')}
                         </p>
                       </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-50">
                  <p className="text-slate-700 font-bold leading-relaxed italic">"{log.result_note}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-24 text-center bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-200">
           <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
           <p className="text-slate-400 font-black uppercase tracking-[0.2em]">ยังไม่มีประวัติการติดต่อลูกค้าในขณะนี้</p>
        </div>
      )}
    </div>
  )
}