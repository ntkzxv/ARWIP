'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Edit2, Save } from 'lucide-react'

// Import Components
import Sidebar from './components/Sidebar'
import PersonalInfo from './components/PersonalInfo'
import GuarantorInfo from './components/GuarantorInfo'
import PurchaseHistory from './components/PurchaseHistory'
import InstallmentDetails from './components/InstallmentDetails' 

import Swal from 'sweetalert2'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  
  // 1. States สำหรับจัดการ UI และข้อมูล
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // 2. States สำหรับเก็บข้อมูล Database
  const [customer, setCustomer] = useState<any>(null)
  const [contracts, setContracts] = useState<any[]>([])
  
  // 3. States สำหรับการแก้ไข (ใช้เฉพาะ Tab Personal)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [sales, setSales] = useState<any[]>([])

  // ฟังก์ชันดึงข้อมูลทั้งหมด
  const fetchData = async () => {
    setLoading(true)
    try {
      // ดึง User Role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setUserRole(profile?.role)
      }

      // ดึงข้อมูลลูกค้า
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select(`*, branches(*)`)
        .eq('id', id)
        .single()
      if (custErr) throw custErr

      // ดึงข้อมูลสัญญา + รายการขาย + ผู้ค้ำ
      const { data: contractData } = await supabase
        .from('installment_contracts')
        .select(`
          *,
          customers (full_name),
          sales_transactions (*),
          installment_payments (*),
          guarantors (*)
        `)
        .eq('customer_id', id)
      const { data: salesData } = await supabase
        .from('sales_transactions')
        .select('*')
        .eq('customer_id', id)
        .eq('transaction_type', 'cash')
      // อัปเดต State ครั้งเดียว
      setCustomer(custData)
      setEditForm(custData)
      setContracts(contractData || [])
      setSales(salesData || [])

    } catch (error: any) {
      console.error("Fetch Error:", error.message)
      Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลลูกค้าได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  // ฟังก์ชันบันทึกข้อมูลลูกค้า
  const handleSave = async () => {
    try {
      const { error } = await supabase.from('customers').update(editForm).eq('id', id)
      if (error) throw error
      await Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', timer: 1000, showConfirmButton: false })
      setIsEditing(false)
      fetchData()
    } catch (e: any) {
      Swal.fire('Error', e.message, 'error')
    }
  }

  const canEdit = userRole === 'admin' || userRole === 'manager'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  return (
    <div className="p-6 md:p-12 lg:ml-16 space-y-10 bg-[#f4f7fe] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white rounded-3xl shadow-sm text-slate-400 active:scale-95 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-800 leading-none">
              {customer?.full_name}
            </h1>
            <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">Customer Profile</p>
          </div>
        </div>
        
        {/* แสดงปุ่ม Edit เฉพาะเมื่ออยู่ที่หน้า ข้อมูลส่วนตัว เท่านั้น */}
        {activeTab === 'personal' && canEdit && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
            className={`px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${isEditing ? 'bg-emerald-500 text-white' : 'bg-[#1e1e2d] text-white hover:bg-blue-600'}`}
          >
            {isEditing ? <><Save size={18}/> บันทึกข้อมูล</> : <><Edit2 size={18}/> แก้ไขข้อมูลลูกค้า</>}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar สำหรับเปลี่ยน Tab */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          customerScore={customer?.credit_score || 50} 
        />

        {/* Content Display Area - เช็คเงื่อนไขแยกเด็ดขาด ไม่ให้หน้าทับกัน */}
        <div className="flex-1 bg-white rounded-[45px] shadow-sm border border-slate-100 p-12 min-h-[600px]">
          
          {/* 1. หน้าข้อมูลส่วนตัว */}
          {activeTab === 'personal' && (
            <PersonalInfo 
              customer={customer} 
              isEditing={isEditing} 
              editForm={editForm} 
              setEditForm={setEditForm} 
            />
          )}

          {/* 2. หน้าประวัติการซื้อ */}
          {activeTab === 'history' && (
            <PurchaseHistory contracts={contracts}
              sales={sales}
             />
          )}

          {/* 3. หน้าผู้ค้ำประกัน */}
          {activeTab === 'guarantor' && (
            <GuarantorInfo contracts={contracts} />
          )}

          {/* 4. หน้ารายละเอียดการผ่อน (ถ้ายังไม่ทำไฟล์ให้โชว์ข้อความรอ) */}
          {activeTab === 'installment' && (
            <InstallmentDetails contracts={contracts} />
          )}

        </div>
      </div>
    </div>
  )
}