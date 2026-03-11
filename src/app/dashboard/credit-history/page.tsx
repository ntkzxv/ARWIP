'use client'
import { History, BrainCircuit, TrendingUp, Info } from 'lucide-react'

export default function CreditHistoryPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="bg-white/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
            AI Engine v4.0 Active
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Customer Credit Intelligence</h1>
          <p className="text-blue-100/80 font-medium leading-relaxed">
            ระบบวิเคราะห์พฤติกรรมการจ่ายและคะแนนเครดิตเพื่อใช้ประกอบการตัดสินใจในการอนุมัติสินเชื่อ
          </p>
        </div>
        <BrainCircuit className="absolute -right-10 -bottom-10 text-white/5" size={300} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[35px] border border-slate-50 shadow-sm">
          <h3 className="font-black text-slate-800 flex items-center gap-3 mb-6">
            <TrendingUp size={20} className="text-emerald-500" /> Credit Score Factors
          </h3>
          <div className="space-y-4">
            <FactorItem label="Payment Punctuality" percent={85} />
            <FactorItem label="Installment History" percent={60} />
            <FactorItem label="Debt-to-Income Ratio" percent={45} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-slate-50 shadow-sm flex items-center justify-center">
            <div className="text-center text-slate-300 italic font-medium">
               <Info className="mx-auto mb-2" size={24} />
               กำลังประมวลผล Dataset ล่าสุดจาก AI...
            </div>
        </div>
      </div>
    </div>
  )
}

function FactorItem({ label, percent }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}