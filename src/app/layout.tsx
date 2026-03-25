import { Kanit } from 'next/font/google'
import './globals.css'

const kanit = Kanit({ 
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-kanit',
})

export const metadata = {
  title: 'ARWIP SYSTEM',
  description: 'AI-Powered Retail & Warehouse Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      {/* 🚩 ล็อกพฤติกรรม Body ไม่ให้เกิดการเลื่อนแนวนอน และใช้ฟอนต์ Kanit */}
      <body className={`${kanit.variable} font-sans bg-[#F4F7FE] antialiased overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900`}>
        
        {/* 🚩 กล่องครอบระดับ Root:
            1. max-w-[1920px]: ล็อกความกว้างสูงสุดสำหรับจอ Desktop ใหญ่ๆ
            2. mx-auto: จัดกึ่งกลาง
            3. flex flex-col: จัดการโครงสร้างภายในเป็นแนวตั้ง
            4. min-w-0: "หัวใจสำคัญ" ป้องกันคอนเทนต์ดันขอบจนทะลุ (MacBook Fix)
        */}
        <div className="max-w-[1920px] mx-auto min-h-screen relative overflow-x-hidden flex flex-col w-full min-w-0">
           {children}
        </div>

      </body>
    </html>
  )
}