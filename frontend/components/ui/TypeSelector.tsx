
import React from 'react';
import { ElementType } from '../../types';
import { EnergyIcon } from '../Icons';

export const TypeSelector = React.memo(({ label, value, onChange, includeNone = false }: { label: string, value: ElementType | undefined, onChange: (val: ElementType | undefined) => void, includeNone?: boolean }) => {
    const getTypeStyles = (type: ElementType | undefined) => {
        if (!type) return 'bg-gray-700 text-white';
        switch (type) {
            case ElementType.Fire: return 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)] border-orange-400';
            case ElementType.Grass: return 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)] border-green-500';
            case ElementType.Water: return 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] border-blue-400';
            case ElementType.Lightning: return 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.6)] border-yellow-400';
            case ElementType.Psychic: return 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)] border-purple-500';
            case ElementType.Fighting: return 'bg-orange-700 text-white shadow-[0_0_15px_rgba(194,65,12,0.6)] border-orange-600';
            case ElementType.Darkness: return 'bg-gray-800 text-white shadow-[0_0_15px_rgba(31,41,55,0.6)] border-gray-600';
            case ElementType.Metal: return 'bg-gray-400 text-white shadow-[0_0_15px_rgba(156,163,175,0.6)] border-gray-300';
            case ElementType.Fairy: return 'bg-pink-400 text-white shadow-[0_0_15px_rgba(244,114,182,0.6)] border-pink-300';
            case ElementType.Dragon: return 'bg-yellow-700 text-white shadow-[0_0_15px_rgba(161,98,7,0.6)] border-yellow-600';
            case ElementType.Colorless: return 'bg-gray-300 text-gray-800 shadow-[0_0_15px_rgba(209,213,219,0.6)] border-gray-200';
            default: return 'bg-gray-700 text-white';
        }
    };

    return (
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</label>
        <div className="bg-[#050608] p-3 rounded-2xl border border-gray-800 grid grid-cols-6 gap-2">
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
                    title="None"
                >
                    <span className="text-xs font-bold">✕</span>
                </button>
            )}
            {Object.values(ElementType).map((type) => {
                const isSelected = value === type;
                return (
                    <button
                        key={type}
                        onClick={() => onChange(type)}
                        className={`
                            h-12 w-full rounded-lg flex items-center justify-center transition-all duration-200 group relative active:scale-95
                            ${isSelected 
                              ? `${getTypeStyles(type)} scale-105 z-10` 
                              : 'bg-[#1f2937] text-gray-500 border border-transparent hover:bg-gray-700 hover:text-gray-300 hover:scale-105'
                            }
                        `}
                        title={type}
                    >
                        <EnergyIcon type={type} size={20} flat className={isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                    </button>
                )
            })}
        </div>
      </div>
    );
});
