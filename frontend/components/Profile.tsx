
import React, { useState, useRef, useEffect } from 'react';
import { CardData, PurchasedPack, User } from '../types';
import { CardPreview } from './CardPreview';
import { PackCard } from './PackCard';
import { TiltCard } from './TiltCard';
import { UserIcon, GlobeIcon, EditIcon, EyeIcon, XIcon, TrashIcon, WalletIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getSubtypeLabel } from '../lib/subtype';

interface ProfileProps {
    user: User | null;
    onLoginClick: () => void;
    savedCards?: CardData[];
    likedCards?: CardData[];
    purchasedPacks?: PurchasedPack[];
    onRemoveFavorite: (id: string) => void;
    onOpenPurchasedPack?: (pack: PurchasedPack) => void;
    onPublishCard: (card: CardData) => void;
    onLoadCard: (card: CardData) => void;
    onCreateNew: () => void;
    onDeleteCard: (id: string) => void | Promise<void>;
    onRecharge: () => void;
}

// Helper component to scale the fixed-size CardPreview to fit its container
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
            <div 
                style={{ 
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top left',
                    width: '420px',
                    height: '588px',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            >
                {children}
            </div>
        </div>
    );
};

export const Profile: React.FC<ProfileProps> = ({
    user,
    onLoginClick,
    savedCards = [],
    likedCards = [],
    purchasedPacks = [],
    onRemoveFavorite,
    onOpenPurchasedPack,
    onPublishCard,
    onLoadCard,
    onCreateNew,
    onDeleteCard,
    onRecharge
}) => {
    const [activeTab, setActiveTab] = useState<'creations' | 'favorites' | 'packs'>('creations');
    const [viewCard, setViewCard] = useState<CardData | null>(null);
    const { t, language } = useLanguage();
    const getSupertypeLabel = (supertype: CardData['supertype']) =>
        supertype === 'Trainer'
            ? t('supertype.trainer')
            : supertype === 'Energy'
                ? t('supertype.energy')
                : t('supertype.pokemon');
    const isPublishedCard = (card: CardData) => Boolean(card.isPublic || card.status === 'published' || card.publishedAt);
    const isAppraisedCard = (card: CardData) => Boolean(card.appraisal?.price && card.appraisal?.comment);
    const isDeletedCard = (card: CardData) => Boolean(card.isDeleted || card.deletedAt || card.status === 'deleted');
    const isUnpublishedFavorite = (card: CardData) => activeTab === 'favorites' && !isDeletedCard(card) && !isPublishedCard(card);
    const isUnavailableFavorite = (card: CardData) => activeTab === 'favorites' && (isDeletedCard(card) || isUnpublishedFavorite(card));
    const getFavoriteStateLabel = (card: CardData) => {
        if (isDeletedCard(card)) return t('card.deleted_badge');
        if (isUnpublishedFavorite(card)) return t('card.unpublished_badge');
        return null;
    };
    const getFavoriteStateNotice = (card: CardData) => {
        if (isDeletedCard(card)) return t('favorites.deleted_notice');
        if (isUnpublishedFavorite(card)) return t('favorites.unpublished_notice');
        return null;
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
                        onClick={onLoginClick}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                    >
                        {t('nav.signin')}
                    </button>
                </div>
            </div>
        );
    }

    const displayCards = (() => {
        switch (activeTab) {
            case 'favorites':
                return likedCards;
            case 'packs':
                return [];
            case 'creations':
            default:
                return savedCards;
        }
    })();

    return (
        <div className="flex-grow bg-[#090b10] overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-12">
                
                {/* Profile Header */}
                <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 shadow-xl relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-4 border-[#090b10] z-10 shrink-0">
                        <span className="text-2xl md:text-4xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="text-center md:text-left flex-grow z-10 w-full">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{user.name}</h1>
                        <p className="text-gray-400 font-mono text-xs md:text-base mb-3 md:mb-4 truncate">{user.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 text-[10px] md:text-sm">
                            <div className="bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-700 whitespace-nowrap">
                                <span className="text-gray-400">{t('profile.member')}</span>
                                <span className="text-white font-bold ml-1.5">2024</span>
                            </div>
                            <div className="bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-700 whitespace-nowrap">
                                <span className="text-gray-400">{t('profile.created')}</span>
                                <span className="text-blue-400 font-bold ml-1.5">{savedCards.length}</span>
                            </div>
                            <div className="bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-700 whitespace-nowrap">
                                <span className="text-gray-400">{t('profile.liked')}</span>
                                <span className="text-red-400 font-bold ml-1.5">{likedCards.length}</span>
                            </div>
                            <div className="bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-700 whitespace-nowrap">
                                <span className="text-gray-400">{t('profile.packs')}</span>
                                <span className="text-amber-300 font-bold ml-1.5">{purchasedPacks.length}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-2 md:gap-3 z-10 w-full md:w-auto mt-2 md:mt-0">
                         <button onClick={onRecharge} className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs md:text-sm">
                            <WalletIcon className="w-4 h-4" />
                            {t('profile.recharge')}
                        </button>
                        <button className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white font-medium transition-colors text-xs md:text-sm">
                            {t('profile.edit')}
                        </button>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div>
                    <div className="flex gap-4 md:gap-8 border-b border-gray-800 mb-6 md:mb-8 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setActiveTab('creations')}
                            className={`font-bold pb-3 md:pb-4 px-2 transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${
                                activeTab === 'creations' 
                                    ? 'text-blue-500 border-blue-500' 
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            {t('tab.creations')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('favorites')}
                            className={`font-bold pb-3 md:pb-4 px-2 transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${
                                activeTab === 'favorites' 
                                    ? 'text-red-500 border-red-500' 
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            {t('tab.favorites')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('packs')}
                            className={`font-bold pb-3 md:pb-4 px-2 transition-colors border-b-2 whitespace-nowrap text-sm md:text-base ${
                                activeTab === 'packs' 
                                    ? 'text-amber-400 border-amber-400' 
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            {t('tab.purchased_packs')}
                        </button>
                    </div>

                    {activeTab === 'packs' ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {purchasedPacks.map((pack) => (
                                <PackCard
                                    key={pack.id}
                                    pack={pack}
                                    meta={[
                                        { label: t('packs.cards_count'), value: pack.packCount },
                                        { label: t('profile.pack_bought'), value: new Date(pack.purchasedAt).toLocaleDateString('en-CA') },
                                    ]}
                                    primaryActionLabel={t('packs.open_owned_pack')}
                                    onPrimaryAction={(selectedPack) => onOpenPurchasedPack?.(selectedPack as PurchasedPack)}
                                    showPrimaryIcon={false}
                                    compact={true}
                                    secondaryActionLabel={t('packs.view_pack')}
                                    onSecondaryAction={() => undefined}
                                />
                            ))}
                        </div>
                    ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                         {displayCards.map((card) => (
                             <div key={card.id} className="flex flex-col gap-2 md:gap-4 group">
                                 {/* Wrapper for Card and Overlay */}
                                 {/* FIXED: Added onClick to open viewCard on mobile directly */}
                                 <div 
                                    className="relative w-full aspect-[420/588] cursor-pointer"
                                    onClick={() => setViewCard(card)}
                                >
                                     {/* Card Layer - z-0 */}
                                     <div className="absolute inset-0 z-0">
                                         <TiltCard className="w-full h-full rounded-[16px] md:rounded-[24px]" maxAngle={20} disabled={true}>
                                             <div className="w-full h-full relative rounded-[16px] md:rounded-[24px] overflow-hidden">
                                                 <ResponsiveCardContainer>
                                                    <CardPreview data={card} />
                                                 </ResponsiveCardContainer>
                                             </div>
                                         </TiltCard>
                                     </div>

                                     {activeTab === 'creations' && isPublishedCard(card) && (
                                        <div className="absolute left-2 top-2 md:left-3 md:top-3 z-10 rounded-full border border-green-400/25 bg-green-500/18 px-2.5 py-1 text-[10px] md:text-xs font-bold text-green-200 backdrop-blur-md shadow-lg">
                                            {t('card.published_badge')}
                                        </div>
                                     )}
                                     {activeTab === 'favorites' && getFavoriteStateLabel(card) && (
                                        <div className={`absolute left-2 top-2 md:left-3 md:top-3 z-10 rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold backdrop-blur-md shadow-lg ${
                                            isDeletedCard(card)
                                                ? 'border border-red-400/25 bg-red-500/18 text-red-100'
                                                : 'border border-amber-400/25 bg-amber-500/18 text-amber-100'
                                        }`}>
                                            {getFavoriteStateLabel(card)}
                                        </div>
                                     )}
                                     {isAppraisedCard(card) && (
                                        <div className="absolute right-2 top-2 md:right-3 md:top-3 z-10 rounded-full border border-amber-400/25 bg-amber-500/18 px-2.5 py-1 text-[10px] md:text-xs font-bold text-amber-100 backdrop-blur-md shadow-lg">
                                            已鑑定
                                        </div>
                                     )}

                                    {/* Desktop Actions Overlay - Hidden on Mobile (md:flex) */}
                                    {/* This prevents mobile click interference */}
                                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        className="hidden md:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center gap-2 p-4 z-20 rounded-[24px]"
                                    >
                                        {activeTab === 'favorites' ? (
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setViewCard(card);
                                                    }} 
                                                    className="w-full max-w-[160px] bg-white/90 text-black py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform backdrop-blur-sm shadow-lg cursor-pointer"
                                                > 
                                                    <EyeIcon className="w-4 h-4" /> {t('card.view')} 
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (card.id) onRemoveFavorite(card.id);
                                                    }} 
                                                    className="w-full max-w-[160px] bg-red-600 text-white py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform mt-2 shadow-lg cursor-pointer"
                                                > 
                                                    <TrashIcon className="w-3 h-3" /> {t('btn.remove')} 
                                                </button>
                                            </>
                                        ) : ( // Creations tab
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setViewCard(card);
                                                    }} 
                                                    className="w-full max-w-[160px] bg-white/90 text-black py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform backdrop-blur-sm shadow-lg cursor-pointer"
                                                > 
                                                    <EyeIcon className="w-4 h-4" /> {t('card.view')} 
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onLoadCard(card);
                                                    }} 
                                                    className="w-full max-w-[160px] bg-blue-600 text-white py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg cursor-pointer"
                                                > 
                                                    <EditIcon className="w-3 h-3" /> Edit 
                                                </button>
                                                {/* Only show publish/delete on My Creations */}
                                                {activeTab === 'creations' && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                onPublishCard(card);
                                                            }} 
                                                            className={`w-full max-w-[160px] py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg cursor-pointer ${
                                                                isPublishedCard(card)
                                                                    ? 'bg-amber-600 text-white'
                                                                    : 'bg-green-600 text-white'
                                                            }`}
                                                        > 
                                                            <GlobeIcon className="w-3 h-3" /> {isPublishedCard(card) ? t('btn.unpublish_card') : t('btn.publish_card')} 
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (card.id) onDeleteCard(card.id);
                                                            }}
                                                            className="w-full max-w-[160px] bg-red-600 text-white py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform mt-2 shadow-lg cursor-pointer"
                                                        > 
                                                            <TrashIcon className="w-3 h-3" /> {t('btn.delete')} 
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                 </div>
                                 
                                 <div className="flex justify-between items-center px-1 md:px-2">
                                     <div className="min-w-0">
                                         <span className="font-bold text-white block truncate max-w-[100px] md:max-w-[150px] text-xs md:text-base">{card.name}</span>
                                         {activeTab === 'creations' && isPublishedCard(card) && (
                                            <span className="text-[10px] md:text-xs text-green-300">{t('card.published_badge')}</span>
                                         )}
                                         {activeTab === 'favorites' && getFavoriteStateNotice(card) && (
                                            <span className={`block text-[10px] md:text-xs ${isDeletedCard(card) ? 'text-red-300' : 'text-amber-300'}`}>{getFavoriteStateNotice(card)}</span>
                                         )}
                                         {isAppraisedCard(card) && (
                                            <span className="block text-[10px] md:text-xs text-amber-300">已鑑定</span>
                                         )}
                                     </div>
                                     <span className="text-[10px] md:text-xs text-gray-500">{getSubtypeLabel(card.subtype, language)}</span>
                                 </div>
                             </div>
                         ))}
                         
                         {/* Add New Placeholder (Only on Creations Tab) */}
                         {activeTab === 'creations' && (
                             <div 
                                key="create-new-card-placeholder"
                                onClick={onCreateNew}
                                className="aspect-[420/588] rounded-[16px] md:rounded-[24px] border-2 border-dashed border-gray-800 flex flex-col items-center justify-center gap-2 md:gap-4 text-gray-600 hover:text-gray-400 hover:border-gray-600 hover:bg-gray-800/20 transition-all cursor-pointer group"
                             >
                                 <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                                     <span className="text-2xl md:text-4xl pb-1 md:pb-2">+</span>
                                 </div>
                                 <span className="font-bold text-xs md:text-base text-center px-2">{t('card.create_new')}</span>
                             </div>
                         )}
                    </div>
                    )}
                </div>
            </div>

            {/* View Modal - Expanded to include Actions */}
            {viewCard && (
                 <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto" onClick={() => setViewCard(null)}>
                     {/* Flex layout compatible with mobile and desktop */}
                     <div className="min-h-full w-full flex flex-col md:flex-row items-center justify-center p-4 py-12 md:p-8 gap-8 md:gap-12" onClick={e => e.stopPropagation()}>
                         
                         {/* Close Button */}
                         <button 
                            onClick={() => setViewCard(null)}
                            className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors z-[110] active:scale-90 border border-gray-700"
                         >
                             <XIcon className="w-6 h-6" />
                         </button>

                         {/* Left: Card Preview */}
                         <div className="w-[85vw] max-w-[420px] md:w-[420px] md:max-w-none flex-shrink-0 animate-in zoom-in-90 duration-300">
                             <TiltCard className="w-full aspect-[420/588] rounded-[24px] shadow-2xl shadow-black/50" maxAngle={20}>
                                 <ResponsiveCardContainer>
                                     <CardPreview data={viewCard} />
                                 </ResponsiveCardContainer>
                             </TiltCard>
                         </div>

                         {/* Right: Actions and Details Panel */}
                         <div className="flex flex-col text-left w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-500 pb-8 md:pb-0">
                             <div>
                                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-heading">{viewCard.name}</h2>
                                 <div className="flex items-center gap-3 text-gray-400">
                                     <span className="px-3 py-1 bg-gray-800 rounded-full text-xs md:text-sm font-medium border border-gray-700">{getSupertypeLabel(viewCard.supertype)}</span>
                                     <span className="px-3 py-1 bg-gray-800 rounded-full text-xs md:text-sm font-medium border border-gray-700">{getSubtypeLabel(viewCard.subtype, language)}</span>
                                     {isPublishedCard(viewCard) && (
                                        <span className="px-3 py-1 bg-green-500/15 rounded-full text-xs md:text-sm font-medium border border-green-500/30 text-green-300">{t('card.published_badge')}</span>
                                     )}
                                     {activeTab === 'favorites' && getFavoriteStateLabel(viewCard) && (
                                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                                            isDeletedCard(viewCard)
                                                ? 'bg-red-500/15 border border-red-500/30 text-red-200'
                                                : 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                                        }`}>{getFavoriteStateLabel(viewCard)}</span>
                                     )}
                                     {isAppraisedCard(viewCard) && (
                                        <span className="px-3 py-1 bg-amber-500/15 rounded-full text-xs md:text-sm font-medium border border-amber-500/30 text-amber-200">已鑑定</span>
                                     )}
                                 </div>
                             </div>

                             {/* Info Box */}
                             <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">Artist</span>
                                     <span className="text-white font-medium">{viewCard.illustrator}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">HP</span>
                                     <span className="text-white font-medium">{viewCard.hp}</span>
                                 </div>
                                 <div className="pt-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold block mb-2">{t('label.dexentry')}</span>
                                     <p className="text-gray-300 text-sm italic leading-relaxed">
                                         {viewCard.pokedexEntry || t('msg.no_lore_entry')}
                                     </p>
                                 </div>
                                 {isUnavailableFavorite(viewCard) && (
                                    <div className="pt-2 border-t border-gray-700">
                                        <span className="text-gray-500 text-sm uppercase font-bold block mb-2">{t('favorites.unavailable_title')}</span>
                                        <div className={`rounded-xl p-4 ${
                                            isDeletedCard(viewCard)
                                                ? 'border border-red-500/20 bg-red-500/5'
                                                : 'border border-amber-500/20 bg-amber-500/5'
                                        }`}>
                                            <p className={`text-sm leading-relaxed ${isDeletedCard(viewCard) ? 'text-red-100/90' : 'text-amber-100/90'}`}>{getFavoriteStateNotice(viewCard)}</p>
                                        </div>
                                    </div>
                                 )}
                                 {isAppraisedCard(viewCard) && (
                                    <div className="pt-2 border-t border-gray-700">
                                        <span className="text-gray-500 text-sm uppercase font-bold block mb-2">Appraisal</span>
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                                            <div className="text-2xl font-black text-amber-300">{viewCard.appraisal?.price}</div>
                                            <p className="text-sm leading-relaxed text-amber-100/90">{viewCard.appraisal?.comment}</p>
                                        </div>
                                    </div>
                                 )}
                             </div>

                             {/* Action Buttons */}
                             {activeTab === 'creations' ? (
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => { onLoadCard(viewCard); setViewCard(null); }}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <EditIcon className="w-5 h-5" />
                                        Edit / Copy Design
                                    </button>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => { onPublishCard(viewCard); setViewCard(null); }}
                                            className={`flex-1 font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                                                isPublishedCard(viewCard)
                                                    ? 'bg-[#161b22] hover:bg-amber-900/20 text-amber-300 border-amber-900/50'
                                                    : 'bg-[#161b22] hover:bg-[#1f2937] text-green-400 border-green-900/50'
                                            }`}
                                        >
                                            <GlobeIcon className="w-5 h-5" />
                                            {isPublishedCard(viewCard) ? t('btn.unpublish_card') : t('btn.publish_card')}
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                onDeleteCard(viewCard.id!); 
                                                setViewCard(null); 
                                            }}
                                            className="flex-1 bg-[#161b22] hover:bg-red-900/20 text-red-400 border border-red-900/50 font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                             ) : (
                                <button 
                                    onClick={() => { onRemoveFavorite(viewCard.id!); setViewCard(null); }}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    Remove from Favorites
                                </button>
                             )}
                         </div>
                     </div>
                 </div>
            )}
        </div>
    );
};
