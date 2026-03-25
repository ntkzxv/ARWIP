'use client'
import { useState, useEffect, Suspense } from 'react' // 🚩 เพิ่ม Suspense
import { supabase } from '../../../../utils/supabase'
import { useRouter, useParams, useSearchParams } from 'next/navigation' // 🚩 เพิ่ม useSearchParams
import {
    ArrowLeft, Edit3, Hash, Info, History, ArrowUpRight,
    ArrowDownLeft, Tags, Bookmark, Laptop, Ruler, ShieldCheck,
    Warehouse, ChevronRight, Clock, Box, Layers, Calculator,
    TrendingUp, Image as ImageIcon, MapPin, Barcode, Calendar,
    AlertCircle, Truck, DollarSign, Activity,
    ArrowRight,
    ArrowRightLeft
} from 'lucide-react'
import Link from 'next/link'
import ProductDetailSkeleton from '../../../../components/skeletons/ProductDetailSkeleton'

// 🚩 แยก Content ออกมาเพื่อใช้กับ Suspense ตามกฎของ Next.js
function ProductDetailContent() {
    const { id } = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const focusedBranchId = searchParams.get('branch') // 🚩 ดึง ID สาขามาใช้งาน

    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState<any>(null)
    const [movements, setMovements] = useState<any[]>([])
    const [currentStock, setCurrentStock] = useState(0)
    const [inventoryBreakdown, setInventoryBreakdown] = useState<any[]>([])
    const [displayBranchName, setDisplayBranchName] = useState('ยอดรวมทุกสาขา')

    useEffect(() => { fetchProductAndStock() }, [id, focusedBranchId])

    const fetchProductAndStock = async () => {
        setLoading(true)
        try {
            const [productRes, movementRes] = await Promise.all([
                supabase.from('products').select('*, inventory(quantity, branch_id, branches(branch_name))').eq('id', id).single(),
                supabase.from('stock_movements').select(`
                    *,
                    from_branch:branches!stock_movements_branch_id_fkey (branch_name),
                    to_branch:branches!stock_movements_to_branch_id_fkey (branch_name)
                `).eq('product_id', id).order('created_at', { ascending: false })
            ])

            if (productRes.data) {
                const inv = productRes.data.inventory || []
                setProduct(productRes.data)
                setInventoryBreakdown(inv)

                // 🚩 LOGIC: เลือกแสดงยอดตามสาขาที่ส่งมา
                if (focusedBranchId && focusedBranchId !== 'all') {
                    const branchData = inv.find((i: any) => String(i.branch_id) === String(focusedBranchId))
                    setCurrentStock(branchData?.quantity || 0)
                    setDisplayBranchName(branchData?.branches?.branch_name || 'ไม่พบสาขา')
                } else {
                    const total = inv.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0)
                    setCurrentStock(total)
                    setDisplayBranchName('ยอดรวมทุกสาขา')
                }
            }

            if (movementRes.data) {
                // 🚩 LOGIC: กรองประวัติเฉพาะสาขาที่เลือก (ถ้ามี)
                if (focusedBranchId && focusedBranchId !== 'all') {
                    const filtered = movementRes.data.filter((m: any) => 
                        String(m.branch_id) === String(focusedBranchId) || 
                        String(m.to_branch_id) === String(focusedBranchId)
                    )
                    setMovements(filtered)
                } else {
                    setMovements(movementRes.data)
                }
            }
            
            setTimeout(() => setLoading(false), 500)
        } catch (err) { console.error(err); setLoading(false); }
    }

    return (
        <div className="min-h-screen text-slate-900 bg-[#F4F7FE] font-sans pb-24 overflow-x-hidden font-bold">
            {/* 🧭 Header */}
            <div className="px-6 md:px-12 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#F4F7FE]/80 backdrop-blur-md">
                <div className="flex items-center gap-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        ย้อนกลับ
                    </button>
                    <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                    <nav className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <button onClick={() => router.back()} className="hover:text-indigo-600 transition-colors">คลังสินค้า</button>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 font-black">{focusedBranchId ? `สาขา: ${displayBranchName}` : 'รายละเอียดสินค้าแบบรวมสาขา'}</span>
                    </nav>
                </div>
                {!loading && (
                    <button onClick={() => router.push(`/warehouse/inventory/edit/${id}`)} className="flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 font-bold">
                        <Edit3 size={14} /> แก้ไขข้อมูลสินค้า
                    </button>
                )}
            </div>

            {loading ? (
                <ProductDetailSkeleton />
            ) : (
                <main className="w-full px-4 md:px-10 lg:px-12 py-10 space-y-8 animate-in fade-in duration-700">

                    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-sm flex flex-col lg:flex-row gap-16 relative overflow-hidden font-bold">
                        <div className="lg:w-[420px] flex-shrink-0 flex flex-col gap-4">
                            <div className="aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner group relative font-bold">
                                {product?.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 font-bold" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-200 font-bold">
                                        <ImageIcon size={100} strokeWidth={1} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 italic font-bold">ไม่มีรูปภาพ</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 font-sans font-bold">
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center font-bold">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-bold"><Barcode size={14} /> บาร์โค้ด</span>
                                    <span className="text-xs font-black text-slate-700 font-bold">{product?.barcode || '---'}</span>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center font-bold">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-bold"><ShieldCheck size={14} /> ซีเรียล</span>
                                    <span className="text-xs font-black text-slate-700 font-mono font-bold">{product?.serial_number || '---'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0 font-bold">
                            <div className="space-y-6 font-bold">
                                <div className="flex items-center gap-3 font-bold">
                                    <span className="px-3 py-1 bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-md shadow-lg font-bold">
                                        {product?.category}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest px-3 border-l-4 border-indigo-600 font-bold">
                                        รหัสสินค้า: {product?.product_code}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] font-bold">
                                    {product?.name}
                                </h1>

                                <div className="grid grid-cols-3 gap-8 pt-8 mt-4 border-t border-slate-50 font-bold">
                                    <ProfileSpec label="ยี่ห้อ" value={product?.brand} icon={<Bookmark size={14} />} />
                                    <ProfileSpec label="รุ่น / โมเดล" value={product?.model} icon={<Laptop size={14} />} />
                                    <ProfileSpec label="หน่วยนับ" value={product?.unit} icon={<Box size={14} />} />
                                </div>

                                <div className="pt-8 border-t border-slate-100 font-bold">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-bold">
                                        <Warehouse size={14} /> สถานะการจัดเก็บรายสาขา
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-bold">
                                        {inventoryBreakdown.map((item, idx) => (
                                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border font-bold ${String(item.branch_id) === String(focusedBranchId) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                                <div className="flex items-center gap-3 font-bold">
                                                    <MapPin size={14} className={String(item.branch_id) === String(focusedBranchId) ? 'text-indigo-600 font-bold' : 'text-indigo-500 font-bold'} />
                                                    <span className="text-xs font-bold text-slate-600 font-bold">{item.branches?.branch_name}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900 font-bold">{item.quantity?.toLocaleString()} {product?.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-10 flex flex-col md:flex-row items-end justify-between gap-8 font-bold">
                                <div className="flex items-center gap-4 group bg-indigo-50/50 p-5 pr-10 rounded-[2.5rem] border border-indigo-100 flex-shrink-0 font-bold">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm font-bold">
                                        <Layers size={26} />
                                    </div>
                                    <div className="min-w-0 font-bold">
                                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1 font-bold">สาขาปัจจุบันที่ตรวจสอบ</p>
                                        <p className="text-xl font-black text-slate-800 uppercase font-bold">{displayBranchName}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end px-4 flex-shrink-0 font-sans font-bold">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 text-right font-bold">ยอดคงเหลือสุทธิ</p>
                                    <div className="flex items-baseline gap-3 font-bold">
                                        <span className={`text-6xl md:text-8xl font-black italic tracking-tighter ${currentStock <= (product?.min_stock || 0) ? 'text-rose-500' : 'text-slate-900'} leading-none font-bold`}>
                                            {currentStock.toLocaleString()}
                                        </span>
                                        <span className="text-sm font-bold uppercase text-slate-300 font-bold">{product?.unit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans font-bold">
                        <div className="lg:col-span-4 space-y-8 font-bold">
                            <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-8 font-bold">
                                <div className="flex items-center justify-between font-bold">
                                    <div className="flex items-center gap-3 text-slate-400 font-bold">
                                        <Activity size={18} />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-bold">การควบคุมสต็อก</h3>
                                    </div>
                                    <AlertCircle size={18} className={currentStock <= (product?.min_stock || 0) ? 'text-rose-500 animate-pulse' : 'text-slate-200'} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 font-bold">
                                    <ControlCard label="ขั้นต่ำ" value={product?.min_stock} sub="จุดสั่งซื้อ" icon={<ArrowDownLeft size={12} />} />
                                    <ControlCard label="สูงสุด" value={product?.max_stock} sub="ความจุคลัง" icon={<ArrowUpRight size={12} />} />
                                    <div className="col-span-2 font-bold">
                                        <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] space-y-3 min-w-0 font-bold">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold">
                                                <DollarSign size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest font-bold">มูลค่าสต็อก ({displayBranchName})</span>
                                            </div>
                                            <div className="flex items-baseline gap-2 flex-wrap min-w-0 font-bold">
                                                <span className="text-sm font-bold text-slate-300 font-bold">฿</span>
                                                <span className="text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter text-slate-900 leading-none font-bold">
                                                    {(currentStock * (product?.cost_price_avg || 0)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-8 font-bold">
                                <div className="flex items-center gap-3 text-slate-400 font-bold">
                                    <TrendingUp size={18} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-bold">นโยบายราคาจำหน่าย</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3 font-bold">
                                    <CompactPriceRow label="ราคาปลีก (P1)" value={product?.sale_price_1} active />
                                    <CompactPriceRow label="ราคาส่ง (P2)" value={product?.sale_price_2} />
                                    <CompactPriceRow label="ราคาสมาชิก (P3)" value={product?.sale_price_3} />
                                    <CompactPriceRow label="ราคาพิเศษ (P4)" value={product?.sale_price_4} />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden flex flex-col font-bold">
                            <div className="p-10 flex justify-between items-center border-b border-slate-50 bg-slate-50/30 font-bold">
                                <div className="flex items-center gap-4 font-bold">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm font-bold"><History size={22} /></div>
                                    <div className="font-bold">
                                        <h3 className="text-base font-black text-slate-800 uppercase tracking-tight font-bold">ประวัติความเคลื่อนไหว</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-bold">LOGS ({displayBranchName})</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[800px] font-bold">
                                <table className="w-full text-left border-collapse font-bold">
                                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 z-10 font-bold">
                                        <tr>
                                            <th className="p-8 pl-12 w-[20%]">วัน-เวลา</th>
                                            <th className="p-8 text-center w-[20%]">ประเภท</th>
                                            <th className="p-8 text-center w-[40%]">รายการ / สาขา</th>
                                            <th className="p-8 text-center pr-12 w-[20%] font-bold">จำนวน</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {movements.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/50 transition-all font-bold group">
                                                <td className="p-8 pl-12 text-xs text-slate-400 font-bold">{new Date(m.created_at).toLocaleDateString('th-TH')}</td>
                                                <td className="p-8 text-center">
                                                    <div className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border font-bold text-[10px] uppercase tracking-widest ${
                                                        m.type === 'IN' ? 'bg-emerald-50/60 border-emerald-100 text-emerald-600' : 
                                                        m.type === 'OUT' ? 'bg-rose-50/60 border-rose-100 text-rose-500' : 'bg-indigo-50/60 border-indigo-100 text-indigo-600'
                                                    }`}>
                                                        <ArrowRightLeft size={12} strokeWidth={3} />
                                                        {m.type === 'IN' ? 'เพิ่มสต็อก' : m.type === 'OUT' ? 'ลดสต็อก' : 'โอนย้ายสินค้า'}
                                                    </div>
                                                </td>
                                                <td className="p-8 font-bold text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        {m.type === 'TRANSFER' ? (
                                                            <div className="flex items-center gap-3 text-[11px] font-black uppercase">
                                                                <span className="text-slate-900">{m.from_branch?.branch_name}</span>
                                                                <ArrowRight size={14} strokeWidth={3} className="text-indigo-500" />
                                                                <span className="text-slate-900">{m.to_branch?.branch_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] font-black text-slate-700 uppercase">{m.from_branch?.branch_name || m.branches?.branch_name || 'ไม่ระบุสาขา'}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-8 text-center pr-12 font-bold">
                                                    <div className={`text-2xl font-bold italic ${m.type === 'IN' ? 'text-emerald-600' : m.type === 'OUT' ? 'text-rose-500' : 'text-indigo-600'}`}>
                                                        {m.qty} <span className="text-[10px] not-italic text-slate-900 ml-1.5 uppercase font-bold">{product?.unit}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}

// 🚩 หุ้ม Component ทั้งหมดด้วย Suspense เพื่อรองรับ useSearchParams
export default function ProductDetailPage() {
    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetailContent />
        </Suspense>
    )
}

function ProfileSpec({ label, value, icon }: any) {
    return (
        <div className="space-y-3 font-bold">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
                {icon}
                <p className="text-[9px] font-bold uppercase tracking-widest italic">{label}</p>
            </div>
            <p className="text-xl font-black tracking-tight text-slate-800">{value || '---'}</p>
        </div>
    )
}

function ControlCard({ label, value, sub, icon, prefix, suffix, horizontal }: any) {
    return (
        <div className={`p-5 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-1 ${horizontal ? 'flex items-center justify-between space-y-0' : ''} font-bold`}>
            <div className={horizontal ? 'flex flex-col' : ''}>
                <div className="flex items-center gap-2 text-slate-400 font-bold">
                    {icon}
                    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
                </div>
                {horizontal && <p className="text-[8px] font-bold text-slate-300 uppercase mt-0.5">{sub}</p>}
            </div>
            <div className={horizontal ? 'text-right' : ''}>
                <p className="text-xl font-black text-slate-800 leading-none py-1">{prefix}{value || '0'}{suffix}</p>
                {!horizontal && <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">{sub}</p>}
            </div>
        </div>
    )
}

function CompactPriceRow({ label, value, active }: any) {
    return (
        <div className={`flex justify-between items-center p-5 border rounded-2xl transition-all ${active ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50/30 border-slate-100'} font-bold`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-400' : 'text-slate-400'}`}>{label}</span>
            <span className={`text-lg font-bold italic ${active ? 'text-indigo-600' : 'text-slate-700'}`}>฿{value?.toLocaleString() || '0'}</span>
        </div>
    )
}