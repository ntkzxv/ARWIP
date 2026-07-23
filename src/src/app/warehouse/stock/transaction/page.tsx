'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase' // ใช้ Alias @/ ตามที่ตั้งค่าไว้
import { useRouter } from 'next/navigation'
import { 
  X, MapPin, Box, Info, HelpCircle, Package, ArrowRight, 
  Warehouse, Tags, Hash, Layers, Clock, Bookmark, Laptop,
  ArrowUpRight, ArrowDownLeft, History
} from 'lucide-react'
import ProductDrawerSkeleton from '../../../../components/skeletons/ProductDrawerSkeleton'

export default function ProductDetailDrawer({ productId, onClose }: any) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) fetchDetail()
  }, [productId])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      
      if (error) throw error
      setProduct(data)
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!productId) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto rounded-l-[3.5rem]">
        
        {/* --- Header Section --- */}
        <div className="flex items-center justify-between p-8 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 font-bold text-slate-900 uppercase tracking-tighter text-lg">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100"><History size={20}/></div>
              Transaction Logs
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => router.push(`/warehouse/inventory/${productId}`)}
                 className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold text-[11px] uppercase rounded-2xl hover:bg-indigo-600 transition-all shadow-lg group"
               >
                 Full Profile
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                 <X size={24}/>
               </button>
            </div>
        </div>

        {loading ? (
          <ProductDrawerSkeleton />
        ) : (
          <div className="p-10 space-y-10">
              {/* Product Profile Summary */}
              <div className="flex flex-col md:flex-row gap-8 items-start bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                  <div className="w-32 h-32 bg-white rounded-3xl border-2 border-slate-100 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                    {product?.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Package size={40} className="text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold text-slate-900 leading-none">{product?.name}</h2>
                    <div className="flex gap-4 pt-2">
                       <MiniInfo label="SKU" value={product?.product_code} />
                       <MiniInfo label="UNIT" value={product?.unit} />
                       <MiniInfo label="STOCK" value={product?.opening_qty?.toLocaleString()} highlight />
                    </div>
                  </div>
              </div>

              {/* Type & Location Info */}
              <div className="grid grid-cols-2 gap-6">
                <InfoBox icon={<Box size={14}/>} label="Size / Type" value={product?.type_size || 'N/A'} />
                <InfoBox icon={<MapPin size={14}/>} label="Warehouse Location" value={product?.location || 'Not Assigned'} isIndigo />
              </div>

              {/* --- Transaction Table (The Core) --- */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Movement History</h3>
                   <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">Live Update</span>
                </div>

                <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/80 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                         <tr>
                            <th className="p-6 pl-10 font-bold">Date & Time</th>
                            <th className="p-6 font-bold text-center">Action</th>
                            <th className="p-6 font-bold text-right pr-10">Quantity</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-bold">
                          {/* 1. รับเข้า (Stock In) */}
                          <TransactionRow 
                            date="24 Mar 2026" 
                            type="STOCK IN" 
                            refCode="PO-8829" 
                            qty={+150} 
                            unit={product?.unit}
                            status="in"
                          />

                          {/* 2. จ่ายออก (Stock Out) */}
                          <TransactionRow 
                            date="22 Mar 2026" 
                            type="DISPATCH" 
                            refCode="DO-1102" 
                            qty={-24} 
                            unit={product?.unit}
                            status="out"
                          />

                          {/* 3. ยอดยกมา (Opening Balance) */}
                          <TransactionRow 
                            date={product?.created_at ? new Date(product.created_at).toLocaleDateString() : '-'} 
                            type="INITIAL" 
                            refCode="SYS-INIT" 
                            qty={product?.opening_qty} 
                            unit={product?.unit}
                            status="neutral"
                          />
                      </tbody>
                   </table>
                </div>
              </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-10 mt-auto border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic font-sans">WMS Intelligence / Log v2.0</p>
           <button className="text-slate-400 hover:text-indigo-600 transition-colors">
             <HelpCircle size={20}/>
           </button>
        </div>
      </div>
    </div>
  )
}

// --- Sub-Components (ช่วยให้โค้ดสะอาดขึ้นและแก้เรื่องความสูงต่ำไม่เท่ากัน) ---

function TransactionRow({ date, type, refCode, qty, unit, status }: any) {
  const isOut = status === 'out';
  const isIn = status === 'in';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-6 pl-10">
        <div className="flex items-center gap-3">
          <Clock size={12} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
          <span className="text-slate-400 text-xs font-medium">{date}</span>
        </div>
      </td>
      <td className="p-6">
         <div className="flex flex-col items-center gap-1">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border ${
              isIn ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              isOut ? 'bg-rose-50 text-rose-600 border-rose-100' :
              'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
              {type}
            </span>
            <span className="text-[9px] text-slate-300 tracking-tighter">{refCode}</span>
         </div>
      </td>
      <td className="p-6 text-right pr-10">
        <div className="flex items-center justify-end gap-2">
          {isIn && <ArrowUpRight size={14} className="text-emerald-500" />}
          {isOut && <ArrowDownLeft size={14} className="text-rose-500" />}
          <span className={`text-lg font-bold italic ${
            isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-slate-600'
          }`}>
            {qty > 0 && isIn ? `+${qty}` : qty}
          </span>
          <span className="text-[10px] font-bold text-slate-300 uppercase not-italic">{unit}</span>
        </div>
      </td>
    </tr>
  )
}

function MiniInfo({ label, value, highlight }: any) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-indigo-600' : 'text-slate-600'}`}>{value || '-'}</span>
    </div>
  )
}

function InfoBox({ icon, label, value, isIndigo }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</p>
      <div className={`flex items-center gap-3 p-5 rounded-[2rem] border h-20 ${
        isIndigo ? 'bg-indigo-50/30 border-indigo-50 text-indigo-700' : 'bg-slate-50/50 border-slate-100 text-slate-600'
      }`}>
        <div className={`p-2 rounded-xl shrink-0 ${isIndigo ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white text-slate-400 shadow-sm'}`}>
          {icon}
        </div>
        <span className="text-sm font-bold truncate leading-none">{value}</span>
      </div>
    </div>
  )
}