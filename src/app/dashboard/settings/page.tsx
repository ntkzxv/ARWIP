'use client'
import { useEffect, useState } from 'react'
import { User, ShieldCheck, Hammer, Lock, MapPin, BadgeCheck } from 'lucide-react'
import { supabase } from '../../../utils/supabase'

export default function AccountSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const savedUserId = localStorage.getItem('current_user_id')
      if (savedUserId) {
        const { data } = await supabase
          .from('employees')
          .select('*, branches(branch_name)')
          .eq('id', savedUserId)
          .single()
        
        if (data) {
          // 🚩 ใส่ Timestamp เพื่อให้รูปอัปเดตใหม่เสมอเมื่อมีการเปลี่ยน
          const photoUrl = data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null;
          setCurrentUser({ ...data, avatar_url: photoUrl })
        }
      }
      setLoading(false)
    }
    fetchUserData()
  }, [])

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin'

  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
          System <span className="text-indigo-600">Account</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-3">
          ข้อมูลส่วนบุคคลและสิทธิ์การเข้าถึง
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* --- 📁 TABS --- */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'
            }`}
          >
            Profile Info
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'admin' ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-400'
              }`}
            >
              Admin Menu
            </button>
          )}
        </div>

        {/* --- ⚙️ CONTENT --- */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[500px]">
          {activeTab === 'profile' ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              
              {/* Profile Header */}
              <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
                {/* 🚩 แสดงรูปจริงแทน Icon */}
                <div className="w-28 h-28 rounded-[35px] bg-slate-950 flex items-center justify-center text-white shadow-2xl overflow-hidden border-4 border-white">
                   {currentUser?.avatar_url ? (
                     <img 
                       src={currentUser.avatar_url} 
                       className="w-full h-full object-cover animate-in fade-in duration-700" 
                       alt="Profile" 
                     />
                   ) : (
                     currentUser?.full_name ? (
                       <span className="text-4xl font-black italic">{currentUser.full_name.charAt(0)}</span>
                     ) : <User size={40} />
                   )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-black italic text-slate-950 uppercase leading-none tracking-tighter">
                    {currentUser?.full_name || 'Loading...'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100/50">
                      {currentUser?.role || 'User'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black uppercase italic tracking-widest">
                      <BadgeCheck size={14} className="text-emerald-500" /> Identity Verified
                    </span>
                  </div>
                </div>
              </div>
              
              {/* ข้อมูลจริงจาก Database (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReadOnlyField label="Full Name" value={currentUser?.full_name || '-'} />
                <ReadOnlyField label="Employee ID" value={currentUser?.login_id || '-'} />
                <ReadOnlyField label="Current Position" value={currentUser?.position || 'Staff'} />
                <ReadOnlyField label="Assigned Branch" value={currentUser?.branches?.branch_name || 'Main Office'} />
              </div>

              {/* Waiting Alert */}
              <div className="p-8 bg-slate-50 rounded-[30px] border border-dashed border-slate-200 flex items-center gap-5 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                   <Hammer size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Self-Service Update Pending</p>
                  <p className="text-[9px] font-bold uppercase mt-1 leading-relaxed">
                    ฟีเจอร์การแก้ไขข้อมูลและเปลี่ยนรูปโปรไฟล์ด้วยตนเองกำลังอยู่ระหว่างการพัฒนา <br/>
                    ขณะนี้รองรับการแก้ไขโดย Admin เท่านั้น
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Admin Menu Content */
            isAdmin && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-center py-20">
                <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
                <h3 className="text-xl font-black italic uppercase text-slate-950">Admin Management</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto">
                  เข้าถึงการจัดการพนักงานทั้งหมดได้ที่เมนู "Team Directory" ในแถบ Sidebar
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2 group">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-hover:text-indigo-600 transition-colors">{label}</p>
      <div className="w-full px-7 py-5 bg-slate-50/50 rounded-[22px] text-sm font-black text-slate-900 border border-slate-100 shadow-inner italic">
        {value}
      </div>
    </div>
  )
}