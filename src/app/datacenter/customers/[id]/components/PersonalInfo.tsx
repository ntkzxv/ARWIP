'use client'
import { useState } from 'react'
import { Eye, EyeOff, User, Briefcase, MapPin, Building2 } from 'lucide-react'

export default function PersonalInfo({ customer, isEditing, editForm, setEditForm }: any) {
  const [showId, setShowId] = useState(false);
  const [showSpouseId, setShowSpouseId] = useState(false);

  const update = (field: string, val: any) => setEditForm({ ...editForm, [field]: val });
  
  const formatId = (id: string, show: boolean) => {
    if (!id) return '-';
    return show ? id : `x-xxxx-xxxxx-${id.slice(-2)}`;
  };

  if (!customer) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-10 m-6">
      {/* 1. ข้อมูลส่วนตัวหลัก */}
      <section className="space-y-6">
        <h3 className="flex items-center gap-2 text-[16px] font-black text-indigo-600 uppercase border-b border-slate-50 pb-4">
          <User size={16}/> ข้อมูลส่วนตัวลูกค้า
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {/* ใช้ isLocked={false} เพื่อให้เป็นสีดำเข้มตามโจทย์ */}
          <InfoRow label="ชื่อ-นามสกุล" value={customer.full_name} isLocked={false} />
          
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-[11px] font-black text-slate-400 uppercase">เลขบัตรประชาชน</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{formatId(customer.id_card, showId)}</span>
              <button onClick={() => setShowId(!showId)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                {showId ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          <InfoRow label="เบอร์โทรศัพท์" value={editForm.phone} isEditing={isEditing} onChange={(v:any) => update('phone', v)} />
          <InfoRow label="อีเมลส่วนตัว" value={editForm.personal_email} isEditing={isEditing} onChange={(v:any) => update('personal_email', v)} />
          <InfoRow label="เบอร์โทรศัพท์บ้าน" value={editForm.home_phone} isEditing={isEditing} onChange={(v:any) => update('home_phone', v)} />
          <InfoRow label="วันเกิด" value={customer.birth_date} isLocked={false} />
          <InfoRow label="เพศ" value={customer.gender === 'male' ? 'ชาย' : customer.gender === 'female' ? 'หญิง' : 'เพศทางเลือก'} isLocked={false} />
          <InfoRow label="สถานภาพ" value={customer.marital_status === 'married' ? 'สมรส' : customer.marital_status === 'single' ? 'โสด' : 'หย่าร้าง'} isLocked={false} />
        </div>
      </section>

      {/* 2. ข้อมูลที่อยู่ */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่ปัจจุบัน (ที่ติดต่อได้)</p>
            {isEditing ? (
              <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.current_address} onChange={(e)=>update('current_address', e.target.value)} />
            ) : (
              <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.current_address}</p></div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่ตามภูมิลำเนา (ตามบัตร)</p>
            {isEditing ? (
              <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.permanent_address} onChange={(e)=>update('permanent_address', e.target.value)} />
            ) : (
              <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.permanent_address}</p></div>
            )}
          </div>
        </div>
      </section>

      {/* 3. ข้อมูลการทำงาน */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <InfoRow label="อาชีพ" value={editForm.occupation} isEditing={isEditing} onChange={(v:any) => update('occupation', v)} />
          <InfoRow label="ชื่อสถานที่ทำงาน" value={editForm.work_place_name} isEditing={isEditing} onChange={(v:any) => update('work_place_name', v)} />
          <InfoRow label="เบอร์โทรที่ทำงาน" value={editForm.work_phone} isEditing={isEditing} onChange={(v:any) => update('work_phone', v)} />
          <InfoRow label="รายได้ต่อเดือน" value={editForm.monthly_income} type="number" isEditing={isEditing} onChange={(v:any) => update('monthly_income', v)} />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่สถานที่ทำงาน</p>
          {isEditing ? (
            <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.work_place_address} onChange={(e)=>update('work_place_address', e.target.value)} />
          ) : (
            <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.work_place_address || '-'}</p></div>
          )}
        </div>        
      </section>
      <div className="pt-2 border-t border-slate-100"/>
      {/* 4. ข้อมูลคู่สมรส */}
      {(customer.marital_status === 'married' || customer.spouse_name) && (
        <section className="space-y-6">
          <h3 className="flex items-center gap-2 text-[14px] font-black text-indigo-600 uppercase tracking-[0.1em] border-b border-slate-50 pb-4">
            <User size={16}/> ข้อมูลคู่สมรส
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <InfoRow label="ชื่อ-นามสกุลคู่สมรส" value={editForm.spouse_name} isEditing={isEditing} onChange={(v:any) => update('spouse_name', v)} />
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="text-[11px] font-black text-slate-400 uppercase">เลขบัตรประชาชนคู่สมรส</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{formatId(customer.spouse_id_card, showSpouseId)}</span>
                <button onClick={() => setShowSpouseId(!showSpouseId)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                  <Eye size={14}/>
                </button>
              </div>
            </div>
            <InfoRow label="เบอร์โทรคู่สมรส" value={editForm.spouse_phone} isEditing={isEditing} onChange={(v:any) => update('spouse_phone', v)} />
            <InfoRow label="วันเกิดคู่สมรส" value={customer.spouse_birth_date || '-'} isLocked={false} />
            <InfoRow label="เพศคู่สมรส" value={customer.spouse_gender === 'male' ? 'ชาย' : 'หญิง'} isLocked={false} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่ปัจจุบันคู่สมรส</p>
              {isEditing ? (
                <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.spouse_current_address} onChange={(e)=>update('spouse_current_address', e.target.value)} />
              ) : (
                <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.spouse_current_address || '-'}</p></div>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่ตามภูมิลำเนาคู่สมรส</p>
              {isEditing ? (
                <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.spouse_permanent_address} onChange={(e)=>update('spouse_permanent_address', e.target.value)} />
              ) : (
                <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.spouse_permanent_address || '-'}</p></div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-4">
            <InfoRow label="อาชีพคู่สมรส" value={editForm.spouse_occupation} isEditing={isEditing} onChange={(v:any) => update('spouse_occupation', v)} />
            <InfoRow label="สถานที่ทำงานคู่สมรส" value={editForm.spouse_work_place} isEditing={isEditing} onChange={(v:any) => update('spouse_work_place', v)} />
            <InfoRow label="รายได้คู่สมรส/เดือน" value={editForm.spouse_monthly_income} type="number" isEditing={isEditing} onChange={(v:any) => update('spouse_monthly_income', v)} />
          </div>
          <div className="space-y-3 mt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase ml-1">ที่อยู่สถานที่ทำงานคู่สมรส</p>
            {isEditing ? (
              <textarea className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 outline-none text-sm font-bold text-slate-900 focus:text-indigo-600 focus:border-indigo-400" rows={3} value={editForm.spouse_work_place_address} onChange={(e)=>update('spouse_work_place_address', e.target.value)} />
            ) : (
              <div className="bg-white p-5 rounded-[25px] min-h-[100px] border border-slate-100/50"><p className="text-sm font-bold text-slate-900 leading-relaxed">{customer.spouse_work_place_address || '-'}</p></div>
            )}
          </div>              
        </section>
      )}

      {/* 5. ข้อมูลสาขาต้นสังกัด */}
      <section className="pt-6 border-t border-slate-100">
        <div className="flex items-center gap-4 p-6 bg-indigo-50/30 rounded-[30px] border border-indigo-100/50">
          <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-50"><Building2 size={24}/></div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">สาขาที่ลงทะเบียน (Home Branch)</p>
            <p className="text-lg font-black text-slate-900">{customer.branches?.branch_name || 'ไม่ระบุสาขา'}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// UI Helper: แถวข้อมูล - ปรับให้ value เป็นสี slate-900 (ดำเข้ม)
function InfoRow({ label, value, isEditing, isLocked, onChange, type="text" }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-50 pb-2 min-h-[42px]">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
      {isEditing && !isLocked ? (
        <input 
          type={type} 
          className="text-sm font-bold text-slate-900 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100 outline-none text-right w-1/2 focus:border-indigo-400 focus:text-indigo-600 transition-colors" 
          value={value || ''} 
          onChange={(e)=>onChange(e.target.value)} 
        />
      ) : (
        <span className={`text-sm font-bold ${isLocked ? 'text-slate-500 opacity-70' : 'text-slate-900'}`}>
          {type === 'number' ? `฿${Number(value || 0).toLocaleString()}` : (value || '-')}
        </span>
      )}
    </div>
  )
}