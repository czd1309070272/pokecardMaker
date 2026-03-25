
import { ElementType, TrainerType } from '../types';

// Helper for energy background colors (Vibrant)
export const getEnergyColor = (type: ElementType): string => {
    switch (type) {
        case ElementType.Grass: return '#5FBD58'; 
        case ElementType.Fire: return '#F08030'; 
        case ElementType.Water: return '#539DDF'; 
        case ElementType.Lightning: return '#F8D030'; 
        case ElementType.Psychic: return '#FA92B2'; 
        case ElementType.Fighting: return '#D04164'; 
        case ElementType.Darkness: return '#5A5366'; 
        case ElementType.Metal: return '#B7B7CE'; 
        case ElementType.Fairy: return '#EE99AC'; 
        case ElementType.Dragon: return '#C2A84F'; 
        case ElementType.Ice: return '#78DEE0';
        case ElementType.Poison: return '#A040A0';
        case ElementType.Ground: return '#E0C068';
        case ElementType.Flying: return '#A890F0';
        case ElementType.Bug: return '#A8B820';
        case ElementType.Rock: return '#B8A038';
        case ElementType.Ghost: return '#705898';
        case ElementType.Colorless: return '#E0E0E0';
        default: return '#E0E0E0';
    }
};

// Helper for Trainer Type Colors
export const getTrainerColor = (type?: TrainerType): string => {
    switch (type) {
        case TrainerType.Supporter: return '#ef4444'; // Red/Orange
        case TrainerType.Item: return '#3b82f6'; // Blue
        case TrainerType.Stadium: return '#22c55e'; // Green
        case TrainerType.Tool: return '#a855f7'; // Purple
        default: return '#3b82f6';
    }
};

// Helper for effect colors
export const getTypeColorHex = (type: ElementType): string => {
    switch (type) {
        case ElementType.Fire: return '#ef4444';
        case ElementType.Grass: return '#22c55e';
        case ElementType.Water: return '#3b82f6';
        case ElementType.Lightning: return '#eab308';
        case ElementType.Psychic: return '#a855f7';
        case ElementType.Fighting: return '#c2410c';
        case ElementType.Darkness: return '#1f2937';
        case ElementType.Metal: return '#9ca3af';
        case ElementType.Fairy: return '#f472b6';
        case ElementType.Dragon: return '#ca8a04';
        case ElementType.Ice: return '#22d3ee';
        case ElementType.Poison: return '#d946ef';
        case ElementType.Ground: return '#a16207';
        case ElementType.Flying: return '#60a5fa';
        case ElementType.Bug: return '#84cc16';
        case ElementType.Rock: return '#78716c';
        case ElementType.Ghost: return '#4f46e5';
        case ElementType.Colorless: return '#d1d5db';
        default: return '#ffffff';
    }
};

export const getTypeTheme = (type: ElementType) => {
    const themes: Record<ElementType, { boxGradient: string, footerGradient: string, textColor: string, subTextColor: string }> = {
        [ElementType.Grass]: { boxGradient: 'bg-gradient-to-b from-green-600/90 to-green-700/90', footerGradient: 'bg-gradient-to-t from-green-600 to-transparent', textColor: 'text-white', subTextColor: 'text-green-100' },
        [ElementType.Fire]: { boxGradient: 'bg-gradient-to-b from-orange-600/90 to-red-600/90', footerGradient: 'bg-gradient-to-t from-red-600 to-transparent', textColor: 'text-white', subTextColor: 'text-orange-100' },
        [ElementType.Water]: { boxGradient: 'bg-gradient-to-b from-blue-600/90 to-blue-800/90', footerGradient: 'bg-gradient-to-t from-blue-700 to-transparent', textColor: 'text-white', subTextColor: 'text-blue-100' },
        [ElementType.Lightning]: { boxGradient: 'bg-gradient-to-b from-yellow-400/90 to-yellow-500/90', footerGradient: 'bg-gradient-to-t from-yellow-500 to-transparent', textColor: 'text-black', subTextColor: 'text-yellow-900' },
        [ElementType.Psychic]: { boxGradient: 'bg-gradient-to-b from-purple-600/90 to-purple-800/90', footerGradient: 'bg-gradient-to-t from-purple-700 to-transparent', textColor: 'text-white', subTextColor: 'text-purple-100' },
        [ElementType.Fighting]: { boxGradient: 'bg-gradient-to-b from-orange-700/90 to-amber-800/90', footerGradient: 'bg-gradient-to-t from-orange-800 to-transparent', textColor: 'text-white', subTextColor: 'text-orange-100' },
        [ElementType.Darkness]: { boxGradient: 'bg-gradient-to-b from-gray-800/90 to-black/90', footerGradient: 'bg-gradient-to-t from-gray-900 to-transparent', textColor: 'text-white', subTextColor: 'text-gray-300' },
        [ElementType.Metal]: { boxGradient: 'bg-gradient-to-b from-gray-400/90 to-gray-500/90', footerGradient: 'bg-gradient-to-t from-gray-500 to-transparent', textColor: 'text-black', subTextColor: 'text-gray-800' },
        [ElementType.Fairy]: { boxGradient: 'bg-gradient-to-b from-pink-400/90 to-pink-600/90', footerGradient: 'bg-gradient-to-t from-pink-500 to-transparent', textColor: 'text-white', subTextColor: 'text-pink-100' },
        [ElementType.Dragon]: { boxGradient: 'bg-gradient-to-b from-[#C4A484]/90 to-[#8B7355]/90', footerGradient: 'bg-gradient-to-t from-[#8B7355] to-transparent', textColor: 'text-white', subTextColor: 'text-yellow-100' },
        [ElementType.Ice]: { boxGradient: 'bg-gradient-to-b from-cyan-400/90 to-cyan-600/90', footerGradient: 'bg-gradient-to-t from-cyan-500 to-transparent', textColor: 'text-black', subTextColor: 'text-cyan-900' },
        [ElementType.Poison]: { boxGradient: 'bg-gradient-to-b from-fuchsia-600/90 to-fuchsia-800/90', footerGradient: 'bg-gradient-to-t from-fuchsia-700 to-transparent', textColor: 'text-white', subTextColor: 'text-fuchsia-100' },
        [ElementType.Ground]: { boxGradient: 'bg-gradient-to-b from-yellow-700/90 to-yellow-800/90', footerGradient: 'bg-gradient-to-t from-yellow-800 to-transparent', textColor: 'text-white', subTextColor: 'text-yellow-100' },
        [ElementType.Flying]: { boxGradient: 'bg-gradient-to-b from-blue-300/90 to-blue-400/90', footerGradient: 'bg-gradient-to-t from-blue-400 to-transparent', textColor: 'text-black', subTextColor: 'text-blue-900' },
        [ElementType.Bug]: { boxGradient: 'bg-gradient-to-b from-lime-500/90 to-lime-600/90', footerGradient: 'bg-gradient-to-t from-lime-600 to-transparent', textColor: 'text-black', subTextColor: 'text-lime-900' },
        [ElementType.Rock]: { boxGradient: 'bg-gradient-to-b from-stone-500/90 to-stone-600/90', footerGradient: 'bg-gradient-to-t from-stone-600 to-transparent', textColor: 'text-white', subTextColor: 'text-stone-100' },
        [ElementType.Ghost]: { boxGradient: 'bg-gradient-to-b from-indigo-600/90 to-indigo-800/90', footerGradient: 'bg-gradient-to-t from-indigo-700 to-transparent', textColor: 'text-white', subTextColor: 'text-indigo-100' },
        [ElementType.Colorless]: { boxGradient: 'bg-gradient-to-b from-gray-200/90 to-gray-300/90', footerGradient: 'bg-gradient-to-t from-gray-300 to-transparent', textColor: 'text-black', subTextColor: 'text-gray-700' },
    };
    return themes[type] || themes[ElementType.Colorless];
};
