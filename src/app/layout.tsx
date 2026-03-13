// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// ✅ เพิ่ม Metadata กลับมาได้ตรงนี้เลย
export const metadata = {
  title: 'ARWIP SYSTEM',
  description: 'AI-Powered Retail & Warehouse Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}