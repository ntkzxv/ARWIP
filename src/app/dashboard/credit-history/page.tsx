'use client'
import { useEffect, useState, useMemo } from 'react'
import { 
  Search, History, BellRing, ClockAlert, 
  ChevronLeft, ChevronRight, Calendar, Loader2 
} from 'lucide-react'
import { supabase } from '../../../utils/supabase'

// Import Table Components
import RecentTable from './components/RecentTable'
import NoticeTable from './components/NoticeTable'
import OverdueTable from './components/OverdueTable'

export default function CreditHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('recent') // ใช้ตัวเดียวจบ
  const rowsPerPage = 20

  // 📈 Stats สำหรับหลอด Analysis (แนะนำให้ทำฟังก์ชันดึงค่าจริงในอนาคต)
  const stats = { paid: 45, notified: 30, overdue: 25 }

  const fetchData = async () => {
    setLoading(true);
    try {
      let resultData: any[] = [];

      if (activeTab === 'recent') {
        // 1. ดึงจากประวัติการเงิน (จ่ายล่าสุด)
        let query = supabase
          .from('credit_history')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.ilike('customer_name', `%${searchTerm}%`);
        }

        const { data, error } = await query.range((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage - 1);
        if (error) throw error;
        resultData = data;

      } else {
        // 2. สำหรับ Tab 'notice' และ 'overdue'
        const today = new Date().toISOString().split('T')[0];
        
        let query = supabase
          .from('installment_payments')
          .select(`
            *,
            installment_contracts!inner (
              customer_id,
              customers (full_name)
            )
          `)
          .eq('status', 'pending');

        // แยก Logic ตาม Tab
        if (activeTab === 'overdue') {
          query = query.lt('due_date', today); // เลยกำหนด (Overdue)
        } else {
          query = query.gte('due_date', today); // ยังไม่ถึง/ถึงวันนี้ (Notice)
        }

        if (searchTerm) {
          query = query.ilike('installment_contracts.customers.full_name', `%${searchTerm}%`);
        }

        const { data, error } = await query.order('due_date', { ascending: true });
        if (error) throw error;

        resultData = data.map((item: any) => ({
          id: item.id,
          customer_name: item.installment_contracts?.customers?.full_name || 'ไม่ระบุชื่อ',
          amount: item.amount,
          due_date: item.due_date,
          status: item.status,
          type: 'installment_bill',
          created_at: item.created_at
        }));
      }

      setData(resultData);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 เรียก fetchData ทุกครั้งที่ Tab, ค้นหา, หรือหน้าเปลี่ยน
  useEffect(() => {
    fetchData()
  }, [activeTab, searchTerm, currentPage])

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* 🟢 ส่วนหัวและปุ่มเลือกหมวด */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Accounting Analysis</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Real-time Financial Monitor</p>
        </div>
        
        <div className="flex p-1 bg-slate-100 rounded-[1.5rem] shadow-inner border border-slate-200">
          <CategoryBtn active={activeTab === 'recent'} label="จ่ายล่าสุด" icon={History} onClick={() => {setActiveTab('recent'); setCurrentPage(1)}} />
          <CategoryBtn active={activeTab === 'notice'} label="แจ้งเตือนชำระ" icon={BellRing} onClick={() => {setActiveTab('notice'); setCurrentPage(1)}} />
          <CategoryBtn active={activeTab === 'overdue'} label="ค้างชำระ" icon={ClockAlert} onClick={() => {setActiveTab('overdue'); setCurrentPage(1)}} />
        </div>
      </div>

      {/* 📊 หลอดวิเคราะห์ & ช่องค้นหา */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="lg:col-span-4 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
          />
        </div>

        <div className="lg:col-span-5 px-2">
          <div className="flex justify-between mb-2.5 px-1">
             <span className="text-[10px] font-black uppercase text-slate-500">Debtor Analysis</span>
             <div className="flex gap-4">
                <StatusDot color="bg-emerald-500" label="จ่ายแล้ว" />
                <StatusDot color="bg-indigo-500" label="แจ้งเตือน" />
                <StatusDot color="bg-rose-500" label="ค้างชำระ" />
             </div>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
             <div style={{ width: `${stats.paid}%` }} className="h-full bg-emerald-500 transition-all duration-1000" />
             <div style={{ width: `${stats.notified}%` }} className="h-full bg-indigo-500 transition-all duration-1000" />
             <div style={{ width: `${stats.overdue}%` }} className="h-full bg-rose-500 transition-all duration-1000" />
          </div>
        </div>

        <div className="lg:col-span-3">
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Calendar size={16} /> เลือกช่วงวันที่
          </button>
        </div>
      </div>

      {/* 📋 ส่วนแสดงผลตาราง */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-300 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">กำลังดึงข้อมูล...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'recent' && <RecentTable data={data} />}
            {activeTab === 'notice' && <NoticeTable data={data} />}
            {activeTab === 'overdue' && <OverdueTable data={data} />}
          </div>
        )}

        {/* 📟 Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Showing Page {currentPage}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronLeft size={18}/>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-slate-950 text-white rounded-xl font-black text-xs shadow-lg">{currentPage}</button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🔵 Internal Components (เหมือนเดิมแต่คลีนขึ้น)
function CategoryBtn({ active, label, icon: Icon, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-8 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase flex items-center gap-3 transition-all duration-300 ${active ? 'bg-white text-indigo-600 shadow-md scale-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}>
      <Icon size={16} /> {label}
    </button>
  )
}

function StatusDot({ color, label }: any) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-500">
      <div className={`w-2 h-2 rounded-full ${color}`} /> {label}
    </div>
  )
}