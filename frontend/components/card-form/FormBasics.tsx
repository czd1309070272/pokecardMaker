
import React from 'react';
import { CardData, Supertype, Subtype, TrainerType } from '../../types';
import { InputField, SelectField, SegmentedControl } from '../ui/FormControls';
import { TypeSelector } from '../ui/TypeSelector';
import { SparklesIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSubtypeLabel } from '../../lib/subtype';

interface FormBasicsProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    handleSupertypeChange: (type: Supertype) => void;
}

export const FormBasics: React.FC<FormBasicsProps> = ({ data, onChange, handleSupertypeChange }) => {
    const { t, language } = useLanguage();
    const supertypeOptions = [
        { value: Supertype.Pokemon, label: t('supertype.pokemon') },
        { value: Supertype.Trainer, label: t('supertype.trainer') },
        { value: Supertype.Energy, label: t('supertype.energy') },
    ];
    const subtypeOptions = [
        { value: Subtype.Basic, label: getSubtypeLabel(Subtype.Basic, language) },
        { value: Subtype.Stage1, label: getSubtypeLabel(Subtype.Stage1, language) },
        { value: Subtype.Stage2, label: getSubtypeLabel(Subtype.Stage2, language) },
        { value: Subtype.VMAX, label: getSubtypeLabel(Subtype.VMAX, language) },
        { value: Subtype.Radiant, label: getSubtypeLabel(Subtype.Radiant, language) },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 pb-2">
                <SparklesIcon className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                <h2 className="text-xl font-bold text-white font-heading tracking-tight">{t('form.basics_title')}</h2>
            </div>

            <SegmentedControl 
                value={data.supertype}
                options={supertypeOptions}
                onChange={(v) => handleSupertypeChange(v)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <InputField 
                    label={t('label.cardname')}
                    value={data.name} 
                    onChange={(v: any) => onChange('name', v)} 
                    placeholder={t('placeholder.cardname_gutter')}
                    className="sm:col-span-3"
                />
                {data.supertype === Supertype.Pokemon && (
                    <InputField 
                        label={t('label.pressure')}
                        type="number"
                        value={data.hp} 
                        onChange={(v: any) => onChange('hp', v)} 
                        placeholder={t('placeholder.pressure')}
                        className="sm:col-span-2"
                    />
                )}
            </div>

            {data.supertype === Supertype.Pokemon && (
                <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField 
                            label={t('label.subtype_gutter')}
                            value={data.subtype} 
                            onChange={(v: any) => onChange('subtype', v)} 
                            options={subtypeOptions}
                        />
                        {(data.subtype === Subtype.Stage1 || data.subtype === Subtype.Stage2) && (
                            <InputField 
                                label={t('label.previous_form')}
                                value={data.evolvesFrom} 
                                onChange={(v: any) => onChange('evolvesFrom', v)} 
                                placeholder={t('placeholder.previous_form')}
                            />
                        )}
                    </div>

                    <TypeSelector 
                        label={t('label.type')}
                        value={data.type}
                        onChange={(v) => v && onChange('type', v)}
                    />

                    <InputField 
                        label={t('label.species')}
                        value={data.dexSpecies} 
                        onChange={(v: any) => onChange('dexSpecies', v)} 
                        placeholder={t('placeholder.species_gutter')}
                    />
                </>
            )}

            {data.supertype === Supertype.Trainer && (
                <SelectField 
                    label={t('label.trainertype')}
                    value={data.trainerType || TrainerType.Item} 
                    onChange={(v: any) => onChange('trainerType', v)} 
                    options={[
                        { value: TrainerType.Item, label: t('trainer.item') },
                        { value: TrainerType.Supporter, label: t('trainer.supporter') },
                        { value: TrainerType.Stadium, label: t('trainer.stadium') },
                        { value: TrainerType.Tool, label: t('trainer.tool') },
                    ]}
                />
            )}

            {data.supertype === Supertype.Energy && (
                <TypeSelector 
                    label={t('label.type')}
                    value={data.type}
                    onChange={(v) => v && onChange('type', v)}
                />
            )}
        </div>
    );
};
