
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CardData, HoloPattern, User } from '../../types';
import { InputField, SelectField, TextAreaField } from '../ui/FormControls';
import { ArtworkIcon, UploadIcon, MagicWandIcon, RefreshIcon, CoinIcon, SparklesIcon } from '../Icons';
import { SparkleBurst } from '../Effects';
import { generateCardImage, redrawCardImage } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

interface FormArtworkProps {
    data: CardData;
    onChange: (field: keyof CardData, value: any) => void;
    user: User | null;
    onLoginRequired: () => void;
    isGeneratingImage: boolean;
    setIsGeneratingImage: (val: boolean) => void;
    addNotification: (type: 'success'|'error'|'info', msg: string) => void;
    setCooldown: (val: number) => void;
    cooldown: number;
}

const SUGGESTED_PROMPTS = [
  "Charizard breathing fire",
  "Cute Pikachu in a forest",
  "Mewtwo in a cyberpunk city",
  "Gengar lurking in shadows",
  "Eevee playing in flowers",
  "Rayquaza flying in clouds",
  "Gyarados in stormy ocean",
  "Lucario using Aura Sphere",
  "Hyper realistic style",
  "Anime art style"
];

// Helper to convert inline image processing
const toBase64 = async (url: string): Promise<string> => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const proxyUrl = url.startsWith('http') ? `https://cors.bridged.cc/${url}` : url;
    try {
        const response = await fetch(proxyUrl, { mode: 'cors' });
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(url);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return url;
    }
};

export const FormArtwork: React.FC<FormArtworkProps> = ({ 
    data, onChange, user, onLoginRequired, 
    isGeneratingImage, setIsGeneratingImage, addNotification, setCooldown, cooldown 
}) => {
    const [artMode, setArtMode] = useState<'upload' | 'ai'>('ai');
    const [aiPrompt, setAiPrompt] = useState('cute cat');
    const [isDragging, setIsDragging] = useState(false);
    const [generateBurst, setGenerateBurst] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleGenerateArt = async () => {
        if (!user) { onLoginRequired(); return; }
        if (!aiPrompt) return;
        if (cooldown > 0) {
            addNotification('info', `Please wait ${cooldown}s before generating again.`);
            return;
        }
    
        setGenerateBurst(prev => prev + 1);
        setIsGeneratingImage(true);
        
        try {
          const imageUrl = await generateCardImage(aiPrompt,1);
          onChange('image', imageUrl);
          setCooldown(60); 
          addNotification('success', t('msg.gen_art'));
        } catch (error: any) {
          addNotification('error', error.message || 'Image generation failed.');
        } finally {
          setIsGeneratingImage(false);
        }
    };

    const handleRedrawArt = async () => {
        if (!user) { onLoginRequired(); return; }
        if (!data.image) return;
        if (cooldown > 0) {
            addNotification('info', `Please wait ${cooldown}s before generating again.`);
            return;
        }
    
        setIsGeneratingImage(true);
        
        try {
            let base64Data = data.image;
            console.log(data.image)
            if (data.image.startsWith('http')) {
                 base64Data = await toBase64(data.image);
            }
    
            const promptToUse = aiPrompt || "Keep the composition but make it look like high quality anime style fantasy card art.";
            const newImageUrl = await redrawCardImage(base64Data, promptToUse);
            onChange('image', newImageUrl);
            setCooldown(60); 
            addNotification('success', 'AI Redraw complete!');
        } catch (error: any) {
            addNotification('error', error.message || 'Redraw failed.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const processFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const result = e.target?.result as string;
              onChange('image', result);
              addNotification('success', 'Image uploaded.');
          };
          reader.readAsDataURL(file);
        } else {
            addNotification('error', 'Please upload a valid image file.');
        }
    }, [onChange, addNotification]);
  
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    }, [processFile]);
  
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-gray-800 pb-2">
                <ArtworkIcon className="w-5 h-5 text-blue-400" />
                Card Artwork
            </div>

            <div className="flex p-1 bg-[#1a1d24] rounded-lg">
                <button 
                    onClick={() => setArtMode('upload')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${artMode === 'upload' ? 'bg-[#2a2e37] text-white shadow-sm scale-100' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                >
                    <UploadIcon className="w-3 h-3" />
                    {t('btn.upload')}
                </button>
                <button 
                    onClick={() => setArtMode('ai')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${artMode === 'ai' ? 'bg-purple-600 text-white shadow-sm scale-100' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                >
                    <MagicWandIcon className="w-3 h-3" />
                    {t('btn.aigenerate')}
                </button>
            </div>

            {artMode === 'ai' && (
                <div className="bg-[#13161b] rounded-xl p-4 border border-gray-800 space-y-4">
                    <p className="text-xs text-gray-400">
                        Describe your artwork and let Gemini create it.
                    </p>
                    <div>
                        <TextAreaField
                            label={t('label.prompt')}
                            value={aiPrompt}
                            onChange={setAiPrompt}
                            className=""
                        />
                        <div className="mt-3">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{t('label.quickprompts')}</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setAiPrompt(prev => prev ? `${prev} ${prompt}` : prompt)}
                                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-300 transition-colors active:scale-95 hover:border-gray-500"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerateArt}
                        disabled={isGeneratingImage || cooldown > 0}
                        className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                            isGeneratingImage || cooldown > 0 
                                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:brightness-110 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}
                    >
                        <SparkleBurst active={true} key={generateBurst} count={20} color={['#a855f7', '#3b82f6', '#ffffff']} />
                        {isGeneratingImage 
                            ? <RefreshIcon className="w-4 h-4 animate-spin" /> 
                            : cooldown > 0 
                                ? `${t('btn.wait')} ${cooldown}s` 
                                : (
                                    <>
                                        <MagicWandIcon className="w-4 h-4" />
                                        {t('btn.aigenerate')}
                                        <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded text-xs ml-1 border border-white/10">
                                            <CoinIcon className="w-3.5 h-3.5 text-yellow-400" /> 1
                                        </div>
                                    </>
                                )
                        }
                    </button>
                </div>
            )}

            {artMode === 'upload' && (
                <div className="space-y-4">
                    <div 
                        className={`
                            bg-[#13161b] rounded-xl border-2 border-dashed h-48 flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragging ? 'border-blue-500 bg-[#1e232b]' : 'border-gray-700 hover:bg-[#1a1d24]'}
                        `}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                        <UploadIcon className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium text-gray-400">
                            {isDragging ? "Drop image here" : (data.image ? "Click or Drop to Change" : "Click or Drop to Upload")}
                        </span>
                    </div>

                    {data.image && (
                        <div className="bg-[#13161b] rounded-xl p-4 border border-gray-800 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                                <MagicWandIcon className="w-3 h-3" />
                                AI Style Transfer
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Redraw your uploaded photo in a Pokémon card art style.
                            </p>
                            <TextAreaField
                                value={aiPrompt}
                                onChange={setAiPrompt}
                                placeholder="Optional: Add details (e.g. 'Make it fiery', 'Anime style')"
                                height="h-16"
                            />
                            <button 
                                onClick={handleRedrawArt}
                                disabled={isGeneratingImage || cooldown > 0}
                                className={`w-full py-2 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                                    isGeneratingImage || cooldown > 0 
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.98]'
                                }`}
                            >
                                    <SparkleBurst active={true} key={generateBurst} count={16} color={['#a855f7', '#6366f1']} />
                                    {isGeneratingImage 
                                    ? <RefreshIcon className="w-3 h-3 animate-spin" /> 
                                    : cooldown > 0 
                                        ? `${t('btn.wait')} ${cooldown}s` 
                                        : (
                                            <div className="flex items-center gap-2">
                                                {t('btn.redraw')}
                                                <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-[10px] border border-white/10">
                                                    <CoinIcon className="w-3 h-3 text-yellow-400" /> 1
                                                </div>
                                            </div>
                                        )
                                }
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Positioning</span>
                </div>
                <div className="space-y-4">
                    <SelectField 
                        label="Holo Pattern"
                        value={data.holoPattern}
                        onChange={(v: any) => onChange('holoPattern', v)}
                        options={Object.values(HoloPattern)}
                    />

                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span className="flex items-center gap-1"><span className="text-lg leading-none">+</span> ZOOM</span>
                            <span className="text-blue-400">{data.zoom}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2" 
                            step="0.1" 
                            value={data.zoom}
                            onChange={(e) => onChange('zoom', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <span className="text-lg leading-none transform rotate-45">↔</span> X Offset
                            </label>
                            <div className="flex items-center bg-[#0a0c10] border border-gray-700 rounded overflow-hidden">
                                    <input 
                                    type="number" 
                                    value={data.xOffset}
                                    onChange={(e) => onChange('xOffset', parseInt(e.target.value))}
                                    className="w-full bg-transparent p-2 text-xs text-white outline-none" 
                                    />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <span className="text-lg leading-none transform rotate-45">↕</span> Y Offset
                            </label>
                            <div className="flex items-center bg-[#0a0c10] border border-gray-700 rounded overflow-hidden">
                                    <input 
                                    type="number" 
                                    value={data.yOffset}
                                    onChange={(e) => onChange('yOffset', parseInt(e.target.value))}
                                    className="w-full bg-transparent p-2 text-xs text-white outline-none" 
                                    />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
