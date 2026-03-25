
import React from 'react';
import { CardData, Supertype, Subtype, ElementType, TrainerType, INITIAL_CARD_DATA } from '../../types';
import { InputField, SelectField, SegmentedControl } from '../ui/FormControls';
import { TypeSelector } from '../ui/TypeSelector';
import { SparklesIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormBasicsProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    handleSupertypeChange: (type: Supertype) => void;
}

export const FormBasics: React.FC<FormBasicsProps> = ({ data, onChange, handleSupertypeChange }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 pb-2">
                <SparklesIcon className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                <h2 className="text-xl font-bold text-white font-heading tracking-tight">Basic Information</h2>
            </div>

            <SegmentedControl 
                value={data.supertype}
                options={Object.values(Supertype)}
                onChange={(v) => handleSupertypeChange(v)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <InputField 
                    label={t('label.cardname')}
                    value={data.name} 
                    onChange={(v: any) => onChange('name', v)} 
                    placeholder="e.g. Charizard"
                    className="sm:col-span-3"
                />
                {data.supertype === Supertype.Pokemon && (
                    <InputField 
                        label={t('label.hp')}
                        type="number"
                        value={data.hp} 
                        onChange={(v: any) => onChange('hp', v)} 
                        placeholder="330"
                        className="sm:col-span-2"
                    />
                )}
            </div>

            {data.supertype === Supertype.Pokemon && (
                <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField 
                            label={t('label.subtype')}
                            value={data.subtype} 
                            onChange={(v: any) => onChange('subtype', v)} 
                            options={Object.values(Subtype)}
                        />
                        {(data.subtype === Subtype.Stage1 || data.subtype === Subtype.Stage2) && (
                            <InputField 
                                label={t('label.evolves')}
                                value={data.evolvesFrom} 
                                onChange={(v: any) => onChange('evolvesFrom', v)} 
                                placeholder="e.g. Charmander"
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
                        placeholder="Flame Pokémon"
                    />
                </>
            )}

            {data.supertype === Supertype.Trainer && (
                    <SelectField 
                    label={t('label.trainertype')}
                    value={data.trainerType || TrainerType.Item} 
                    onChange={(v: any) => onChange('trainerType', v)} 
                    options={Object.values(TrainerType)}
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
