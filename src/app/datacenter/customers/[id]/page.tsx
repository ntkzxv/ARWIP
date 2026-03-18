'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Edit2, Save } from 'lucide-react'

// Import Components
import Sidebar from './components/Sidebar'
import PersonalInfo from './components/PersonalInfo'
import GuarantorInfo from './components/GuarantorInfo'
import PurchaseHistory from './components/PurchaseHistory'
import InstallmentDetails from './components/InstallmentDetails' 
import CollectionHistoryTab from './components/CollectionHistoryTab'

import Swal from 'sweetalert2'

// 🚩 แยก Content ออกมาเพื่อใช้ Suspense ครอบ (Next.js บังคับเมื่อใช้ useSearchParams)
function CustomerDetailContent() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🚩 ดึงค่าจาก URL
  const initialTab = searchParams.get('tab') 
  const contractIdFromUrl = searchParams.get('contractId')

  const [activeTab, setActiveTab] = useState(initialTab || 'personal')
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])
  const [collectionLogs, setCollectionLogs] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})

  // 🚩 Logic สำหรับการเลื่อนหน้าจอไปยังบิลที่ระบุ
  useEffect(() => {
    if (activeTab === 'history' && contractIdFromUrl) {
      // หน่วงเวลาเล็กน้อยเพื่อให้ Component PurchaseHistory โหลดข้อมูลเสร็จ
      const timer = setTimeout(() => {
        const element = document.getElementById(contractIdFromUrl)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // เพิ่ม Effect ขอบสีน้ำเงินกะพริบเพื่อให้พนักงานหาบิลเจอทันที
          element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-4', 'duration-1000')
          
          // ล้าง Effect หลังจาก 3 วินาที
          setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500'), 3000)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [activeTab, contractIdFromUrl])

  // 🚩 แก้ไขชื่อ Tab ให้ตรงตามที่ส่งมาจาก Notification (ถ้าส่ง tab=purchase มาให้เปลี่ยนเป็น history)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'purchase') {
      setActiveTab('history')
    } else if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const fetchData = async () => {
    if (!id || id === 'undefined') return;
    try {
      let { data: custData } = await supabase.from('customers').select(`*, branches(*)`).eq('id', id).maybeSingle();
      if (!custData) return;
      setCustomer(custData);
      setEditForm(custData);

      const [contractRes, cashSalesRes] = await Promise.all([
        supabase.from('installment_contracts').select('*').eq('customer_id', id),
        supabase.from('sales_transactions').select('*').eq('customer_id', id).eq('transaction_type', 'cash')
      ]);

      if (contractRes.data && contractRes.data.length > 0) {
        const cIds = contractRes.data.map(c => c.id);
        const tIds = contractRes.data.map(c => c.transaction_id).filter(Boolean);

        const [paymentsRes, guarantorsRes, stRes, logsRes] = await Promise.all([
          supabase.from('installment_payments').select('*').in('contract_id', cIds),
          supabase.from('guarantors').select('*').in('contract_id', cIds),
          supabase.from('sales_transactions').select('*').in('id', tIds),
          supabase.from('collection_logs').select('*').in('contract_id', cIds).order('created_at', { ascending: false })
        ]);

        const enriched = contractRes.data.map(con => ({
          ...con,
          sales_transactions: stRes.data?.find(s => s.id === con.transaction_id),
          installment_payments: paymentsRes.data?.filter(p => p.contract_id === con.id),
          guarantors: guarantorsRes.data?.filter(g => g.contract_id === con.id)
        }));

        setContracts(enriched);
        setCollectionLogs(logsRes.data || []); 
      }
      setSales(cashSalesRes.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData() }, [id])

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fe] gap-4">
      <Loader2 className="animate-spin text-slate-400" size={48} />
      <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading Customer Profile...</p>
    </div>
  )

  return (
    <div className="p-6 md:p-12 lg:ml-16 space-y-10 bg-[#f4f7fe] min-h-screen">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white rounded-3xl shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{customer?.full_name}</h1>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" /> 
            Customer Detail ID: {id?.toString().slice(0,8)}
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} customerScore={customer?.credit_score || 0} />

<div className="flex-1 bg-white rounded-[45px] shadow-sm border border-slate-100 p-8 md:p-12 transition-all">
  {activeTab === 'personal' && <PersonalInfo customer={customer} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />}
  
  {/* 🚩 แก้ไข: ส่ง contractId จาก URL ลงไปใน Component */}
  {activeTab === 'history' && (
    <PurchaseHistory 
      contracts={contracts} 
      sales={sales} 
      autoExpandId={searchParams.get('contractId')} // ส่ง ID ไปให้ลูก
    />
  )}
          {activeTab === 'guarantor' && <GuarantorInfo contracts={contracts} />}
          
          {activeTab === 'installment' && (
            <InstallmentDetails 
              contracts={contracts} 
              customerName={customer?.full_name} 
            />
          )}

          {activeTab === 'collection_logs' && (
            <CollectionHistoryTab logs={collectionLogs} />
          )}
        </div>
      </div>
    </div>
  )
}

// 🚩 Main Component พร้อม Suspense Boundary
export default function CustomerDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <CustomerDetailContent />
    </Suspense>
  )
}