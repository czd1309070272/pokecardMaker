
import React, { useState, useEffect, useRef } from 'react';
import { CardData, User } from '../types';
import { CardPreview } from './CardPreview';
import { TiltCard } from './TiltCard';
import { GavelIcon, CoinIcon, RefreshIcon, UserIcon } from './Icons';
import { generateAppraisal } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface AppraiserProps {
    user: User | null;
    myCards: CardData[];
    onUpdateUserCoins: (coins: number) => void;
    onSaveAppraisal: (
        cardId: string,
        appraisal: { price: string; comment: string; language: 'en' | 'zh-Hant' },
    ) => Promise<CardData>;
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
    onLoginRequired: () => void;
}

// Helper for responsive scaling - Moved outside component to prevent re-creation and fix TS errors
const ResponsiveCardContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // CardPreview is 420px wide. Calculate scale to fit width.
                const newScale = entry.contentRect.width / 420;
                setScale(newScale);
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full aspect-[420/588] relative">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '420px', height: '588px', position: 'absolute' }}>
                {children}
            </div>
        </div>
    );
};

export const Appraiser: React.FC<AppraiserProps> = ({
    user,
    myCards,
    onUpdateUserCoins,
    onSaveAppraisal,
    addNotification,
    onLoginRequired,
}) => {
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanStage, setScanStage] = useState(0); // 0: Idle, 1: Scanning, 2: Analyzing, 3: Result
    const [result, setResult] = useState<{ price: string, comment: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { t, language } = useLanguage();
    const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const COST = 20;

    const clearAnalysisTimer = () => {
        if (analysisTimerRef.current) {
            clearTimeout(analysisTimerRef.current);
            analysisTimerRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearAnalysisTimer();
        };
    }, []);

    useEffect(() => {
        if (!selectedCard?.id) return;
        const updatedCard = myCards.find(card => card.id === selectedCard.id);
        if (updatedCard) {
            setSelectedCard(updatedCard);
        }
    }, [myCards, selectedCard?.id]);

    const handleSelect = (card: CardData) => {
        clearAnalysisTimer();
        setSelectedCard(card);
        setScanStage(0);
        setResult(null);
        setError(null);
    };

    const handleSaveResult = async () => {
        if (!selectedCard?.id || !result || isSaving) return;
        setIsSaving(true);
        try {
            const savedCard = await onSaveAppraisal(selectedCard.id, {
                price: result.price,
                comment: result.comment,
                language: language === 'en' ? 'en' : 'zh-Hant',
            });
            setSelectedCard(savedCard);
            addNotification('success', language === 'en' ? 'Appraisal saved.' : '鑑定結果已保存。');
        } catch (e: any) {
            addNotification('error', e.message || (language === 'en' ? 'Failed to save appraisal.' : '保存鑑定結果失敗。'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartAppraisal = async () => {
        if (!user) {
            onLoginRequired();
            return;
        }

        if (!selectedCard) return;

        if (user.coins && user.coins < COST) {
            setError(t('appraiser.no_coins'));
            return;
        }

        setIsScanning(true);
        setScanStage(1);
        setError(null);

        // Simulate scanning stages
        clearAnalysisTimer();
        analysisTimerRef.current = setTimeout(() => {
            setScanStage(2);
            analysisTimerRef.current = null;
        }, 2000);

        try {
            const appraisal = await generateAppraisal(
                selectedCard,
                language === 'en' ? 'en' : 'zh-Hant',
            );
            clearAnalysisTimer();
            setResult({ price: appraisal.price, comment: appraisal.comment });
            onUpdateUserCoins(appraisal.remainingCoins);
            setScanStage(3);
        } catch (e: any) {
            clearAnalysisTimer();
            setError(e.message || "Appraisal failed.");
            setScanStage(0);
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        clearAnalysisTimer();
        setSelectedCard(null);
        setScanStage(0);
        setResult(null);
        setError(null);
    };

    if (!user) {
        return (
            <div className="flex-grow flex items-center justify-center bg-[#090b10] text-center p-8">
                <div className="max-w-md bg-[#161b22] border border-gray-800 rounded-2xl p-10 shadow-2xl">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('auth.signin_req')}</h2>
                    <p className="text-gray-400 mb-8">{t('auth.signin_desc')}</p>
                    <button 
                        onClick={onLoginRequired}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                    >
                        {t('nav.signin')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col bg-[#050608] overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-900/10 to-transparent"></div>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#a855f7 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="relative z-10 flex-grow flex flex-col p-4 md:p-8 overflow-y-auto">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-900/20 rounded-full mb-4 border border-purple-500/30">
                        <GavelIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-pink-400 font-heading tracking-tighter mb-2">
                        {t('appraiser.title')}
                    </h1>
                    <p className="text-gray-400">{t('appraiser.subtitle')}</p>
                </div>

                {/* Main Interaction Area */}
                <div className="flex-grow flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
                    
                    {!selectedCard ? (
                        /* STATE 1: SELECT CARD */
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-bold text-white mb-6 text-center">{t('appraiser.select')}</h3>
                            
                            {myCards.length === 0 ? (
                                <div className="text-center p-12 bg-[#161b22] rounded-2xl border border-gray-800">
                                    <p className="text-gray-500">You don't have any saved cards yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {myCards.map(card => (
                                        <div 
                                            key={card.id} 
                                            onClick={() => handleSelect(card)}
                                            className="cursor-pointer group relative aspect-[420/588]"
                                        >
                                            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-colors z-10 rounded-[12px] border-2 border-transparent group-hover:border-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                                            <TiltCard className="w-full h-full rounded-[12px]" maxAngle={5} disabled>
                                                <ResponsiveCardContainer>
                                                    <CardPreview data={card} />
                                                </ResponsiveCardContainer>
                                            </TiltCard>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* STATE 2: SCANNING / RESULT */
                        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-center animate-in zoom-in-95 duration-300">
                            
                            {/* Card Display */}
                            <div className="w-full max-w-[320px] md:max-w-[400px] relative">
                                <TiltCard className="rounded-[24px] shadow-2xl shadow-purple-900/20" maxAngle={10} disabled={scanStage === 1}>
                                    <ResponsiveCardContainer>
                                        <CardPreview data={selectedCard} />
                                    </ResponsiveCardContainer>
                                </TiltCard>

                                {/* Scanning Overlay */}
                                {scanStage === 1 && (
                                    <div className="absolute inset-0 z-50 overflow-hidden rounded-[24px] pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-[5px] bg-red-500 shadow-[0_0_15px_#ef4444] animate-[scan_2s_linear_infinite]"></div>
                                        <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay"></div>
                                        <style>{`
                                            @keyframes scan {
                                                0% { top: 0%; opacity: 0; }
                                                10% { opacity: 1; }
                                                90% { opacity: 1; }
                                                100% { top: 100%; opacity: 0; }
                                            }
                                        `}</style>
                                    </div>
                                )}

                                {/* Price Stamp */}
                                {scanStage === 3 && result && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transform rotate-[-15deg] animate-[stamp_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] max-w-[90%]">
                                        <div className="border-[6px] md:border-[8px] border-red-600 text-red-600 font-black text-4xl md:text-6xl px-4 md:px-6 py-2 rounded-lg bg-white/10 backdrop-blur-sm uppercase tracking-widest shadow-2xl mix-blend-hard-light whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                            {result.price}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls / Result Text */}
                            <div className="flex-grow max-w-md w-full flex flex-col gap-6">
                                {scanStage === 0 && (
                                    <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 text-center space-y-6">
                                        <h3 className="text-xl font-bold text-white">{selectedCard.name}</h3>
                                        <div className="flex justify-center items-center gap-2 text-yellow-400 text-lg font-bold">
                                            <span>{t('appraiser.cost')}:</span>
                                            <div className="flex items-center gap-1 bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-500/30">
                                                <CoinIcon className="w-5 h-5" /> {COST}
                                            </div>
                                        </div>
                                        
                                        {error && <p className="text-red-400 text-sm font-bold animate-pulse">{error}</p>}

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={handleReset}
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleStartAppraisal}
                                                className="flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                            >
                                                <GavelIcon className="w-5 h-5" />
                                                {selectedCard.appraisal ? (language === 'en' ? 'RE-APPRAISE' : '重新鑑定') : t('appraiser.start')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {(scanStage === 1 || scanStage === 2) && (
                                    <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 text-center flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-purple-300 font-mono animate-pulse">
                                            {scanStage === 1 ? t('appraiser.scanning') : t('appraiser.analyzing')}
                                        </p>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 animate-[progress_2s_ease-in-out_infinite] w-1/3"></div>
                                        </div>
                                    </div>
                                )}

                                {scanStage === 3 && result && (
                                    <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6 animate-in slide-in-from-right duration-500">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{t('appraiser.roast_title')}</h3>
                                            <p className="text-white text-lg leading-relaxed font-serif italic border-l-4 border-purple-500 pl-4 py-1">
                                                "{result.comment}"
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{t('appraiser.value')}</h3>
                                            <p className="text-4xl font-black text-green-400 font-mono tracking-tight break-words">{result.price}</p>
                                        </div>

                                        <button 
                                            onClick={handleSaveResult}
                                            disabled={isSaving}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <GavelIcon className="w-4 h-4" />}
                                            {selectedCard.appraisal
                                                ? (language === 'en' ? 'Overwrite Saved Appraisal' : '覆蓋已保存鑑定')
                                                : (language === 'en' ? 'Save Appraisal' : '保存鑑定結果')}
                                        </button>

                                        <button 
                                            onClick={handleReset}
                                            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl border border-gray-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <RefreshIcon className="w-4 h-4" />
                                            {t('appraiser.again')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
