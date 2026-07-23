'use client'
import { useState } from 'react'
import { Users, Eye, EyeOff, Briefcase, MapPin, User, ChevronDown, ChevronUp, UserCheck, Tag, Hash, Box } from 'lucide-react'

export default function GuarantorInfo({ contracts }: any) {
  const [showId, setShowId] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const guarantors = contracts
    ?.filter((con: any) => con.guarantors && (Array.isArray(con.guarantors) ? con.guarantors.length > 0 : !!con.guarantors))
    ?.map((con: any) => {
      const g = Array.isArray(con.guarantors) ? con.guarantors[0] : con.guarantors;
      return {
        id: g.id,
        contract_id: con.id,
        full_name: g.full_name,
        id_card: g.id_card,
        phone: g.phone,
        home_phone: g.home_phone,
        personal_email: g.personal_email,
        birth_date: g.birth_date,
        gender: g.gender,
        marital_status: g.marital_status,
        current_address: g.current_address,
        permanent_address: g.permanent_address,
        occupation: g.occupation,
        work_place_name: g.work_place_name,
        work_place_address: g.work_place_address,
        work_phone: g.work_phone,
        monthly_income: g.monthly_income,
        relationship: g.relationship,
        product_id: con.sales_transactions?.product_id || '-',
        product_name: con.sales_transactions?.product_name || 'ไม่ระบุชื่อสินค้า' // 🚩 เพิ่มชื่อสินค้า
      };
    });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatId = (idCard: string, isVisible: boolean) => {
    if (!idCard) return '-';
    return isVisible ? idCard : `x-xxxx-xxxxx-${idCard.slice(-2)}`;
  };

  if (!guarantors || guarantors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[45px] border-2 border-dashed border-slate-200">
        <Users size={64} className="text-slate-200 mb-4" />
        <p className="text-slate-400 font-bold italic text-center">ไม่พบข้อมูลผู้ค้ำประกันในระบบ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-end items-center px-2 mb-6">
                <div className="flex items-center bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">
                    {guarantors.length} ทั้งหมด
                </span>
                </div>
            </div>
      
      {guarantors.map((g: any) => {
        const isExpanded = expandedId === g.contract_id;
        
        return (
          <div key={g.contract_id} className={`group bg-white rounded-[40px] border-2 transition-all duration-500 overflow-hidden ${isExpanded ? 'border-indigo-100 shadow-xl shadow-indigo-50/50' : 'border-slate-50 hover:border-indigo-200'}`}>
            
            {/* --- Header Card --- */}
            <button 
              onClick={() => toggleExpand(g.contract_id)}
              className="w-full p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors text-left"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                  <UserCheck size={28}/>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Contract: {g.contract_id.slice(0,8).toUpperCase()}</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{g.full_name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-10 lg:flex-1">
                <div className="lg:text-right border-l lg:border-l-0 lg:border-r border-slate-100 pl-4 lg:pl-0 lg:pr-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">สินค้าที่ค้ำประกัน</p>
                  <p className="text-base font-black text-slate-900 flex items-center gap-2 lg:justify-end">
                    <Box size={14} className="text-indigo-500"/> {g.product_name}
                  </p>
                  <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase">ID: {g.product_id}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </button>

            {/* --- Details Body --- */}
            {isExpanded && (
              <div className="p-10 border-t border-slate-50 space-y-12 animate-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  
                  {/* ข้อมูลส่วนตัว - 🚩 เปลี่ยน Heart เป็น User */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b border-indigo-50 pb-4">
                      <User size={16}/> ข้อมูลส่วนตัวผู้ค้ำ
                    </h3>
                    <div className="space-y-4">
                      <DataRow label="ชื่อ-นามสกุล" value={g.full_name}/>
                      <DataRow label="ความสัมพันธ์" value={g.relationship}/>
                      <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">เลขบัตรประชาชน</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{formatId(g.id_card, showId[g.id])}</span>
                          <button onClick={(e) => {e.stopPropagation(); setShowId(prev => ({...prev, [g.id]: !prev[g.id]}));}} className="text-slate-300 hover:text-indigo-600 transition-colors">
                            {showId[g.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                        </div>
                      </div>
                      <DataRow label="เบอร์โทรศัพท์" value={g.phone} />
                      <DataRow label="เบอร์โทรบ้าน" value={g.home_phone} />
                      <DataRow label="อีเมลส่วนตัว" value={g.personal_email} />
                      <DataRow label="วันเกิด" value={g.birth_date} />
                      <DataRow label="เพศ" value={g.gender === 'male' ? 'ชาย' : 'หญิง'} />
                    </div>
                  </div>

                  {/* ข้อมูลอาชีพและรายได้ */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 border-b border-indigo-50 pb-4">
                      <Briefcase size={16}/> ข้อมูลอาชีพ & รายได้
                    </h3>
                    <div className="space-y-4">
                      <DataRow label="อาชีพ" value={g.occupation} />
                      <DataRow label="ชื่อสถานที่ทำงาน" value={g.work_place_name}/>
                      <DataRow label="เบอร์โทรที่ทำงาน" value={g.work_phone} />
                      <DataRow label="รายได้ต่อเดือน" value={g.monthly_income} type="number"/>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">ที่อยู่สถานที่ทำงาน</p>
                      <div className="p-6 bg-white rounded-3xl border border-slate-100 ">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {g.work_place_address || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลที่อยู่ */}
                <div className="pt-8 border-t border-slate-100">
                  <h3 className="flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-8">
                    <MapPin size={16}/> ข้อมูลที่อยู่ผู้ค้ำประกัน
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">ที่อยู่ปัจจุบัน</p>
                      <div className="p-7 bg-white rounded-[35px] border border-slate-100 min-h-[100px]">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{g.current_address}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">ที่อยู่ตามภูมิลำเนา</p>
                      <div className="p-7 bg-white rounded-[35px] border border-slate-100 min-h-[100px]">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">{g.permanent_address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DataRow({ label, value, type = "text" }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100/50 pb-2 min-h-[42px]">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-sm font-bold text-slate-900 uppercase">
        {type === 'number' ? `฿${Number(value || 0).toLocaleString()}` : (value || '-')}
      </span>
    </div>
  )
}