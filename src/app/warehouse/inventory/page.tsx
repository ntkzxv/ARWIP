'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Filter, ChevronDown, ChevronRight, Package, 
  Printer, Download, Plus, Layers, Box, MoreVertical, XCircle, MapPin, CheckCircle2
} from 'lucide-react'
import ProductDetailDrawer from './components/ProductDetailDrawer'
import Link from 'next/link'
import InventorySkeleton from '../../../components/skeletons/InventorySkeleton'

export default function InventoryMasterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- States ---
  const [products, setProducts] = useState<any[]>([])
  // 🚩 ปรับโครงสร้างเก็บสาขาเป็น Object เพื่อเอา ID ไปกรองได้แม่นยำ
  const [branches, setBranches] = useState<any[]>([{ id: 'all', branch_name: 'ทุกสาขารวม' }])
  const [loading, setLoading] = useState(true)
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  // 🚩 เก็บเป็น Object สาขาที่เลือก
  const [selectedBranch, setSelectedBranch] = useState<any>({ id: 'all', branch_name: 'ทุกสาขารวม' })
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all')
  const [searchCategoryTerm, setSearchCategoryTerm] = useState('')
  
  const filterRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [urlToUpdate, setUrlToUpdate] = useState<string | null>(null)

  // --- Effects ---
  useEffect(() => { 
    initialFetch() 
  }, [])

  useEffect(() => {
    const openParam = searchParams.get('open')
    if (openParam) setOpenCategories(openParam.split(','))
  }, [searchParams])

  useEffect(() => {
    if (urlToUpdate !== null) {
      window.history.replaceState(null, '', urlToUpdate)
      setUrlToUpdate(null)
    }
  }, [urlToUpdate])

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initialFetch = async () => {
    setLoading(true)
    try {
      // 🚩 ดึงข้อมูลสินค้าพร้อมยอดคงเหลือจากตาราง inventory ทุกแถวที่ผูกอยู่
      const [productRes, branchRes] = await Promise.all([
        supabase.from('products').select('*, inventory(quantity, branch_id, min_stock)').order('category', { ascending: true }),
        supabase.from('branches').select('id, branch_name').order('branch_name', { ascending: true })
      ])

      if (productRes.data) {
        setProducts(productRes.data)
      }
      if (branchRes.data) {
        setBranches([{ id: 'all', branch_name: 'ทุกสาขารวม' }, ...branchRes.data])
      }
    } catch (error) {
      console.error(error)
    }
    setTimeout(() => setLoading(false), 600)
  }

  // --- 🚀 Logic การกรองและการคำนวณยอด (รักษา UI เดิม) ---
  const filteredProducts = useMemo(() => {
    return products.map(p => {
      // 🚩 คำนวณยอดสต็อกตามเงื่อนไขสาขาที่เลือก
      let displayQty = 0;
      let minStockForCheck = p.min_stock || 0;

      if (selectedBranch.id === 'all') {
        // ทุกสาขารวม: รวม quantity จากทุกแถวใน inventory
        displayQty = p.inventory?.reduce((acc: number, inv: any) => acc + (inv.quantity || 0), 0) || 0;
      } else {
        // เฉพาะสาขา: หาแถวที่ตรงกับ branch_id ที่เลือก
        const branchInv = p.inventory?.find((inv: any) => inv.branch_id === selectedBranch.id);
        displayQty = branchInv?.quantity || 0;
        // ถ้าในแถว inventory มี min_stock เฉพาะสาขา ให้ใช้ค่านั้น ถ้าไม่มีใช้ค่ากลางจาก products
        minStockForCheck = branchInv?.min_stock ?? p.min_stock ?? 0;
      }

      return { ...p, current_display_qty: displayQty, current_min_stock: minStockForCheck };
    }).filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
      
      // กรองสถานะสต็อก
      let matchesStatus = true;
      if (filterStatus === 'low') matchesStatus = p.current_display_qty > 0 && p.current_display_qty <= p.current_min_stock;
      if (filterStatus === 'out') matchesStatus = p.current_display_qty <= 0;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
  }, [products, searchTerm, selectedCategory, selectedBranch, filterStatus])

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc: any, p) => {
      const cat = p.category || 'ไม่มีหมวดหมู่'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    }, {})
  }, [filteredProducts])

  const categoryNames = useMemo(() => 
    ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category || 'ไม่มีหมวดหมู่')))]
  , [products])

  const allCategoryKeys = Object.keys(groupedProducts)
  const totalPages = Math.ceil(allCategoryKeys.length / itemsPerPage)
  const paginatedCategories = allCategoryKeys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      const params = new URLSearchParams(searchParams.toString())
      if (next.length > 0) params.set('open', next.join(','))
      else params.delete('open')
      setUrlToUpdate(`?${params.toString()}`)
      return next
    })
  }

  return (
    <div className="max-w-[98%] mx-auto space-y-6 pb-20 text-slate-900 bg-[#F4F7FE] min-h-screen p-10 animate-in fade-in duration-700 font-sans">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter text-slate-900 leading-none">
            คลังสินค้า<span className="text-indigo-600 ml-1">มาสเตอร์</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-4 ml-1">
            ARWIP Central Inventory Management
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div className="flex gap-1 px-2 text-slate-400">
            <button className="p-3 hover:text-indigo-600 transition-all"><Printer size={18}/></button>
            <button className="p-3 hover:text-indigo-600 transition-all"><Download size={18}/></button>
          </div>
          <div className="w-[1px] h-8 bg-slate-100 mx-1" />
          <Link href="/warehouse/inventory/add">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all flex items-center gap-3">
              <Plus size={16} /> เพิ่มสินค้าใหม่
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <InventorySkeleton />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* 🔍 Search & Advanced Filter */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อสินค้า หรือ รหัส SKU..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full p-5 pl-16 bg-white border border-slate-200/70 rounded-[2.5rem] text-sm font-semibold shadow-sm outline-none focus:ring-4 focus:ring-indigo-50/50 transition-all" 
              />
            </div>

            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-10 py-5 border rounded-[2.5rem] text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-sm transition-all bg-white ${
                  isFilterOpen ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-500 hover:border-indigo-400'
                }`}
              >
                <Filter size={16} /> ตัวกรองละเอียด <ChevronDown size={12} className={isFilterOpen ? 'rotate-180' : ''} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-3 w-[600px] bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="flex divide-x divide-slate-50">
                    
                    {/* 🚩 คอลัมน์ 1: สาขา (ใช้ Object) */}
                    <div className="flex-1 p-7 bg-slate-50/20">
                      <p className="text-[9px] text-slate-300 uppercase tracking-widest mb-5 font-bold flex items-center gap-2">
                        <MapPin size={10} /> เลือกสาขา
                      </p>
                      <div className="space-y-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {branches.map(b => (
                          <button 
                            key={b.id} 
                            onClick={() => { setSelectedBranch(b); setCurrentPage(1); }} 
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                              selectedBranch.id === b.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                            }`}
                          >
                            {b.branch_name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-[1.2] p-7">
                      <p className="text-[9px] text-slate-300 uppercase tracking-widest mb-5 font-bold flex items-center gap-2">
                        <Layers size={10} /> หมวดหมู่สินค้า
                      </p>
                      <div className="relative mb-3">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text" 
                          placeholder="ค้นหาหมวดหมู่..." 
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] outline-none font-bold focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all" 
                          onChange={(e) => setSearchCategoryTerm(e.target.value.toLowerCase())} 
                        />
                      </div>
                      <div className="space-y-1 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                        {categoryNames.filter(cat => cat.toLowerCase().includes(searchCategoryTerm)).map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} 
                            className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                              selectedCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-white border-t border-slate-50 flex justify-end">
                    <button 
                      onClick={() => { 
                        setSelectedCategory('ทั้งหมด'); 
                        setFilterStatus('all'); 
                        setSelectedBranch({ id: 'all', branch_name: 'ทุกสาขารวม' }); 
                        setCurrentPage(1); 
                        setIsFilterOpen(false); 
                      }}
                      className="px-6 py-2.5 bg-slate-900 text-[9px] font-bold text-white uppercase rounded-xl hover:bg-rose-500 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <XCircle size={12}/> ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 📋 Table Content */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden text-slate-600">
            <div className="grid grid-cols-12 p-8 border-b border-slate-50 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] px-14">
              <div className="col-span-12">โครงสร้างหมวดหมู่มาสเตอร์</div>
            </div>

            <div className="divide-y divide-slate-50">
              {paginatedCategories.length > 0 ? paginatedCategories.map((cat) => (
                <div key={cat} className="group">
                  <div 
                    onClick={() => toggleCategory(cat)} 
                    className={`grid grid-cols-12 p-8 px-14 items-center hover:bg-slate-50 transition-all border-l-[6px] cursor-pointer ${
                      openCategories.includes(cat) ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <div className="col-span-12 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`p-2 rounded-xl transition-all ${openCategories.includes(cat) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                          <Layers size={18} />
                        </div>
                        <div>
                          <span className={`text-base font-bold tracking-tight ${openCategories.includes(cat) ? 'text-indigo-800' : 'text-slate-800'}`}>{cat}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Master Inventory Group</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                          {groupedProducts[cat].length} รายการ
                        </span>
                        <ChevronDown size={20} className={`transition-all ${openCategories.includes(cat) ? 'text-indigo-600' : '-rotate-90 text-slate-300'}`} />
                      </div>
                    </div>
                  </div>

                  {openCategories.includes(cat) && (
                    <div className="bg-white border-l-[3px] border-indigo-500 ml-20 animate-in fade-in slide-in-from-top-1 duration-200">
                      {groupedProducts[cat].map((p: any) => (
                        <div 
                          key={p.id} 
                          onClick={() => setSelectedProductId(p.id)}
                          className="grid grid-cols-12 p-6 px-10 items-center hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all cursor-pointer group/item"
                        >
                          <div className="col-span-8 flex items-center gap-5">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 group-hover/item:text-indigo-500 group-hover/item:border-indigo-200 transition-all shadow-sm overflow-hidden">
                              {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <Box size={18} />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-600 group-hover/item:text-indigo-700 transition-colors">{p.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 border-l-2 border-indigo-200">SKU: {p.product_code}</p>
                                 {/* 🚩 โชว์สาขาเฉพาะถ้าเลือกสาขาไว้ เพื่อให้รู้ว่าเป็นของที่ไหน */}
                                 {selectedBranch.id !== 'all' && (
                                   <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 rounded flex items-center gap-1"><MapPin size={8}/> {selectedBranch.branch_name}</p>
                                 )}
                               </div>
                            </div>
                          </div>
                          <div className="col-span-4 text-right pr-10">
                            <div className="flex items-center justify-end gap-10">
                              <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">ยอดคงเหลือ</p>
                                <p className={`text-xs font-bold ${p.current_display_qty <= (p.current_min_stock || 0) ? 'text-rose-500' : 'text-slate-600'}`}>
                                  {/* 🚩 ใช้ค่า current_display_qty ที่คำนวณตามสาขา */}
                                  {p.current_display_qty?.toLocaleString()} {p.unit || 'ชิ้น'}
                                </p>
                              </div>
                              <div className="p-2 text-slate-200 group-hover/item:text-slate-400 transition-all">
                                <MoreVertical size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-[0.2em]">
                  ไม่พบข้อมูลที่ตรงตามเงื่อนไขการกรอง
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-6">แสดง {paginatedCategories.length} จาก {allCategoryKeys.length} หมวดหมู่</p>
               <div className="flex gap-3 mr-6">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all uppercase tracking-widest shadow-sm">ก่อนหน้า</button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-bold text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all uppercase tracking-widest shadow-sm">ถัดไป</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {selectedProductId && (
  <ProductDetailDrawer 
    productId={selectedProductId} 
    onClose={() => setSelectedProductId(null)} 
    selectedBranchId={selectedBranch.id} 
  />
)}
    </div>
  )
}

function FilterOption({ active, label, onClick, color }: any) {
  const activeClass = color === 'rose' 
    ? 'bg-rose-50 text-rose-600' 
    : color === 'slate' 
    ? 'bg-slate-100 text-slate-900' 
    : 'bg-indigo-50 text-indigo-600';

  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between font-sans ${
        active ? activeClass : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
      }`}
    >
      {label} 
      {active && <CheckCircle2 size={12} className="opacity-80" />}
    </button>
  )
}