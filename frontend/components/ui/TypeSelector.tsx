
import React from 'react';
import { ElementType } from '../../types';
import { EnergyIcon } from '../Icons';
import { getAttributeLabel, getAttributeTheme } from '../../lib/attributes';
import { useLanguage } from '../../contexts/LanguageContext';

export const TypeSelector = React.memo(({ label, value, onChange, includeNone = false }: { label: string, value: ElementType | undefined, onChange: (val: ElementType | undefined) => void, includeNone?: boolean }) => {
    const { t, language } = useLanguage();
    return (
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</label>
        <div className="bg-[#050608] p-3 rounded-2xl border border-gray-800 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {includeNone && (
                <button
                    onClick={() => onChange(undefined)}
                    className={`
                        h-12 w-full rounded-lg flex items-center justify-center transition-all border active:scale-95
                        ${!value 
                            ? 'border-blue-500 bg-gray-800 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                            : 'border-transparent bg-gray-700/50 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                        }
                    `}
                    title={t('form.none')}
                >
                    <span className="text-xs font-bold">✕</span>
                </button>
            )}
            {Object.values(ElementType).map((type) => {
                const isSelected = value === type;
                const theme = getAttributeTheme(type);
                return (
                    <button
                        key={type}
                        onClick={() => onChange(type)}
                        className={`
                            min-h-[56px] w-full rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200 group relative active:scale-95 border px-1 py-2
                            ${isSelected ? 'scale-105 z-10' : 'bg-[#1f2937] text-gray-400 border-transparent hover:bg-gray-700 hover:text-gray-100 hover:scale-105'}
                        `}
                        style={isSelected ? {
                            background: theme.selectorBg,
                            color: theme.textColor,
                            borderColor: theme.selectorBorder,
                            boxShadow: `0 0 15px ${theme.glow}`,
                        } : undefined}
                        title={getAttributeLabel(type, language)}
                    >
                        <EnergyIcon type={type} size={20} flat className={isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                        <span className="text-[9px] font-bold leading-none">{getAttributeLabel(type, language)}</span>
                    </button>
                )
            })}
        </div>
      </div>
    );
});
