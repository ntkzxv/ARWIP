'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../utils/supabase' 
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()
  
  // 🚩 อัปเดตลิ้งค์ Logo ใหม่ที่คุณส่งมา
  const logoUrl = "https://yksehgfsltzngnhqrdiv.supabase.co/storage/v1/object/sign/image/arwipLogo%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMDllMzQzNy0zMDk4LTRhOTctYmUwMy03Njg5YzYyMGYxODEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28gKDEpLnBuZyIsImlhdCI6MTc3MzU3OTA0NiwiZXhwIjoxODA1MTE1MDQ2fQ.LQOV5fqAv3TICvAUGW0mqTm3YiUO67OrfIHU0m7onHI"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        // หน่วงเวลา 10 วินาที เพื่อสร้างบรรยากาศระบบความปลอดภัย
        setTimeout(() => {
          if (session) {
            router.replace('/dashboard')
          } else {
            router.replace('/login')
          }
        }, 10000);

      } catch (error) {
        console.error('Auth error:', error)
        setTimeout(() => router.replace('/login'), 10000);
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* 🌌 Ambient Background Glow - ขยายรัศมีแสงให้กว้างขึ้น */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-500/10 blur-[200px] rounded-full"></div>

      <div className="text-center space-y-16 relative z-10">
        
        {/* 🚩 Huge Logo Section - No Border */}
        <div className="relative inline-flex flex-col items-center">
          
          <div className="relative mb-12 group animate-mega-float">
            {/* รัศมีแสงด้านหลัง (Aura) ช่วยขับให้โลโก้มองเห็นชัดบนพื้นหลังสว่าง */}
            
            {/* 🖼️ Logo ใหม่ขนาดใหญ่พิเศษ */}
            <img 
              src={logoUrl} 
              alt="ARWIP Logo" 
              className="w-1500 h-96 object-contain drop-shadow-[0_25px_10px_rgba(0,0,0,0.25)] transition-transform duration-1000 group-hover:scale-110"
            />
          </div>
          
          {/* Typography Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                AI-Powered Retail & Warehouse
              </h1>
              <p className="text-indigo-600 font-black text-xl md:text-2xl uppercase tracking-[0.15em] italic">
                Management System
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] ml-[0.6em]">
                Integrated Installment Payment
              </p>
              <div className="h-[4px] w-32 bg-gradient-to-r from-transparent via-indigo-600 to-transparent rounded-full opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Status Loading Section */}
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 px-12 py-6 bg-white/40 backdrop-blur-xl rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 transition-all hover:bg-white/80">
            <Loader2 size={26} className="animate-spin text-indigo-600" />
            <span className="text-[15px] font-black text-slate-800 uppercase tracking-[0.3em]">
              Securing Neural Interface...
            </span>
          </div>
        </div>
      </div>

      {/* ⏳ Bottom Progress Bar (10 Seconds) */}
      <div className="fixed bottom-16 flex flex-col items-center gap-4 w-full max-w-[450px] px-10">
         <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <div className="h-full bg-indigo-600 animate-progress shadow-[0_0_20px_rgba(79,70,229,0.8)]"></div>
         </div>
         <div className="flex justify-between w-full text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] px-2">
            <span className="animate-pulse">Analyzing...</span>
            <span className="text-indigo-500">v3.0.01</span>
         </div>
      </div>

      <style jsx>{`
        @keyframes mega-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(2deg); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-mega-float {
          animation: mega-float 7s ease-in-out infinite;
        }
        .animate-progress {
          animation: progress 10s linear forwards;
        }
      `}</style>
    </div>
  )
}