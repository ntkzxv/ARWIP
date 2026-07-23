'use client'
import Sidebar from '../../components/SidebarWarehouse'

export default function DatacenterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-[#F4F7FE] relative overflow-hidden font-sans">
      
      {/* Sidebar: ล็อคความสูงเต็มจอ ไม่เลื่อนตามเนื้อหา */}
      <Sidebar />

      {/* Main Content: เลื่อนแยกอิสระ และพื้นหลังคลุมเต็มพื้นที่ */}
      <main className="flex-1 h-full overflow-y-auto bg-[#F4F7FE] custom-scrollbar">
        <div className="min-h-full w-full p-4 lg:p-10 text-slate-900">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 0, 0, 0.05); 
          border-radius: 20px; 
        }
      `}</style>
    </div>
  )
}