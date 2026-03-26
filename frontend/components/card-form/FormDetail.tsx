
import React from 'react';
import { CardData, Supertype } from '../../types';
import { InputField, SelectField, TextAreaField } from '../ui/FormControls';
import { DetailIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getRarityOptions, normalizeRarity } from '../../lib/rarity';

interface FormDetailProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    user: any;
    onLoginRequired: () => void;
    addNotification: (type: 'success' | 'error', msg: string) => void;
}

export const FormDetail: React.FC<FormDetailProps> = ({ data, onChange, addNotification }) => {
    const { t, language } = useLanguage();
    const rarityOptions = getRarityOptions(language);

    return (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800 pb-2">
                <DetailIcon className="w-5 h-5 text-blue-400" />
                {t('form.detail_title')}
            </div>

            {data.supertype === Supertype.Energy ? (
                <div className="p-4 bg-gray-800/50 rounded-lg text-center text-sm text-gray-500">
                    {t('msg.no_energy_details')}
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
                            value={normalizeRarity(data.rarity)}
                            onChange={(v: any) => onChange('rarity', v)} 
                            options={rarityOptions}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label={t('label.setnum')}
                            value={data.setNumber} 
                            onChange={(v: any) => onChange('setNumber', v)} 
                            placeholder={t('placeholder.set_number')}
                        />
                            <InputField 
                            label={t('label.regmark')}
                            value={data.regulationMark} 
                            onChange={(v: any) => onChange('regulationMark', v)} 
                            placeholder={t('placeholder.reg_mark')}
                        />
                    </div>

                    <div className="border-t border-gray-800 pt-2 mt-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">{t('label.setsymbol')}</label>
                        <div className="flex gap-2 items-center">
                                <button 
                                onClick={() => document.getElementById('setsym-upload')?.click()}
                                className="bg-[#13161b] hover:bg-[#1a1d24] border border-gray-700 rounded-lg py-2 px-4 text-xs text-gray-300 font-bold transition-colors hover:text-white"
                                >
                                    {t('form.upload_set_icon')}
                                </button>
                                {data.setSymbolImage && (
                                    <button onClick={() => onChange('setSymbolImage', undefined)} className="text-red-400 hover:text-red-300 text-xs">{t('form.remove')}</button>
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
                                            addNotification('success', t('msg.set_symbol_updated'));
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
                                <div className="text-xs font-bold text-gray-500 uppercase mb-3">{t('form.dex_stats')}</div>
                                <div className="grid grid-cols-3 gap-2">
                                        <InputField 
                                        label={t('label.dex_species')}
                                        value={data.dexSpecies} 
                                        onChange={(v: any) => onChange('dexSpecies', v)} 
                                        placeholder={t('placeholder.dex_species')}
                                    />
                                    <InputField 
                                        label={t('label.dex_height')}
                                        value={data.dexHeight} 
                                        onChange={(v: any) => onChange('dexHeight', v)} 
                                        placeholder={t('placeholder.dex_height')}
                                    />
                                    <InputField 
                                        label={t('label.dex_weight')}
                                        value={data.dexWeight} 
                                        onChange={(v: any) => onChange('dexWeight', v)} 
                                        placeholder={t('placeholder.dex_weight')}
                                    />
                                </div>
                                </div>

                                <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                                    {t('label.dexentry')}
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
