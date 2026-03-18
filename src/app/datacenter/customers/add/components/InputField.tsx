import React from 'react'

export function InputField({ label, value, onChange, type = 'text', maxLength, options, placeholder, error }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {type === 'select' ? (
        <select 
          className="w-full p-5 bg-slate-50 rounded-[22px] font-bold text-sm outline-none transition-all shadow-sm border-2 border-transparent focus:border-blue-500" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          maxLength={maxLength} 
          placeholder={placeholder} 
          
          className={`w-full p-5 bg-slate-50 rounded-[22px] border-2 font-bold text-sm outline-none transition-all shadow-inner 
            ${error ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-500'}`} 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
        />
      )}
      {error && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase">{error}</p>}
    </div>
  )
}