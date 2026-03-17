'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import Link from 'next/link'
import { 
  UserCheck, ChevronRight, Clock, 
  Zap, ArrowRight, Box, Tag, Loader2,
  ChevronLeft, MessageSquare, History, User,
  Calendar
} from 'lucide-react'

export default function CollectionHistoryView() {
  const [groupedHistory, setGroupedHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5 

useEffect(() => {
  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('collection_logs')
        .select(`
          *,
          installment_payments (installment_number),
          installment_contracts (
            id, 
            customer_id,
            customers (full_name, overdue_logs (installments)), 
            sales_transactions (product_name, product_id)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      //console.log("เช็คโครงสร้างข้อมูลก้อนแรก:", data[0]);

    const groups = data.reduce((acc: any, log: any) => {
    const contract = log.installment_contracts;
    const customer = Array.isArray(contract?.customers) ? contract.customers[0] : contract?.customers;

    // 🚩 เพิ่มบรรทัดนี้: ถ้าไม่มีชื่อลูกค้า ให้ข้ามไปเลย ไม่ต้องเก็บลงกลุ่ม
    if (!customer?.full_name) return acc; 

    const sales = Array.isArray(contract?.sales_transactions) ? contract.sales_transactions[0] : contract?.sales_transactions;
    const contractId = contract?.id || `unknown-${log.id}`;

    if (!acc[contractId]) {
        acc[contractId] = {
        contract_id: contractId,
        customer_id: contract?.customer_id || null,
        customer_name: customer.full_name, 
        current_overdue: customer.overdue_logs?.[0]?.installments || 0,
        product_name: sales?.product_name || 'ไม่ทราบรายการสินค้า',
        product_id: sales?.product_id || 'N/A',
        logs: [],
        last_contact: log.created_at
        }
    }
    acc[contractId].logs.push(log);
    return acc;
    }, {});
    
      setGroupedHistory(Object.values(groups))
    } catch (e) { 
      console.error("Fetch History Error:", e) 
    } finally { 
      setLoading(false) 
    }
  }
  fetchHistory()
}, [])

  const totalPages = Math.ceil(groupedHistory.length / rowsPerPage) || 1
  const currentItems = groupedHistory.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  if (loading) return (
    <div className="py-24 text-center flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <Loader2 className="animate-spin text-slate-900" size={48} />
        <History className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200" size={20} />
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Organizing History...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full px-2">
      <div className="flex-1 space-y-6">
        {currentItems.length > 0 ? currentItems.map((group, index) => {
          const isExpanded = expandedContractId === group.contract_id;
          const hasUrgentAction = group.logs.some((l: any) => l.result_note?.includes('[แจ้งเตือน SMS]') || l.result_note?.includes('[ติดตามด่วน]'));

          return (
            <div key={group.contract_id} className="relative group transition-all duration-500">
              {/* --- 👤 Card Header --- */}
              <div 
                onClick={() => setExpandedContractId(isExpanded ? null : group.contract_id)}
                className={`relative z-10 bg-white p-6 md:p-8 rounded-[35px] border border-slate-50 shadwo-sm transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isExpanded 
                  ? 'border-slate-900 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]' 
                  : 'border-slate-100 hover:border-slate-300 hover:shadow-xl shadow-sm'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-md'
                  }`}>
                    <User size={28} strokeWidth={isExpanded ? 2.5 : 2} />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {hasUrgentAction && (
                        <span className="flex items-center gap-1 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                        <Zap size={10} fill="white" /> ติดตามด่วน
                        </span>
                    )}
                    {group.current_overdue >= 3 && (
                        <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                            ค้างสะสม {group.current_overdue} งวด
                        </span>
                        )}

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Ref: {group.product_id}
                        </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                        {group.customer_name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Box size={12} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[150px]">
                          {group.product_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Last Interaction</p>
                    <div className="flex items-center md:justify-end gap-2 text-slate-900">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-sm font-black ">
                        {new Date(group.last_contact).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner ${
                isExpanded 
                ? 'bg-slate-950 text-white rotate-90 scale-110' 
                : 'bg-slate-50 text-slate-300 group-hover:bg-slate-950 group-hover:text-white group-hover:rotate-45'
                }`}>
                <ChevronRight size={18} strokeWidth={3} />
                </div>
                </div>
              </div>

                {/* --- 📝 Timeline Logs --- */}
                {isExpanded && (
                <div className="mx-4 md:mx-10 bg-slate-50/80 rounded-b-[40px] -mt-10 pt-16 pb-8 px-6 md:px-12 animate-in slide-in-from-top-8 duration-700 border-x-2 border-b-2 border-slate-100 shadow-inner">
                    
                    {/* 🚩 เพิ่ม Container สำหรับ Scrollbar: กำหนดความสูงและสไตล์การเลื่อน */}
                    <div className="max-h-[450px] overflow-y-auto pr-4 space-y-6 custom-scrollbar">
                    <div className="space-y-4">
                        {group.logs.map((log: any, logIdx: number) => {
                        // 🚩 แก้ไขเงื่อนไขตรงนี้: ให้เช็คทั้ง SMS และ ติดตามด่วน
                        const isUrgentAction = log.result_note.includes('[แจ้งเตือน SMS]') || log.result_note.includes('[ติดตามด่วน]');
                        
                        return (
                            <div key={log.id} className="relative flex gap-4 group/log">
                            {/* Timeline Line */}
                            {logIdx !== group.logs.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-slate-200" />
                            )}
                            
                            {/* 🚩 แก้ไข Icon: ถ้าเป็น Urgent Action ให้เป็นสายฟ้าสีแดง */}
                            <div className={`relative z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                isUrgentAction ? 'bg-rose-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                                {isUrgentAction ? <Zap size={16} fill="white" /> : <MessageSquare size={16} />}
                            </div>

                            <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover/log:border-slate-300 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    isUrgentAction ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                    แจ้งเตือนงวดที่  {log.installment_payments?.installment_number}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {new Date(log.created_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                </span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                "{log.result_note}"
                                </p>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    </div>
    <div className="pt-6 mt-4 border-t border-slate-200 flex justify-end">
      <Link 
          href={`/dashboard/customers/${group.customer_id}?tab=purchase&contractId=${group.contract_id}`}
          className="group/btn flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
      >
          เช็คประวัติการซื้อ 
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
)}
            </div>
          )
        }) : (
          <div className="py-32 text-center flex flex-col items-center justify-center gap-6 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
             <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                <UserCheck size={48} className="text-slate-200" />
             </div>
             <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-400">Archive Empty</p>
          </div>
        )}
      </div>
    </div>
  )
}