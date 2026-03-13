'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 🚩 ตรวจสอบสิทธิ์การเข้าถึง
    const savedUserId = localStorage.getItem('current_user_id')
    
    if (!savedUserId) {
      // ❌ ถ้าไม่มี ID ในเครื่อง ให้ดีดไปหน้า Login ทันที
      router.replace('/login')
    } else {
      // ✅ ถ้ามีสิทธิ์ ให้เข้าใช้งานได้
      setIsReady(true)
    }
  }, [router])

  // --- ระหว่างตรวจสอบสิทธิ์ ให้โชว์ Loading เพื่อความสมูท ---
  if (!isReady) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Checking Access...</p>
      </div>
    )
  }

  // --- เมื่อตรวจสอบผ่านแล้ว แสดง Sidebar + เนื้อหา ---
  return (
    <div className="flex min-h-screen bg-[#f4f7fe]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-y-auto h-screen no-scrollbar">
        {children}
      </main>
    </div>
  )
}