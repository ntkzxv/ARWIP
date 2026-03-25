export default function StockTableSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* ส่วนหัวและสถิติ */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-3">
          <div className="h-12 w-48 bg-slate-200 rounded-2xl"></div>
          <div className="h-3 w-64 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-24 w-80 bg-white border border-slate-100 rounded-[2.5rem]"></div>
      </div>

      {/* ตารางจำลอง */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="h-16 bg-slate-50/50 border-b border-slate-50"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-8 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded-lg"></div>
                <div className="h-3 w-24 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
            <div className="h-8 w-20 bg-slate-100 rounded-xl"></div>
            <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
            <div className="h-12 w-12 bg-slate-50 rounded-2xl"></div>
          </div>
        ))}
      </div>
    </div>
  )
}