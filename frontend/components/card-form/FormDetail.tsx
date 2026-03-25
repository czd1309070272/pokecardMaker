
import React, { useState } from 'react';
import { CardData, Rarity, Supertype } from '../../types';
import { InputField, SelectField, TextAreaField } from '../ui/FormControls';
import { DetailIcon, RobotIcon } from '../Icons';
import { generateDexEntry } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormDetailProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    user: any;
    onLoginRequired: () => void;
    addNotification: (type: 'success' | 'error', msg: string) => void;
}

export const FormDetail: React.FC<FormDetailProps> = ({ data, onChange, user, onLoginRequired, addNotification }) => {
    const { t } = useLanguage();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateDexEntry = async () => {
        if (!user) { onLoginRequired(); return; }
        if(isGenerating) return;
        setIsGenerating(true);
        try {
            const entry = await generateDexEntry(data.name, data.dexSpecies || 'Pokemon');
            onChange('pokedexEntry', entry);
            addNotification('success', 'Dex entry written!');
        } catch (error: any) {
            addNotification('error', error.message || 'Failed to write entry.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800 pb-2">
                <DetailIcon className="w-5 h-5 text-blue-400" />
                Card Info & Details
            </div>

            {data.supertype === Supertype.Energy ? (
                <div className="p-4 bg-gray-800/50 rounded-lg text-center text-sm text-gray-500">
                    No additional details required for Energy cards.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label={t('label.illustrator')}
                            value={data.illustrator} 
                            onChange={(v: any) => onChange('illustrator', v)} 
                        />
                            <SelectField 
                            label={t('label.rarity')} 
                            value={data.rarity} 
                            onChange={(v: any) => onChange('rarity', v)} 
                            options={Object.values(Rarity)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label={t('label.setnum')}
                            value={data.setNumber} 
                            onChange={(v: any) => onChange('setNumber', v)} 
                            placeholder="001/165"
                        />
                            <InputField 
                            label={t('label.regmark')}
                            value={data.regulationMark} 
                            onChange={(v: any) => onChange('regulationMark', v)} 
                            placeholder="G"
                        />
                    </div>

                    <div className="border-t border-gray-800 pt-2 mt-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{t('label.setsymbol')}</label>
                        <div className="flex gap-2 items-center">
                                <button 
                                onClick={() => document.getElementById('setsym-upload')?.click()}
                                className="bg-[#13161b] hover:bg-[#1a1d24] border border-gray-700 rounded-lg py-2 px-4 text-xs text-gray-300 font-bold transition-colors hover:text-white"
                                >
                                    Upload Icon
                                </button>
                                {data.setSymbolImage && (
                                    <button onClick={() => onChange('setSymbolImage', undefined)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                                )}
                                <input 
                                id="setsym-upload" 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if(file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const base64 = event.target?.result as string;
                                            onChange('setSymbolImage', base64);
                                            addNotification('success', 'Set symbol updated!');
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                />
                        </div>
                    </div>
                    
                    {data.supertype === Supertype.Pokemon && (
                        <>
                                <div className="border-t border-gray-800 pt-2 mt-2">
                                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Dex Stats</div>
                                <div className="grid grid-cols-3 gap-2">
                                        <InputField 
                                        label="Species"
                                        value={data.dexSpecies} 
                                        onChange={(v: any) => onChange('dexSpecies', v)} 
                                        placeholder="Mouse Pokémon"
                                    />
                                    <InputField 
                                        label="Height"
                                        value={data.dexHeight} 
                                        onChange={(v: any) => onChange('dexHeight', v)} 
                                        placeholder="1'04"
                                    />
                                    <InputField 
                                        label="Weight"
                                        value={data.dexWeight} 
                                        onChange={(v: any) => onChange('dexWeight', v)} 
                                        placeholder="13.2 lbs."
                                    />
                                </div>
                                </div>

                                <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                    <span>{t('label.dexentry')}</span>
                                    <button onClick={handleGenerateDexEntry} className="text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:scale-105 transition-transform" title="AI Write">
                                        <RobotIcon className="w-3 h-3" /> AI
                                    </button>
                                </label>
                                <TextAreaField
                                    value={data.pokedexEntry}
                                    onChange={(val: any) => onChange('pokedexEntry', val)}
                                    height="h-24"
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
