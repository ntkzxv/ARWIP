'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase } from '../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, Package, Plus, X, Filter, RotateCcw, ChevronDown, ShoppingCart 
} from 'lucide-react'
import StatusModal from '../../../components/StatusModal'
import ReceiveSkeleton from '../../../components/skeletons/ReceiveSkeleton'

export default function GoodsReceivingPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  
  // --- สถานะฟอร์ม ---
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [receiveQty, setReceiveQty] = useState<number | string>('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [currentBranchStock, setCurrentBranchStock] = useState(0) // 🚩 ยอดเดิมเฉพาะสาขาที่เลือก

  // --- UI States ---
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    const savedData = localStorage.getItem('receiving_draft');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSelectedProduct(parsed.selectedProduct);
      setReceiveQty(parsed.receiveQty);
      setSelectedBranchId(parsed.selectedBranchId);
      setReferenceNo(parsed.referenceNo);
      setSupplierName(parsed.supplierName);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 💾 Auto-save draft
  useEffect(() => {
    if (!isSaved) {
      const draft = { selectedProduct, receiveQty, selectedBranchId, referenceNo, supplierName };
      localStorage.setItem('receiving_draft', JSON.stringify(draft));
    }
  }, [selectedProduct, receiveQty, selectedBranchId, referenceNo, supplierName, isSaved]);

  // 🚩 เมื่อเลือกสินค้า หรือ เปลี่ยนสาขา ให้ไปดึงยอดคงเหลือเดิมจากตาราง inventory
  useEffect(() => {
    if (selectedProduct && selectedBranchId) {
        fetchCurrentStock(selectedProduct.id, selectedBranchId)
    } else {
        setCurrentBranchStock(0)
    }
  }, [selectedProduct, selectedBranchId])

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

  const fetchCurrentStock = async (pId: string, bId: string) => {
    const { data } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('product_id', pId)
        .eq('branch_id', bId)
        .single()
    setCurrentBranchStock(data?.quantity || 0)
  }

  const categories = useMemo(() => 
    ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))], 
  [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || 
                           p.product_code.toLowerCase().includes(productSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
  }, [products, productSearchTerm, selectedCategory])

  // 🚩 แก้ไข Logic การบันทึก (Update Inventory แทน Product)
  const handleSaveReceive = async () => {
    if (!selectedProduct || !receiveQty || Number(receiveQty) <= 0 || !selectedBranchId) {
      setModal({ 
          isOpen: true, type: 'warning', 
          title: 'ข้อมูลไม่ครบ', 
          subtitle: 'กรุณาเลือกสินค้า เลือกสาขา และระบุจำนวนให้ถูกต้อง', 
          confirmText: 'รับทราบ', 
          onConfirm: () => setModal(prev => ({...prev, isOpen: false})) 
      });
      return;
    }

    setModal({ isOpen: true, type: 'loading', title: 'กำลังบันทึกข้อมูล', subtitle: 'ระบบกำลังดำเนินการอัปเดตสต็อกสินค้า...', confirmText: '', onConfirm: () => {} });
    setLoading(true)

    try {
      const qty = Number(receiveQty);

      // 1. จัดการตาราง Inventory (Upsert)
      const { data: existingInv } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('product_id', selectedProduct.id)
        .eq('branch_id', selectedBranchId)
        .single();

      if (existingInv) {
        await supabase.from('inventory').update({ 
            quantity: existingInv.quantity + qty,
            last_update: new Date() 
        }).eq('id', existingInv.id);
      } else {
        await supabase.from('inventory').insert([{
            product_id: selectedProduct.id,
            branch_id: selectedBranchId,
            quantity: qty
        }]);
      }

      // 2. บันทึก Movement Log
      const { error: logError } = await supabase.from('stock_movements').insert([{
          product_id: selectedProduct.id,
          branch_id: selectedBranchId,
          qty: qty,
          type: 'IN',
          note: `รับเข้า: ${supplierName || '-'} (Ref: ${referenceNo || '-'})`,
          reference_no: referenceNo
      }])
      if (logError) throw logError

      localStorage.removeItem('receiving_draft');
      setIsSaved(true);

      setModal({
        isOpen: true, type: 'success', title: 'รับเข้าสำเร็จ!', subtitle: `เพิ่มสต็อก ${selectedProduct.name} เรียบร้อยแล้ว`, confirmText: 'ไปหน้าสต็อก',
        onConfirm: () => { setModal(prev => ({ ...prev, isOpen: false })); router.push('/warehouse/stock'); }
      });
    } catch (error: any) {
      setModal({ isOpen: true, type: 'error', title: 'เกิดข้อผิดพลาด', subtitle: error.message, confirmText: 'ตกลง', onConfirm: () => setModal(prev => ({...prev, isOpen: false})) });
    } finally { setLoading(false) }
  }

  const finalTotal = currentBranchStock + (Number(receiveQty) || 0)

  return (
    <div className="max-w-[1550px] mx-auto min-h-screen p-6 md:p-12 font-sans text-slate-900 animate-in fade-in duration-700 relative overflow-x-hidden font-bold">
      
      <StatusModal 
        isOpen={modal.isOpen} type={modal.type} title={modal.title} subtitle={modal.subtitle}
        confirmText={modal.confirmText} onConfirm={modal.onConfirm}
        onClose={() => { if (!loading) setModal(prev => ({ ...prev, isOpen: false })) }}
      />

      <div className="mb-14 border-b border-slate-100 pb-10 font-bold">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">รับเข้า <span className="text-indigo-600 font-black">สินค้าใหม่</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-4 ml-1">ARWIP INTERNAL LOGISTICS</p>
      </div>

      {fetching ? (
        <ReceiveSkeleton />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 font-bold">
          <div className="xl:col-span-7 space-y-10 min-w-0 font-bold">
            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 relative font-bold" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-8 font-bold">
                  <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">รายการสินค้าที่จะรับเข้า</h2>
                  {selectedProduct && !isSaved && (
                      <button onClick={() => setSelectedProduct(null)} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2 px-4 py-2 hover:bg-rose-50 rounded-full transition-all"><X size={14}/> เปลี่ยนรายการ</button>
                  )}
              </div>

              {!selectedProduct ? (
                <div className="relative font-bold">
                  <div className="flex items-center bg-slate-50 rounded-3xl px-8 py-2 border border-transparent focus-within:border-indigo-100 transition-all font-bold">
                    <Search className="text-slate-300 font-bold" size={20} />
                    <input type="text" placeholder="พิมพ์ชื่อสินค้า หรือ SKU เพื่อค้นหา..." className="w-full p-5 bg-transparent border-none outline-none font-bold text-slate-900 font-sans" onFocus={() => setIsDropdownOpen(true)} value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} />
                    <ChevronDown className={`text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 font-bold">
                      <div className="bg-slate-50/50 border-b border-slate-100 p-6 font-bold">
                          <div className="flex items-center justify-between mb-4 font-bold">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><Filter size={10}/> หมวดหมู่</span>
                              <button onClick={() => {setProductSearchTerm(''); setSelectedCategory('ทั้งหมด');}} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 font-bold"><RotateCcw size={10}/> ล้างค่า</button>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar font-bold font-sans">
                              {categories.map(cat => (
                                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all font-sans ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{cat}</button>
                              ))}
                          </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-4 font-sans font-bold">
                          {filteredProducts.map(p => (
                              <button key={p.id} onClick={() => {setSelectedProduct(p); setIsDropdownOpen(false);}} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 flex items-center justify-between transition-all group font-sans">
                                  <div className="flex items-center gap-5 font-sans">
                                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Package size={18}/></div>
                                      <div><p className="font-bold text-slate-900 text-sm leading-none mb-1 font-sans">{p.name}</p><span className="text-[9px] text-slate-400 font-bold uppercase font-sans">{p.product_code}</span></div>
                                  </div>
                                  <Plus size={16} className="text-slate-200 group-hover:text-indigo-600 font-sans" />
                              </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-7 bg-indigo-50/40 rounded-3xl border border-indigo-100 flex items-center gap-6 animate-in zoom-in-95 duration-500 font-bold">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50 shrink-0 font-bold"><Package size={30} /></div>
                  <div className="font-bold"><h3 className="text-xl font-black text-slate-900 tracking-tight leading-none font-bold">{selectedProduct.name}</h3><p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-3 font-bold">SKU: {selectedProduct.product_code}</p></div>
                </div>
              )}
            </section>

            <section className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-12 font-bold font-sans">
              <div className="space-y-10 md:border-r border-slate-50 md:pr-10 font-bold">
                 <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">การระบุจำนวนและที่อยู่</h2>
                 <div className="space-y-4 font-bold font-sans">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold">จำนวนที่รับเข้า</label>
                    <div className="relative group font-bold">
                      <input type="number" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} className="w-full text-4xl font-black text-indigo-600 bg-transparent border-none p-0 outline-none placeholder:text-slate-100 tracking-tighter font-sans" placeholder="0" />
                      <div className="h-1 w-12 bg-indigo-600 rounded-full mt-4 group-focus-within:w-20 transition-all duration-500 font-bold"></div>
                    </div>
                 </div>
                 <div className="space-y-4 pt-4 font-bold font-sans">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold font-sans">คลังสินค้าปลายทาง</label>
                    <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none outline-none text-slate-900 font-sans">
                      <option value="">โปรดเลือกคลังสินค้า...</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="space-y-10 font-bold font-sans">
                 <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ข้อมูลเอกสารอ้างอิง</h2>
                 <div className="space-y-6 font-bold font-sans">
                    <div className="space-y-3 font-bold">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold">ชื่อซัพพลายเออร์</label>
                      <input type="text" value={supplierName} placeholder="ผู้จำหน่าย / ผู้ส่งของ..." className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none text-slate-900 font-sans" onChange={(e) => setSupplierName(e.target.value)} />
                    </div>
                    <div className="space-y-3 font-bold font-sans">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-bold">เลขที่ใบสั่งซื้อ / อ้างอิง</label>
                      <input type="text" value={referenceNo} placeholder="ระบุเลขที่เอกสาร..." className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none text-slate-900 font-sans font-bold" onChange={(e) => setReferenceNo(e.target.value)} />
                    </div>
                 </div>
              </div>
            </section>
          </div>

          {/* สรุปรายการ (ฝั่งขวา) */}
          <div className="xl:col-span-5 sticky top-12 font-bold font-sans">
            <div className="bg-white p-12 md:p-14 rounded-[4.5rem] border border-slate-100 shadow-[0_40px_80px_rgba(0,0,0,0.03)] space-y-12 relative overflow-hidden font-bold font-sans">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-4 tracking-tight uppercase font-bold font-sans"><ShoppingCart size={24} className="text-indigo-600 font-bold" /> สรุปการอัปเดต</h3>
              <div className="space-y-8 font-bold font-sans">
                 <div className="flex justify-between items-end border-b border-slate-50 pb-6 text-slate-900 font-sans">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans">สต็อกเดิมในสาขานี้</span>
                    <div className="text-right font-sans">
                      <p className="text-2xl font-black text-slate-900 leading-none font-sans font-bold">{currentBranchStock.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-end pb-8 border-b border-slate-50 text-slate-900 font-sans font-bold">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans font-bold">จำนวนที่รับเพิ่ม</span>
                    <p className="text-2xl font-black text-emerald-500 leading-none font-sans font-bold">+{(Number(receiveQty) || 0).toLocaleString()}</p>
                 </div>
                 <div className="pt-6 flex flex-col items-center gap-4 text-slate-900 text-center font-bold">
                    <div className="bg-indigo-50 px-4 py-1.5 rounded-full font-bold font-sans"><span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] font-sans">ยอดสต็อกรวมใหม่ (เฉพาะสาขา)</span></div>
                    <p className="text-7xl font-black text-slate-900 tracking-tighter leading-none font-sans">{finalTotal.toLocaleString()}</p>
                 </div>
              </div>
              <button 
                onClick={handleSaveReceive} 
                disabled={loading || isSaved} 
                className="w-full py-8 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-50 disabled:text-slate-200 font-sans"
              >
                {isSaved ? 'บันทึกสำเร็จ' : loading ? 'กำลังบันทึก...' : 'ยืนยันการรับเข้าคลัง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}