'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../../../utils/supabase'
import { 
  Package, MapPin, ArrowRightLeft, Search, Filter, 
  XCircle, ChevronRight, ChevronDown, CheckCircle2,
  ChevronLeft,
  Check
} from 'lucide-react'
import ProductDetailDrawer from './components/ProductDetailDrawer'
import StockTableSkeleton from '../../../components/skeletons/StockTableSkeleton'

export default function StockManagementPage() {
  const [inventory, setInventory] = useState<any[]>([]) 
  const [branches, setBranches] = useState<any[]>([{ id: 'all', branch_name: 'ทุกสาขารวม' }]) 
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [selectedBranch, setSelectedBranch] = useState<any>({ id: 'all', branch_name: 'ทุกสาขารวม' })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchCategoryTerm, setSearchCategoryTerm] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  // 🚩 LOGIC: เพิ่ม State เพื่อจำสาขาของบรรทัดที่ถูกกด
  const [selectedBranchForDrawer, setSelectedBranchForDrawer] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => { 
    initialFetch()
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initialFetch = async () => {
    setLoading(true)
    try {
      const [invRes, branchRes] = await Promise.all([
        supabase.from('inventory').select(`*, products (*), branches (branch_name)`),
        supabase.from('branches').select('id, branch_name').order('branch_name', { ascending: true })
      ])
      if (invRes.data) setInventory(invRes.data)
      if (branchRes.data) setBranches([{ id: 'all', branch_name: 'ทุกสาขารวม' }, ...branchRes.data])
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const getStockMetrics = (item: any) => {
    const qty = item.quantity || 0;
    const max = item.max_stock || 0;
    const isDefault = !max || max <= 0;
    const effectiveMax = !isDefault ? max : (qty > 0 ? qty : 1);
    const percent = Math.min((qty / effectiveMax) * 100, 100);
    return { percent, displayMax: !isDefault ? max.toLocaleString() : "Standard", isDefault };
  };

  const categories = useMemo(() => ['ทั้งหมด', ...Array.from(new Set(inventory.map(item => item.products?.category).filter(Boolean)))], [inventory])

  const filteredStock = useMemo(() => {
    return inventory.filter(item => {
      const p = item.products;
      if (!p) return false;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
      const matchesBranch = selectedBranch.id === 'all' || item.branch_id === selectedBranch.id;
      let matchesStatus = true;
      if (filterStatus === 'low') matchesStatus = item.quantity > 0 && item.quantity <= (item.min_stock || 0);
      if (filterStatus === 'out') matchesStatus = item.quantity <= 0;
      return matchesSearch && matchesCategory && matchesStatus && matchesBranch;
    })
  }, [inventory, searchTerm, selectedCategory, filterStatus, selectedBranch])

  const totalInventoryQty = useMemo(() => filteredStock.reduce((acc, item) => acc + (item.quantity || 0), 0), [filteredStock])
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage)
  const paginatedData = filteredStock.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading && inventory.length === 0) {
    return <div className="max-w-[98%] mx-auto p-8 bg-[#F4F7FE] min-h-screen"><StockTableSkeleton /></div>
  }

  return (
    <div className="max-w-[98%] mx-auto space-y-6 pb-20 text-slate-900 bg-[#F4F7FE] min-h-screen p-8 font-sans animate-in fade-in duration-700 font-bold">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 font-bold">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter text-slate-900 leading-none">
            ควบคุม <span className="text-indigo-600 font-extrabold">คลังสินค้า</span>
          </h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.4em] mt-4 ml-1">
            ระบบจัดการสต็อกอัจฉริยะ (Inventory Mode)
          </p>
        </div>

        <div className="bg-white p-5 px-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 min-w-[350px]">
          <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg flex-shrink-0"><Package size={28}/></div>
          <div className="min-w-0 font-sans font-bold">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">
              สต็อกคงเหลือ: {selectedBranch.branch_name}
            </p>
            <div className="flex items-baseline gap-2 font-bold">
              <h2 className="text-3xl text-slate-900 tracking-tight font-bold">{totalInventoryQty.toLocaleString()}</h2>
              <span className="text-[10px] text-slate-300 uppercase font-bold">ชิ้น</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6 font-sans font-bold">
        <div className="relative flex-1 group font-bold">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสินค้า หรือ รหัส SKU..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full p-5 pl-14 bg-white border border-slate-200/60 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold" 
          />
        </div>

        <div className="relative font-bold" ref={filterRef}>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-8 py-5 border rounded-[2rem] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all bg-white ${isFilterOpen ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-500 hover:border-indigo-400'}`}>
            <Filter size={14} /> ตัวกรองละเอียด <ChevronDown size={12} className={isFilterOpen ? 'rotate-180' : ''} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-3 w-[850px] bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right font-bold">
              <div className="flex divide-x divide-slate-50 font-bold">
                <div className="flex-1 p-7 bg-slate-50/20 font-bold">
                  <p className="text-[9px] text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2 font-bold"><MapPin size={10} /> เลือกสาขา</p>
                  <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar font-bold">
                    {branches.map(b => (
                      <button key={b.id} onClick={() => { setSelectedBranch(b); setCurrentPage(1); }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${selectedBranch.id === b.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-white hover:text-indigo-600'}`}>{b.branch_name}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-7 font-bold">
                  <p className="text-[9px] text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2 font-bold">สถานะสินค้า</p>
                  <div className="space-y-1.5 font-bold">
                    <FilterOption active={filterStatus === 'all'} label="ทั้งหมด" onClick={() => { setFilterStatus('all'); setCurrentPage(1); }} />
                    <FilterOption active={filterStatus === 'low'} label="สต็อกต่ำ" color="rose" onClick={() => { setFilterStatus('low'); setCurrentPage(1); }} />
                    <FilterOption active={filterStatus === 'out'} label="สินค้าหมด" color="slate" onClick={() => { setFilterStatus('out'); setCurrentPage(1); }} />
                  </div>
                </div>
                <div className="flex-1 p-7 bg-slate-50/20 font-bold">
                  <p className="text-[9px] text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2 font-bold">หมวดหมู่</p>
                  <input type="text" placeholder="ค้นหาหมวดหมู่..." className="w-full px-4 py-2 mb-3 bg-white border border-slate-100 rounded-lg text-[10px] outline-none shadow-sm font-bold" onChange={(e) => setSearchCategoryTerm(e.target.value)} />
                  <div className="space-y-1 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar font-bold">
                    {categories.filter(c => c.toLowerCase().includes(searchCategoryTerm.toLowerCase())).map(cat => (
                      <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white border-t border-slate-50 flex justify-end font-bold">
                 <button onClick={() => { setSelectedCategory('ทั้งหมด'); setFilterStatus('all'); setSelectedBranch({id:'all', branch_name:'ทุกสาขารวม'}); setCurrentPage(1); }} className="px-6 py-2.5 bg-slate-900 text-[9px] text-white uppercase rounded-xl hover:bg-rose-500 transition-all flex items-center gap-2 shadow-sm font-bold"><XCircle size={12}/> ล้างตัวกรองทั้งหมด</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans font-bold">
        <table className="w-full text-left font-bold">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold font-sans">
              <th className="p-6 pl-10">รายการสินค้า</th>
              <th className="p-6 text-center">ยอดคงเหลือ</th>
              <th className="p-6 text-center">ระดับสต็อก</th>
              <th className="p-6 text-right pr-10 font-bold">วิเคราะห์</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold">
            {paginatedData.map((item) => {
              const p = item.products;
              const { percent, displayMax, isDefault } = getStockMetrics(item);
              const isLow = item.quantity > 0 && item.quantity <= (item.min_stock || 0);
              const isOut = item.quantity <= 0;
              return (
                <tr key={item.id} className="group hover:bg-indigo-50/10 transition-all font-sans font-bold">
                  <td className="p-6 pl-10 font-bold">
                    <div className="flex items-center gap-4 font-bold">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 shadow-sm overflow-hidden shrink-0 font-bold">
                        {p?.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover font-bold" /> : <Package size={22} />}
                      </div>
                      <div className="min-w-0 font-bold">
                        <p className="text-sm text-slate-900 mb-1 truncate font-bold">{p?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 font-bold">
                          <span className="text-[9px] text-slate-400 uppercase border-r border-slate-200 pr-2 font-bold leading-none">{p?.product_code}</span>
                          <span className="text-[9px] text-indigo-600 uppercase bg-indigo-50/50 px-2 py-0.5 rounded-md leading-none font-bold">{p?.category || 'ทั่วไป'}</span>
                          <span className="text-[9px] text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md leading-none flex items-center gap-1 font-sans font-bold">
                             <MapPin size={8} /> {item.branches?.branch_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center font-bold font-sans">
                    <span className={`text-xl tracking-tight font-bold ${isOut ? 'text-slate-300 line-through' : isLow ? 'text-rose-500' : 'text-slate-900'}`}>{item.quantity.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-400 ml-1 uppercase font-bold">{p?.unit}</span>
                  </td>
                  <td className="p-6 font-bold">
                    <div className="flex flex-col items-center gap-2 min-w-[150px] font-bold">
                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50 font-bold">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isOut ? 'bg-transparent' : isDefault ? 'bg-violet-400' : isLow ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${percent}%` }} />
                       </div>
                       <p className="text-[9px] text-slate-400 uppercase font-bold">{(item.quantity || 0).toLocaleString()} / {displayMax} | {Math.round(percent)}%</p>
                    </div>
                  </td>
                  <td className="p-6 text-right pr-10 font-bold">
                    <button 
                      onClick={() => { 
                        setSelectedProductId(p?.id); 
                        // 🚩 ล็อคสาขาประจำบรรทัดนี้ เพื่อส่งให้ Drawer
                        setSelectedBranchForDrawer(item.branch_id); 
                      }} 
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all shadow-sm active:scale-95 group/btn font-bold"
                    >
                      <ArrowRightLeft size={16} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm font-bold">
         <p className="text-[10px] text-slate-400 uppercase tracking-widest ml-4">แสดง {paginatedData.length} จาก {filteredStock.length} รายการ</p>
         <div className="flex gap-2 mr-4 font-bold">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronLeft size={16}/></button>
            <div className="flex items-center px-4 text-xs font-black text-slate-900">{currentPage} / {totalPages || 1}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronRight size={16}/></button>
         </div>
      </div>

      {selectedProductId && (
        <ProductDetailDrawer 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
          // 🚩 ส่ง ID ที่ล็อคไว้เข้าไป ข้อมูลใน Drawer จะได้ไม่เปลี่ยนไปตามตัวกรองด้านบน
          selectedBranchId={selectedBranchForDrawer} 
        />
      )}
    </div>
  )
}

function FilterOption({ active, label, onClick, color }: any) {
  const activeClass = color === 'rose' ? 'bg-rose-50 text-rose-600 shadow-sm' : color === 'slate' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-indigo-50 text-indigo-600 shadow-sm';
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between font-sans ${active ? activeClass : 'text-slate-400 hover:bg-slate-50'}`}>
      {label} {active && <Check size={12} />}
    </button>
  )
}