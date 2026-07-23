'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  const [isAnimate, setIsAnimate] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  const logoUrl = "https://ypmsrjhflwpdmfrqgupa.supabase.co/storage/v1/object/sign/image/arwipLogo%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ODc1YjdjMy05NjY2LTQyOTEtYjY3Zi04YjVlZTU5NDg4Y2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9hcndpcExvZ28gKDEpLnBuZyIsImlhdCI6MTc3MzgyMzU3NywiZXhwIjoxODA1MzU5NTc3fQ.2iJTOFAEuPTqCigx6qttkv3azCcE5lZlnYeyoZG43Vs"

  useEffect(() => {
    setIsAnimate(true)
    
    // หน่วงเวลาโชว์ Splash Screen
    const timer = setTimeout(() => {
      setIsExiting(true) // 🚩 เริ่มแอนิเมชันตอนออก
      
      setTimeout(() => {
        const savedUserId = localStorage.getItem('current_user_id')
        if (savedUserId) {
          router.replace('/portal')
        } else {
          router.replace('/login')
        }
      }, 1200); // 🚩 ให้เวลา Bloom Exit ทำงานสวยๆ
    }, 2800); 

    return () => clearTimeout(timer)
  }, [router])

  return (
    // 🚩 พื้นหลังมืดสนิท (Slate-950)
    <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      
      {/* 🌌 Main Wrapper: ค่อยๆ จางหายไปแบบ "ระเบิดตัว" (Bloom Exit) */}
      <div className={`relative w-full h-full min-h-screen flex items-center justify-center transition-all duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1)
        ${isExiting ? 'opacity-0 scale-[1.15] blur-xl' : 'opacity-100 scale-100 blur-0'}
      `}>
        
        {/* 🪐 1. Background Mesh Glow: แสงฟุ้งหลายชั้นแก้ปัญหาแสงแตก (Mesh) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
           {/* แสงสีคราม (Indigo) หลัก */}
           <div className={`absolute -top-1/4 -left-1/4 w-full h-full bg-indigo-900/10 blur-[200px] rounded-full transition-all duration-[3000ms] ${isAnimate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
           {/* แสงสีม่วง (Violet) อ่อนๆ */}
           <div className={`absolute -bottom-1/4 -right-1/4 w-full h-full bg-violet-900/5 blur-[200px] rounded-full transition-all duration-[3500ms] delay-500 ${isAnimate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
           {/* แสงสีฟ้า (Cyan) จางๆ ตรงกลาง */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-cyan-950/2 blur-[200px] rounded-full transition-all duration-[2000ms] ${isAnimate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* 🖼️ Logo Section */}
          <div className="relative flex items-center justify-center">
            {/* 🌟 2. Immediate Logo Bloom: แสงฟุ้งตรงโลโก้ ปรับให้เนียนขึ้นมาก */}
            <div className={`absolute w-[400px] h-[400px] bg-indigo-500/15 blur-[160px] rounded-full transition-all duration-[2500ms] ease-out
              ${isAnimate ? 'scale-[2.8] opacity-100' : 'scale-0 opacity-0'}
            `}></div>
            
            <img 
              src={logoUrl} 
              alt="ARWIP Logo" 
              className="w-80 h-auto md:w-[550px] object-contain relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            />
          </div>

          {/* 🔡 Status Message */}
          <div className="mt-20 flex flex-col items-center gap-4">
             <div className={`transition-all duration-1000 delay-800 flex flex-col items-center gap-4
               ${isAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
             `}>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[1.4em] ml-[1.4em]">
                  Neural Link Initializing
                </span>
                <div className="w-44 h-[1px] bg-white/5 relative overflow-hidden rounded-full">
                   <div className="absolute inset-y-0 left-0 bg-indigo-500/60 animate-slow-load rounded-full"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slow-load {
          0% { width: 0%; left: -100%; }
          100% { width: 100%; left: 100%; }
        }
        .animate-slow-load {
          animation: slow-load 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}