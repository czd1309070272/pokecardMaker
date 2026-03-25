
import React, { useState } from 'react';
import { User } from '../types';
import { CoinIcon, WalletIcon, XIcon, ArrowDownIcon, WechatIcon, AlipayIcon, CreditCardIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface RechargeProps {
    user: User | null;
    onBack: () => void;
    onRecharge: (amount: number) => void;
}

export const Recharge: React.FC<RechargeProps> = ({ user, onBack, onRecharge }) => {
    const [selectedAmount, setSelectedAmount] = useState<number>(10);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useLanguage();

    const PRESETS = [10, 50, 100];
    const EXCHANGE_RATE = 100; // 1 RMB = 100 Coins

    const currentAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    const coinsReceived = Math.floor((currentAmount || 0) * EXCHANGE_RATE);

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
        setSelectedAmount(0); // Deselect presets
    };

    const handlePresetSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handlePayment = () => {
        if (!currentAmount || currentAmount <= 0) return;
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        setIsProcessing(true);
        
        // [Mock Payment Process]
        setTimeout(() => {
            setIsProcessing(false);
            setShowPaymentModal(false);
            onRecharge(coinsReceived); // Optimistic UI update
            onBack();
        }, 1500);
    };

    return (
        <div className="flex-grow flex flex-col bg-[#050608] overflow-y-auto relative p-3 md:p-8 no-scrollbar">
             <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-green-900/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                <button onClick={onBack} className="text-gray-400 hover:text-white mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base active:scale-95 transition-transform">
                    <span className="transform rotate-90 inline-block"><ArrowDownIcon className="w-4 h-4" /></span> Back to Profile
                </button>

                <div className="bg-[#161b22] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-5 md:p-8 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-[#161b22]">
                        <div className="flex items-center gap-3 md:gap-4 mb-2">
                            <div className="p-2 md:p-3 bg-green-500/10 rounded-full shrink-0">
                                <WalletIcon className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white">{t('recharge.title')}</h1>
                                <p className="text-gray-400 text-xs md:text-sm">{t('recharge.subtitle')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left: Amount Selection */}
                        <div className="space-y-6 md:space-y-8">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase mb-2 md:mb-4">{t('recharge.current_balance')}</label>
                                <div className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-yellow-400">
                                    <CoinIcon className="w-6 h-6 md:w-8 md:h-8" />
                                    <span>{user?.coins?.toLocaleString() || 0}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase mb-2 md:mb-4">{t('recharge.select_amount')}</label>
                                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
                                    {PRESETS.map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => handlePresetSelect(amount)}
                                            className={`py-3 md:py-4 rounded-xl border-2 font-bold text-base md:text-lg transition-all ${
                                                selectedAmount === amount 
                                                ? 'border-green-500 bg-green-500/10 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                                                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                                            }`}
                                        >
                                            ¥{amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">¥</span>
                                    <input 
                                        type="number" 
                                        placeholder={t('recharge.custom_amount')}
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        className={`w-full bg-gray-800 border-2 rounded-xl py-3 md:py-4 pl-10 pr-4 text-white font-bold outline-none transition-all text-sm md:text-base ${
                                            customAmount ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-gray-700 focus:border-gray-500'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary & Pay */}
                        <div className="flex flex-col justify-center bg-gray-900/50 rounded-xl p-5 md:p-6 border border-gray-800">
                            <div className="text-center mb-6 md:mb-8">
                                <p className="text-gray-500 text-xs md:text-sm font-bold uppercase mb-2">{t('recharge.coins_received')}</p>
                                <div className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-2">
                                    <CoinIcon className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                                    <span>{coinsReceived.toLocaleString()}</span>
                                </div>
                                <p className="text-green-400 text-[10px] md:text-xs mt-2 font-mono bg-green-900/20 inline-block px-2 py-1 rounded">
                                    + {coinsReceived / 100} Drawing Chances
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={!currentAmount || currentAmount <= 0}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 text-base md:text-lg"
                            >
                                {t('recharge.pay_now')} ¥{currentAmount || 0}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-sm md:max-w-md p-6 shadow-2xl relative">
                        <button 
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6 text-center">{t('recharge.payment_method')}</h2>
                        
                        {isProcessing ? (
                            <div className="py-10 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-green-400 font-bold animate-pulse">{t('recharge.processing')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button onClick={confirmPayment} className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-xl border border-gray-700 transition-all group active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#09bb07] p-2 rounded-lg text-white">
                                            <WechatIcon className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-white text-sm md:text-base">{t('recharge.wechat')}</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-500 group-hover:border-green-500"></div>
                                </button>
                                <button onClick={confirmPayment} className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-xl border border-gray-700 transition-all group active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#1677ff] p-2 rounded-lg text-white">
                                            <AlipayIcon className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-white text-sm md:text-base">{t('recharge.alipay')}</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-500 group-hover:border-blue-500"></div>
                                </button>
                                <button onClick={confirmPayment} className="w-full flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] p-4 rounded-xl border border-gray-700 transition-all group active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-600 p-2 rounded-lg text-white">
                                            <CreditCardIcon className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-white text-sm md:text-base">{t('recharge.card')}</span>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-500 group-hover:border-purple-500"></div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
