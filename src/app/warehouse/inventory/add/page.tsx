'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../../utils/supabase' 
import { useRouter } from 'next/navigation'
import Cropper from 'react-easy-crop'
import { 
  ArrowLeft, Package, Barcode, Hash, Layers, Activity, TrendingUp, 
  Calculator, Info, ChevronDown, ChevronRight, Camera, X, UploadCloud, 
  Eye, CheckCircle, ShieldCheck, ZoomIn, ZoomOut, Trash2
} from 'lucide-react'
import Link from 'next/link'
import StatusModal from '../../../../components/StatusModal'
import RegistrySkeleton from '../../../../components/skeletons/RegistrySkeleton'

export default function RegistryProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true) // 🚩 สำหรับ Skeleton
  const [branches, setBranches] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // --- UI States ---
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'loading',
    title: '',
    subtitle: '',
    confirmText: 'ตกลง',
    onConfirm: () => {}
  })

  // 🚩 แก้ไขค่าเริ่มต้นเป็นค่าว่างทั้งหมด (ยกเว้นวันที่) เพื่อให้โชว์ Placeholder
  const initialFormState = {
    product_code: '', barcode: '', category: '', name: '', unit: '', 
    type_size: '', brand: '', model: '', status_active: 'มือหนึ่ง', 
    serial_number: '', min_stock: '', max_stock: '', lead_time: '', branch_id: '',
    image_url: '', opening_date: new Date().toISOString().split('T')[0],
    opening_qty: '', opening_cost: '', opening_total_cost: '0',
    sale_price_1: '', sale_price_2: '', sale_price_3: '', sale_price_4: '',
  }

  const [formData, setFormData] = useState(initialFormState)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormState)

  // 🚩 โหลดข้อมูลเริ่มต้นและปิด Skeleton
  useEffect(() => {
    async function init() {
      await fetchBranches()
      setTimeout(() => setInitialLoading(false), 600) // หน่วงนิดๆ ให้แอนิเมชัน Skeleton ทำงานสวยๆ
    }
    init()
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBackNavigation = () => {
    if (isDirty) {
      setModal({
        isOpen: true, type: 'warning', title: 'ยืนยันการออกจากหน้านี้?',
        subtitle: 'ข้อมูลที่กรอกไว้ทั้งหมดจะหายไป ยืนยันที่จะออกหรือไม่?',
        confirmText: 'ยืนยันการออก',
        onConfirm: () => { setModal(prev => ({ ...prev, isOpen: false })); router.back(); }
      });
    } else { router.back(); }
  };

  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('id, branch_name')
    if (data) setBranches(data)
  }

  useEffect(() => {
    const qty = parseFloat(formData.opening_qty) || 0
    const cost = parseFloat(formData.opening_cost) || 0
    const total = qty * cost
    setFormData(prev => ({ ...prev, opening_total_cost: total.toLocaleString() }))
  }, [formData.opening_qty, formData.opening_cost])

  const handleClearForm = () => {
    setModal({
      isOpen: true, type: 'warning', title: 'ล้างข้อมูลทั้งหมด?',
      subtitle: 'ต้องการล้างสิ่งที่กรอกไว้ทั้งหมดใช่หรือไม่?',
      confirmText: 'ล้างข้อมูล',
      onConfirm: () => { setFormData(initialFormState); setSelectedFileName(''); setModal(prev => ({ ...prev, isOpen: false })); }
    });
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFileName(file.name)
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
        setZoom(1)
        setIsCropping(true)
      })
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels) }, [])

  const showCroppedImage = async () => {
    try {
      const croppedImage: any = await getCroppedImg(imageSrc, croppedAreaPixels)
      setFormData({ ...formData, image_url: croppedImage })
      setIsCropping(false)
    } catch (e) { console.error(e) }
  }

// 🚩 ค้นหาฟังก์ชัน handleSubmit แล้ววางทับส่วนนี้
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModal({
      isOpen: true, type: 'loading', title: 'กำลังบันทึกข้อมูล',
      subtitle: 'กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลลงฐานข้อมูล...',
      confirmText: '', onConfirm: () => {}
    })

    setLoading(true)
    try {
      let finalImageUrl = formData.image_url
      if (formData.image_url.startsWith('data:image')) {
          const blob = await fetch(formData.image_url).then(r => r.blob())
          const fileName = `prod_${Date.now()}.jpg`
          await supabase.storage.from('product-images').upload(`products/${fileName}`, blob)
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`)
          finalImageUrl = publicUrl
      }

      // 1. บันทึกเข้าตาราง products (เฉพาะข้อมูลสเปก)
      const productData = {
        product_code: formData.product_code,
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        unit: formData.unit,
        type_size: formData.type_size,
        serial_number: formData.serial_number,
        has_serial: formData.serial_number ? 'Yes' : 'No',
        image_url: finalImageUrl,
        lead_time: parseInt(formData.lead_time) || 0,
        sale_price_1: parseFloat(formData.sale_price_1) || 0,
        sale_price_2: parseFloat(formData.sale_price_2) || 0,
        sale_price_3: parseFloat(formData.sale_price_3) || 0,
        sale_price_4: parseFloat(formData.sale_price_4) || 0,
        status_active: formData.status_active,
        cost_price_avg: parseFloat(formData.opening_cost) || 0
      }

      const { data: newProd, error: pError } = await supabase.from('products').insert([productData]).select().single()
      if (pError) throw pError

      // 2. บันทึกเข้าตาราง inventory (เฉพาะยอดสต็อก)
      if (formData.branch_id) {
        const { error: invError } = await supabase.from('inventory').insert([{
          product_id: newProd.id,
          branch_id: formData.branch_id,
          quantity: parseInt(formData.opening_qty) || 0,
          min_stock: parseInt(formData.min_stock) || 0,
          max_stock: parseInt(formData.max_stock) || 0
        }])
        if (invError) throw invError
      }
      
      setModal({
        isOpen: true, type: 'success', title: 'บันทึกสำเร็จ',
        subtitle: 'ลงทะเบียนสินค้าและจัดตั้งสต็อกเรียบร้อยแล้ว',
        confirmText: 'ตกลง', onConfirm: () => router.push('/warehouse/inventory')
      });
    } catch (err: any) { 
        setModal({
            isOpen: true, type: 'error', title: 'เกิดข้อผิดพลาด',
            subtitle: err.message, confirmText: 'ลองอีกครั้ง',
            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
        });
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-24 relative">
      
      <StatusModal 
        isOpen={modal.isOpen} type={modal.type} title={modal.title} subtitle={modal.subtitle}
        confirmText={modal.confirmText} onConfirm={modal.onConfirm}
        onClose={() => modal.type !== 'loading' && setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* CROP MODAL (เหมือนเดิม) */}
      {isCropping && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="relative w-full max-w-xl aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <Cropper image={imageSrc!} crop={crop} zoom={zoom} aspect={1 / 1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="mt-10 w-full max-w-xl bg-white/10 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md flex items-center gap-6">
            <ZoomOut size={20} className="text-white/40" />
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e: any) => setZoom(e.target.value)} className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-50" />
            <ZoomIn size={20} className="text-white/40" />
          </div>
          <div className="mt-8 flex gap-4 w-full max-w-xl font-bold">
            <button onClick={() => setIsCropping(false)} className="flex-1 py-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all uppercase text-xs">ยกเลิก</button>
            <button onClick={showCroppedImage} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg uppercase text-xs">ตกลง</button>
          </div>
        </div>
      )}

      {/* 🧭 Header */}
      <div className=" px-6 md:px-12 py-8 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button onClick={handleBackNavigation} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            ย้อนกลับ
          </button>
          <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
          <nav className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={handleBackNavigation}>คลังสินค้า</span>
            <ChevronRight size={12} /> 
            <span className="text-slate-900 font-black">ลงทะเบียนสินค้าใหม่</span>
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <form id="regForm" className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" onSubmit={handleSubmit}>
          
          {initialLoading ? (
            <RegistrySkeleton /> // 🚩 แสดง Skeleton ขณะรอข้อมูล
          ) : (
            <div className="p-10 space-y-12 animate-in fade-in duration-500">
              {/* โซนที่ 1: ข้อมูล Identity */}
              <div className="space-y-8">
                <SectionHeader icon={<Info size={20}/>} title="ข้อมูลอัตลักษณ์สินค้า" sub="Product Identity" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  <div className="md:col-span-2">
                     <ModernInput label="ชื่อสินค้าเต็ม" value={formData.name} onChange={(v:any)=>setFormData({...formData, name:v})} placeholder="ระบุชื่อสินค้า..." required />
                  </div>
                  <ModernInput label="รหัสสินค้า (SKU)" value={formData.product_code} onChange={(v:any)=>setFormData({...formData, product_code:v})} placeholder="รหัสอ้างอิง" required />
                  <ModernInput label="บาร์โค้ด" value={formData.barcode} onChange={(v:any)=>setFormData({...formData, barcode:v})} placeholder="สแกนบาร์โค้ด" />
                  <ModernInput label="หมวดหมู่" value={formData.category} onChange={(v:any)=>setFormData({...formData, category:v})} placeholder="ระบุกลุ่มสินค้า" />
                  <ModernInput label="หน่วยนับ" value={formData.unit} onChange={(v:any)=>setFormData({...formData, unit:v})} placeholder="ชิ้น, กล่อง, ชุด" />
                  <ModernInput label="ยี่ห้อ" value={formData.brand} onChange={(v:any)=>setFormData({...formData, brand:v})} placeholder="แบรนด์สินค้า" />
                  <ModernInput label="รุ่น / โมเดล" value={formData.model} onChange={(v:any)=>setFormData({...formData, model:v})} placeholder="เลขรุ่น" />
                  <ModernInput label="สเปก / ขนาด" value={formData.type_size} onChange={(v:any)=>setFormData({...formData, type_size:v})} placeholder="ข้อมูลขนาด" />
                  <ModernInput label="หมายเลขซีเรียล" value={formData.serial_number} onChange={(v:any)=>setFormData({...formData, serial_number:v})} icon={<ShieldCheck size={14}/>} placeholder="S/N (ถ้ามี)" />
                  <ModernCustomSelect label="สภาพสินค้า" value={formData.status_active} onChange={(v:any)=>setFormData({...formData, status_active:v})} options={['มือหนึ่ง', 'มือสอง']} />
                </div>
              </div>

              <hr className="border-slate-50" />

              {/* โซนที่ 2: Inventory */}
              <div className="space-y-8">
                <SectionHeader icon={<Calculator size={20}/>} title="การคุมคลังและต้นทุน" sub="Inventory Control" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <ModernInput label="จำนวนต่ำสุด (Min)" value={formData.min_stock} onChange={(v:any)=>setFormData({...formData, min_stock:v})} placeholder="0" />
                   <ModernInput label="จำนวนสูงสุด (Max)" value={formData.max_stock} onChange={(v:any)=>setFormData({...formData, max_stock:v})} placeholder="0" />
                   <ModernInput label="ระยะเวลาสั่งซื้อ (วัน)" value={formData.lead_time} onChange={(v:any)=>setFormData({...formData, lead_time:v})} placeholder="0" />
                   <ModernCustomSelect label="สถานที่จัดเก็บ" value={branches.find(b => b.id === formData.branch_id)?.branch_name || '-- เลือกสาขา --'} onChange={(v:any)=>{
                          const bId = branches.find(b => b.branch_name === v)?.id || '';
                          setFormData({...formData, branch_id: bId});
                      }} options={branches.map(b => b.branch_name)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                   <ModernInput label="วันที่เริ่มยกมา" type="date" value={formData.opening_date} onChange={(v:any)=>setFormData({...formData, opening_date:v})} />
                   <ModernInput label="จำนวนยกมาตั้งต้น" value={formData.opening_qty} onChange={(v:any)=>setFormData({...formData, opening_qty:v})} placeholder="0" />
                   <ModernInput label="ต้นทุนต่อหน่วย" value={formData.opening_cost} onChange={(v:any)=>setFormData({...formData, opening_cost:v})} placeholder="0.00" />
                </div>
                <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-50 mt-4">
                   <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle size={14} className="text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">มูลค่าต้นทุนรวมยอดยกมา:</span>
                   </div>
                   <span className="text-xl font-black text-slate-900 tracking-tight italic">฿ {formData.opening_total_cost}</span>
                </div>
              </div>

              <hr className="border-slate-50" />

              {/* โซนที่ 3: ราคาขาย */}
              <div className="space-y-8">
                <SectionHeader icon={<TrendingUp size={20}/>} title="นโยบายราคาขาย" sub="Pricing Strategy" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <PriceInput label="ราคาปลีก (P1)" value={formData.sale_price_1} onChange={(v:any)=>setFormData({...formData, sale_price_1:v})} placeholder="0.00" active />
                  <PriceInput label="ราคาส่ง (P2)" value={formData.sale_price_2} onChange={(v:any)=>setFormData({...formData, sale_price_2:v})} placeholder="0.00" />
                  <PriceInput label="ราคาสมาชิก (P3)" value={formData.sale_price_3} onChange={(v:any)=>setFormData({...formData, sale_price_3:v})} placeholder="0.00" />
                  <PriceInput label="ราคาโครงการ (P4)" value={formData.sale_price_4} onChange={(v:any)=>setFormData({...formData, sale_price_4:v})} placeholder="0.00" />
                </div>
              </div>

              <hr className="border-slate-50" />

              <div className="space-y-6 pb-4">
                <SectionHeader icon={<Camera size={20}/>} title="รูปภาพสินค้า" sub="Product Attachment" />
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className="w-full p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-between hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm"><UploadCloud size={24} className="text-indigo-500" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{selectedFileName || 'คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง'}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5 italic">รองรับไฟล์ภาพ และระบบจะให้ตัดรูปทันที</p>
                      </div>
                    </div>
                    {formData.image_url && (
                      <div className="flex items-center gap-2">
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm"><img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" /></div>
                         <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, image_url: ''}); setSelectedFileName(''); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={20} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
              </div>
            </div>
          )}

          {/* ส่วนท้าย */}
          {!initialLoading && (
            <div className="p-10 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
              <button type="button" onClick={handleClearForm} className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-rose-500 transition-all text-[11px] font-bold uppercase tracking-widest"><Trash2 size={16} /> ล้างข้อมูล</button>
              <button form="regForm" disabled={loading} className="bg-slate-900 text-white px-16 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:bg-indigo-600 active:scale-95 shadow-xl disabled:opacity-50">{loading ? 'กำลังบันทึก...' : 'ลงทะเบียนสินค้า'}</button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

// ... Reusable Components & Helpers เหมือนเดิม ...
async function getCroppedImg(imageSrc: string | null, pixelCrop: any) {
  const image = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image(); img.src = imageSrc!; img.onload = () => resolve(img);
  });
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
  ctx?.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return canvas.toDataURL('image/jpeg');
}

function SectionHeader({ icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">{icon}</div>
      <div><h3 className="text-md font-bold uppercase tracking-tight text-slate-800">{title}</h3><p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{sub}</p></div>
    </div>
  )
}

function ModernInput({ label, value, onChange, placeholder, type="text", required, icon }: any) {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">{icon} {label} {required && "*"}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300 shadow-sm" />
    </div>
  )
}

function PriceInput({ label, value, onChange, active, placeholder }: any) {
  return (
    <div className="space-y-1.5 font-sans">
      <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">฿</span>
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "0.00"} className={`w-full p-4 pl-9 border rounded-xl font-black text-sm outline-none transition-all ${active ? 'bg-indigo-50/30 border-indigo-100 text-indigo-600 shadow-inner' : 'bg-slate-50/50 border-slate-100 text-slate-700'}`} />
      </div>
    </div>
  )
}

function ModernCustomSelect({ label, value, onChange, options }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative font-sans" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full p-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-sm cursor-pointer flex justify-between items-center transition-all shadow-sm ${isOpen ? 'border-indigo-400 bg-white shadow-md shadow-indigo-50' : ''}`} >
        <span className={value.includes('--') ? 'text-slate-300' : 'text-slate-700'}>{value}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'text-slate-300'}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt: string) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className="p-4 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border-b border-slate-50 last:border-none" >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}