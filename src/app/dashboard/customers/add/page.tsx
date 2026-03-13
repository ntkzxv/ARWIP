'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, BadgeDollarSign, Loader2, Wallet, Users, 
  Calendar, Heart, Briefcase, MapPin, CreditCard, Mail, Phone,RotateCcw
} from 'lucide-react'
import CashForm from './components/CashForm'
import InstallmentForm from './components/InstallmentForm'
import Swal from 'sweetalert2'

// --- Minimal InputField Component ---
const InputField = ({ label, value, onChange, type = 'text', maxLength, options, placeholder, error, isFullWidth }: any) => (
  <div className={`space-y-2 ${isFullWidth ? 'col-span-full' : ''}`}>
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {type === 'select' ? (
      <select 
        // ✅ เพิ่มเงื่อนไขตรวจสอบ error เหมือนกับ input ทั่วไป
        className={`w-full p-4 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm border transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'
        }`} 
        value={value ?? ""} 
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea 
        rows={2}
        className={`w-full p-4 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm border transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'} resize-none`}
        value={value ?? ""} // ✅ ป้องกัน null ใน textarea ด้วย
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input 
        type={type} 
        maxLength={maxLength} 
        placeholder={placeholder} 
        className={`w-full p-4 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm border transition-all ${
          error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'}`} 
        value={value ?? ""} // ✅ ป้องกัน null ใน input ทั่วไป
        onChange={(e) => onChange(e.target.value)} 
      />
    )}
    {error && <p className="text-red-500 text-[9px] font-bold ml-2 uppercase">{error}</p>}
  </div>
)



// ✅ ตัวเลือกเพศแบบใหม่ (เริ่มต้นที่ "เลือกเพศ")
const genderOptions = [
  { l: 'เลือกเพศ', v: '' },
  { l: 'ชาย', v: 'male' },
  { l: 'หญิง', v: 'female' },
  { l: 'เพศทางเลือก', v: 'lgbtq' }
]

export default function AddCustomerFullPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchingGuarantor, setFetchingGuarantor] = useState(false)
  const [branches, setBranches] = useState<any[]>([])
  const [step, setStep] = useState(0) 
  const [purchaseType, setPurchaseType] = useState<'cash' | 'installment' | null>(null)
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [errors, setErrors] = useState<any>({});

    const [formData, setFormData] = useState<any>({
    // --- ผู้ซื้อ (Customer) ---
    full_name: '', id_card: '', phone: '', line_id: '', personal_email: '', home_phone: '',
    birth_date: '', gender: '', age: '', marital_status: 'single',
    current_address: '', permanent_address: '',
    occupation: '', work_place_name: '', work_place_address: '', work_phone: '', monthly_income: '',
    home_branch_id: '',
    // คู่สมรสผู้ซื้อ
    spouse_name: '', spouse_id_card: '', spouse_phone: '', spouse_birth_date: '', spouse_gender: '',
    spouse_occupation: '', spouse_work_place: '', spouse_work_place_address: '', spouse_work_phone: '', spouse_monthly_income: '',
    // สินค้า
    product_id: '', product_name: '', market_price: '', discount: '0', unit_price: '', 
    down_payment: '', period_months: '', interest_rate: '1.5',
    // ผู้ค้ำ
    g_full_name: '', g_id_card: '', g_phone: '', g_home_phone: '', g_personal_email: '',
    g_birth_date: '', g_gender: '', g_age: '', g_marital_status: 'single',
    g_current_address: '', g_permanent_address: '',
    g_occupation: '', g_work_place_name: '', g_work_place_address: '', g_work_phone: '', g_monthly_income: '',
    // พนักงาน
    g_relationship: '',staff_id: '',staff_name: '',
  })

  const fetchStaffName = async (staffId: string) => {
      if (staffId.length >= 3) {
        try {
          const { data } = await supabase
            .from('employees') 
            .select('full_name')
            .eq('login_id', staffId)
            .maybeSingle();

          if (data) {
            setFormData((prev: any) => ({
              ...prev,
              staff_name: data.full_name
            }));
          }
        } catch (err) {
          console.error("Staff fetch error:", err);
        }
      }
    }; 

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*')
      if (data) setBranches(data)
    }
    fetchBranches()
  }, [])
  useEffect(() => {
  const debounceTimer = setTimeout(() => {
    if (formData.staff_id) {
      fetchStaffName(formData.staff_id);
    }
  }, 500); // รอพิมพ์หยุด 0.5 วินาทีค่อยดึงข้อมูล (ลดภาระฐานข้อมูล)

  return () => clearTimeout(debounceTimer);
}, [formData.staff_id]);
  const checkExistingCustomer = async (idCard: string) => {
    if (idCard.length === 13) {
      setFetching(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id_card', idCard)
          .maybeSingle()

        if (data) {
          setIsExistingCustomer(true)
          
          // ✅ แจ้งเตือนผู้ใช้หน่อยว่าเจอข้อมูลเดิม
          Swal.fire({
            title: 'พบข้อมูลลูกค้าเก่า',
            text: `ดึงข้อมูลคุณ ${data.full_name} เรียบร้อยแล้ว`,
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: 'rounded-[30px]' }
          })

          setFormData((prev: any) => ({
            ...prev,
            ...data, // นำข้อมูลทั้งหมดมาทับ
            // ✅ บังคับ Format วันที่ให้ลงล็อกกับ Input Date (YYYY-MM-DD)
            birth_date: data.birth_date ? data.birth_date.substring(0, 10) : '',
            spouse_birth_date: data.spouse_birth_date ? data.spouse_birth_date.substring(0, 10) : '',
            // ตรวจสอบค่าที่เป็น null ให้เป็นค่าว่างป้องกัน Error
            home_phone: data.home_phone || '',
            personal_email: data.personal_email || '',
            work_place_address: data.work_place_address || '',
          }))
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setFetching(false)
      }
    }   
  }

const checkExistingGuarantor = async (idCard: string) => {
        if (idCard.length === 13) {
            setFetchingGuarantor(true)
            try {
              // ดึงจากตารางผู้ค้ำ (guarantors) ✨
              const { data, error } = await supabase
                .from('guarantors')
                .select('*')
                .eq('id_card', idCard)
                .order('created_at', { ascending: false }) // เอาข้อมูลที่เคยค้ำล่าสุด
                .limit(1)
                .maybeSingle()

        if (data) {
        Swal.fire({
          title: 'พบข้อมูลผู้ค้ำประกันเดิม',
          text: `ดึงข้อมูลคุณ ${data.full_name} เรียบร้อยแล้ว`,
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[30px]' }
        })

        // นำข้อมูลที่เจอมาใส่ในฟิลด์ผู้ค้ำ (ตัวแปรที่ขึ้นต้นด้วย g_)
        setFormData((prev: any) => ({
          ...prev,
          g_full_name: data.full_name,
          g_phone: data.phone,
          g_home_phone: data.home_phone || '',
          g_personal_email: data.personal_email || '',
          g_birth_date: data.birth_date ? data.birth_date.substring(0, 10) : '',
          g_gender: data.gender,
          g_current_address: data.current_address,
          g_permanent_address: data.permanent_address,
          g_occupation: data.occupation,
          g_work_place_name: data.work_place_name,
          g_work_place_address: data.work_place_address || '',
          g_work_phone: data.work_phone,
          g_monthly_income: data.monthly_income,
          g_relationship: data.relationship,
        }))
      }
    } catch (err) {
      console.error("Guarantor fetch error:", err)
    } finally {
      setFetchingGuarantor(false)
    }
  }
}

const handleSubmit = async () => {
  // 1️⃣ ถามเพื่อความมั่นใจก่อน (อยู่นอกสุด)
  const confirmResult = await Swal.fire({
    title: 'ยืนยันการบันทึกข้อมูล?',
    text: "ตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยัน",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'ยืนยันบันทึก',
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-[30px]',
      confirmButton: 'rounded-full px-6 py-3 font-bold',
      cancelButton: 'rounded-full px-6 py-3 font-bold'
    }
  });

  if (!confirmResult.isConfirmed) return;

  setLoading(true);
  try {
    const branchId = formData.home_branch_id || null;

    // 2️⃣ ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.product_id || !formData.full_name || !formData.id_card) {
        throw new Error("กรุณากรอกข้อมูลหลักให้ครบถ้วน");
    }

    // 3️⃣ เริ่มขั้นตอนบันทึก (Step-by-Step)
    
    // Step 1: บันทึกข้อมูลลูกค้า
    const { data: customer, error: custErr } = await supabase.from('customers').upsert({
      full_name: formData.full_name, 
      id_card: formData.id_card, 
      phone: formData.phone,
      personal_email: formData.personal_email, 
      home_phone: formData.home_phone,
      birth_date: formData.birth_date || null, 
      gender: formData.gender,
      marital_status: formData.marital_status, 
      current_address: formData.current_address, 
      permanent_address: formData.permanent_address,
      occupation: formData.occupation, 
      work_place_name: formData.work_place_name, 
      work_place_address: formData.work_place_address,
      work_phone: formData.work_phone, 
      monthly_income: parseFloat(formData.monthly_income) || 0,
      spouse_name: formData.spouse_name, 
      spouse_id_card: formData.spouse_id_card, 
      spouse_phone: formData.spouse_phone,
      spouse_current_address: formData.spouse_current_address,
      spouse_birth_date: formData.spouse_birth_date || null, 
      spouse_gender: formData.spouse_gender,
      spouse_permanent_address: formData.spouse_permanent_address,
      spouse_occupation: formData.spouse_occupation, 
      spouse_work_place: formData.spouse_work_place,
      spouse_work_place_address: formData.spouse_work_place_address,
      spouse_work_phone: formData.spouse_work_phone, 
      spouse_monthly_income: parseFloat(formData.spouse_monthly_income) || 0,
      home_branch_id: branchId
    }, { onConflict: 'id_card' }).select().single();
    
    if (custErr) throw custErr;

    // Step 2: บันทึกการขาย
    const { data: sale, error: saleErr } = await supabase.from('sales_transactions').insert({
      customer_id: customer.id, 
      product_id: formData.product_id, 
      product_name: formData.product_name,
      market_price: parseFloat(formData.market_price) || 0, 
      discount: parseFloat(formData.discount) || 0,
      unit_price: parseFloat(formData.unit_price) || 0, 
      transaction_type: purchaseType, 
      status: 'success', 
      branch_id: branchId,
      staff_id: formData.staff_id,
      staff_name: formData.staff_name
    }).select().single();
    
    if (saleErr) throw saleErr;
    // ⭐ [เพิ่มใหม่] บันทึกประวัติการเงินลง credit_history (หน้า Recent Table)

    await supabase.from('credit_history').insert({
        customer_id: customer.id,
        customer_name: formData.full_name,
        amount: parseFloat(formData.unit_price),
        type: purchaseType === 'cash' ? 'topup' : 'usage',
        status: 'completed',
        staff_id: formData.staff_id,
        created_at: new Date().toISOString()
      })

    // Step 3: กรณีผ่อนชำระ (บันทึกสัญญา + แตกงวดบิล)
    if (purchaseType === 'installment') {
      const loanAmount = parseFloat(formData.unit_price || 0) - parseFloat(formData.down_payment || 0);
      const interestRate = parseFloat(formData.interest_rate || 0);
      const periodMonths = parseInt(formData.period_months || 0);
      const totalInterest = (loanAmount * (interestRate / 100)) * periodMonths;
      
      // 3.1 บันทึกสัญญาหลัก
      const { data: contract, error: contErr } = await supabase.from('installment_contracts').insert({
        transaction_id: sale.id, 
        customer_id: customer.id, 
        down_payment: parseFloat(formData.down_payment) || 0,
        loan_amount: loanAmount, 
        interest_rate: interestRate, 
        total_interest: totalInterest,
        total_purchase_price: loanAmount + totalInterest, 
        period_months: periodMonths,
        monthly_payment: periodMonths > 0 ? (loanAmount + totalInterest) / periodMonths : 0,
        first_payment_date: formData.first_payment_date, // 📍 ใส่ฟิลด์นี้เพื่อให้ระบบรู้จุดเริ่มนับเดือน
        contract_status: 'active'
      }).select().single();
      
      if (contErr) throw contErr;

      // ⭐ [เพิ่มใหม่] บันทึกยอดค้างชำระลง overdue_logs เพื่อให้ไปโชว์ในหน้า Overdue
        await supabase.from('overdue_logs').insert({
          customer_id: customer.id,
          total_debt: parseFloat(formData.total_purchase_price) - parseFloat(formData.down_payment),
          installments: 0, // เริ่มต้นยังไม่ค้างงวด
          overdue_since: null,
          priority: 'medium'
        })

      // 3.2 🚀 แตกงวดบิลรายเดือน (Insert ลง installment_payments)
      if (contract && formData.first_payment_date) {
        const bills = [];
        const monthlyAmount = (loanAmount + totalInterest) / periodMonths;
        const startDate = new Date(formData.first_payment_date);

        for (let i = 1; i <= periodMonths; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + (i - 1)); // ขยับทีละเดือน

          bills.push({
            contract_id: contract.id,
            installment_number: i,
            amount: monthlyAmount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'pending'
          });
        }

        const { error: billErr } = await supabase
          .from('installment_payments')
          .insert(bills);

        if (billErr) throw billErr;
      }

      // 3.3 บันทึกผู้ค้ำ
      const { error: guarErr } = await supabase.from('guarantors').insert({
        contract_id: contract.id, 
        full_name: formData.g_full_name, 
        id_card: formData.g_id_card,
        phone: formData.g_phone, 
        home_phone: formData.g_home_phone, 
        personal_email: formData.g_personal_email,
        birth_date: formData.g_birth_date || null, 
        gender: formData.g_gender,
        marital_status: formData.g_marital_status, 
        current_address: formData.g_current_address,
        permanent_address: formData.g_permanent_address, 
        occupation: formData.g_occupation,
        work_place_name: formData.g_work_place_name, 
        work_place_address: formData.g_work_place_address,
        work_phone: formData.g_work_phone, 
        monthly_income: parseFloat(formData.g_monthly_income) || 0,
        relationship: formData.g_relationship
      });

      if (guarErr) throw guarErr;
    }

    // 4️⃣ บันทึกสำเร็จ
    await Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: 'ข้อมูลถูกบันทึกลงระบบเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 2000
    });

    router.push('/dashboard/customers');

  } catch (e: any) {
    console.error("Submit Error:", e);
    Swal.fire({
      title: 'ยืนยันไม่สำเร็จ',
      text: e.message || 'กรุณากรอกข้อมูลให้ครบ หรือ ตรวจสอบความถูกต้องอีกครั้ง',
      icon: 'error',
      confirmButtonColor: '#ef4444',
      customClass: { popup: 'rounded-[30px]' }
    });
  } finally {
    setLoading(false);
  }
}
  const validateStep = () => {
    const newErrors: any = {};

    // --- ตรวจสอบ Step 1: ข้อมูลผู้ซื้อ ---
    if (step === 1) {
      // ข้อมูลพื้นฐาน
      if (!formData.id_card || formData.id_card.length !== 13) {
        newErrors.id_card = "กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก";
      }
      if (!formData.full_name) newErrors.full_name = "กรุณากรอกชื่อ-นามสกุล";
      if (!formData.phone) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
      if (!formData.home_phone) newErrors.home_phone = "กรุณาระบุเบอร์โทรศัพท์บ้าน";      
      if (!formData.personal_email) newErrors.personal_email = "กรุณากรอกอีเมลส่วนตัว";
      if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
      if (!formData.birth_date) newErrors.birth_date = "กรุณาระบุวันเดือนปีเกิด";      

      // ที่อยู่และการทำงาน
      if (!formData.current_address) newErrors.current_address = "กรุณากรอกที่อยู่ปัจจุบัน";
      if (!formData.permanent_address) newErrors.permanent_address = "กรุณากรอกที่อยู่ตามภูมิลำเนา";
      if (!formData.occupation) newErrors.occupation = "กรุณากรอกอาชีพ";
      if (!formData.work_place_name) newErrors.work_place_name = "กรุณากรอกสถานที่ทำงาน";
      if (!formData.work_place_address) newErrors.work_place_address = "กรุณากรอกที่อยู่สถานที่ทำงาน";
      if (!formData.work_phone) newErrors.work_phone = "กรุณากรอกเบอร์โทรที่ทำงาน";
      if (!formData.monthly_income) newErrors.monthly_income = "กรุณากรอกรายได้ต่อเดือน";

      // ข้อมูลคู่สมรส (ถ้าเลือกสถานะ 'สมรส' และไม่ใช่ซื้อเงินสด)
      if (!formData.monthly_income) newErrors.monthly_income = "กรุณากรอกรายได้ต่อเดือน";
      if (purchaseType !== 'cash' && formData.marital_status === 'married') {
        if (!formData.spouse_name) newErrors.spouse_name = "กรุณากรอกชื่อคู่สมรส";
        if (!formData.spouse_id_card) newErrors.spouse_id_card = "กรุณากรอกเลขบัตรคู่สมรส";
        if (!formData.spouse_birth_date) newErrors.spouse_birth_date = "กรุณากรอกวันเดือนปีเกิดคู่สมรส";
        if (!formData.spouse_phone) newErrors.spouse_phone = "กรุณากรอกเบอร์โทรคู่สมรส";
        if (!formData.spouse_gender) newErrors.spouse_gender = "กรุณาเลือกเพศคู่สมรส";
        if (!formData.spouse_occupation) newErrors.spouse_occupation = "กรุณากรอกอาชีพคู่สมรส";
        if (!formData.spouse_work_place) newErrors.spouse_work_place_address = "กรุณากรอกสถานที่ทำงานคู่สมรส";
        if (!formData.spouse_work_place) newErrors.spouse_work_phone = "กรุณากรอกสถานที่ทำงานคู่สมรส";
        if (!formData.spouse_work_place) newErrors.spouse_work_place = "กรุณากรอกที่อยู่สถานที่ทำงานคู่สมรส";
        if (!formData.spouse_monthly_income) newErrors.spouse_monthly_income = "กรุณากรอกรายได้คู่สมรส";
        if (!formData.spouse_current_address) newErrors.spouse_current_address = "กรุณากรอกรายที่อยู่ปัจจุบัน";
        if (!formData.spouse_permanent_address) newErrors.spouse_permanent_address = "กรุณากรอกที่อยู่ตามภูมิลำเนา";

      }

      // สาขา
      if (!formData.home_branch_id) newErrors.home_branch_id = "กรุณาเลือกสาขาที่ทำรายการ";
    }

    // --- ตรวจสอบ Step 2: ข้อมูลผู้ค้ำประกัน (เฉพาะกรณีผ่อน) ---
    if (step === 2 && purchaseType === 'installment') {
      if (!formData.g_id_card || formData.g_id_card.length !== 13) {
        newErrors.g_id_card = "กรุณากรอกเลขบัตรผู้ค้ำให้ครบ 13 หลัก";
      }
      if (!formData.g_full_name) newErrors.g_full_name = "กรุณากรอกชื่อ-นามสกุลผู้ค้ำ";
      if (!formData.g_phone) newErrors.g_phone = "กรุณากรอกเบอร์โทรผู้ค้ำ";
      if (!formData.g_home_phone) newErrors.g_home_phone = "กรุณากรอกเบอร์โทรบ้านผู้ค้ำ";
      if (!formData.g_personal_email) newErrors.g_personal_email = "กรุณากรอกอีเมลผู้ค้ำ";
      if (!formData.g_gender) newErrors.g_gender = "กรุณาเลือกเพศผู้ค้ำ";
      if (!formData.g_relationship) newErrors.g_relationship = "กรุณาระบุความสัมพันธ์";
      if (!formData.g_birth_date) newErrors.g_birth_date = "กรุณาระบุวันเดือนปีเกิดผู้ค้ำ";
      
      // ที่อยู่และการทำงานผู้ค้ำ
      if (!formData.g_current_address) newErrors.g_current_address = "กรุณากรอกที่อยู่ปัจจุบันผู้ค้ำ";
      if (!formData.g_permanent_address) newErrors.g_permanent_address = "กรุณากรอกที่อยู่ภูมิลำเนาผู้ค้ำ";
      if (!formData.g_occupation) newErrors.g_occupation = "กรุณากรอกอาชีพผู้ค้ำ";
      if (!formData.g_work_place_name) newErrors.g_work_place_name = "กรุณากรอกสถานที่ทำงานผู้ค้ำ";
      if (!formData.g_work_place_address) newErrors.g_work_place_address = "กรุณากรอกที่อยู่สถานที่ทำงานผู้ค้ำ";
      if (!formData.g_work_phone) newErrors.g_work_phone = "กรุณากรอกเบอร์โทรที่ทำงานผู้ค้ำ";
    }
      const isFinanceStep = (purchaseType === 'cash' && step === 2) || (purchaseType === 'installment' && step === 3);
    // รายละเอียดเงิน
      if (isFinanceStep) {
        if (!formData.product_id) newErrors.product_id = "กรุณากรอกรหัสสินค้า";
        if (!formData.product_name) newErrors.product_name = "กรุณากรอกชื่อสินค้า";
        if (!formData.market_price || formData.market_price === "0") newErrors.market_price = "กรุณาระบุราคาเริ่มต้น";
        if (!formData.discount) newErrors.discount = "กรุณาระบุส่วนลด";
        if (!formData.unit_price || formData.unit_price === "0") newErrors.unit_price = "กรุณาระบุราคาสุทธิ";
        if (!formData.staff_id) newErrors.staff_id = "กรุณาระบุรหัสพนักงานขาย";
        if (!formData.staff_name) newErrors.staff_name = "กรุณาระบุชื่อพนักงานขาย";

        if (purchaseType === 'installment') {
          if (!formData.down_payment) newErrors.down_payment = "กรุณาระบุเงินดาวน์";
          if (!formData.period_months) newErrors.period_months = "กรุณาเลือกระยะเวลาผ่อน";
          if (!formData.first_payment_date) newErrors.first_payment_date = "กรุณาระบุวันเริ่มผ่อน";
        }
      }
    setErrors(newErrors);
    //return Object.keys(newErrors).length === 0;
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setErrors({}); 
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนขึ้นบนสุดเมื่อไปหน้าใหม่
    } else {
      // เลื่อนขึ้นไปด้านบนสุดเพื่อให้เห็นจุดที่ขึ้นตัวอักษรสีแดง
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const isLastStep = (purchaseType === 'cash' && step === 2) || (purchaseType === 'installment' && step === 3)

  const handleResetForm = async () => {
    const result = await Swal.fire({
      title: 'ล้างข้อมูลทั้งหมด?',
      text: "ข้อมูลที่คุณกรอกไว้ในทุกขั้นตอนจะหายไปทั้งหมด",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', 
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ใช่, ล้างข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[30px]',
        confirmButton: 'rounded-full px-6 py-3 font-bold',
        cancelButton: 'rounded-full px-6 py-3 font-bold'
      }
    });

    if (result.isConfirmed) {
      setErrors({});
      setFormData({
        full_name: '', id_card: '', phone: '', line_id: '', personal_email: '', home_phone: '',
        birth_date: '', gender: '', age: '', marital_status: 'single',
        current_address: '', permanent_address: '',
        occupation: '', work_place_name: '', work_place_address: '', work_phone: '', monthly_income: '',
        home_branch_id: '',
        spouse_name: '', spouse_id_card: '', spouse_phone: '', spouse_birth_date: '', spouse_gender: '',spouse_current_address: '',spouse_permanent_address: '',
        spouse_occupation: '', spouse_work_place: '', spouse_work_place_address: '', spouse_work_phone: '', spouse_monthly_income: '',
        product_id: '', product_name: '', market_price: '', discount: '0', unit_price: '', 
        down_payment: '', period_months: '', interest_rate: '1.5',
        g_full_name: '', g_id_card: '', g_phone: '', g_home_phone: '', g_personal_email: '',
        g_birth_date: '', g_gender: '', g_age: '', g_marital_status: 'single',
        g_current_address: '', g_permanent_address: '',
        g_occupation: '', g_work_place_name: '', g_work_place_address: '', g_work_phone: '', g_monthly_income: '',
        g_relationship: '', staff_id: '', staff_name: '',
      });
      setStep(0);
      setPurchaseType(null);
      setIsExistingCustomer(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:ml-16 space-y-10 bg-[#f4f7fe] min-h-screen font-sans">
      <div className="flex items-center gap-6 max-w-6xl mx-auto">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="p-4 bg-white rounded-3xl shadow-sm text-slate-400 active:scale-95 transition-all"><ArrowLeft size={24} /></button>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">เพิ่มรายการใหม่</h1>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-[50px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-12">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in zoom-in-95">
              <SelectionCard 
                icon={<Wallet size={80}/>} 
                title="ซื้อเงินสด" 
                color="emerald" 
                onClick={() => {setPurchaseType('cash'); setStep(1);}} 
              />
              <SelectionCard 
                icon={<CreditCard size={80}/>} 
                title="ผ่อนชำระ" 
                color="blue" 
                onClick={() => {setPurchaseType('installment'); setStep(1);}} 
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-12 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4 mb-10">
              {/* ขีดสีม่วงแนวตั้ง ยืดตามความสูงตัวหนังสือ */}
              <div className="w-1.5 self-stretch bg-indigo-600 rounded-full"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none mb-1">
                  Pesonal Details
                </h3>
                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                  รายละเอียดส่วนตัว
                </p>
              </div>
            </div>
              
                {fetching && <Loader2 className="animate-spin text-indigo-600" />}
                <button onClick={handleResetForm}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"title="ล้างข้อมูล">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">ล้างข้อมูล</span>
                <RotateCcw size={20} className="group-active:rotate-[-180deg] transition-transform duration-500" />
              </button>
              </div>
              
              {/* ข้อมูลพื้นฐานผู้ซื้อ */}

              {/* ที่อยู่และการทำงานผู้ซื้อ */}
              <div className="p-10 border border-slate-100 rounded-[40px] space-y-10">
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="เลขบัตรประชาชน" value={formData.id_card} error={errors.id_card} onChange={(v:any) => {setFormData({...formData, id_card:v}); if(v.length===13) checkExistingCustomer(v);}} maxLength={13} placeholder="13 หลัก"/>
                <InputField label="ชื่อ-นามสกุล" value={formData.full_name} error={errors.full_name} onChange={(v:any) => setFormData({...formData, full_name:v})} />
                <InputField label="มือถือ" value={formData.phone} error={errors.phone} onChange={(v:any) => setFormData({...formData, phone:v})} />
                <InputField label="เบอร์บ้าน" value={formData.home_phone} error={errors.home_phone} onChange={(v:any) => setFormData({...formData, home_phone:v})} />
                {/* ➕ เพิ่ม personal_email */}
                <InputField label="อีเมลส่วนตัว" value={formData.personal_email} error={errors.personal_email} onChange={(v:any) => setFormData({...formData, personal_email:v})} />
                <InputField label="เพศ" value={formData.gender} error={errors.gender} type="select" options={genderOptions} onChange={(v:any) => setFormData({...formData, gender:v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">วันเกิด</label>
                  <input 
                    type="date" 
                    // ✅ เพิ่มเงื่อนไขตรวจสอบ error เพื่อเปลี่ยนสีขอบและพื้นหลัง
                    className={`w-full p-4 bg-white rounded-2xl font-bold text-sm outline-none shadow-sm border transition-all ${
                      errors.birth_date 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-transparent focus:border-blue-200'
                    }`} 
                    value={formData.birth_date ?? ""} 
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
                  />
                  {/* ✅ แสดงข้อความแจ้งเตือนสีแดงใต้ช่อง Input */}
                  {errors.birth_date && (
                    <p className="text-red-500 text-[9px] font-bold ml-2 uppercase animate-pulse">
                      {errors.birth_date}
                    </p>
                  )}
                </div>
              </div>                    
                    <InputField label="ที่อยู่ปัจจุบัน" type="textarea" isFullWidth value={formData.current_address} error={errors.current_address} onChange={(v:any) => setFormData({...formData, current_address:v})} />                    
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ตามภูมิลำเนา</label>
                      <button type="button"
                        onClick={() => setFormData({...formData, permanent_address: formData.current_address})}
                        className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter">ใช้ที่อยู่เดียวกับที่อยู่ปัจจุบัน</button>
                    </div>
                    <InputField type="textarea" isFullWidth value={formData.permanent_address} error={errors.permanent_address} onChange={(v:any) => setFormData({...formData, permanent_address:v})} />
                  </div>
                  </div>
                  <div className="h-px bg-slate-200 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="อาชีพ" value={formData.occupation} error={errors.occupation} onChange={(v:any) => setFormData({...formData, occupation:v})} />
                    <InputField label="สถานที่ทำงาน" value={formData.work_place_name} error={errors.work_place_name} onChange={(v:any) => setFormData({...formData, work_place_name:v})} />
                    {/* ➕ เพิ่ม work_place_address */}
                    <InputField label="ที่อยู่สถานที่ทำงาน" type="textarea" isFullWidth value={formData.work_place_address} error={errors.work_place_address} onChange={(v:any) => setFormData({...formData, work_place_address:v})} />
                    <InputField label="เบอร์โทรที่ทำงาน" value={formData.work_phone} error={errors.work_phone} onChange={(v:any) => setFormData({...formData, work_phone:v})} />
                    <InputField label="รายได้ต่อเดือน" type="number" value={formData.monthly_income} error={errors.monthly_income} onChange={(v:any) => setFormData({...formData, monthly_income:v})} />
                  </div>
                </div>
              </div>

              {/* ข้อมูลคู่สมรส */}
              {purchaseType !== 'cash' && (
                <div className="p-10 border border-slate-100 rounded-[40px] space-y-8 animate-in fade-in">
                  <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Heart size={16}/> สถานภาพ & ข้อมูลคู่สมรส
                  </h3>
                  
                  <InputField 
                    label="สถานภาพ" 
                    value={formData.marital_status} 
                    error={errors.marital_status}
                    type="select" 
                    options={[
                      {l:'โสด',v:'single'},
                      {l:'สมรส',v:'married'},
                      {l:'หย่าร้าง',v:'divorced'}
                    ]} 
                    onChange={(v:any) => setFormData({...formData, marital_status:v})} 
                  />
                  
                  {formData.marital_status === 'married' && (
                    <div className="space-y-10 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6  rounded-[30px]">
                        <InputField label="ชื่อคู่สมรส" value={formData.spouse_name} error={errors.spouse_name} onChange={(v:any) => setFormData({...formData, spouse_name:v})} />
                        <InputField label="เลขบัตรคู่สมรส" value={formData.spouse_id_card} error={errors.spouse_id_card} onChange={(v:any) => setFormData({...formData, spouse_id_card:v})} maxLength={13} />
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">วันเกิดคู่สมรส</label>
                          <input 
                            type="date" 
                            // ✅ เพิ่มการเช็ค errors.spouse_birth_date เพื่อแสดงขอบสีแดง
                            className={`w-full p-4 bg-white rounded-2xl text-sm font-bold shadow-sm outline-none border transition-all ${errors.spouse_birth_date ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'}`} 
                            value={formData.spouse_birth_date ?? ""} 
                            onChange={(e)=>setFormData({...formData, spouse_birth_date:e.target.value})} 
                          />
                          {/* ✅ แสดงข้อความแจ้งเตือนสีแดงใต้ช่อง */}
                          {errors.spouse_birth_date && (
                            <p className="text-red-500 text-[9px] font-bold ml-2 uppercase animate-pulse">
                              {errors.spouse_birth_date}
                            </p>
                          )}
                        </div>
                        <InputField label="เบอร์โทรคู่สมรส" value={formData.spouse_phone} error={errors.spouse_phone} onChange={(v:any) => setFormData({...formData, spouse_phone:v})} />
                        <InputField label="เพศคู่สมรส" value={formData.spouse_gender} error={errors.spouse_gender} type="select" options={genderOptions} onChange={(v:any) => setFormData({...formData, spouse_gender:v})} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* ส่วนที่อยู่ปัจจุบัน */}
                        <div className="space-y-3 col-span-full">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ปัจจุบันคู่สมรส</label>
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, spouse_current_address: formData.current_address})}
                              className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighterr">ใช้ที่อยู่เดียวกับผู้ซื้อ
                            </button>
                          </div>
                          <InputField 
                            type="textarea" 
                            isFullWidth 
                            value={formData.spouse_current_address} 
                            error={errors.spouse_current_address} 
                            onChange={(v:any) => setFormData({...formData, spouse_current_address:v})} 
                          />
                        </div>

                        {/* ส่วนที่อยู่ตามภูมิลำเนา */}
                        <div className="space-y-3 col-span-full">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ตามภูมิลำเนาคู่สมรส</label>
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, spouse_permanent_address: formData.permanent_address})}
                              className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter">ใช้ที่อยู่เดียวกับผู้ซื้อ
                            </button>
                          </div>
                          <InputField 
                            type="textarea" 
                            isFullWidth 
                            value={formData.spouse_permanent_address} 
                            error={errors.spouse_permanent_address} 
                            onChange={(v:any) => setFormData({...formData, spouse_permanent_address:v})} 
                          />
                        </div>
                      </div>  
                      <div className="h-px bg-slate-200 w-full" />                    
                      <div className="rounded-[40px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <InputField label="อาชีพคู่สมรส" value={formData.spouse_occupation} error={errors.spouse_occupation} onChange={(v:any) => setFormData({...formData, spouse_occupation:v})} />
                          <InputField label="สถานที่ทำงานคู่สมรส" value={formData.spouse_work_place} error={errors.spouse_work_place} onChange={(v:any) => setFormData({...formData, spouse_work_place:v})} />
                          <InputField label="ที่อยู่สถานที่ทำงานคู่สมรส" type="textarea" isFullWidth value={formData.spouse_work_place_address} error={errors.spouse_work_place_address} onChange={(v:any) => setFormData({...formData, spouse_work_place_address:v})} />
                          <InputField label="เบอร์โทรที่ทำงานคู่สมรส" value={formData.spouse_work_phone} error={errors.spouse_work_phone} onChange={(v:any) => setFormData({...formData, spouse_work_phone:v})} />
                          <InputField label="รายได้ต่อเดือนคู่สมรส" type="number" value={formData.spouse_monthly_income} error={errors.spouse_monthly_income} onChange={(v:any) => setFormData({...formData, spouse_monthly_income:v})} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ home_branch_id ย้ายมาด้านล่างสุดของข้อมูลผู้ซื้อ */}
              <div className="p-8 border border-slate-100 rounded-[30px] ">
                <InputField 
                  label="สาขาที่ทำรายการ" 
                  value={formData.home_branch_id} 
                  error={errors.home_branch_id}
                  type="select" 
                  options={[{l:'โปรดเลือกสาขา',v:''}, ...branches.map(b=>({l:b.branch_name,v:b.id}))]} 
                  onChange={(v:any) => setFormData({...formData, home_branch_id:v})} 
                />
              </div>
            </div>
          )}

          {step === 2 && purchaseType === 'installment' && (
            <div className="space-y-12 animate-in fade-in">
              <div className="flex items-center gap-4 mb-10">
              {/* ขีดสีม่วงแนวตั้ง ยืดตามความสูงตัวหนังสือ */}
              <div className="w-1.5 self-stretch bg-indigo-600 rounded-full"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none mb-1">
                  Guarantor Details
                </h3>
                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                  ข้อมูลผู้ค้ำประกัน
                </p>
              </div>
            </div>
              <div className="grid grid-cols-1 gap-6 p-10 border border-slate-100 rounded-[40px]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <InputField 
                    label="เลขบัตรผู้ค้ำ" 
                    value={formData.g_id_card} 
                    error={errors.g_id_card} 
                    maxLength={13}
                    onChange={(v: any) => {
                      setFormData({...formData, g_id_card: v}); 
                      if(v.length === 13) checkExistingGuarantor(v); // ✨ เรียกฟังก์ชันผู้ค้ำ
                    }} 
                  />
                  {/* เพิ่มไอคอนหมุนตอนกำลังโหลดข้อมูล */}
                  {fetchingGuarantor && (
                    <div className="absolute right-4 bottom-4">
                      <Loader2 className="animate-spin text-indigo-600 w-4 h-4" />
                    </div>
                  )}
                </div>
                <InputField label="ชื่อ-นามสกุลผู้ค้ำ" value={formData.g_full_name} error={errors.g_full_name} onChange={(v:any) => setFormData({...formData, g_full_name:v})} />
                <InputField label="มือถือ" value={formData.g_phone} error={errors.g_phone} onChange={(v:any) => setFormData({...formData, g_phone:v})} />
                {/* ➕ เพิ่ม g_home_phone */}
                <InputField label="เบอร์บ้านผู้ค้ำ" value={formData.g_home_phone} error={errors.g_home_phone} onChange={(v:any) => setFormData({...formData, g_home_phone:v})} />
                {/* ➕ เพิ่ม g_personal_email */}
                <InputField label="อีเมลผู้ค้ำ" value={formData.g_personal_email} error={errors.g_personal_email} onChange={(v:any) => setFormData({...formData, g_personal_email:v})} />
                <InputField label="เพศ" value={formData.g_gender} type="select" options={genderOptions} error={errors.g_gender} onChange={(v:any) => setFormData({...formData, g_gender:v})} />
                <InputField label="ความสัมพันธ์" value={formData.g_relationship} placeholder="เช่น เพื่อน, พี่น้อง" error={errors.g_relationship} onChange={(v:any) => setFormData({...formData, g_relationship:v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">วันเกิดผู้ค้ำ</label><input type="date" 
                    className={`w-full p-4 bg-white rounded-2xl font-bold shadow-sm border transition-all ${
                      errors.g_birth_date ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-blue-200'}`} 
                    value={formData.g_birth_date ?? ""} 
                    onChange={(e) => setFormData({...formData, g_birth_date: e.target.value})} 
                  />
                  {errors.g_birth_date && (
                    <p className="text-red-500 text-[9px] font-bold ml-2 uppercase animate-pulse">
                      {errors.g_birth_date}
                    </p>
                  )}
                </div>
              </div>                
                  {/* 📍 1. ที่อยู่ปัจจุบันผู้ค้ำ (มี 2 ปุ่มเหมือนกันแล้ว) */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1 flex-wrap gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ปัจจุบันผู้ค้ำ</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, g_current_address: formData.current_address})}
                          className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter">ใช้จากปัจจุบันผู้ซื้อ
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, g_current_address: formData.permanent_address})}
                          className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter">ใช้จากภูมิลำเนาผู้ซื้อ
                        </button>
                      </div>
                    </div>
                    <InputField type="textarea" 
                      isFullWidth 
                      value={formData.g_current_address} 
                      error={errors.g_current_address} 
                      onChange={(v:any) => setFormData({...formData, g_current_address:v})} 
                    />
                  </div>

                  {/* 📍 2. ที่อยู่ภูมิลำเนาผู้ค้ำ (มี 2 ปุ่ม) */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1 flex-wrap gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ภูมิลำเนาผู้ค้ำ</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, g_permanent_address: formData.current_address})}
                          className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter"
                        >
                          ใช้จากปัจจุบันผู้ซื้อ
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, g_permanent_address: formData.permanent_address})}
                          className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter"
                        >
                          ใช้จากภูมิลำเนาผู้ซื้อ
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, g_permanent_address: formData.g_current_address})}
                          className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-tighter"
                        >
                          ใช้จากที่อยู่ปัจจุบันของตน
                        </button>                        
                      </div>
                    </div>
                    <InputField 
                      type="textarea" 
                      isFullWidth 
                      value={formData.g_permanent_address} 
                      error={errors.g_permanent_address} 
                      onChange={(v:any) => setFormData({...formData, g_permanent_address:v})} 
                    />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <InputField label="อาชีพ" value={formData.g_occupation} error={errors.g_occupation} onChange={(v:any) => setFormData({...formData, g_occupation:v})} />
                  <InputField label="สถานที่ทำงาน" value={formData.g_work_place_name} error={errors.g_work_place_name} onChange={(v:any) => setFormData({...formData, g_work_place_name:v})} />
                  {/* ➕ เพิ่ม g_work_place_address */}
                  <InputField label="ที่อยู่สถานที่ทำงานผู้ค้ำ" type="textarea" isFullWidth value={formData.g_work_place_address} error={errors.g_work_place_address} onChange={(v:any) => setFormData({...formData, g_work_place_address:v})} />
                  {/* ➕ เพิ่ม g_work_phone */}
                  <InputField label="เบอร์โทรที่ทำงานผู้ค้ำ" value={formData.g_work_phone} error={errors.g_work_phone} onChange={(v:any) => setFormData({...formData, g_work_phone:v})} />
                </div>
              </div>
            </div>
          )}

          {((purchaseType === 'cash' && step === 2) || (purchaseType === 'installment' && step === 3)) && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center gap-4 mb-10">
              {/* ขีดสีม่วงแนวตั้ง ยืดตามความสูงตัวหนังสือ */}
              <div className="w-1.5 self-stretch bg-indigo-600 rounded-full"></div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none mb-1">
                  Financial Details
                </h3>
                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                  รายละเอียดการเงิน
                </p>
              </div>
            </div>
              {purchaseType === 'cash' ? 
                <CashForm formData={formData} setFormData={setFormData} errors={errors} InputField={InputField} /> : 
                <InstallmentForm formData={formData} setFormData={setFormData} errors={errors} InputField={InputField} />
              }
            </div>
          )}

          <div className="mt-16 flex justify-between pt-10 border-t border-slate-100">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-10 py-5 rounded-full font-black text-[12px] uppercase text-slate-400 hover:text-slate-800 transition-all">ย้อนกลับ</button>}
            <div className="flex-1"></div>
            
            {step > 0 && (<button onClick={() => {
              if (validateStep()) {
                    if (isLastStep) {
                      handleSubmit(); // ถ้าข้อมูลครบและเป็นหน้าสุดท้าย ให้บันทึก
                    } else {
                      handleNext(); // ถ้าข้อมูลครบแต่ยังไม่ท้ายสุด ให้ไปหน้าถัดไป
                    }
                  } else {
                    // ❌ ถ้าข้อมูลไม่ครบ หน้าจอจะเลื่อนขึ้นไปดูจุดที่แดง
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }} 
              disabled={loading || fetching} 
              className="bg-indigo-600 text-white px-14 py-5 rounded-full font-black text-[13px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              {loading ? (
                <Loader2 className="animate-spin" size={20}/>
              ) : (
                isLastStep ? "ยืนยันและบันทึก" : "ถัดไป"
              )}
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SelectionCard({ icon, title, color, onClick }: any) {
  const colors: any = { 
    emerald: 'hover:border-emerald-500 text-emerald-500', 
    blue: 'hover:border-indigo-600 text-indigo-600' 
  }
  
  return (
    <button 
      onClick={onClick} 
      className={`group p-12 bg-white border-4 border-slate-50 rounded-[60px] ${colors[color]} hover:shadow-2xl transition-all flex flex-col items-center gap-8`}
    >
      {/* ส่วนของ Icon Wrapper: ปรับให้ Icon เปลี่ยนเป็นสีขาว และพื้นหลังเปลี่ยนสีเมื่อ Hover */}
      <div className="p-10 bg-slate-50 rounded-full group-hover:bg-current transition-all flex items-center justify-center">
        <div className="group-hover:text-white transition-all flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase group-hover:scale-105 transition-transform">
        {title}
      </h3>
    </button>
  )
}