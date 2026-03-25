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
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (productId) fetchDetail()
    }, [productId, selectedBranchId]) // 🚩 เพิ่ม selectedBranchId ใน dependency เพื่อให้โหลดใหม่เมื่อเปลี่ยนสาขา

    const fetchDetail = async () => {
        setLoading(true)
        try {
            // 1. ดึงข้อมูลสินค้า
            const { data: pData } = await supabase
                .from('products')
                .select('*, inventory(quantity, branch_id, branches(branch_name))')
                .eq('id', productId)
                .single()
            
            if (pData) {
                const total = pData.inventory?.reduce((acc: number, inv: any) => acc + (inv.quantity || 0), 0) || 0
                setProduct({ ...pData, total_qty: total })
            }

            // 2. 🚩 ปรับ Logic Query ประวัติให้กรองตามสาขาที่เลือก
            let query = supabase
                .from('stock_movements')
                .select(`
                    *,
                    from_branch:branches!stock_movements_branch_id_fkey (branch_name),
                    to_branch:branches!stock_movements_to_branch_id_fkey (branch_name)
                `)
                .eq('product_id', productId)

            // 🚩 เงื่อนไข: ถ้าไม่ใช่ 'ทุกสาขารวม' ให้ดึงเฉพาะรายการที่เกี่ยวข้องกับสาขานั้น
            if (selectedBranchId && selectedBranchId !== 'all') {
                query = query.or(`branch_id.eq.${selectedBranchId},to_branch_id.eq.${selectedBranchId}`)
            }

            const { data: mData } = await query.order('created_at', { ascending: false }).limit(5)
            if (mData) setMovements(mData)

        } catch (error) {
            console.error("Error fetching drawer detail:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!productId) return null

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans font-bold">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto rounded-l-[3.5rem] font-bold">

                <div className="flex items-center justify-between p-8 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10 font-bold">
                    <div className="flex items-center gap-3 font-bold text-slate-900 uppercase tracking-tighter text-lg">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100"><Package size={20} /></div>
                        ภาพรวมสินค้า
                    </div>

                    <div className="flex items-center gap-3 font-bold">
                        <button
                            onClick={() => router.push(`/warehouse/inventory/${productId}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-[11px] uppercase rounded-2xl hover:bg-indigo-600 transition-all shadow-lg group"
                        >
                            โปรไฟล์ฉบับเต็ม
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <ProductDrawerSkeleton />
                ) : (
                    <div className="p-10 space-y-10 font-bold font-sans">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="w-44 h-44 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center shadow-inner overflow-hidden group shrink-0">
                                {product?.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-200 font-bold">
                                        <Package size={70} strokeWidth={1} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">No Image</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-6 font-bold">
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                                        {product?.name}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-4 text-indigo-600 font-bold">
                                        <Tags size={14} />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            หมวด: {product?.category || 'ไม่ระบุ'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 pt-6 border-t border-slate-50 font-bold">
                                    <InfoItem icon={<Bookmark size={14} />} label="แบรนด์ (Brand)" value={product?.brand} />
                                    <InfoItem icon={<Laptop size={14} />} label="รุ่น (Model)" value={product?.model} />
                                    <InfoItem icon={<Hash size={14} />} label="รหัสสินค้า (SKU)" value={product?.product_code} />
                                    <InfoItem icon={<Layers size={14} />} label="รวมในคลัง" value={`${product?.total_qty?.toLocaleString()} ${product?.unit || 'ชิ้น'}`} color="text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 font-sans">
                                    <Info size={14} /> ขนาดและประเภท
                                </p>
                                <div className="text-xs text-slate-500 leading-relaxed font-bold bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-h-[120px] font-sans">
                                    {product?.type_size || 'ไม่มีข้อมูลรายละเอียดเพิ่มเติม'}
                                </div>
                            </div>

                            <div className="space-y-3 font-bold">
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 px-1 font-sans">
                                    <Warehouse size={14} /> สถานะรายสาขา
                                </p>
                                <div className="flex flex-col gap-2 p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-50 min-h-[120px] font-sans">
                                    {product?.inventory?.length > 0 ? product.inventory.map((inv: any) => (
                                        <div key={inv.branch_id} className={`flex justify-between items-center text-xs font-bold border-b border-indigo-100/50 pb-2 last:border-0 last:pb-0 ${inv.branch_id === selectedBranchId ? 'text-indigo-600' : ''}`}>
                                            <span className="flex items-center gap-2"><MapPin size={10}/> {inv.branches?.branch_name}</span>
                                            <span className="font-black">{inv.quantity.toLocaleString()}</span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">ไม่มีข้อมูลสินค้าในสาขาใดๆ</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 font-bold">
                            <div className="flex justify-between items-center px-1 font-bold">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                                    ประวัติล่าสุด {selectedBranchId !== 'all' && <span className="text-xs text-indigo-500 font-normal ml-2">(เฉพาะสาขาที่เลือก)</span>}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">MOVEMENT LOGS</span>
                            </div>
                            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm bg-white font-sans font-bold">
                                <table className="w-full text-left text-xs font-sans font-bold">
                                    <thead className="bg-slate-50/80 text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 font-bold font-sans">
                                        <tr>
                                            <th className="p-6 pl-10 font-sans">วัน-เวลา</th>
                                            <th className="p-6 font-sans text-center">รายการ / สาขา</th>
                                            <th className="p-6 font-sans text-right pr-10">จำนวน</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-bold font-sans">
                                        {movements.length > 0 ? movements.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors font-bold font-sans">
                                                <td className="p-6 pl-10 text-[11px] text-slate-400 font-medium shrink-0">
                                                    {new Date(m.created_at).toLocaleDateString('th-TH')}
                                                </td>

                                                <td className="p-6 font-sans font-bold text-center">
                                                    <div className="flex flex-col items-center justify-center gap-1">
                                                        {m.type === 'TRANSFER' ? (
                                                            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight">
                                                                <span className={m.branch_id === selectedBranchId ? 'text-slate-900' : 'text-slate-900'}>{m.from_branch?.branch_name}</span>
                                                                <ArrowRight size={14} strokeWidth={3} className="text-indigo-500 shrink-0" />
                                                                <span className={m.to_branch_id === selectedBranchId ? 'text-slate-900' : 'text-slate-900'}>{m.to_branch?.branch_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className={`text-[10px] font-black uppercase ${m.branch_id === selectedBranchId ? 'text-slate-600' : 'text-slate-600'}`}>
                                                                {m.from_branch?.branch_name || m.branches?.branch_name}
                                                            </span>
                                                        )}
                                                        
                                                        <div className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest ${
                                                            m.type === 'IN' ? 'text-emerald-600' : m.type === 'OUT' ? 'text-rose-500' : 'text-indigo-400'
                                                        }`}>
                                                            <ArrowRightLeft size={10} strokeWidth={3} />
                                                            <span>{m.type === 'IN' ? 'รับเข้าสินค้า' : m.type === 'OUT' ? 'เบิกจ่ายออก' : 'โอนย้ายระหว่างสาขา'}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-6 text-center font-sans">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className={`text-xl font-bold italic flex items-baseline gap-1.5 ${
                                                            m.type === 'IN' ? 'text-emerald-600' : m.type === 'OUT' ? 'text-rose-600' : 'text-indigo-600'
                                                        }`}>
                                                            <span>{m.type === 'IN' ? `${m.qty}` : m.type === 'OUT' ? `${m.qty}` : m.qty}</span>
                                                            <span className="text-[10px] not-italic text-slate-900 font-bold uppercase tracking-widest">
                                                                {product?.unit || 'ชิ้น'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="p-16 text-center text-slate-300 uppercase text-[10px] font-bold tracking-widest font-sans">ไม่พบประวัติในสาขานี้</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-10 mt-auto border-t border-slate-50 flex justify-between items-center bg-slate-50/30 font-bold font-sans">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic font-sans">ARWIP Intelligence WMS / v3.5</p>
                    <button className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold text-[11px] uppercase rounded-[1.2rem] hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm font-sans font-bold">
                        <HelpCircle size={14} /> ศูนย์ช่วยเหลือ
                    </button>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ icon, label, value, color = "text-slate-700" }: any) {
    return (
        <div className="space-y-2 font-sans font-bold">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-sans">{label}</p>
            <div className={`flex items-center gap-3 text-sm font-bold font-sans ${color}`}>
                <div className="text-indigo-400 bg-indigo-50/50 p-2 rounded-xl font-sans">{icon}</div>
                {value || '-'}
            </div>
        </div>
    )
}