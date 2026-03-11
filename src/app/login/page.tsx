'use client'
import { useState } from 'react'
import { supabase } from '../../utils/supabase'

export default function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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

    localStorage.setItem('current_user_id', employee.id)
    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e2d] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <span className="text-white text-2xl font-black">AR</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Data Center</h1>
          <p className="text-slate-400 mt-2 font-medium text-sm text-center">Employee Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 uppercase">User ID</label>
            <input 
              type="text" 
              placeholder="UUID" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none transition-all text-slate-800 font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 uppercase">Password</label>
            <input 
              type="Password" 
              placeholder="••••••" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none transition-all text-slate-800 font-medium focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-blue-200 hover:shadow-blue-300 transform transition active:scale-[0.98] disabled:bg-slate-300"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] mt-10 font-bold uppercase tracking-[0.2em]">
          Secured by ARWIP-Shield v4.0
        </p>
      </div>
    </div>
  )
}