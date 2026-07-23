'use client'
import { useEffect, useState, useRef } from 'react'
import { 
  Search, History, ClockAlert, 
  ChevronLeft, ChevronRight, Calendar, X, Users 
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

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
        let query = supabase
          .from('credit_history')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (searchTerm) query = query.ilike('customer_name', `%${searchTerm}%`);
        if (selectedDate) {
          query = query.gte('created_at', `${selectedDate}T00:00:00`).lte('created_at', `${selectedDate}T23:59:59`);
        }
        const { data: res, count } = await query.range(from, to);

        const formattedRecent = res?.map((item: any) => ({
          ...item,
          customer_name: item.customer_name || 'ไม่ระบุชื่อ',
          bank_ref: item.bank_ref || item.transaction_code || item.reference_code || 'TRX-PAYMENT',
          amount: item.amount || item.received_amount || 0,
          created_at: item.created_at,
          installment_number: item.installment_number || item.term || '-',
          product_id: item.product_id || 'N/A'
        })) || [];

        setData(formattedRecent);
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
          customer_name: item.installment_contracts?.customers?.full_name || 'ไม่ระบุชื่อ',
          product_id: item.installment_contracts?.sales_transactions?.product_id || 'N/A'
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
          const custId = item.installment_contracts?.customer_id;
          const productId = item.installment_contracts?.sales_transactions?.product_id || 'UNKNOWN';
          const productName = item.installment_contracts?.sales_transactions?.product_name || 'สินค้าผ่อนชำระ';

          if (!custId) return acc;

          if (!acc[custId]) {
            acc[custId] = {
              customer_id: custId,
              customer_name: item.installment_contracts?.customers?.full_name || 'ไม่ระบุชื่อ',
              remaining_installments: 0,
              total_remaining_amount: 0,
              products: {} 
            };
          }

          acc[custId].remaining_installments += 1;
          acc[custId].total_remaining_amount += Number(item.amount || 0);

          if (!acc[custId].products[productId]) {
            acc[custId].products[productId] = {
              product_id: productId,
              product_name: productName,
              count: 0,
              subtotal: 0
            };
          }
          acc[custId].products[productId].count += 1;
          acc[custId].products[productId].subtotal += Number(item.amount || 0);

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
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData() }, [activeTab, searchTerm, currentPage, selectedDate])

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  return (
    <div className="w-full min-w-0 space-y-6 pb-10 font-sans bg-[#F4F7FE] min-h-screen animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase leading-none">
            CREDIT<span className="text-indigo-600">HISTORY</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            ประวัติการเงินและยอดสรุปหนี้ค้าง
          </p>
        </div>
        <div className="flex flex-wrap p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
          <CategoryBtn active={activeTab === 'recent'} activeColor="text-emerald-600" label="จ่ายล่าสุด" icon={History} onClick={() => handleTabChange('recent')} />
          <CategoryBtn active={activeTab === 'overdue'} activeColor="text-rose-600" label="ค้างชำระ" icon={ClockAlert} onClick={() => handleTabChange('overdue')} />
          <CategoryBtn active={activeTab === 'total_debt'} activeColor="text-indigo-600" label="ยอดผ่อนทั้งหมด" icon={Users} onClick={() => handleTabChange('total_debt')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="lg:col-span-5 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า..." 
            value={searchTerm} 
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold outline-none placeholder:text-slate-300" 
          />
        </div>
        
        <div className="lg:col-span-4 px-1">
          <div className="flex justify-between mb-2 px-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Analysis Status</span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Paid</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-600" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Overdue</span></div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Total</span></div>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: '45%' }} className="h-full bg-emerald-500" />
            <div style={{ width: '25%' }} className="h-full bg-rose-600" />
            <div style={{ width: '30%' }} className="h-full bg-indigo-500" />
          </div>
        </div>

        <div className="lg:col-span-3 relative">
          <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none" onChange={(e) => {setSelectedDate(e.target.value); setCurrentPage(1);}} />
          <button 
            onClick={() => dateInputRef.current?.showPicker()} 
            className={`w-full h-[48px] flex items-center justify-center gap-2 px-5 rounded-2xl font-bold text-xs uppercase shadow-sm active:scale-95 transition-all ${selectedDate ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Calendar size={16} />
            <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH') : 'เลือกวันที่'}</span>
            {selectedDate && <X size={14} className="ml-1 hover:text-rose-200" onClick={(e) => {e.stopPropagation(); setSelectedDate('');}} />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        <div className="flex-1 w-full overflow-x-auto">
          {loading ? (
            <SkeletonTable rows={rowsPerPage} />
          ) : (
            <div className="w-full min-w-[700px] animate-in fade-in duration-500">
              {activeTab === 'recent' && <RecentTable data={data} onRowClick={() => {}} />}
              {activeTab === 'overdue' && <OverdueTable data={data} onRowClick={() => {}} />}
              {activeTab === 'total_debt' && <TotalDebtTable data={data} />}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => {setCurrentPage(p => p - 1); scrollToTop();}} 
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 active:scale-90 transition-all hover:bg-slate-50"
            >
              <ChevronLeft size={18}/>
            </button>
            <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none py-1">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => {setCurrentPage(i+1); scrollToTop();}} 
                  className={`min-w-[40px] h-10 px-3 rounded-xl font-bold text-xs transition-all ${currentPage === i+1 ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => {setCurrentPage(p => p + 1); scrollToTop();}} 
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 active:scale-90 transition-all hover:bg-slate-50"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonTable({ rows }: { rows: number }) {
  return (
    <div className="w-full animate-pulse min-w-[700px]">
      <div className="grid grid-cols-5 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-2.5 bg-slate-200 rounded-full w-20"></div>
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 p-6 border-b border-slate-50 items-center">
          <div className="h-3.5 bg-slate-100 rounded-lg w-36"></div>
          <div className="h-3 bg-slate-50 rounded-full w-24"></div>
          <div className="h-3 bg-slate-50 rounded-full w-16"></div>
          <div className="h-3 bg-slate-50 rounded-full w-20"></div>
          <div className="h-7 bg-slate-50 rounded-lg w-8 justify-self-end"></div>
        </div>
      ))}
    </div>
  )
}

function CategoryBtn({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap ${active ? `bg-white ${activeColor} shadow-sm` : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
    >
      <Icon size={15} /> {label}
    </button>
  )
}