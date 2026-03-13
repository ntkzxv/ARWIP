'use client'
import { useEffect, useState, use as reactUse } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../utils/supabase'
import { 
  ArrowLeft, Edit3, User, ShieldAlert, Loader2, Lock, Eye, EyeOff, 
  Phone, Mail, MapPin, Calendar, Heart, Globe, School, Banknote, 
  ClipboardCheck, GraduationCap, Briefcase, AlertCircle
} from 'lucide-react'

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = reactUse(params); 
  const id = resolvedParams.id; 
  const router = useRouter()
  
  const [employee, setEmployee] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    async function init() {
      setLoading(true)
      const savedUserId = localStorage.getItem('current_user_id')
      const { data: curr } = await supabase.from('employees').select('*').eq('id', savedUserId).single()
      const { data: emp } = await supabase.from('employees').select('*, branches(branch_name)').eq('id', id).single()
      
      if (!emp || !curr) { router.push('/dashboard/employees'); return }

      if (curr.role === 'manager' && emp.branch_id !== curr.branch_id) {
        alert('สิทธิ์ปฏิเสธ: คุณไม่สามารถเข้าดูพนักงานนอกสาขาที่สังกัดได้');
        router.push('/dashboard/employees');
        return
      }

      setCurrentUser(curr)
      setEmployee(emp)
      setFormData(emp)
      const names = emp.full_name?.split(' ') || ['', '']
      setFirstName(names[0]); setLastName(names.slice(1).join(' '))
      setLoading(false)
    }
    init()
  }, [id, router])

  const isAdmin = currentUser?.role === 'admin'

  const handleFinalSave = async () => {
    if (!isAdmin) return;
    if (!confirmPassword || confirmPassword !== String(currentUser.temp_password)) { 
      alert(`รหัสผ่าน Admin ไม่ถูกต้อง!`); return 
    }
    const updatedFullName = `${firstName} ${lastName}`.trim()
    const updateData = {
      prefix: formData.prefix || null,
      full_name: updatedFullName,
      nickname: formData.nickname || null,
      gender: formData.gender || null,
      birth_date: formData.birth_date || null,
      blood_type: formData.blood_type || null,
      nationality: formData.nationality || 'Thai',
      religion: formData.religion || null,
      phone: formData.phone || '',
      email: formData.email || null,
      current_address: formData.current_address || null,
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_phone: formData.emergency_contact_phone || null,
      position: formData.position || null,
      department: formData.department || null,
      temp_password: formData.temp_password || '',
      salary: formData.salary ? parseFloat(formData.salary) : null,
      employment_status: formData.employment_status || 'probation',
      education_level: formData.education_level || null,
      major_subject: formData.major_subject || null,
      university_name: formData.university_name || null,
      start_date: formData.start_date || null,
      updated_at: new Date().toISOString()
    }
    const { error } = await supabase.from('employees').update(updateData).eq('id', id)
    if (!error) {
      const { data: fresh } = await supabase.from('employees').select('*, branches(branch_name)').eq('id', id).single()
      setEmployee(fresh); setFormData(fresh); setIsEditing(false); setShowConfirmModal(false); setConfirmPassword('');
      alert('บันทึกสำเร็จ!');
    }
  }

  if (loading || !employee) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-all"><ArrowLeft size={20}/> ย้อนกลับ</button>
        {isAdmin && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"><Edit3 size={18}/> แก้ไขข้อมูลพนักงาน</button>
        )}
      </div>

      <div className="bg-white rounded-[50px] shadow-sm border border-slate-50 overflow-hidden">
        {/* Profile Card Header */}
        <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row items-center gap-10">
          <div className="w-40 h-40 bg-slate-800 rounded-[45px] overflow-hidden border-4 border-white/10 flex items-center justify-center shadow-2xl">
            <User size={80} className="text-slate-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter uppercase">{employee.full_name}</h1>
            <div className="flex gap-3">
               <span className="px-4 py-1.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{employee.position || 'Staff'}</span>
               <span className="px-4 py-1.5 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">{employee.branches?.branch_name || 'ไม่ระบุสาขา'}</span>
            </div>
          </div>
        </div>

        <div className="p-12 space-y-16">
          
          {/* PERSONAL DETAILS */}
          <section className="space-y-8">
            <HeaderSection english="PERSONAL DETAILS" thai="ข้อมูลส่วนตัว" color="bg-indigo-600" textColor="text-indigo-600" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10">
              <Select label="คำนำหน้า" value={formData.prefix} isEditing={isEditing} options={['นาย', 'นาง', 'นางสาว']} onChange={(v:any)=>setFormData({...formData, prefix:v})} />
              <Input label="ชื่อจริง" value={firstName} isEditing={isEditing} onChange={setFirstName} />
              <Input label="นามสกุล" value={lastName} isEditing={isEditing} onChange={setLastName} />
              <Input label="ชื่อเล่น" value={formData.nickname} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, nickname:v})} />
              <Select label="เพศ" value={formData.gender} isEditing={isEditing} options={['ชาย', 'หญิง', 'อื่นๆ']} onChange={(v:any)=>setFormData({...formData, gender:v})} />
              <Input label="สัญชาติ" value={formData.nationality} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, nationality:v})} />
              <Input label="ศาสนา" value={formData.religion} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, religion:v})} />
              <Input label="กรุ๊ปเลือด" value={formData.blood_type} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, blood_type:v})} />
              <Input label="ระดับการศึกษา" value={formData.education_level} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, education_level:v})} />
              <Input label="คณะ / สาขาวิชา" value={formData.major_subject} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, major_subject:v})} />
              <Input label="สถาบัน / มหาวิทยาลัย" value={formData.university_name} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, university_name:v})} />              
            </div>
          </section>         
          {/* CONTACT */}
          <section className="space-y-8">
            <HeaderSection english="CONTACT & EMERGENCY" thai="ข้อมูลติดต่อ" color="bg-emerald-600" textColor="text-emerald-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
               <Input label="เบอร์โทรศัพท์" value={formData.phone} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, phone:v})} />
               <Input label="อีเมล" value={formData.email} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, email:v})} />
               <Input label="ผู้ติดต่อฉุกเฉิน" value={formData.emergency_contact_name} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, emergency_contact_name:v})} />
               <Input label="เบอร์โทรฉุกเฉิน" value={formData.emergency_contact_phone} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, emergency_contact_phone:v})} />
            </div>
            {isAdmin && <Input label="ที่อยู่ปัจจุบัน" value={formData.current_address} isEditing={isEditing} isTextarea onChange={(v:any)=>setFormData({...formData, current_address:v})} />}
          </section>

          {/* COMPANY DETAILS */}
          <section className="space-y-8">
            <HeaderSection english="COMPANY DETAILS" thai="ข้อมูลทำงาน" color="bg-blue-600" textColor="text-blue-600" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
              <Input label="ID พนักงาน" value={employee.login_id} isEditing={false} />
              <Input label="ตำแหน่ง" value={formData.position} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, position:v})} />
              <Input label="แผนก" value={formData.department} isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, department:v})} />
            </div>
            {/* สาขาสไตล์กล่องเดิมแต่เพิ่มดีไซน์ */}
            <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><MapPin size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สาขาที่สังกัด</p>
                <p className="text-xl font-black text-slate-900">{employee.branches?.branch_name || 'ไม่ระบุสาขา'}</p>
              </div>
            </div>
          </section>

          {/* SENSITIVE DATA (ADMIN ONLY) */}
          {isAdmin && (
            <section className="space-y-8 p-10 bg-red-50/30 rounded-[45px] border border-red-100/50">
               <HeaderSection english="SENSITIVE DATA" thai="ข้อมูลความปลอดภัย" color="bg-red-600" textColor="text-red-600" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <Input label="รหัสผ่านระบบ" value={formData.temp_password} isEditing={isEditing} isPassword showPassword={showPassword} setShowPassword={setShowPassword} onChange={(v:any)=>setFormData({...formData, temp_password:v})} />
                  <Input label="เลขบัตรประชาชน" value={employee.id_card} isEditing={false} />
                  <Input label="วันเกิด" value={formData.birth_date} type="date" isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, birth_date:v})} />
                  <Input label="เงินเดือน" value={formData.salary} type="number" isEditing={isEditing} onChange={(v:any)=>setFormData({...formData, salary:v})} />
                  <Select label="สถานะพนักงาน" value={formData.employment_status} isEditing={isEditing} options={['regular', 'probation', 'contract', 'resigned']} onChange={(v:any)=>setFormData({...formData, employment_status:v})} />
               </div>
            </section>
          )}

        </div>

        {isEditing && isAdmin && (
          <div className="p-8 bg-slate-50 border-t flex justify-end gap-4">
            <button onClick={()=>setIsEditing(false)} className="px-8 py-3 font-bold text-slate-400">ยกเลิก</button>
            <button onClick={()=>setShowConfirmModal(true)} className="bg-indigo-600 text-white px-12 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-200">บันทึกข้อมูล</button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[45px] p-12 max-w-md w-full shadow-2xl text-center space-y-6">
             <Lock size={40} className="mx-auto text-indigo-600"/>
             <h2 className="text-2xl font-black text-slate-800">ยืนยันรหัสผ่าน Admin</h2>
             <input type="password" autoFocus className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-bold text-xl outline-none focus:border-indigo-600" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleFinalSave()} />
             <div className="flex gap-4 pt-4">
                <button onClick={()=>setShowConfirmModal(false)} className="flex-1 py-4 font-bold text-slate-400">ยกเลิก</button>
                <button onClick={handleFinalSave} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl">ยืนยัน</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 🔧 ส่วนหัว Section แบบมีขีดข้างหน้า
function HeaderSection({ english, thai, color, textColor }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-1.5 self-stretch ${color} rounded-full`}></div>
      <div className="flex flex-col">
        <h3 className={`text-[10px] font-black ${textColor} uppercase tracking-[0.3em] leading-none mb-1`}>{english}</h3>
        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">{thai}</p>
      </div>
    </div>
  )
}

// 🔧 Helper Component สำหรับ Input (พร้อมเส้นใต้สถานะ Read-only)
function Input({ label, value, isEditing, onChange, isPassword, showPassword, setShowPassword, type="text", isTextarea }: any) {
  return (
    <div className="space-y-1 w-full text-left group">
      <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</p>
      {isEditing ? (
        <div className="relative">
          {isTextarea ? <textarea className="w-full p-4 bg-white border-2 border-indigo-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all" value={value || ''} onChange={(e)=>onChange(e.target.value)} rows={3} />
          : <input type={isPassword ? (showPassword ? "text" : "password") : type} className="w-full p-4 bg-white border-2 border-indigo-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all" value={value || ''} onChange={(e)=>onChange(e.target.value)} />}
          {isPassword && <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}
        </div>
      ) : (
        <div className="px-1 py-3 bg-transparent border-b-2 border-slate-100 text-sm font-black text-slate-800 min-h-[45px] flex items-center transition-all group-hover:border-indigo-200">
          {isPassword ? '••••••••' : (value || '-')}
        </div>
      )}
    </div>
  )
}

// 🔧 Helper Component สำหรับ Select (พร้อมเส้นใต้สถานะ Read-only)
function Select({ label, value, isEditing, options, onChange }: any) {
  return (
    <div className="space-y-1 w-full text-left group">
      <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</p>
      {isEditing ? (
        <select className="w-full p-4 bg-white border-2 border-indigo-50 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 transition-all" value={value || ''} onChange={(e)=>onChange(e.target.value)}>
          <option value="">เลือก...</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <div className="px-1 py-3 bg-transparent border-b-2 border-slate-100 text-sm font-black text-slate-800 min-h-[45px] flex items-center transition-all group-hover:border-indigo-200 uppercase">
          {value || '-'}
        </div>
      )}
    </div>
  )
}