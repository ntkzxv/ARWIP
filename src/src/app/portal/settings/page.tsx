'use client'
import { useEffect, useState, Suspense } from 'react'
import { User, ShieldCheck, Hammer, BadgeCheck, LayoutDashboard, Settings2, ArrowLeft } from 'lucide-react'
import { supabase } from '../../../utils/supabase'
import AccountSettingsSkeleton from '../../../components/skeletons/AccountSettingsSkeleton'
import { useRouter } from 'next/navigation'

function AccountSettingsContent() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'admin'>('profile')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
          const photoUrl = data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null;
          setCurrentUser({ ...data, avatar_url: photoUrl })
        }
      }
      setTimeout(() => setLoading(false), 600)
    }
    fetchUserData()
  }, [])

  if (loading) return <AccountSettingsSkeleton />

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin'

  return (
    <div className="p-10 space-y-10 bg-[#f4f7fe] min-h-screen font-bold">
      <header className="max-w-4xl mx-auto flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
            จัดการ <span className="text-indigo-600">ข้อมูลผู้ใช้งาน</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-3">
            การจัดการข้อมูลส่วนบุคคลและสิทธิ์การเข้าถึงระบบ
          </p>
        </div>
        
        {/* 🚩 ปุ่มกลับสู่หน้าโมดูล */}
        <button 
          onClick={() => router.push('/portal')}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
        >
          <LayoutDashboard size={14} /> กลับสู่หน้าโมดูล
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* --- 📁 แท็บเมนู --- */}
        <div className="flex gap-2 font-bold">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400'
            }`}
          >
            <User size={14} /> ข้อมูลโปรไฟล์
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-400'
              }`}
            >
              <Settings2 size={14} /> เมนูผู้ดูแลระบบ
            </button>
          )}
        </div>

        {/* --- ⚙️ ส่วนเนื้อหา --- */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[500px]">
          {activeTab === 'profile' ? (
            <div className="space-y-10 animate-in fade-in duration-500 font-bold">
              
              <div className="flex items-center gap-8 pb-10 border-b border-slate-50 font-bold">
                <div className="w-28 h-28 rounded-[35px] bg-slate-950 flex items-center justify-center text-white shadow-2xl overflow-hidden border-4 border-white flex-shrink-0">
                   {currentUser?.avatar_url ? (
                     <img 
                       src={currentUser.avatar_url} 
                       className="w-full h-full object-cover animate-in fade-in duration-700" 
                       alt="รูปโปรไฟล์" 
                     />
                   ) : (
                     currentUser?.full_name ? (
                       <span className="text-4xl font-black italic">{currentUser.full_name.charAt(0)}</span>
                     ) : <User size={40} />
                   )}
                </div>

                <div className="space-y-3 font-bold">
                  <h3 className="text-3xl font-black italic text-slate-950 uppercase leading-none tracking-tighter">
                    {currentUser?.full_name || 'กำลังโหลด...'}
                  </h3>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-xl uppercase tracking-widest border border-indigo-100/50">
                      {currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงานทั่วไป'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                <ReadOnlyField label="ชื่อนามสกุลพนักงาน" value={currentUser?.full_name || '-'} />
                <ReadOnlyField label="รหัสพนักงาน (ID)" value={currentUser?.login_id || '-'} />
                <ReadOnlyField label="ตำแหน่งงาน" value={currentUser?.position || 'เจ้าหน้าที่'} />
                <ReadOnlyField label="สาขาที่ปฏิบัติงาน" value={currentUser?.branches?.branch_name || 'สำนักงานใหญ่'} />
              </div>

              <div className="p-8 bg-slate-50 rounded-[30px] border border-dashed border-slate-200 flex items-center gap-5 text-slate-400 font-bold">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                   <Hammer size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">ระบบอยู่ระหว่างการพัฒนา</p>
                  <p className="text-[9px] font-bold uppercase mt-1 leading-relaxed">
                    ฟีเจอร์การแก้ไขข้อมูลและเปลี่ยนรูปโปรไฟล์ด้วยตนเองกำลังจะมาเร็วๆ นี้ <br/>
                    หากต้องการเปลี่ยนข้อมูลเร่งด่วน โปรดติดต่อฝ่ายไอทีหรือผู้ดูแลระบบ
                  </p>
                </div>
              </div>
            </div>
          ) : (
            isAdmin && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-center py-20 font-bold">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-black italic uppercase text-slate-950">การจัดการระบบหลังบ้าน</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.1em] max-w-sm mx-auto leading-loose">
                  คุณสามารถจัดการข้อมูลพนักงาน สิทธิ์การเข้าถึง <br/> และข้อมูลสาขาได้ที่เมนู "Team Directory"
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function AccountSettingsPage() {
    return (
      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettingsContent />
      </Suspense>
    )
}

function ReadOnlyField({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2 group font-bold">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 group-hover:text-indigo-600 transition-colors">{label}</p>
      <div className="w-full px-7 py-5 bg-slate-50/50 rounded-[22px] text-sm font-bold text-slate-900 border border-slate-100 shadow-inner">
        {value}
      </div>
    </div>
  )
}