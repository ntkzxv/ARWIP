'use client'
import Sidebar from '../../components/SidebarWarehouse'

export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[100dvh] w-full bg-[#F4F7FE] relative overflow-x-hidden font-sans">
      <Sidebar />
      <main className="flex-1 h-full min-w-0 overflow-y-auto bg-[#F4F7FE] custom-scrollbar">
        <div className="min-h-full w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-10 text-slate-900">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 0, 0, 0.08); 
          border-radius: 20px; 
        }
      `}</style>
    </div>
  )
}