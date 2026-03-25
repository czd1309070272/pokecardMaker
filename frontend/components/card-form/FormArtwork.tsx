
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
  "Anime art style"
];

export const FormArtwork: React.FC<FormArtworkProps> = ({ 
    data, onChange, user, onLoginRequired, 
    isGeneratingImage, setIsGeneratingImage, addNotification, setCooldown, cooldown 
}) => {
    const [artMode, setArtMode] = useState<'upload' | 'ai'>('ai');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [generateBurst, setGenerateBurst] = useState(0);
    
    // 关键：存储原始 File 对象用于重绘
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    // 清理 Object URL 防止内存泄漏
    useEffect(() => {
        return () => {
            if (data.image?.startsWith('blob:')) {
                URL.revokeObjectURL(data.image);
            }
        };
    }, [data.image]);

    const handleGenerateArt = async () => {
        if (!user) { onLoginRequired(); return; }
        if (!aiPrompt) return;
        if (cooldown > 0) {
            addNotification('info', `Please wait ${cooldown}s.`);
            return;
        }
    
        setGenerateBurst(prev => prev + 1);
        setIsGeneratingImage(true);
        
        try {
          const imageUrl = await generateCardImage(aiPrompt,1);
          onChange('image', imageUrl);
          setPendingFile(null); // AI生成的图暂时没有本地 File
          setCooldown(60); 
          addNotification('success', t('msg.gen_art'));
        } catch (error: any) {
          addNotification('error', error.message || 'Generation failed.');
        } finally {
          setIsGeneratingImage(false);
        }
    };

    const handleRedrawArt = async () => {
        if (!user) { onLoginRequired(); return; }
        
        // 如果没有 pendingFile，说明当前图片不是刚刚上传的或者是外链
        if (!pendingFile) {
            addNotification('error', 'Please upload a local image first to redraw.');
            return;
        }

        if (cooldown > 0) {
            addNotification('info', `Please wait ${cooldown}s.`);
            return;
        }
    
        setIsGeneratingImage(true);
        try {
            const promptToUse = aiPrompt || "Anime style fantasy card art.";
            // 直接传递 File 对象到 Service 层
            const newImageUrl = await redrawCardImage(1,pendingFile, promptToUse);
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
          // 1. 保存原始文件对象
          setPendingFile(file);
          
          // 2. 使用 Object URL 进行快速预览（比 Base64 性能高得多）
          const objectUrl = URL.createObjectURL(file);
          onChange('image', objectUrl);
          
          addNotification('success', 'Image ready for redraw.');
        } else {
            addNotification('error', 'Invalid image file.');
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
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${artMode === 'upload' ? 'bg-[#2a2e37] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <UploadIcon className="w-3 h-3" />
                    {t('btn.upload')}
                </button>
                <button 
                    onClick={() => setArtMode('ai')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${artMode === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <MagicWandIcon className="w-3 h-3" />
                    {t('btn.aigenerate')}
                </button>
            </div>

            {artMode === 'ai' && (
                <div className="bg-[#13161b] rounded-xl p-4 border border-gray-800 space-y-4">
                    <TextAreaField
                        label={t('label.prompt')}
                        value={aiPrompt}
                        onChange={setAiPrompt}
                        placeholder="Describe your artwork..."
                    />
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => setAiPrompt(prompt)}
                                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-300 transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleGenerateArt}
                        disabled={isGeneratingImage || cooldown > 0}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2"
                    >
                        <SparkleBurst active={true} key={generateBurst} count={20} />
                        <MagicWandIcon className="w-4 h-4" />
                        {t('btn.aigenerate')}
                    </button>
                </div>
            )}

            {artMode === 'upload' && (
                <div className="space-y-4">
                    <div 
                        className={`bg-[#13161b] rounded-xl border-2 border-dashed h-40 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-[#1e232b]' : 'border-gray-700'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                        <UploadIcon className="w-8 h-8 mb-2 text-gray-500" />
                        <span className="text-xs text-gray-400">Click or Drop to Upload</span>
                    </div>

                    {pendingFile && (
                        <div className="bg-[#13161b] rounded-xl p-4 border border-gray-800 space-y-3">
                            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                <MagicWandIcon className="w-3 h-3" /> AI Redraw Mode
                            </div>
                            <TextAreaField
                                value={aiPrompt}
                                onChange={setAiPrompt}
                                placeholder="Describe the style (e.g. 'Watercolor', 'Vibrant Anime')"
                                height="h-16"
                            />
                            <button 
                                onClick={handleRedrawArt}
                                disabled={isGeneratingImage || cooldown > 0}
                                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2"
                            >
                                {isGeneratingImage ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <MagicWandIcon className="w-3 h-3" />}
                                {t('btn.redraw')}
                                <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                                    <CoinIcon className="w-3 h-3 text-yellow-400" /> 1
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Common Controls */}
            <div className="border-t border-gray-800 pt-4 space-y-4">
                <SelectField 
                    label="Holo Pattern"
                    value={data.holoPattern}
                    onChange={(v: any) => onChange('holoPattern', v)}
                    options={Object.values(HoloPattern)}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Zoom</label>
                        <input 
                            type="range" min="0.5" max="2" step="0.1" value={data.zoom}
                            onChange={(e) => onChange('zoom', parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                         <InputField label="X" value={data.xOffset} onChange={(v:any) => onChange('xOffset', parseInt(v))} type="number" />
                         <InputField label="Y" value={data.yOffset} onChange={(v:any) => onChange('yOffset', parseInt(v))} type="number" />
                    </div>
                </div>
            </div>
        </div>
    );
};
