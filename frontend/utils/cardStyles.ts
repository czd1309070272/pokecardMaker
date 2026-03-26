
import { ElementType, TrainerType } from '../types';
import { getAttributeTheme } from '../lib/attributes';

// Helper for energy background colors (Vibrant)
export const getEnergyColor = (type: ElementType): string => {
    return getAttributeTheme(type).color;
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
    return getAttributeTheme(type).color;
};

export const getTypeTheme = (type: ElementType) => {
    const theme = getAttributeTheme(type);
    return {
        boxGradient: theme.boxGradient,
        footerGradient: theme.footerGradient,
        textColor: theme.themeTextColor,
        subTextColor: theme.themeSubTextColor,
    };
};
