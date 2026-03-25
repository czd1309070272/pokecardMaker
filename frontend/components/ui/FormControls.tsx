
import React from 'react';

// --- Input Field ---
export const InputField = React.memo(({ label, value, onChange, type = "text", placeholder = "", className="" }: any) => (
    <div className={className}>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{label}</label>
        <div className="relative group">
            <input 
                type={type}
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full bg-[#050608] border border-gray-800 rounded-lg p-3 text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner placeholder-gray-700 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
            />
        </div>
    </div>
));

// --- Select Field ---
export const SelectField = React.memo(({ label, value, onChange, options }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{label}</label>
        <div className="relative group">
            <select 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="w-full bg-[#050608] border border-gray-800 rounded-lg p-3 text-base sm:text-sm text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-inner cursor-pointer focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-300">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    </div>
));

// --- Text Area ---
export const TextAreaField = React.memo(({ label, value, onChange, placeholder = "", className = "", height = "h-24" }: any) => (
    <div className={className}>
        {label && <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">{label}</label>}
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-[#050608] border border-gray-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none resize-none focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] ${height}`}
        />
    </div>
));

// --- Segmented Control ---
export const SegmentedControl = React.memo(({ value, options, onChange }: { value: string, options: string[], onChange: (val: any) => void }) => (
      <div className="grid grid-flow-col auto-cols-fr gap-1 p-1 bg-[#050608] rounded-xl border border-gray-800 mb-6 shadow-sm">
          {options.map((opt) => {
              const isActive = value === opt;
              return (
                  <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`py-2 px-1 rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 relative overflow-hidden whitespace-nowrap active:scale-95 truncate
                        ${isActive 
                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/50' 
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                        }
                    `}
                    title={opt}
                  >
                      {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />}
                      {opt}
                  </button>
              )
          })}
      </div>
));
