'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { Fingerprint, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 🚩 หัวใจสำคัญ: ต้องตั้งค่าเริ่มต้นให้ถูกต้อง
  const [isChecking, setIsChecking] = useState(true) // กั้นหน้าขาวแวบตอนแรก
  const [isReady, setIsReady] = useState(false)     // คุมการจางออกของม่านดำ

  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const savedUserId = localStorage.getItem('current_user_id')
      
      if (savedUserId) {
        // ถ้าล็อกอินแล้ว ส่งไปหน้า Portal
        router.replace('/portal')
      } else {
        // ถ้ายังไม่ได้ล็อกอิน ให้ "เปิดม่าน" โชว์หน้า Login
        setIsChecking(false) 
        // หน่วงเวลาเล็กน้อยให้ตาปรับสภาพ (ลืมตา)
        setTimeout(() => setIsReady(true), 100)
      }
    }
    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        
        .eq('login_id', loginId)
        .single()

      if (error || !employee) {
        alert('Unauthorized: User ID not found')
        setLoading(false)
        return
      }

      if (employee.temp_password !== password) {
        alert('Security Error: Invalid Key')
        setLoading(false)
        return
      }

      localStorage.setItem('current_user_id', employee.id)
      window.location.href = '/portal'
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  // 🚩 ส่วนที่กั้นหน้าจอ (ต้องแน่ใจว่า bg ตรงกับ Splash Screen)
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans overflow-hidden relative transition-colors duration-1000">
      
      {/* 🌑 1. Anti-Glare Overlay: ม่านดำค่อยๆ จางออก (กันแสบตา) */}
      <div className={`absolute inset-0 bg-slate-950 z-50 pointer-events-none transition-opacity duration-1000 ease-in-out ${isReady ? 'opacity-0' : 'opacity-100'}`}></div>

      {/* 🌌 2. Ambient Glow: แสงครามจางๆ */}
      <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full transition-all duration-[2000ms] ${isReady ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* 🛡️ 3. Login Card */}
      <div className={`w-full max-w-[460px] relative z-10 transition-all duration-1000 delay-300 ${isReady ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-md'}`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-[50px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.06)] border border-white p-12 md:p-16">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[30px] mb-8 shadow-2xl shadow-indigo-100">
               <Fingerprint className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Neural <span className="text-indigo-600">Access</span>
            </h1>
            <p className="text-slate-400 mt-4 text-[10px] font-black uppercase tracking-[0.4em]">Establish Secure Link</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Identity_ID
              </label>
              <input 
                type="text" 
                placeholder="Ex. EMP_001" 
                className="w-full px-8 py-5 rounded-[25px] bg-slate-50 border border-slate-100 outline-none transition-all text-slate-900 font-bold focus:bg-white focus:border-indigo-500 italic"
                value={loginId} onChange={(e) => setLoginId(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Security_Key
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-8 py-5 rounded-[25px] bg-slate-50 border border-slate-100 outline-none transition-all text-slate-900 font-bold focus:bg-white focus:border-indigo-500"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[28px] font-black text-[12px] mt-4 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase tracking-[0.3em] italic"
            >
              {loading ? 'Verifying...' : (
                <>Authorize Access <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <ShieldCheck className="text-emerald-500" size={14} />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol v4.0 Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}