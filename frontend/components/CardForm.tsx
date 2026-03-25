
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardData, Supertype, INITIAL_CARD_DATA, User } from '../types';
import { generateCardData } from '../services/geminiService';
import { SparkleBurst } from './Effects';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  MagicWandIcon, 
  BasicsIcon, 
  ArtworkIcon, 
  CombatIcon, 
  StatsIcon, 
  DetailIcon,
  ExportIcon,
  RefreshIcon,
  TrashIcon,
  DownloadIcon,
  CartPlusIcon,
  FileIcon,
  SparklesIcon,
  SaveIcon,
  GlobeIcon,
  CoinIcon
} from './Icons';

// Import New Sub-components
import { FormBasics } from './card-form/FormBasics';
import { FormArtwork } from './card-form/FormArtwork';
import { FormCombat } from './card-form/FormCombat';
import { FormStats } from './card-form/FormStats';
import { FormDetail } from './card-form/FormDetail';
import { useCardDownload } from '../hooks/useCardDownload';
import { ActionDialog, ActionDialogOption } from './ActionDialog';

interface CardFormProps {
  data: CardData;
  onChange: (data: CardData) => void;
  onAddToCart: (card: CardData) => void;
  onSave: (card: CardData) => Promise<void>;
  onPublish: (card: CardData) => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  user: User | null;
  onLoginRequired: () => void;
  isGeneratingImage: boolean;
  setIsGeneratingImage: (isGenerating: boolean) => void;
}

type Tab = 'basics' | 'artwork' | 'combat' | 'stats' | 'detail';

const NavItem = React.memo(({ id, icon: Icon, label, activeTab, setActiveTab }: { id: Tab, icon: any, label: string, activeTab: Tab, setActiveTab: (id: Tab) => void }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-shrink-0 lg:w-full flex lg:items-center gap-1.5 lg:gap-4 px-3 lg:px-6 py-3 lg:py-4 transition-all duration-300 relative overflow-hidden group border-b-2 lg:border-b-0 lg:border-l-2
        ${activeTab === id 
          ? 'text-blue-400 border-blue-500 bg-[#161b22] shadow-[inset_4px_0_0_0_rgba(59,130,246,0.1)]' 
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#161b22]/50 hover:border-gray-700'
      }`}
    >
      <Icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-300 ${activeTab === id ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'group-hover:scale-110'}`} />
      <span className="font-medium text-xs lg:text-sm relative z-10 whitespace-nowrap transition-transform duration-200 group-hover:translate-x-1">{label}</span>
      {activeTab === id && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none opacity-50" />
      )}
    </button>
));

export const CardForm: React.FC<CardFormProps> = ({ 
    data, onChange, onAddToCart, onSave, onPublish, addNotification, 
    user, onLoginRequired, isGeneratingImage, setIsGeneratingImage 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('basics');
  const [cardTextPrompt, setCardTextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cartBurst, setCartBurst] = useState(0);
  const [clearDialogOptions, setClearDialogOptions] = useState<ActionDialogOption[]>([]);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const imageCache = useRef<Record<string, string | undefined>>({});
  
  const { t } = useLanguage();
  const { isDownloading, handleDownload } = useCardDownload(addNotification, t, data.name);

  // Timer for cooldowns
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
        timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Main change handler passed down to sub-forms
  const handleChange = useCallback((field: keyof CardData, value: any) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const handleSupertypeChange = (newType: Supertype) => {
    imageCache.current[data.supertype] = data.image;
    let nextImage = imageCache.current[newType];

    if (nextImage === undefined) {
        if (newType === Supertype.Pokemon) {
             nextImage = INITIAL_CARD_DATA.image;
        } else {
            nextImage = ''; 
        }
    }
    onChange({ ...data, supertype: newType, image: nextImage });
  };

  const handleClear = useCallback(() => {
    setClearDialogOptions([
        {
            label: t('dialog.clear_confirm'),
            variant: 'danger',
            onClick: () => {
                imageCache.current = {};
                onChange({ ...INITIAL_CARD_DATA, attacks: [] });
                addNotification('info', t('msg.cleared'));
                setIsClearDialogOpen(false);
            },
        },
        {
            label: t('dialog.keep_editing'),
            variant: 'secondary',
            onClick: () => setIsClearDialogOpen(false),
        },
    ]);
    setIsClearDialogOpen(true);
  }, [onChange, addNotification, t]);

  const handleJsonExport = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${data.name.replace(/ /g, '_') || 'card'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addNotification('success', 'JSON exported successfully.');
  }, [data, addNotification]);

  const handleJsonImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (json && json.supertype) {
                imageCache.current[json.supertype] = json.image;
                onChange(json);
                addNotification('success', t('msg.imported'));
            } else {
                addNotification('error', 'Invalid card JSON format.');
            }
        } catch (err) {
            addNotification('error', 'Failed to parse JSON file.');
        }
        if (jsonInputRef.current) jsonInputRef.current.value = '';
    };
    reader.readAsText(file);
  }, [onChange, addNotification, t]);

  const handleGenerateCardText = async () => {
    if (!user) { onLoginRequired(); return; }
    const finalPrompt = cardTextPrompt || "Create a completely random, creative, and balanced Pokemon card concept.";
    
    if (cooldown > 0) {
        addNotification('info', `Please wait ${cooldown}s before generating again.`);
        return;
    }
    
    setIsGenerating(true);
    addNotification('info', cardTextPrompt ? `Generating concept for: ${cardTextPrompt}...` : 'Generating random card concept...');
    
    try {
        const generatedData = await generateCardData(finalPrompt);
        const mergedData = { 
            ...data, 
            ...generatedData, 
            id: data.id,
            image: data.image // Preserve image
        };
        onChange(mergedData);
        setCooldown(10); 
        addNotification('success', t('msg.gen_text'));
        setCardTextPrompt(''); 
    } catch (error: any) {
        addNotification('error', error.message || 'Failed to generate text.');
    } finally {
        setIsGenerating(false);
    }
  };

  const ActionsBlock = () => (
      <div className="space-y-3">
             {/* Action Buttons Row: Flex-1 on mobile for bigger targets */}
             <div className="flex justify-center gap-3 mb-2 lg:mb-0 lg:gap-2">
                <button 
                    onClick={() => void onSave(data)}
                    className="flex-1 lg:flex-none lg:aspect-square bg-[#161b22] hover:bg-[#21262d] text-green-400 border border-gray-700 hover:border-green-500/50 py-3 lg:p-2.5 rounded-lg font-bold text-xs flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                    title={t('btn.save')}
                >
                    <SaveIcon className="w-5 h-5 lg:w-4 lg:h-4" />
                </button>
                <button 
                    onClick={() => onPublish(data)}
                    className="flex-1 lg:flex-none lg:aspect-square bg-[#161b22] hover:bg-[#21262d] text-purple-400 border border-gray-700 hover:border-purple-500/50 py-3 lg:p-2.5 rounded-lg font-bold text-xs flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                    title={t('btn.publish')}
                >
                    <GlobeIcon className="w-5 h-5 lg:w-4 lg:h-4" />
                </button>
                 <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 lg:flex-none lg:aspect-square bg-[#161b22] hover:bg-[#21262d] text-blue-400 border border-gray-700 hover:border-blue-500/50 py-3 lg:p-2.5 rounded-lg font-bold text-xs flex items-center justify-center transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                    title={t('btn.download')}
                    aria-label="Download Card"
                >
                    {isDownloading ? <RefreshIcon className="w-5 h-5 lg:w-4 lg:h-4 animate-spin" /> : <DownloadIcon className="w-5 h-5 lg:w-4 lg:h-4" />}
                </button>
             </div>

            <button 
                onClick={() => {
                    if (!user) { onLoginRequired(); return; }
                    setCartBurst(prev => prev + 1);
                    onAddToCart(data); 
                    addNotification('success', t('msg.added_cart')); 
                }}
                className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] text-white py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-[0.98] relative overflow-hidden group hover:-translate-y-0.5"
            >
                <SparkleBurst active={true} key={cartBurst} count={16} color="#93c5fd" />
                <CartPlusIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                {t('btn.addtocart')}
            </button>

            <div className="bg-[#1e232b] rounded-xl overflow-hidden border border-gray-700 mt-2">
                <input 
                    type="file" 
                    ref={jsonInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleJsonImport} 
                />
                <div className="flex border-b border-gray-700">
                    <button 
                        onClick={() => jsonInputRef.current?.click()}
                        className="flex-grow hover:bg-gray-700/50 text-gray-300 py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:bg-gray-700"
                    >
                        <FileIcon className="w-3 h-3" />
                        {t('btn.import')}
                    </button>
                    <button 
                        onClick={handleClear}
                        className="px-3 border-l border-gray-700 hover:bg-red-900/30 hover:text-red-400 text-gray-500 transition-colors active:bg-red-900/50"
                        title={t('btn.clear')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={handleJsonExport}
                    className="w-full hover:bg-gray-700/50 text-gray-300 py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:bg-gray-700"
                >
                    <ExportIcon className="w-3 h-3" />
                    {t('btn.export')}
                </button>
            </div>
      </div>
  );

  return (
    <>
    <ActionDialog
        isOpen={isClearDialogOpen}
        title={t('dialog.clear_card_title')}
        description={t('dialog.clear_card_desc')}
        options={clearDialogOptions}
        onClose={() => setIsClearDialogOpen(false)}
    />
    <fieldset disabled={isGeneratingImage} className="flex flex-col lg:flex-row h-full bg-[#0f1216] text-gray-300 relative disabled:opacity-70 disabled:pointer-events-none transition-opacity">
      
      {/* Sidebar / Tabs */}
      <div className="w-full lg:w-48 flex-shrink-0 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-800 flex flex-row lg:flex-col pt-0 lg:pt-4 bg-[#0d1117] overflow-x-auto lg:overflow-visible no-scrollbar">
        <div className="hidden lg:block px-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('tools.title')}</div>
        <nav className="flex flex-row lg:flex-col space-y-0 lg:space-y-1 w-full lg:w-auto">
          <NavItem id="basics" icon={BasicsIcon} label={t('tab.basics')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="artwork" icon={ArtworkIcon} label={t('tab.artwork')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="combat" icon={CombatIcon} label={t('tab.combat')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="stats" icon={StatsIcon} label={t('tab.stats')} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="detail" icon={DetailIcon} label={t('tab.detail')} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden lg:block mt-auto p-4">
             <ActionsBlock />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col w-full lg:w-[420px] max-w-none lg:max-w-[420px] border-r-0 lg:border-r border-gray-800 bg-[#090b0e] overflow-hidden">
        
        {/* AI Generator Bar */}
        <div className="p-4 border-b border-gray-800 bg-[#13161b]">
             <div className="flex gap-2">
                 <div className="relative flex-grow">
                     <MagicWandIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                     <input 
                        type="text" 
                        value={cardTextPrompt}
                        onChange={(e) => setCardTextPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateCardText()}
                        placeholder="Theme (e.g. Fire Dragon) or empty for Random..."
                        className="w-full bg-[#050608] border border-gray-700 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-600 transition-all shadow-inner focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                     />
                 </div>
                 <button 
                    onClick={() => handleGenerateCardText()}
                    disabled={isGenerating || cooldown > 0}
                    className={`bg-[#6d28d9] hover:bg-[#5b21b6] text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center gap-2 hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] ${isGenerating || cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                     {isGenerating ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                     <span className="hidden sm:inline">{cooldown > 0 ? `${cooldown}s` : 'GEN'}</span>
                     {!isGenerating && cooldown === 0 && (
                        <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded text-[10px] ml-1 border border-white/10">
                            <CoinIcon className="w-3 h-3 text-yellow-400" /> 1
                        </div>
                     )}
                 </button>
             </div>
        </div>

        {/* Scrollable Inputs - Render Active Tab Component */}
        <div className="flex-grow overflow-y-auto p-6">
            {activeTab === 'basics' && (
                <FormBasics 
                    data={data} 
                    onChange={handleChange} 
                    handleSupertypeChange={handleSupertypeChange} 
                />
            )}
            
            {activeTab === 'artwork' && (
                <FormArtwork 
                    data={data} 
                    onChange={handleChange} 
                    user={user}
                    onLoginRequired={onLoginRequired}
                    isGeneratingImage={isGeneratingImage}
                    setIsGeneratingImage={setIsGeneratingImage}
                    addNotification={addNotification}
                    setCooldown={setCooldown}
                    cooldown={cooldown}
                />
            )}
            
            {activeTab === 'combat' && (
                <FormCombat 
                    data={data} 
                    onChange={handleChange} 
                    user={user}
                    onLoginRequired={onLoginRequired}
                    addNotification={addNotification}
                />
            )}

            {activeTab === 'stats' && (
                <FormStats 
                    data={data} 
                    onChange={handleChange} 
                />
            )}

            {activeTab === 'detail' && (
                <FormDetail 
                    data={data} 
                    onChange={handleChange} 
                    user={user}
                    onLoginRequired={onLoginRequired}
                    addNotification={addNotification}
                />
            )}

            {/* Mobile Actions Block at end of content */}
            <div className="lg:hidden pt-6 pb-20">
                <ActionsBlock />
            </div>
        </div>
      </div>
    </fieldset>
    </>
  );
};
