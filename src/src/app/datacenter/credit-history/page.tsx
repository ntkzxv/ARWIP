'use client'
import { useEffect, useState, useRef, memo } from 'react'
import { 
  Search, History, ClockAlert, 
  ChevronLeft, ChevronRight, Calendar, X, Users 
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// Import Components
import RecentTable from './components/RecentTable'
import OverdueTable from './components/OverdueTable'
import TotalDebtTable from './components/TotalDebtTable'

export default function CreditHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('recent') 
  const [totalCount, setTotalCount] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>('') 
  const dateInputRef = useRef<HTMLInputElement>(null)
  
  const rowsPerPage = 10 

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedDate('');
    scrollToTop();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;

      if (activeTab === 'recent') {
        let query = supabase.from('credit_history').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (searchTerm) query = query.ilike('customer_name', `%${searchTerm}%`);
        if (selectedDate) {
          query = query.gte('created_at', `${selectedDate}T00:00:00`).lte('created_at', `${selectedDate}T23:59:59`);
        }
        const { data: res, count } = await query.range(from, to);
        setData(res || []);
        setTotalCount(count || 0);

      } else if (activeTab === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
          .from('installment_payments')
          .select(`*, installment_contracts!inner (customer_id, customers (full_name), sales_transactions (product_name, product_id))`, { count: 'exact' })
          .eq('status', 'pending')
          .lt('due_date', today);

        if (searchTerm) query = query.ilike('installment_contracts.customers.full_name', `%${searchTerm}%`);
        if (selectedDate) query = query.eq('due_date', selectedDate);

        const { data: res, count } = await query.order('due_date', { ascending: true }).range(from, to);
        setData(res?.map((item: any) => ({
          ...item,
          customer_name: item.installment_contracts.customers.full_name,
          product_id: item.installment_contracts.sales_transactions.product_id
        })) || []);
        setTotalCount(count || 0);

      } else if (activeTab === 'total_debt') {
        let query = supabase
          .from('installment_payments')
          .select(`
            amount, 
            installment_contracts!inner (
              customer_id,
              customers (full_name),
              sales_transactions (product_name, product_id)
            )
          `)
          .eq('status', 'pending');

        const { data: allPending } = await query;
        
        const summaryMap = allPending?.reduce((acc: any, item: any) => {
          const custId = item.installment_contracts.customer_id;
          const productId = item.installment_contracts.sales_transactions.product_id;
          const productName = item.installment_contracts.sales_transactions.product_name;

          if (!acc[custId]) {
            acc[custId] = {
              customer_id: custId,
              customer_name: item.installment_contracts.customers.full_name,
              remaining_installments: 0,
              total_remaining_amount: 0,
              products: {} 
            };
          }

          acc[custId].remaining_installments += 1;
          acc[custId].total_remaining_amount += Number(item.amount);

          if (!acc[custId].products[productId]) {
            acc[custId].products[productId] = {
              product_id: productId,
              product_name: productName,
              count: 0,
              subtotal: 0
            };
          }
          acc[custId].products[productId].count += 1;
          acc[custId].products[productId].subtotal += Number(item.amount);

          return acc;
        }, {});

        let groupedArray = Object.values(summaryMap || {}).map((cust: any) => ({
          ...cust,
          product_list: Object.values(cust.products) 
        }));

        if (searchTerm) {
          groupedArray = groupedArray.filter((i: any) => i.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        setTotalCount(groupedArray.length);
        setData(groupedArray.slice(from, to + 1));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData() }, [activeTab, searchTerm, currentPage, selectedDate])

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  return (
    <div className="space-y-6 pb-10 font-sans animate-in fade-in duration-700 pl-30 pr-15">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            credit<span className="text-indigo-600">history</span>
          </h1>
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.3em]">ประวัติการเงินและยอดสรุปหนี้ค้าง</p>
        </div>
        <div className="flex p-1 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200">
          <CategoryBtn active={activeTab === 'recent'} activeColor="text-emerald-600" label="จ่ายล่าสุด" icon={History} onClick={() => handleTabChange('recent')} />
          <CategoryBtn active={activeTab === 'overdue'} activeColor="text-rose-600" label="ค้างชำระ" icon={ClockAlert} onClick={() => handleTabChange('overdue')} />
          <CategoryBtn active={activeTab === 'total_debt'} activeColor="text-indigo-600" label="ยอดผ่อนทั้งหมด" icon={Users} onClick={() => handleTabChange('total_debt')} />
        </div>
      </div>

      {/* Search & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="lg:col-span-4 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" placeholder="ค้นหาชื่อลูกค้า..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none font-bold italic" />
        </div>
        
        <div className="lg:col-span-5 px-2">
            <div className="flex justify-between mb-2.5 px-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider italic">Analysis Status</span>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-tight italic">Paid</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-600" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-tight italic">Overdue</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[10px] font-black text-slate-600 uppercase tracking-tight italic">Total</span></div>
                </div>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div style={{ width: '45%' }} className="h-full bg-emerald-500" />
                <div style={{ width: '25%' }} className="h-full bg-rose-600" />
                <div style={{ width: '30%' }} className="h-full bg-indigo-500" />
            </div>
        </div>

        <div className="lg:col-span-3 relative">
          <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none" onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}} />
          <button onClick={() => dateInputRef.current?.showPicker()} className={`w-full h-[54px] flex items-center justify-center gap-3 px-6 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 relative transition-all italic ${selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            <Calendar size={16} />
            <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH') : 'เลือกวันที่'}</span>
            {selectedDate && <X size={14} className="ml-2" onClick={(e) => {e.stopPropagation(); setSelectedDate('');}} />}
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex-1">
          {loading ? (
            <SkeletonTable rows={rowsPerPage} />
          ) : (
            <div className="overflow-x-auto animate-in fade-in duration-500">
              {activeTab === 'recent' && <RecentTable data={data} onRowClick={() => {}} />}
              {activeTab === 'overdue' && <OverdueTable data={data} onRowClick={() => {}} />}
              {activeTab === 'total_debt' && <TotalDebtTable data={data} />}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-10 bg-slate-50/30 border-t border-slate-50 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => {setCurrentPage(p => p - 1); scrollToTop();}} className="w-12 h-12 flex items-center justify-center rounded-[18px] border bg-white disabled:opacity-30 active:scale-90 transition-all"><ChevronLeft size={18}/></button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => {setCurrentPage(i+1); scrollToTop();}} className={`w-12 h-12 rounded-[18px] font-black text-sm transition-all ${currentPage === i+1 ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>{i+1}</button>
              ))}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => {setCurrentPage(p => p + 1); scrollToTop();}} className="w-12 h-12 flex items-center justify-center rounded-[18px] border bg-white disabled:opacity-30 active:scale-90 transition-all"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🚩 Skeleton Component สำหรับ Table
function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse">
      {/* Skeleton Header */}
      <div className="grid grid-cols-5 gap-4 p-8 bg-slate-50 border-bottom border-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded-full w-24"></div>
        ))}
      </div>
      {/* Skeleton Rows */}
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-8 border-b border-slate-50 items-center">
          <div className="h-4 bg-slate-100 rounded-lg w-40"></div>
          <div className="h-3 bg-slate-50 rounded-full w-28"></div>
          <div className="h-3 bg-slate-50 rounded-full w-20"></div>
          <div className="h-3 bg-slate-50 rounded-full w-24"></div>
          <div className="h-8 bg-slate-50 rounded-xl w-10 justify-self-end"></div>
        </div>
      ))}
    </div>
  )
}

function CategoryBtn({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase flex items-center gap-3 transition-all duration-300 ${active ? `bg-white ${activeColor} shadow-md scale-105` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
      <Icon size={16} /> {label}
    </button>
  )
}