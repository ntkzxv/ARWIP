'use client'
import { useEffect, useState, use as reactUse, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../utils/supabase'
import Cropper from 'react-easy-crop' // 🚩 เพิ่ม Library
import { 
  ArrowLeft, Edit3, User, ShieldAlert, Loader2, Lock, Eye, EyeOff, 
  Phone, Mail, MapPin, Calendar, Heart, Globe, School, Banknote, 
  ClipboardCheck, GraduationCap, Briefcase, AlertCircle, X, Check, ZoomIn
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

  // 🚩 [เพิ่ม] State สำหรับการ Crop รูปภาพ
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [showCropModal, setShowCropModal] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      const savedUserId = localStorage.getItem('current_user_id')
      const { data: curr } = await supabase.from('employees').select('*').eq('id', savedUserId).single()
      const { data: emp } = await supabase.from('employees').select('*, branches(branch_name)').eq('id', id).single()
      
      if (!emp || !curr) { router.push('/datacenter/employees'); return }

      if (curr.role === 'manager' && emp.branch_id !== curr.branch_id) {
        alert('สิทธิ์ปฏิเสธ: คุณไม่สามารถเข้าดูพนักงานนอกสาขาที่สังกัดได้');
        router.push('/datacenter/employees');
        return
      }

      setCurrentUser(curr)
      if (emp) {
        // เติม Timestamp เพื่อล้างแคชรูปภาพเก่า
        const cachedPhoto = emp.avatar_url ? `${emp.avatar_url}?t=${Date.now()}` : null;
        setEmployee({ ...emp, avatar_url: cachedPhoto });
        setFormData(emp);
        const names = emp.full_name?.split(' ') || ['', '']
        setFirstName(names[0]); setLastName(names.slice(1).join(' '))
      }
      setLoading(false)
    }
    init()
  }, [id, router])

  const isAdmin = currentUser?.role === 'admin'
  
  // 🚩 [เพิ่ม] Logic การเลือกไฟล์และเปิดตัว Crop
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageDataUrl = URL.createObjectURL(file)
      setImageSrc(imageDataUrl)
      setShowCropModal(true)
    }
  }

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels)
  }, [])

  // 🚩 [เพิ่ม] ฟังก์ชันบันทึกรูปที่ Crop แล้ว
  const handleCropSave = async () => {
    try {
      setLoading(true)
      const croppedImage = await getCroppedImg(imageSrc!, croppedAreaPixels)
      
      const fileName = `${id}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(fileName, croppedImage, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatar').getPublicUrl(fileName)
      
      // อัปเดต URL ใน Database
      await supabase.from('employees').update({ avatar_url: publicUrl }).eq('id', id)

      setEmployee({ ...employee, avatar_url: `${publicUrl}?t=${Date.now()}` })
      setShowCropModal(false)
      setImageSrc(null)
      alert('อัปเดตรูปโปรไฟล์สำเร็จ!')
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

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
      const { data: fresh } = await supabase
        .from('employees')
        .select('*, branches(branch_name)')
        .eq('id', id)
        .single()

      if (fresh) {
        // อัปเดต State ในหน้าปัจจุบันทันที
        setEmployee({
          ...fresh,
          avatar_url: fresh.avatar_url ? `${fresh.avatar_url}?t=${Date.now()}` : null
        });
        setFormData(fresh);
        setIsEditing(false);
        setShowConfirmModal(false);
        setConfirmPassword('');
        alert('บันทึกสำเร็จ!');
      }
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
        {/* 🚀 ส่วนแสดงผลรูปโปรไฟล์ที่มีปุ่มแก้ไข */}
        <div className="relative group shrink-0">
          <div className="w-40 h-40 bg-slate-800 rounded-[45px] overflow-hidden border-4 border-white/10 flex items-center justify-center shadow-2xl transition-all group-hover:border-indigo-500/50">
            {employee.avatar_url ? (
              <img src={employee.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={80} className="text-slate-600" />
            )}
          </div>
          
          {/* ปุ่มปากกาโผล่มาเฉพาะ Admin */}
          {isAdmin && (
            <label className="absolute -bottom-2 -right-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 hover:bg-indigo-500 transition-all border-4 border-slate-900">
              <Edit3 size={20} />
              {/* เปลี่ยนจาก onChange={handleAvatarUpload} เป็น onFileChange เพื่อเปิด Crop Modal */}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={onFileChange} 
              />
            </label>
          )}
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

      {/* 🚩 Modal สำหรับครอบรูป (Crop UI) */}
      {showCropModal && (
        <div className="fixed inset-0 bg-slate-950/95 z-[100] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl h-[450px] md:h-[550px] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
            <Cropper
              image={imageSrc!}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="mt-8 w-full max-w-md bg-slate-900/50 p-8 rounded-[30px] border border-white/5 backdrop-blur-xl">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <ZoomIn size={16} className="text-slate-400" />
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
                
                <div className="flex gap-4">
                   <button 
                     onClick={() => {setShowCropModal(false); setImageSrc(null);}} 
                     className="flex-1 py-4 flex items-center justify-center gap-2 bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all hover:bg-white/10"
                   >
                     <X size={14} /> ยกเลิก
                   </button>
                   <button 
                     onClick={handleCropSave} 
                     className="flex-1 py-4 flex items-center justify-center gap-2 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all"
                   >
                     <Check size={14} /> ยืนยัน
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

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

// 🔧 Helper Function สำหรับประมวลผลรูปที่ครอบ (ใส่ไว้นอก Component)
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = new Image()
  image.src = imageSrc
  await new Promise((resolve) => (image.onload = resolve))

  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 800
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error("Could not get canvas context")

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    800,
    800
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
  })
}