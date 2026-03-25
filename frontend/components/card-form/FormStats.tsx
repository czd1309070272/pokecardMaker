
import React from 'react';
import { CardData, Supertype } from '../../types';
import { InputField } from '../ui/FormControls';
import { TypeSelector } from '../ui/TypeSelector';
import { StatsIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormStatsProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
}

export const FormStats: React.FC<FormStatsProps> = ({ data, onChange }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800 pb-2">
                <StatsIcon className="w-5 h-5 text-blue-400" />
                {t('tab.stats')}
            </div>

            {data.supertype === Supertype.Pokemon ? (
                    <div className="grid grid-cols-1 gap-4">
                    <TypeSelector 
                        label={t('label.weakness')}
                        value={data.weakness}
                        onChange={(v) => onChange('weakness', v)}
                        includeNone
                    />
                    <TypeSelector 
                        label={t('label.resistance')}
                        value={data.resistance}
                        onChange={(v) => onChange('resistance', v)}
                        includeNone
                    />
                        <InputField 
                        label={t('label.retreat')}
                        type="number"
                        value={data.retreatCost} 
                        onChange={(v: any) => onChange('retreatCost', parseInt(v))} 
                    />
                    </div>
            ) : (
                <div className="p-4 bg-gray-800/50 rounded-lg text-center text-sm text-gray-500">
                    No stats available for this card type.
                </div>
            )}
        </div>
    );
};
