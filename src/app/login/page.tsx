'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🚩 ป้องกันคนที่ Login แล้วไม่ให้กลับมาหน้า Login อีก (เช็คด่วนก่อนเรนเดอร์)
  useEffect(() => {
    const savedUserId = localStorage.getItem('current_user_id')
    if (savedUserId && window.location.pathname === '/login') {
      window.location.href = '/dashboard'
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('login_id', loginId)
        .single()

      if (empError || !employee) {
        alert('ไม่พบ User ID นี้ในระบบ')
        setLoading(false)
        return
      }

      if (employee.temp_password !== password) {
        alert('รหัสผ่านไม่ถูกต้อง')
        setLoading(false)
        return
      }

      // ✅ เก็บค่าลง LocalStorage
      localStorage.setItem('current_user_id', employee.id)
      
      // ✅ ใช้ window.location.href เพื่อล้าง Cache ของ Layout เก่า 
      // และบังคับให้ RootLayout เริ่มวงจรการเช็คสิทธิ์ใหม่ทันที
      window.location.href = '/dashboard'

    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-xl shadow-indigo-600/20 ring-4 ring-indigo-50">
            <span className="text-white text-2xl font-black">AR</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Data Center</h1>
          <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-[0.2em]">Employee Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">User ID</label>
            <input 
              type="text" 
              placeholder="UUID" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none transition-all text-slate-800 font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              placeholder="••••••" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none transition-all text-slate-800 font-bold focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg mt-4 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transform transition active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none uppercase tracking-tighter"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50">
           <p className="text-center text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
             Secured by ARWIP-Shield v4.0
           </p>
        </div>
      </div>
    </div>
  )
}