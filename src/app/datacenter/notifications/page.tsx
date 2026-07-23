'use client'
import { useEffect, useState, useRef } from 'react'
import { 
  Search, Bell, ClockAlert, History, 
  Send, Calendar, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

import CollectionHistoryView from './components/CollectionHistoryView'
import CollectionLogModal from '../../../components/CollectionLogModal'
import UrgentContactModal from '../../../components/UrgentContactModal'
import NotificationList from './components/NotificationList' 

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [overdueList, setOverdueList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending') 
  const [selectedDate, setSelectedDate] = useState<string>('')
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false) 

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10 

  const getRemainingTime = (createdAt: string | undefined) => {
    if (!createdAt) return "N/A";
    const fortyEightHours = 24 * 60 * 60 * 1000;
    const remaining = fortyEightHours - (new Date().getTime() - new Date(createdAt).getTime());
    if (remaining <= 0) return "Ready";
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ชม. ${mins}นาที`;
  };

  const fetchData = async () => {
    if (activeTab === 'history') return;
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, full_name,
          overdue_logs (installments, priority),
          sales_transactions (product_name, product_id),
          installment_contracts (
            id,
            installment_payments (
              id, installment_number, amount, due_date, paid_at,
              collection_logs (contact_method, result_note, created_at)
            )
          )
        `);

      if (error) throw error

      const formattedData: any[] = [];
      const nowTime = new Date().getTime();
      const COOLDOWN_MS = 48 * 60 * 60 * 1000;

      data?.forEach((customer: any) => {
        customer.installment_contracts?.forEach((contract: any) => {
          const unpaid = contract.installment_payments?.filter((p: any) => !p.paid_at) || [];
          unpaid.forEach((payment: any) => {
            formattedData.push({
              ...payment,
              priority: customer.overdue_logs?.[0]?.priority || 'low',
              total_overdue_count: customer.overdue_logs?.[0]?.installments || 0,
              installment_contracts: {
                id: contract.id,
                customers: { full_name: customer.full_name },
                sales_transactions: customer.sales_transactions?.[0] || { product_name: '-', product_id: 'N/A' }
              }
            });
          });
        });
      });

      const filteredBySearch = formattedData.filter(item => {
        const matchSearch = !searchTerm || item.installment_contracts?.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDate = !selectedDate || item.due_date === selectedDate;
        return matchSearch && matchDate;
      });

      if (activeTab === 'pending') {
        setOverdueList(filteredBySearch.filter(item => {
          const isOverdue = new Date(item.due_date).getTime() < nowTime;
          if (!isOverdue) return false;
          if (!item.collection_logs || item.collection_logs.length === 0) return true;
          const lastLog = [...item.collection_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          return (nowTime - new Date(lastLog.created_at).getTime()) > COOLDOWN_MS;
        }));
      } else if (activeTab === 'notified') {
        setOverdueList(filteredBySearch.filter(item => {
          if (!item.collection_logs || item.collection_logs.length === 0) return false;
          const lastLog = [...item.collection_logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          return (nowTime - new Date(lastLog.created_at).getTime()) <= COOLDOWN_MS;
        }));
      } else if (activeTab === 'upcoming') {
        setOverdueList(filteredBySearch.filter(item => {
          const dueDate = new Date(item.due_date);
          const diffDays = Math.ceil((dueDate.getTime() - nowTime) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 3;
        }));
      }
      setCurrentPage(1)
    } catch (err: any) {
      console.error("Fetch error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [activeTab, searchTerm, selectedDate])

  const totalPages = Math.ceil(overdueList.length / rowsPerPage) || 1;
  const currentItems = overdueList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="w-full min-w-0 space-y-6 pb-10 font-sans bg-[#F4F7FE] min-h-screen animate-in fade-in duration-700">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase leading-none">
            NOTIFI<span className="text-indigo-600">CATIONS</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            INTELLIGENT DEBT COLLECTION SYSTEM
          </p>
        </div>
        <div className="flex flex-wrap p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
          <TabBtn active={activeTab === 'upcoming'} label="ใกล้ครบ" icon={Bell} activeColor="text-amber-500" onClick={() => setActiveTab('upcoming')} />
          <TabBtn active={activeTab === 'pending'} label="ค้างชำระ" icon={ClockAlert} activeColor="text-rose-600" onClick={() => setActiveTab('pending')} />
          <TabBtn active={activeTab === 'notified'} label="ตามแล้ว" icon={Send} activeColor="text-indigo-600" onClick={() => setActiveTab('notified')} />
          <TabBtn active={activeTab === 'history'} label="ประวัติ" icon={History} activeColor="text-slate-900" onClick={() => setActiveTab('history')} />
        </div>
      </div>

      {/* SEARCH & FILTER */}
      {activeTab !== 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="lg:col-span-9 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อลูกค้า..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="lg:col-span-3 relative">
            <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none" onChange={(e) => setSelectedDate(e.target.value)} />
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              className={`w-full h-[48px] flex items-center justify-center gap-2 px-5 rounded-2xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95 ${
                selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Calendar size={16} />
              <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH') : 'เลือกวันที่'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex-1 w-full overflow-x-auto">
          {loading && activeTab !== 'history' ? (
            <SkeletonNotificationList rows={6} />
          ) : (
            <div className="w-full min-w-[700px] animate-in fade-in duration-500">
              {activeTab === 'history' ? (
                <CollectionHistoryView />
              ) : (
                <NotificationList 
                  items={currentItems}
                  activeTab={activeTab}
                  getRemainingTime={getRemainingTime}
                  onItemClick={(item: any) => {
                    setSelectedItem(item);
                    if (activeTab === 'notified') setIsUrgentModalOpen(true);
                    else setIsLogModalOpen(true);
                  }}
                  onRefresh={fetchData}
                />
              )}
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && activeTab !== 'history' && overdueList.length > rowsPerPage && (
          <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between sm:justify-end gap-4">
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => {setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-90'}`}
              >
                <ChevronLeft size={18} strokeWidth={2.5}/>
              </button>
              <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none py-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    onClick={() => {setCurrentPage(page); window.scrollTo({top: 0, behavior: 'smooth'});}}
                    className={`min-w-[40px] h-10 px-3 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50' }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => {setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-90'}`}
              >
                <ChevronRight size={18} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {isLogModalOpen && <CollectionLogModal item={selectedItem} onClose={() => setIsLogModalOpen(false)} onSave={fetchData} />}
      {isUrgentModalOpen && <UrgentContactModal item={selectedItem} onClose={() => setIsUrgentModalOpen(false)} onSave={fetchData} />}
    </div>
  )
}

function SkeletonNotificationList({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse p-6 space-y-4 min-w-[700px]">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-slate-200/60 rounded-2xl shrink-0"></div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-200 rounded-lg w-40"></div>
              <div className="h-2 bg-slate-100 rounded-full w-24"></div>
            </div>
          </div>
          <div className="flex gap-8 items-center">
             <div className="space-y-1.5 text-right">
                <div className="h-3 bg-slate-100 rounded-full w-16 ml-auto"></div>
                <div className="h-2 bg-slate-50 rounded-full w-12 ml-auto"></div>
             </div>
             <div className="w-20 h-8 bg-slate-200/60 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabBtn({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap ${active ? `bg-white ${activeColor} shadow-sm` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
    >
      <Icon size={15} /> {label}
    </button>
  )
}