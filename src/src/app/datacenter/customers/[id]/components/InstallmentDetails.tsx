'use client'
import { useState } from 'react'
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, 
  Receipt, ArrowLeft, Layers, ShoppingBag, 
  Hash, ArrowRight, Banknote, Box, ChevronRight
} from 'lucide-react'
import PaymentDetailModal from '../../../../../components/PaymentDetailModal' 

export default function InstallmentDetails({ contracts, customerName }: { contracts: any[], customerName?: string }) {
  const [activeContractId, setActiveContractId] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🚩 ฟังก์ชันเปิด Modal
  const handleOpenModal = (payment: any, contract: any) => {
    const checkStatus = () => {
      if (payment.status === 'paid' || payment.status === 'completed' || !!payment.paid_at) {
        return 'paid';
      }
      return 'pending';
    };

    const enrichedData = {
      ...payment,
      status: checkStatus(), 
      customer_name: customerName || 'ไม่ระบุชื่อลูกค้า',
      customer_id: contract.customer_id, 
      product_id: contract.sales_transactions?.product_id || 'N/A'
    };
    
    setSelectedBill(enrichedData);
    setIsModalOpen(true);
  };

  // --- 🟢 หน้าที่ 2: รายการบิลย่อย (เมื่อคลิกเลือกสัญญาแล้ว) ---
  if (activeContractId) {
    const selectedContract = contracts.find(c => c.id === activeContractId);
    if (!selectedContract) return null;

    const sale = selectedContract?.sales_transactions || {};
    const payments = selectedContract?.installment_payments || [];

    const totalPaidAmount = payments
      .filter((p: any) => p.status === 'paid' || !!p.paid_at)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const totalContractAmount = Number(selectedContract.total_purchase_price || 0);

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500">
        <div className="py-6 px-2 mb-4">
          <button 
            onClick={() => setActiveContractId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase transition-all mb-8"
          >
            <ArrowLeft size={16} /> กลับหน้าสรุปสัญญา
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex gap-6 items-center">
               <div className="w-16 h-16 bg-black text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                  <Box size={28} />
               </div>
               <div className="w-[2px] h-12 bg-slate-100 hidden md:block"></div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Product Details</span>
                    <span className="text-[10px] font-bold text-slate-300">|</span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Hash size={12}/> {selectedContract.id.slice(0,8).toUpperCase()}</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                      {sale.product_name || 'ไม่ระบุชื่อสินค้า'}
                  </h2>
               </div>
            </div>

            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ยอดชำระสุทธิ (จ่ายแล้ว / ทั้งหมด)</p>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-3xl font-black text-slate-700 tracking-tighter">
                    ฿{totalPaidAmount.toLocaleString()}
                  </span>
                  <span className="text-xl font-black text-slate-200">/</span>
                  <span className="text-xl font-black text-slate-400 tracking-tighter">
                    ฿{totalContractAmount.toLocaleString()}
                  </span>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {payments.sort((a: any, b: any) => a.installment_number - b.installment_number).map((item: any) => {
            const isPaid = item.status === 'paid' || item.status === 'completed' || !!item.paid_at;
            const isLate = isPaid && item.paid_at && item.due_date && new Date(item.paid_at).setHours(0,0,0,0) > new Date(item.due_date).setHours(0,0,0,0);
            const isOverdue = !isPaid && new Date(item.due_date) < new Date(new Date().setHours(0,0,0,0));

            const statusStyles = isPaid 
              ? 'border-emerald-100 bg-emerald-50/10 hover:border-emerald-500' 
              : isOverdue 
                ? 'border-red-100 bg-red-50/10 hover:border-red-500' 
                : 'border-amber-100 bg-amber-50/10 hover:border-amber-500';

            const priceColor = isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-500' : 'text-amber-600';

            return (
              <div 
                key={item.id} 
                onClick={() => handleOpenModal(item, selectedContract)}
                className={`flex items-center justify-between p-7 rounded-[40px] border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${statusStyles}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                    isPaid ? 'bg-emerald-500 text-white' : isOverdue ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-white'
                  }`}>
                    {item.installment_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isOverdue ? 'เกินกำหนดชำระ' : isPaid ? 'ชำระเรียบร้อย' : 'กำหนดชำระ'}: {new Date(item.due_date).toLocaleDateString('th-TH')}
                      </p>
                      {isLate && (
                          <span className="px-3 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded-full border border-rose-200 uppercase tracking-tighter">
                            ชำระล่าช้า
                          </span>
                        )}
                      </div>
                    <p className={`text-xl font-black tracking-tighter ${priceColor}`}>
                      ฿{Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    {isPaid ? (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                          ชำระเรียบร้อย
                        </p>
                        {item.paid_at && (
                          <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                            เมื่อ: {new Date(item.paid_at).toLocaleDateString('th-TH', {day:'numeric', month:'short', year:'2-digit'})}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-500' : 'text-amber-600'}`}>
                        {isOverdue ? 'เกินกำหนด' : 'รอชำระ'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center pr-2">
                    {isPaid ? (
                      <CheckCircle2 size={26} className="text-emerald-500" />
                    ) : isOverdue ? (
                      <AlertCircle size={26} className="text-red-500 animate-pulse" />
                    ) : (
                      <Clock size={26} className="text-amber-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <PaymentDetailModal item={selectedBill} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    );
  }

  // --- 🔵 หน้าที่ 1: หน้าสรุป (Card View) ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500">   
      <div className="flex justify-between items-end px-2 mb-6">
        <div className="space-y-1"></div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[12px] font-black text-indigo-600 uppercase tracking-widest">
            {contracts.filter((c: any) => c.contract_status !== 'completed').length} จำนวนดำเนิดการ
            </span>
            <span className="text-[12px] font-black text-slate-500">/</span>
            <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
            {contracts.length} จำนวนทั้งหมด
            </span>
        </div>
      </div>
      {contracts.length > 0 ? (
        contracts.map((contract: any) => {
          const sale = contract?.sales_transactions || {};
          const payments = contract?.installment_payments || [];
          
          const paidCount = payments.filter((p: any) => p.status === 'paid').length;
          const totalCount = payments.length;
          const isCompleted = contract.contract_status === 'completed';
          const overdueCount = payments.filter((p: any) => new Date(p.due_date) < new Date() && p.status !== 'paid').length;

          const totalPaidAmount = payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0);
          const totalContractAmount = Number(contract.total_purchase_price || 0);

          let statusTheme = {
            bag: "bg-indigo-600 shadow-indigo-100",
            text: "text-indigo-500",
            title: "text-slate-900", 
            border: "border-slate-50",
            badge: "bg-indigo-50 border-indigo-200 text-indigo-600",
            hover: "hover:border-indigo-500",
            amount: "text-indigo-600",
            label: "สถานะปกติ"
          };

          if (overdueCount > 0) {
            statusTheme = {
              bag: "bg-red-500 shadow-red-100 animate-pulse", 
              text: "text-red-500",
              title: "text-red-500",
              border: "border-red-100 shadow-red-50/50",
              badge: "bg-red-50 border-red-200 text-red-500 animate-pulse", 
              hover: "hover:border-red-500",
              amount: "text-red-500",
              label: `ค้างชำระ ${overdueCount} งวด`
            };
          } else if (isCompleted) {
            statusTheme = {
              bag: "bg-slate-400 shadow-slate-100",
              text: "text-slate-400",
              title: "text-slate-400",
              border: "border-slate-100 grayscale",
              badge: "bg-slate-50 border-slate-200 text-slate-400",
              hover: "hover:border-slate-400",
              amount: "text-slate-400",
              label: "ปิดยอดแล้ว"
            };
          }

          return (
            <div 
              key={contract.id} 
              onClick={() => setActiveContractId(contract.id)} 
              className={`group relative bg-white rounded-[45px] border-2 p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${statusTheme.border} ${statusTheme.hover}`}
            >
              <div className="flex justify-between items-start relative z-10 border-b border-slate-50 pb-8">
                <div className="flex gap-5 items-center">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-lg ${statusTheme.bag}`}>
                    <ShoppingBag size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusTheme.text}`}>
                        {isCompleted ? 'Finished Contract' : 'Installment Plan'}
                    </p>
                    <h2 className={`text-2xl font-black uppercase tracking-tighter transition-colors ${statusTheme.title}`}>
                      {sale.product_name || 'ไม่ระบุชื่อสินค้า'}
                    </h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5"><Calendar size={13}/> {sale.created_at ? new Date(sale.created_at).toLocaleDateString('th-TH') : '-'}</span>
                      <span className="flex items-center gap-1.5"><Hash size={13}/> {contract.id.slice(0,8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-2 transition-all ${statusTheme.badge}`}>
                  {statusTheme.label}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Banknote size={14} className={statusTheme.text}/> ยอดชำระรวม (จ่ายแล้ว / ทั้งหมด)
                   </p>
                   <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-4xl font-black tracking-tighter ${statusTheme.amount}`}>
                        ฿{totalPaidAmount.toLocaleString()}
                      </span>
                      <span className="text-2xl font-black text-slate-200">/</span>
                      <span className="text-2xl font-black text-slate-400 tracking-tighter">
                        ฿{totalContractAmount.toLocaleString()}
                      </span>
                   </div>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-end items-center gap-2">
                      <Layers size={14} className={statusTheme.text}/> ความคืบหน้า (งวด)
                  </p>
                  <p className="text-4xl font-black tracking-tighter">
                      <span className={`${isCompleted ? 'text-slate-400' : overdueCount > 0 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                        {paidCount}
                      </span>
                      <span className="text-lg text-slate-200 mx-1">/</span>
                      <span className={isCompleted ? 'text-slate-400' : 'text-slate-300'}>
                        {totalCount}
                      </span>
                      <span className="text-base font-bold text-slate-400 ml-2 uppercase">งวด</span>
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><Clock size={14}/> คลิกเพื่อตรวจสอบบิลรายงวด</span>
                  </div>
                  <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-widest ${statusTheme.text}`}>
                      ดูรายละเอียดบิล <ArrowRight size={18} />
                  </div>
              </div>
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 transition-colors opacity-10 ${overdueCount > 0 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            </div>
          );
        })
      ) : (
        <div className="p-20 text-center bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-200">
           <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-slate-400 font-black uppercase tracking-[0.2em]">ไม่มีประวัติการเช่าซื้อ</p>
        </div>
      )}
    </div>
  );
}