'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useRouter } from 'next/navigation'
import {
    X, MapPin, Box, Info, HelpCircle, Package, ArrowRight,
    Warehouse, Tags, Hash, Layers, Clock, Bookmark, Laptop,
    ArrowRightLeft
} from 'lucide-react'
import ProductDrawerSkeleton from '../../../../components/skeletons/ProductDrawerSkeleton'

export default function ProductDetailDrawer({ productId, onClose, selectedBranchId }: any) {
    const router = useRouter()
    const [product, setProduct] = useState<any>(null)
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (productId) fetchDetail()
    }, [productId, selectedBranchId])

    const fetchDetail = async () => {
        setLoading(true)
        try {
            const { data: pData } = await supabase
                .from('products')
                .select(`*, inventory (quantity, min_stock, max_stock, branch_id, branches (branch_name))`)
                .eq('id', productId)
                .single()
            
            let query = supabase
                .from('stock_movements')
                .select(`*, from_branch:branches!stock_movements_branch_id_fkey (branch_name), to_branch:branches!stock_movements_to_branch_id_fkey (branch_name)`)
                .eq('product_id', productId)

            if (selectedBranchId && selectedBranchId !== 'all') {
                query = query.or(`branch_id.eq.${selectedBranchId},to_branch_id.eq.${selectedBranchId}`)
            }

            const { data: mData } = await query.order('created_at', { ascending: false }).limit(5)

            if (pData) {
                setProduct(pData)
                const inventoryMap: any = {}
                pData.inventory?.forEach((item: any) => {
                    const bId = String(item.branch_id)
                    if (!inventoryMap[bId]) {
                        inventoryMap[bId] = { ...item }
                    } else {
                        inventoryMap[bId].quantity += (item.quantity || 0)
                    }
                })
                setInventoryItems(Object.values(inventoryMap))
            }
            if (mData) setMovements(mData)
        } catch (error) { console.error("Error:", error) } finally { setLoading(false) }
    }

    if (!productId) return null

    // 🚩 1. ค้นหายอดสาขาตัวเอง และ ยอดรวมทั้งบริษัท
    const myBranchData = inventoryItems.find(item => String(item.branch_id) === String(selectedBranchId))
    const totalQty = inventoryItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0)

    // 🚩 2. Logic การแสดงผล
    const isShowingSpecific = selectedBranchId && selectedBranchId !== 'all' && myBranchData
    const displayBranchName = isShowingSpecific ? myBranchData.branches?.branch_name : 'ทุกสาขารวม'
    const displayQty = isShowingSpecific ? (myBranchData.quantity || 0) : totalQty
    
    // 🚩 3. คำนวณหลอด Progress: (จำนวนสาขาเรา / จำนวนรวมทั้งหมด)
    // ถ้าดู "ทุกสาขารวม" ให้หลอดเต็ม 100% (เพราะยอดเราคือยอดรวม)
    const stockPercent = (isShowingSpecific && totalQty > 0) 
        ? Math.min((displayQty / totalQty) * 100, 100) 
        : 100

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans font-bold text-slate-900">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto rounded-l-[3.5rem] font-bold">
                
                <div className="flex items-center justify-between p-8 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10 font-bold">
                    <div className="flex items-center gap-3 font-bold text-slate-900 uppercase tracking-tighter text-lg">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100"><Package size={20} /></div>{displayBranchName}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/warehouse/inventory/${productId}?branch=${selectedBranchId}`)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-[11px] uppercase rounded-2xl hover:bg-indigo-600 transition-all shadow-lg group">โปรไฟล์ฉบับเต็ม <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></button>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>
                    </div>
                </div>

                {loading ? <ProductDrawerSkeleton /> : (
                    <div className="p-10 space-y-12">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="w-44 h-44 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                {product?.image_url ? <img src={product.image_url} className="w-full h-full object-cover" /> : <Package size={70} className="text-slate-200" />}
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">{product?.name}</h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-4 font-black">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-3">{product?.product_code}</span>
                                        <span className="text-[10px] text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-md font-bold">หมวด: {product?.category}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 font-bold">
                                    <InfoItem icon={<Bookmark size={14} />} label="แบรนด์" value={product?.brand} />
                                    <InfoItem icon={<Laptop size={14} />} label="รุ่น/โมเดล" value={product?.model} />
                                </div>
                            </div>
                        </div>

                        {/* 🚩 ส่วนหลอดสัดส่วน: คำนวณ สาขา/รวม และเป็นสี Indigo เสมอ */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1 font-bold">
                                <div className="space-y-1">
                                    <p className="text-[12px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12}/> สต็อกปัจจุบัน: {displayBranchName}
                                    </p>
                                </div>
                                <p className="text-4xl font-black text-slate-900 italic leading-none">
                                    {displayQty.toLocaleString()} <span className="text-xs not-italic text-slate-400 ml-1 font-bold">{product?.unit || 'ชิ้น'}</span>
                                </p>
                            </div>
                            
                            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                                    style={{ width: `${stockPercent}%` }} 
                                />
                            </div>
                            
                            <div className="flex justify-between items-center px-1 font-bold">
                                <p className="text-[11px] text-slate-400 uppercase italic">
                                    {isShowingSpecific ? `สัดส่วนการถือครอง ${Math.round(stockPercent)}% ของสาขาทั้งหมด` : 'แสดงยอดรวมสต็อกทุกสาขา'}
                                </p>
                                <p className="text-[11px] text-slate-400 uppercase font-bold">
                                    {displayQty.toLocaleString()} / {totalQty.toLocaleString()} {product?.unit}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 font-bold"><Warehouse size={14} /> สถานะสต็อกรวม & สาขาอื่น</p>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between p-6 bg-indigo-50/40 rounded-3xl border border-indigo-100/50 shadow-sm transition-all hover:bg-indigo-50 font-bold">
                                    <div className="flex items-center gap-3">
                                        <Layers size={18} className="text-indigo-400" />
                                        <span className="text-sm font-black text-indigo-600/60  uppercase">ยอดรวมสต็อกทั้งบริษัท</span>
                                    </div>
                                    <span className="text-xl font-black text-indigo-600/60 italic font-bold">{totalQty.toLocaleString()} <span className="text-[10px] not-italic opacity-50">{product?.unit}</span></span>
                                </div>

                                {inventoryItems
                                    .filter(item => String(item.branch_id) !== String(selectedBranchId))
                                    .map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/30 opacity-60 font-bold">
                                        <div className="flex items-center gap-3 font-bold">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-500">{item.branches?.branch_name}</span>
                                        </div>
                                        <span className="text-lg font-black italic text-slate-400 font-bold">
                                            {item.quantity?.toLocaleString()} <span className="text-[10px] not-italic opacity-40 font-bold">{product?.unit}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">ประวัติเคลื่อนไหวล่าสุด</h3>
                            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm font-bold">
                                <table className="w-full text-left text-xs font-bold">
                                    <thead className="bg-slate-50/80 text-[10px] uppercase text-slate-400 border-b border-slate-50 font-black">
                                        <tr><th className="p-6 pl-10 font-bold">วัน-เวลา</th><th className="p-6 text-center font-bold">รายการ / สาขา</th><th className="p-6 text-right pr-10 font-bold">จำนวน</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold">
                                        {movements.map((m, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-6 pl-10 text-slate-400">{new Date(m.created_at).toLocaleDateString('th-TH')}</td>
                                                <td className="p-6 text-center">
                                                    <div className="flex flex-col items-center gap-1 font-bold">
                                                        <span className="text-[10px] font-black uppercase text-slate-600">
                                                            {m.type === 'TRANSFER' ? `${m.from_branch?.branch_name} ➔ ${m.to_branch?.branch_name}` : (m.from_branch?.branch_name || m.branches?.branch_name)}
                                                        </span>
                                                        <div className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest ${m.type === 'IN' ? 'text-emerald-500' : m.type === 'OUT' ? 'text-rose-500' : 'text-indigo-400'}`}>
                                                            <ArrowRightLeft size={10} strokeWidth={3} />
                                                            <span>{m.type === 'IN' ? 'รับเข้า' : m.type === 'OUT' ? 'เบิกจ่าย' : 'โอนย้าย'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right pr-10 font-bold">
                                                    <div className={`text-lg italic font-black ${m.type === 'IN' ? 'text-emerald-600' : m.type === 'OUT' ? 'text-rose-600' : 'text-indigo-600'}`}>
                                                        {m.type === 'IN' ? `+${m.qty}` : m.type === 'OUT' ? `-${m.qty}` : m.qty}
                                                        <span className="text-[10px] not-italic text-slate-300 ml-1.5 uppercase font-bold">{product?.unit}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function InfoItem({ icon, label, value, color = "text-slate-700" }: any) {
    return (
        <div className="space-y-1.5 font-bold">
            <p className="text-[9px] text-slate-300 uppercase tracking-widest font-black flex items-center gap-1.5 font-bold">{icon} {label}</p>
            <p className={`text-sm font-black font-bold ${color} truncate`}>{value || '-'}</p>
        </div>
    )
}