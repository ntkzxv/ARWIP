'use client'
import { useEffect, useState, useRef } from 'react'
import { 
  Search, History, BellRing, ClockAlert, 
  ChevronLeft, ChevronRight, Calendar, Loader2, X 
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// Import Components
import RecentTable from './components/RecentTable'
import NoticeTable from './components/NoticeTable'
import OverdueTable from './components/OverdueTable'
import PaymentDetailModal from '../../../components/PaymentDetailModal'

export default function CreditHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('recent')
  const [isLastPage, setIsLastPage] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  
  // State สำหรับ Modal และการเลือกข้อมูล
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // State สำหรับวันที่
  const [selectedDate, setSelectedDate] = useState<string>('') 
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  const rowsPerPage = 10 
  // Stats จำลองสำหรับหลอด Analysis
  const stats = { paid: 45, notified: 30, overdue: 25 }

  const fetchData = async () => {
    setLoading(true);
    try {
      let resultData: any[] = [];
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;

      if (activeTab === 'recent') {
        let query = supabase
          .from('credit_history')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (searchTerm) query = query.ilike('customer_name', `%${searchTerm}%`);
        
        if (selectedDate) {
          query = query.gte('created_at', `${selectedDate}T00:00:00`)
                       .lte('created_at', `${selectedDate}T23:59:59`);
        }

        const { data, error, count } = await query.range(from, to);
        if (error) throw error;
        resultData = data;
        if (count !== null) setTotalCount(count);
        setIsLastPage(count !== null && from + (data?.length || 0) >= count);

      } else {
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
          .from('installment_payments')
          .select(`*, installment_contracts!inner (customer_id, customers (full_name), sales_transactions (product_id))`, { count: 'exact' })
          .eq('status', 'pending');

        if (activeTab === 'overdue') query = query.lt('due_date', today);
        else query = query.gte('due_date', today);

        if (searchTerm) query = query.ilike('installment_contracts.customers.full_name', `%${searchTerm}%`);
        
        if (selectedDate) query = query.eq('due_date', selectedDate);

        const { data, error, count } = await query.order('due_date', { ascending: true }).range(from, to);
        if (error) throw error;
        resultData = data.map((item: any) => ({
          id: item.id,
          customer_name: item.installment_contracts?.customers?.full_name || 'ไม่ระบุชื่อ',
          amount: item.amount,
          due_date: item.due_date,
          status: item.status,
          product_id: item.installment_contracts?.sales_transactions?.product_id || 'N/A',
          installment_number: item.installment_number,
          created_at: item.created_at
        }));
        
        if (count !== null) setTotalCount(count);
        setIsLastPage(count !== null && from + (data?.length || 0) >= count);
      }

      setData(resultData);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData()
  }, [activeTab, searchTerm, currentPage, selectedDate])

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  return (
    <div className="space-y-6 pb-10">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Accounting Analysis</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Real-time Financial Monitor</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200">
          <CategoryBtn active={activeTab === 'recent'} activeColor="text-emerald-600" label="จ่ายล่าสุด" icon={History} onClick={() => {setActiveTab('recent'); setCurrentPage(1)}} />
          <CategoryBtn active={activeTab === 'notice'} activeColor="text-orange-600" label="แจ้งเตือนชำระ" icon={BellRing} onClick={() => {setActiveTab('notice'); setCurrentPage(1)}} />
          <CategoryBtn active={activeTab === 'overdue'} activeColor="text-rose-600" label="ค้างชำระ" icon={ClockAlert} onClick={() => {setActiveTab('overdue'); setCurrentPage(1)}} />
        </div>
      </div>

      {/* --- SEARCH & ANALYSIS BAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="lg:col-span-4 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none font-bold"
          />
        </div>

        <div className="lg:col-span-5 px-2">
          <div className="flex justify-between mb-2.5 px-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Debtor Analysis</span>
              <div className="flex gap-3">
                 <StatusDot color="bg-emerald-500" label="จ่ายแล้ว" />
                 <StatusDot color="bg-orange-500" label="แจ้งเตือน" />
                 <StatusDot color="bg-rose-500" label="ค้างชำระ" />
              </div>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
              <div style={{ width: `${stats.paid}%` }} className="h-full bg-emerald-500 transition-all duration-1000" />
              <div style={{ width: `${stats.notified}%` }} className="h-full bg-orange-500 transition-all duration-1000" />
              <div style={{ width: `${stats.overdue}%` }} className="h-full bg-rose-500 transition-all duration-1000" />
          </div>
        </div>

        {/* ปุ่มเลือกวันที่ (จัดกึ่งกลาง Center ✨) */}
        <div className="lg:col-span-3 relative">
          <input 
            type="date" 
            ref={dateInputRef}
            className="absolute opacity-0 pointer-events-none"
            onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}}
          />
          <button 
            onClick={() => dateInputRef.current?.showPicker()}
            className={`w-full h-[54px] flex items-center justify-center gap-3 px-6 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95 relative ${
              selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Calendar size={16} />
            <span>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : 'เลือกวันที่ต้องการดู'}
            </span>

            {selectedDate && (
              <div 
                className="absolute right-4 p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate('');
                }}
              >
                <X size={14} />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 gap-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">กำลังดึงข้อมูล...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'recent' && <RecentTable data={data} onRowClick={handleRowClick} />}
            </div>
          )}
        </div>

        {/* --- PAGINATION FOOTER --- */}
        <div className="p-10 bg-slate-50/30 border-t border-slate-50 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              className={`w-12 h-12 flex items-center justify-center rounded-[18px] border transition-all active:scale-90 ${
                currentPage === 1 ? 'bg-transparent text-slate-200 border-slate-100 cursor-not-allowed opacity-50' : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <ChevronLeft size={18} strokeWidth={2.5}/>
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 3) return true;
                  if (currentPage === 1) return page <= 3;
                  if (currentPage === totalPages) return page >= totalPages - 2;
                  return page >= currentPage - 1 && page <= currentPage + 1;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm transition-all active:scale-95 ${
                      currentPage === page ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300' 
                    }`}
                  >
                    {page}
                  </button>
                ))
              }
            </div>
            <button 
              disabled={isLastPage}
              onClick={() => setCurrentPage(p => p + 1)} 
              className={`w-12 h-12 flex items-center justify-center rounded-[18px] border transition-all active:scale-90 ${
                isLastPage ? 'bg-transparent text-slate-200 border-slate-100 cursor-not-allowed opacity-50' : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <ChevronRight size={18} strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {isModalOpen && (
        <PaymentDetailModal 
          item={selectedItem} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  )
}

// Helper Components
function CategoryBtn({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase flex items-center gap-3 transition-all duration-300 ${active ? `bg-white ${activeColor} shadow-md scale-100` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
      <Icon size={16} /> {label}
    </button>
  )
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} /> {label}
    </div>
  )
}