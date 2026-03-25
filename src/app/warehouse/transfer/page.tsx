'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Package, ArrowRightLeft, X, ChevronDown, 
  MapPin, Send, RotateCcw, Filter, Plus, ShoppingCart
} from 'lucide-react'
import StatusModal from '../../../components/StatusModal'
import InventorySkeleton from '../../../components/skeletons/InventorySkeleton'

export default function StockTransferPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [fromBranchId, setFromBranchId] = useState('') // 🚩 เปลี่ยนจากชื่อเป็น ID
  const [toBranchId, setToBranchId] = useState('')     // 🚩 เปลี่ยนจากชื่อเป็น ID
  const [transferQty, setTransferQty] = useState<number | string>('')
  const [note, setNote] = useState('')
  const [currentSourceStock, setCurrentSourceStock] = useState(0) // 🚩 สต็อกต้นทางจริง

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'loading',
    title: '',
    subtitle: '',
    confirmText: 'ตกลง',
    onConfirm: () => {}
  })

  useEffect(() => {
    fetchInitialData()
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 🚩 เมื่อเปลี่ยนสินค้าหรือสาขาต้นทาง ให้ดึงสต็อกจริงจาก inventory
  useEffect(() => {
    if (selectedProduct && fromBranchId) {
        fetchSourceStock(selectedProduct.id, fromBranchId)
    } else {
        setCurrentSourceStock(0)
    }
  }, [selectedProduct, fromBranchId])

  const fetchInitialData = async () => {
    setFetching(true)
    try {
      const [prodRes, branchRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('branches').select('*').order('branch_name')
      ])
      if (prodRes.data) setProducts(prodRes.data)
      if (branchRes.data) setBranches(branchRes.data)
    } catch (error) { console.error(error) } finally { setFetching(false) }
  }

  const fetchSourceStock = async (pId: string, bId: string) => {
    const { data } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', pId)
        .eq('branch_id', bId)
        .single()
    setCurrentSourceStock(data?.quantity || 0)
  }

  const categories = useMemo(() => 
    ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))], 
  [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.product_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  }, [products, searchTerm, selectedCategory])

  const handleTransfer = async () => {
    const qty = Number(transferQty)
    if (!selectedProduct || !fromBranchId || !toBranchId || qty <= 0) {
      setModal({ isOpen: true, type: 'warning', title: 'ข้อมูลไม่ครบ', subtitle: 'กรุณากรอกข้อมูลให้ครบถ้วน', confirmText: 'ตกลง', onConfirm: () => setModal(prev => ({...prev, isOpen: false})) });
      return;
    }
    if (fromBranchId === toBranchId) {
      setModal({ isOpen: true, type: 'warning', title: 'สาขาซ้ำกัน', subtitle: 'ต้นทางและปลายทางต้องต่างกัน', confirmText: 'แก้ไข', onConfirm: () => setModal(prev => ({...prev, isOpen: false})) });
      return;
    }
    if (qty > currentSourceStock) {
        setModal({ isOpen: true, type: 'error', title: 'สต็อกไม่พอ', subtitle: `สินค้าต้นทางมีเพียง ${currentSourceStock} ไม่พอสำหรับโอน`, confirmText: 'ตกลง', onConfirm: () => setModal(prev => ({...prev, isOpen: false})) });
        return;
    }

    setModal({ isOpen: true, type: 'loading', title: 'กำลังดำเนินการ', subtitle: 'ระบบกำลังโอนย้ายสต็อกระหว่างสาขา...', confirmText: '', onConfirm: () => {} });
    setLoading(true);

    try {
      // 🚩 1. ลดสต็อกสาขาต้นทาง
      const { error: sourceError } = await supabase.rpc('increment_inventory', { 
          p_id: selectedProduct.id, b_id: fromBranchId, amt: -qty 
      }); 
      // หมายเหตุ: ถ้ายังไม่ได้สร้าง RPC ให้ใช้การ update ปกติแบบหน้า Receive ครับ
      if (sourceError) {
          await supabase.from('inventory').update({ quantity: currentSourceStock - qty }).eq('product_id', selectedProduct.id).eq('branch_id', fromBranchId);
      }

      // 🚩 2. เพิ่มสต็อกสาขาปลายทาง (เช็คก่อนว่ามีไหม)
      const { data: destInv } = await supabase.from('inventory').select('id, quantity').eq('product_id', selectedProduct.id).eq('branch_id', toBranchId).single();
      if (destInv) {
          await supabase.from('inventory').update({ quantity: destInv.quantity + qty }).eq('id', destInv.id);
      } else {
          await supabase.from('inventory').insert([{ product_id: selectedProduct.id, branch_id: toBranchId, quantity: qty }]);
      }

      // 🚩 3. บันทึก Movement Log
      await supabase.from('stock_movements').insert([{ 
          product_id: selectedProduct.id, 
          branch_id: fromBranchId, 
          to_branch_id: toBranchId,
          qty: qty, 
          type: 'TRANSFER', 
          note: note || 'โอนย้ายสินค้าระหว่างสาขา'
      }]);

      setModal({
        isOpen: true, type: 'success', title: 'โอนย้ายสำเร็จ!', subtitle: `ย้ายสินค้าจำนวน ${qty} รายการ เรียบร้อยแล้ว`, confirmText: 'ไปหน้าสต็อก',
        onConfirm: () => { setModal(prev => ({...prev, isOpen: false})); router.push('/warehouse/stock'); }
      });

    } catch (error: any) {
      setModal({ isOpen: true, type: 'error', title: 'ทำรายการไม่สำเร็จ', subtitle: error.message, confirmText: 'ลองใหม่', onConfirm: () => setModal(prev => ({...prev, isOpen: false})) });
    } finally { setLoading(false); }
  };

  const finalSourceStock = currentSourceStock - (Number(transferQty) || 0)

  return (
    <div className="max-w-[1550px] mx-auto min-h-screen bg-[#FBFBFE] p-6 md:p-12 font-sans text-slate-900 animate-in fade-in duration-700 relative overflow-x-hidden font-bold">
      
      <StatusModal 
        isOpen={modal.isOpen} type={modal.type} title={modal.title} subtitle={modal.subtitle}
        confirmText={modal.confirmText} onConfirm={modal.onConfirm}
        onClose={() => !loading && setModal(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="mb-14 border-b border-slate-100 pb-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-none">โอนย้าย <span className="text-indigo-600 font-black">สินค้า</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 ml-1">ARWIP INTERNAL LOGISTICS SYSTEM</p>
      </div>

      {fetching ? <InventorySkeleton /> : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-7 space-y-10 min-w-0">
            {/* เลือกสินค้า */}
            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 relative font-bold" ref={dropdownRef}>
              <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 font-sans">รายการสินค้าที่จะโอน</h2>
              {!selectedProduct ? (
                <div className="relative font-sans">
                  <div className="flex items-center bg-slate-50 rounded-3xl px-8 py-2 border border-transparent focus-within:border-indigo-100 transition-all">
                    <Search className="text-slate-300" size={20} />
                    <input type="text" placeholder="ค้นหาชื่อสินค้า หรือ SKU..." className="w-full p-5 bg-transparent border-none outline-none font-bold text-slate-900 font-sans" onFocus={() => setIsDropdownOpen(true)} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <ChevronDown className={`text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden">
                       <div className="bg-slate-50/50 border-b border-slate-100 p-6">
                          <div className="flex items-center justify-between mb-4 font-sans">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><Filter size={10}/> หมวดหมู่</span>
                              <button onClick={() => {setSearchTerm(''); setSelectedCategory('ทั้งหมด');}} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest font-sans"><RotateCcw size={10}/></button>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar font-sans font-bold">
                              {categories.map(cat => (
                                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all font-sans ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                              ))}
                          </div>
                       </div>
                       <div className="max-h-64 overflow-y-auto p-4 custom-scrollbar font-sans">
                          {filteredProducts.map(p => (
                            <button key={p.id} onClick={() => {setSelectedProduct(p); setIsDropdownOpen(false);}} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 flex items-center justify-between group transition-all mb-2 font-sans font-bold">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all font-sans"><Package size={18}/></div>
                                    <div><p className="font-bold text-slate-900 text-sm leading-none mb-1 font-sans">{p.name}</p><span className="text-[9px] text-slate-400 uppercase font-sans font-bold">SKU: {p.product_code}</span></div>
                                </div>
                                <Plus size={16} className="text-slate-200 group-hover:text-indigo-600 font-sans" />
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-7 bg-indigo-50/40 rounded-3xl border border-indigo-100 flex items-center gap-6 animate-in zoom-in-95 font-sans font-bold">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-50 font-sans"><Package size={30} /></div>
                  <div className="flex-1 font-sans">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-none font-sans">{selectedProduct.name}</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-3 font-sans">รหัส: {selectedProduct.product_code}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-3 bg-white text-slate-300 hover:text-rose-500 rounded-full transition-all font-sans"><X size={20}/></button>
                </div>
              )}
            </section>

            {/* ต้นทาง - ปลายทาง */}
            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-12 font-bold font-sans">
              <div className="space-y-6 md:border-r border-slate-50 md:pr-10 font-sans">
                 <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 font-sans font-bold"><MapPin size={12}/> ต้นทาง (Source)</h2>
                 <select value={fromBranchId} onChange={(e) => setFromBranchId(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none text-slate-900 appearance-none focus:ring-4 focus:ring-indigo-50 transition-all font-sans">
                    <option value="">เลือกสาขาต้นทาง...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                 </select>
              </div>
              <div className="space-y-6 font-sans">
                 <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 font-sans font-bold font-sans"><Send size={12} className="text-slate-300"/> ปลายทาง (Destination)</h2>
                 <select value={toBranchId} onChange={(e) => setToBranchId(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none text-slate-900 appearance-none focus:ring-4 focus:ring-indigo-50 transition-all font-sans">
                   <option value="">เลือกสาขาปลายทาง...</option>
                   {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                 </select>
              </div>
            </section>

            {/* จำนวนและหมายเหตุ */}
            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 space-y-8 font-bold font-sans">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 font-sans">
                  <div className="md:col-span-1 space-y-4 font-sans font-bold">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 font-sans">จำนวนที่จะโอน</label>
                    <input type="number" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} className="w-full text-4xl font-black text-indigo-600 bg-transparent border-none p-0 outline-none placeholder:text-slate-100 tracking-tighter font-sans font-bold" placeholder="0" />
                    <div className="h-1 w-12 bg-indigo-600 rounded-full mt-2 font-sans"></div>
                  </div>
                  <div className="md:col-span-2 space-y-4 font-sans font-bold font-sans">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1 font-sans">หมายเหตุเพิ่มเติม</label>
                    <input type="text" value={note} placeholder="ระบุรายละเอียดการขนถ่าย..." className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none text-slate-900 font-sans font-bold font-sans" onChange={(e) => setNote(e.target.value)} />
                  </div>
               </div>
            </section>
          </div>

          {/* 📊 ฝั่งขวา: สรุปรายการ */}
          <div className="xl:col-span-5 sticky top-12 font-bold font-sans">
            <div className="bg-white p-12 md:p-14 rounded-[4.5rem] border border-slate-100 shadow-[0_40px_80px_rgba(0,0,0,0.03)] space-y-12 relative overflow-hidden font-sans font-bold">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-4 tracking-tight uppercase font-sans font-bold font-sans"><ShoppingCart size={24} className="text-indigo-600 font-bold font-sans" /> สรุปรายการโอนย้าย</h3>
              
              <div className="space-y-8 font-bold font-sans font-bold">
                 <div className="flex justify-between items-end border-b border-slate-50 pb-6 text-slate-900 font-sans font-bold">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans font-bold">สต็อกต้นทางปัจจุบัน</span>
                    <div className="text-right font-sans font-bold">
                      <p className="text-2xl font-black text-slate-900 leading-none font-sans font-bold">{currentSourceStock.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="space-y-4 font-sans font-bold font-sans">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center font-sans font-bold font-sans font-bold">เส้นทางขนถ่ายสินค้า</p>
                    <div className="grid grid-cols-[1fr_40px_1fr] items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 font-sans font-bold font-sans">
                      <div className="text-center min-w-0 px-2 font-sans font-bold">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 font-sans font-bold font-sans">จากสาขา</p>
                        <p className="text-[11px] font-black text-slate-600 truncate uppercase font-sans font-bold font-sans">{branches.find(b => b.id === fromBranchId)?.branch_name || '???'}</p>
                      </div>
                      <div className="flex justify-center font-sans font-bold">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0 font-sans font-bold">
                          <ArrowRightLeft size={16} />
                        </div>
                      </div>
                      <div className="text-center min-w-0 px-2 font-sans font-bold">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 font-sans font-bold font-sans font-bold">ไปยังสาขา</p>
                        <p className="text-[11px] font-black text-slate-600 truncate uppercase font-sans font-bold font-sans">{branches.find(b => b.id === toBranchId)?.branch_name || '???'}</p>
                      </div>
                    </div>
                 </div>

                 <div className="pt-6 flex flex-col items-center gap-4 text-slate-900 text-center font-sans font-bold font-sans font-bold font-sans">
                    <div className="bg-indigo-50 px-4 py-1.5 rounded-full font-sans font-bold font-sans font-bold"><span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] font-sans font-bold font-sans font-bold">จำนวนที่จะโอนย้าย</span></div>
                    <p className="text-7xl font-black text-slate-900 tracking-tighter leading-none font-sans font-bold font-sans font-bold">{Number(transferQty) || 0}</p>
                 </div>
              </div>

              <button onClick={handleTransfer} disabled={loading} className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-50 disabled:text-slate-200 font-sans font-bold font-sans font-bold font-sans">
                {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการโอนย้ายสินค้า'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}