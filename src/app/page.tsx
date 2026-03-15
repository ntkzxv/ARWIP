'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase' // ปรับ path ให้ตรงกับโปรเจกต์คุณ (เช่น ../utils/supabase)
import { Loader2, ShieldCheck } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. ตรวจสอบ Session จาก Supabase Auth
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // ✅ ถ้ามี Session (Login แล้ว) ส่งไปหน้า Dashboard
          router.replace('/dashboard')
        } else {
          // ❌ ถ้าไม่มี Session ส่งไปหน้า Login
          router.replace('/login')
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center p-6">
      {/* หน้า Loading ระหว่างเช็คสิทธิ์ */}
      <div className="text-center space-y-6 animate-pulse">
        <div className="inline-flex w-20 h-20 bg-indigo-600 rounded-[30px] items-center justify-center shadow-xl shadow-indigo-200">
          <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            ARWIP <span className="text-indigo-600">SYSTEM</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Verifying Access...
            </p>
          </div>
        </div>
      </div>

      {/* ตกแต่งพื้นหลังเล็กน้อยให้เข้ากับธีม */}
      <div className="fixed bottom-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Accounting Analysis & Management
      </div>
    </div>
  )
}