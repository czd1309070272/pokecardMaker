
import React from 'react';
import { CardData } from '../types';
import { TrashIcon, CartIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CartProps {
    items: CardData[];
    onRemove: (id: string) => void;
    onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, onRemove, onCheckout }) => {
    // Mock prices
    const getPrice = (card: CardData) => {
        return card.subtype && card.subtype.toString().includes('ex') ? 9.99 : 4.99;
    };

    const total = items.reduce((sum, item) => sum + getPrice(item), 0);
    const { t } = useLanguage();

    return (
        <div className="flex-grow bg-[#090b10] overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <CartIcon className="w-8 h-8 text-blue-500" />
                    {t('cart.title')}
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-[#161b22] rounded-2xl border border-gray-800">
                        <CartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{t('cart.empty')}</h3>
                        <p className="text-gray-400">{t('cart.empty_desc')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-[#161b22] p-4 rounded-xl border border-gray-800">
                                    <img src={item.image} className="w-20 h-28 object-cover rounded-md" alt={item.name} />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-400">{item.supertype} - {item.subtype}</p>
                                        <p className="text-sm text-gray-500">{t('label.setnum')}: {item.setNumber}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-white text-xl">${getPrice(item).toFixed(2)}</span>
                                        <button 
                                            onClick={() => item.id && onRemove(item.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="h-fit bg-[#161b22] p-6 rounded-xl border border-gray-800 sticky top-4">
                            <h3 className="font-bold text-white text-lg mb-4">{t('cart.summary')}</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>{t('cart.subtotal')}</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>{t('cart.tax')}</span>
                                    <span>${(total * 0.08).toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gray-700 my-2"></div>
                                <div className="flex justify-between text-white font-bold text-xl">
                                    <span>{t('cart.total')}</span>
                                    <span>${(total * 1.08).toFixed(2)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={onCheckout}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all"
                            >
                                {t('cart.checkout')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
