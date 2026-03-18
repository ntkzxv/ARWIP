'use client'
import { useEffect, useState, useRef, memo } from 'react'
import { 
  Search, Bell, ClockAlert, History, 
  X, Zap, Phone, ClipboardList, 
  Hash, Box, Send, Banknote, Clock,
  Calendar, Timer, ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// Import Components
import CollectionHistoryView from './components/CollectionHistoryView'
import CollectionLogModal from '../../../components/CollectionLogModal'
import UrgentContactModal from '../../../components/UrgentContactModal'
import NotificationList from './components/NotificationList' 
import Swal from 'sweetalert2'

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
        customer.installment_contracts.forEach((contract: any) => {
          const unpaid = contract.installment_payments.filter((p: any) => !p.paid_at);
          unpaid.forEach((payment: any) => {
            formattedData.push({
              ...payment,
              priority: customer.overdue_logs?.[0]?.priority || 'low',
              total_overdue_count: customer.overdue_logs?.[0]?.installments || 0,
              installment_contracts: {
                id: contract.id,
                customers: { full_name: customer.full_name },
                sales_transactions: customer.sales_transactions[0]
              }
            });
          });
        });
      });

      const filteredBySearch = formattedData.filter(item => {
        const matchSearch = !searchTerm || item.installment_contracts?.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="space-y-6 pb-10 font-sans animate-in fade-in duration-700 pl-30 pr-15 bg-[#F4F7FE] min-h-screen">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            notifi<span className="text-indigo-600">cations</span>
          </h1>
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.3em]">INTELLIGENT DEBT COLLECTION SYSTEM</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200">
          <TabBtn active={activeTab === 'upcoming'} label="ใกล้ครบ" icon={Bell} activeColor="text-amber-500" onClick={() => setActiveTab('upcoming')} />
          <TabBtn active={activeTab === 'pending'} label="ค้างชำระ" icon={ClockAlert} activeColor="text-rose-600" onClick={() => setActiveTab('pending')} />
          <TabBtn active={activeTab === 'notified'} label="ตามแล้ว" icon={Send} activeColor="text-indigo-600" onClick={() => setActiveTab('notified')} />
          <TabBtn active={activeTab === 'history'} label="ประวัติ" icon={History} activeColor="text-slate-900" onClick={() => setActiveTab('history')} />
        </div>
      </div>

      {/* --- SEARCH & FILTER --- */}
      {activeTab !== 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in delay-100">
          <div className="lg:col-span-9 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อลูกค้า..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all italic"
            />
          </div>
          <div className="lg:col-span-3">
            <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none" onChange={(e) => setSelectedDate(e.target.value)} />
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              className={`w-full h-[54px] flex items-center justify-center gap-3 px-6 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95 relative italic ${
                selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Calendar size={16} />
              <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH') : 'เลือกวันที่ต้องการดู'}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- 📋 MAIN CONTENT WRAPPER --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col transition-all duration-700">
        <div className="flex-1">
          {loading && activeTab !== 'history' ? (
            <SkeletonNotificationList rows={6} />
          ) : (
            <div className="h-full animate-in fade-in duration-500">
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

        {/* --- PAGINATION FOOTER --- */}
        {!loading && activeTab !== 'history' && overdueList.length > rowsPerPage && (
          <div className="p-10 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => {setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                className={`w-12 h-12 flex items-center justify-center rounded-[18px] border transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-50 shadow-sm active:scale-90'}`}
              >
                <ChevronLeft size={18} strokeWidth={2.5}/>
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => {setCurrentPage(page); window.scrollTo({top: 0, behavior: 'smooth'});}}
                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm transition-all ${currentPage === page ? 'bg-slate-950 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300' }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => {setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({top: 0, behavior: 'smooth'});}} 
                className={`w-12 h-12 flex items-center justify-center rounded-[18px] border transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-50 shadow-sm active:scale-90'}`}
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

// 🚩 Component สำหรับ Skeleton List การติดตามหนี้
function SkeletonNotificationList({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse p-8 space-y-6">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[35px] border border-slate-100/50">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 bg-slate-200/60 rounded-[22px]"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded-lg w-48"></div>
              <div className="h-2 bg-slate-100 rounded-full w-32"></div>
            </div>
          </div>
          <div className="flex gap-12 items-center">
             <div className="space-y-2 text-right">
                <div className="h-3 bg-slate-100 rounded-full w-20 ml-auto"></div>
                <div className="h-2 bg-slate-50 rounded-full w-14 ml-auto"></div>
             </div>
             <div className="w-24 h-10 bg-slate-200/60 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabBtn({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase flex items-center gap-3 transition-all duration-300 ${active ? `bg-white ${activeColor} shadow-md scale-105 italic` : 'text-slate-500 hover:text-slate-700'}`}>
      <Icon size={16} /> {label}
    </button>
  )
}