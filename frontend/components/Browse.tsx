
import React, { useState, useEffect, useRef } from 'react';
import { CardComment, CardData, User } from '../types';
import { CardPreview } from './CardPreview';
import { CartIcon, EyeIcon, XIcon, HeartIcon, EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { TiltCard } from './TiltCard';
import { SparkleBurst } from './Effects';
import { useLanguage } from '../contexts/LanguageContext';
import { getRarityLabel } from '../lib/rarity';
import { getSubtypeLabel } from '../lib/subtype';
import { getAttributeLabel } from '../lib/attributes';
import { createCardCommentOnServer, deleteCardCommentOnServer, fetchCardComments } from '../services/cardsService';

interface BrowseProps {
    onAddToCart: (card: CardData) => void;
    onLoadCard: (card: CardData) => void;
    cards: CardData[];
    onToggleLike: (id: string) => void;
    user: User | null;
    onLoginRequired: () => void;
    addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
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

type SortFilter = 'Trending' | 'Newest' | 'Top Rated';

export const Browse: React.FC<BrowseProps> = ({ onAddToCart, onLoadCard, cards, onToggleLike, user, onLoginRequired, addNotification }) => {
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [activeFilter, setActiveFilter] = useState<SortFilter>('Trending');
    const [cardComments, setCardComments] = useState<Record<string, {
        list: CardComment[];
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    }>>({});
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
    const [commentDraft, setCommentDraft] = useState('');
    const [commentError, setCommentError] = useState<string | null>(null);
    const [commentPage, setCommentPage] = useState(1);
    const { t, language } = useLanguage();
    const getSupertypeLabel = (supertype: CardData['supertype']) =>
        supertype === 'Trainer'
            ? t('supertype.trainer')
            : supertype === 'Energy'
                ? t('supertype.energy')
                : t('supertype.pokemon');
    const isAppraisedCard = (card: CardData) => Boolean(card.appraisal?.price && card.appraisal?.comment);
    
    // Track bursts for likes
    const [likeBursts, setLikeBursts] = useState<Record<string, number>>({});
    
    // Update selected card state when global state changes
    useEffect(() => {
        if(selectedCard) {
            const updatedCard = cards.find(c => c.id === selectedCard.id);
            if (updatedCard) {
                setSelectedCard(updatedCard);
            } else {
                setSelectedCard(null); // Card was deleted/removed
            }
        }
    }, [cards, selectedCard]);

    useEffect(() => {
        if (!selectedCard?.id) {
            setCommentDraft('');
            setCommentError(null);
            setCommentPage(1);
            return;
        }
        setCommentPage(1);
    }, [selectedCard?.id]);

    useEffect(() => {
        if (!selectedCard?.id) {
            return;
        }
        let cancelled = false;
        setIsCommentsLoading(true);
        setCommentError(null);

        fetchCardComments(selectedCard.id, { page: commentPage, limit: 5 })
            .then((result) => {
                if (cancelled) return;
                setCardComments((prev) => ({
                    ...prev,
                    [selectedCard.id!]: {
                        list: result.comments,
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        hasMore: result.hasMore,
                    },
                }));
            })
            .catch((error: any) => {
                if (cancelled) return;
                setCommentError(error?.message || t('comments.load_failed'));
            })
            .finally(() => {
                if (!cancelled) {
                    setIsCommentsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedCard?.id, commentPage, t]);

    const handleLikeClick = (id: string | undefined) => {
        if (!id) return;
        if (!user) {
            onLoginRequired();
            return;
        }
        
        const card = cards.find(c => c.id === id);
        if (card && !card.isLiked) {
             setLikeBursts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
        }
        onToggleLike(id);
    };

    const handleAddToCart = (e: React.MouseEvent, card: CardData) => {
        e.stopPropagation();
        if (!user) {
            onLoginRequired();
            return;
        }
        onAddToCart(card);
    };

    const handleLoadCard = (e: React.MouseEvent, card: CardData) => {
        e.stopPropagation();
        if (!user) {
            onLoginRequired();
            return;
        }
        onLoadCard(card);
    };

    const handleSubmitComment = async () => {
        if (!selectedCard?.id) return;
        if (!user) {
            onLoginRequired();
            return;
        }

        const content = commentDraft.trim();
        if (!content) {
            setCommentError(t('comments.empty_error'));
            return;
        }

        setIsSubmittingComment(true);
        setCommentError(null);
        try {
            await createCardCommentOnServer(selectedCard.id, content);
            setCommentDraft('');
            addNotification('success', t('comments.posted'));
            setCommentPage(1);
            const result = await fetchCardComments(selectedCard.id, { page: 1, limit: 5 });
            setCardComments((prev) => ({
                ...prev,
                [selectedCard.id!]: {
                    list: result.comments,
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    hasMore: result.hasMore,
                },
            }));
        } catch (error: any) {
            const message = error?.message || t('comments.post_failed');
            setCommentError(message);
            addNotification('error', message);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!selectedCard?.id) return;
        if (!user) {
            onLoginRequired();
            return;
        }

        setDeletingCommentId(commentId);
        setCommentError(null);
        try {
            await deleteCardCommentOnServer(selectedCard.id, commentId);
            addNotification('success', t('comments.deleted'));

            const currentData = cardComments[selectedCard.id];
            const shouldGoPrevPage =
                currentData &&
                currentData.page > 1 &&
                currentData.list.length === 1;
            const nextPage = shouldGoPrevPage ? currentData.page - 1 : (currentData?.page || commentPage);

            if (nextPage !== commentPage) {
                setCommentPage(nextPage);
            } else {
                const result = await fetchCardComments(selectedCard.id, { page: nextPage, limit: 5 });
                setCardComments((prev) => ({
                    ...prev,
                    [selectedCard.id!]: {
                        list: result.comments,
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                        hasMore: result.hasMore,
                    },
                }));
            }
        } catch (error: any) {
            const message = error?.message || t('comments.delete_failed');
            setCommentError(message);
            addNotification('error', message);
        } finally {
            setDeletingCommentId(null);
        }
    };

    const getSortedCards = () => {
        const c = [...cards];
        switch (activeFilter) {
            case 'Top Rated':
                return c.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            case 'Newest':
                return c.sort((a, b) => {
                    const left = new Date((b as any).publishedAt || (b as any).created_at || 0).getTime();
                    const right = new Date((a as any).publishedAt || (a as any).created_at || 0).getTime();
                    return left - right;
                });
            case 'Trending':
            default:
                return c;
        }
    };

    const displayedCards = getSortedCards();
    const selectedCommentsData = selectedCard?.id
        ? cardComments[selectedCard.id]
        : undefined;
    const selectedComments = selectedCommentsData?.list || [];
    const commentsCountLabel = t('comments.count').replace('{count}', String(selectedCommentsData?.total || 0));
    const commentsPageLabel = t('comments.page').replace('{page}', String(selectedCommentsData?.page || 1));

    const filters: { key: SortFilter, label: string }[] = [
        { key: 'Trending', label: t('filter.trending') },
        { key: 'Newest', label: t('filter.newest') },
        { key: 'Top Rated', label: t('filter.toprated') }
    ];

    return (
        <div className="flex-grow bg-[#090b10] overflow-y-auto p-3 md:p-8 relative">
             <div className="max-w-[1400px] mx-auto">
                 {/* Header */}
                 <div className="flex flex-col md:flex-row justify-between items-end mb-6 md:mb-12 pb-4 md:pb-6 border-b border-gray-800">
                     <div className="w-full md:w-auto mb-4 md:mb-0">
                         <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 font-heading tracking-tight">{t('browse.title')}</h1>
                         <p className="text-gray-400 text-sm md:text-lg">{t('browse.subtitle')}</p>
                     </div>
                     <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                         {/* Filter Buttons */}
                         {filters.map(f => (
                             <button 
                                key={f.key} 
                                onClick={() => setActiveFilter(f.key)}
                                className={`px-4 md:px-5 py-2 md:py-2.5 border rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
                                    activeFilter === f.key 
                                        ? 'bg-[#1f2937] border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                        : 'bg-[#161b22] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500'
                                }`}
                             >
                                 {f.label}
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Grid - Modified for 2 columns on mobile (grid-cols-2) */}
                 <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 lg:gap-10 pb-20">
                     {displayedCards.map((card) => (
                         <div key={card.id} className="flex flex-col gap-2 md:gap-4 group">
                             {/* Card Wrapper with Tilt */}
                             <TiltCard className="w-full aspect-[420/588] rounded-[16px] md:rounded-[24px]" maxAngle={30} disabled={true}>
                                 <div className="w-full h-full relative rounded-[16px] md:rounded-[24px] overflow-hidden">
                                     <ResponsiveCardContainer>
                                        <CardPreview data={card} />
                                     </ResponsiveCardContainer>
                                     {isAppraisedCard(card) && (
                                        <div className="absolute right-2 top-2 z-20 rounded-full border border-amber-400/25 bg-amber-500/18 px-2.5 py-1 text-[10px] font-bold text-amber-100 backdrop-blur-md shadow-lg">
                                            已鑑定
                                        </div>
                                     )}

                                     {/* Hover Overlay - Only shows on desktop hover, on mobile we rely on clicking to view */}
                                     <div className="hidden md:flex absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex-col items-center justify-center gap-3 z-20">
                                         <button 
                                            onClick={() => setSelectedCard(card)}
                                            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                         >
                                             <EyeIcon className="w-5 h-5" />
                                             {t('card.view')}
                                         </button>
                                         <button 
                                            onClick={(e) => handleLoadCard(e, card)}
                                            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-50 flex items-center gap-2 bg-gray-800 text-white border border-gray-600 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-gray-700 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                         >
                                             <EditIcon className="w-4 h-4" />
                                             {t('card.copy')}
                                         </button>
                                         <button 
                                            onClick={(e) => handleAddToCart(e, card)}
                                            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100 flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                         >
                                             <CartIcon className="w-5 h-5" />
                                             {t('card.add')}
                                         </button>
                                     </div>
                                     
                                     {/* Mobile click handler to open view modal since hover doesn't exist */}
                                     <div 
                                        className="md:hidden absolute inset-0 z-30" 
                                        onClick={() => setSelectedCard(card)}
                                     ></div>
                                 </div>
                             </TiltCard>

                             {/* Info Footer */}
                             <div className="px-1 md:px-2 pt-1 md:pt-2">
                                 <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                                     <div className="overflow-hidden">
                                         <h3 className="font-bold text-white text-sm md:text-lg leading-tight truncate">{card.name}</h3>
                                         <p className="text-[10px] md:text-sm text-gray-500 truncate">Illus. {card.illustrator}</p>
                                         {isAppraisedCard(card) && (
                                            <p className="text-[10px] md:text-xs text-amber-300 truncate">已鑑定</p>
                                         )}
                                     </div>
                                     <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-1">
                                          <span className="text-[10px] md:text-xs font-mono text-gray-600 bg-gray-900 px-1.5 md:px-2 py-0.5 rounded border border-gray-800">
                                              {card.setNumber}
                                          </span>
                                          <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLikeClick(card.id);
                                            }}
                                            className={`flex items-center gap-1 md:gap-1.5 text-xs font-bold transition-colors relative overflow-visible z-40 ${
                                                card.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                                            }`}
                                          >
                                              <HeartIcon className="w-3 h-3 md:w-3.5 md:h-3.5" filled={card.isLiked} />
                                              {card.likes}
                                          </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Detail Modal - Fixed for Mobile Layout */}
             {selectedCard && (
                 <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto" onClick={() => setSelectedCard(null)}>
                     {/* 
                        Layout Fix: 
                        1. Use min-h-full to allow scrolling on small screens if content is tall.
                        2. Use py-8 to give vertical breathing room.
                        3. Use ResponsiveCardContainer with max-width on mobile instead of fixed transform scale.
                     */}
                    <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-12 md:flex-row md:items-start md:justify-center md:p-8 gap-8 md:gap-12" onClick={e => e.stopPropagation()}>
                         
                         {/* Close Button */}
                         <button 
                            onClick={() => setSelectedCard(null)}
                            className="fixed top-4 right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors z-[110] active:scale-90 border border-gray-700"
                         >
                             <XIcon className="w-6 h-6" />
                         </button>

                         {/* Left: Card Preview */}
                         {/* Mobile: Width relative to screen, Max width constrained to ensure buttons fit below. Desktop: standard scale. */}
                        <div className="w-[85vw] max-w-[420px] md:sticky md:top-8 md:w-[420px] md:max-w-none flex-shrink-0 animate-in zoom-in-90 duration-300">
                             <TiltCard className="w-full aspect-[420/588] rounded-[24px] shadow-2xl shadow-black/50" maxAngle={20}>
                                 <ResponsiveCardContainer>
                                     <CardPreview data={selectedCard} />
                                 </ResponsiveCardContainer>
                             </TiltCard>
                         </div>

                         {/* Right: Details & Actions */}
                         <div className="flex flex-col text-left w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 md:slide-in-from-right-8 duration-500 pb-8 md:pb-0">
                             <div>
                                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-heading">{selectedCard.name}</h2>
                                 <div className="flex items-center gap-3 text-gray-400">
                                     <span className="px-3 py-1 bg-gray-800 rounded-full text-xs md:text-sm font-medium border border-gray-700">{getSupertypeLabel(selectedCard.supertype)}</span>
                                     <span className="px-3 py-1 bg-gray-800 rounded-full text-xs md:text-sm font-medium border border-gray-700">
                                         {getSubtypeLabel(selectedCard.subtype, language)}
                                     </span>
                                     <span className="px-3 py-1 bg-gray-800 rounded-full text-xs md:text-sm font-medium border border-gray-700">
                                         {getRarityLabel(selectedCard.rarity, language)}
                                     </span>
                                     {isAppraisedCard(selectedCard) && (
                                        <span className="px-3 py-1 bg-amber-500/15 rounded-full text-xs md:text-sm font-medium border border-amber-500/30 text-amber-200">已鑑定</span>
                                     )}
                                 </div>
                             </div>

                             <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">{t('card.creator')}</span>
                                     <span className="text-white font-medium">{selectedCard.authorName || t('card.unknown_creator')}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">Artist</span>
                                     <span className="text-white font-medium">{selectedCard.illustrator}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">HP</span>
                                     <span className="text-white font-medium">{selectedCard.hp}</span>
                                 </div>
                                 <div className="flex justify-between border-b border-gray-700 pb-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold">Type</span>
                                     <span className="text-white font-medium">{getAttributeLabel(selectedCard.type)}</span>
                                 </div>
                                 <div className="pt-2">
                                     <span className="text-gray-500 text-sm uppercase font-bold block mb-2">{t('label.dexentry')}</span>
                                     <p className="text-gray-300 text-sm italic leading-relaxed">
                                         {selectedCard.pokedexEntry || t('msg.no_lore_entry')}
                                     </p>
                                 </div>
                                 {isAppraisedCard(selectedCard) && (
                                    <div className="pt-2 border-t border-gray-700">
                                        <span className="text-gray-500 text-sm uppercase font-bold block mb-2">Appraisal</span>
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                                            <div className="text-2xl font-black text-amber-300">{selectedCard.appraisal?.price}</div>
                                            <p className="text-sm leading-relaxed text-amber-100/90">{selectedCard.appraisal?.comment}</p>
                                        </div>
                                    </div>
                                 )}
                             </div>

                             <div className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 shadow-lg space-y-4">
                                 <div className="flex items-center justify-between gap-3">
                                     <div>
                                         <span className="text-gray-500 text-sm uppercase font-bold block">{t('comments.title')}</span>
                                         <p className="text-xs text-gray-500 mt-1">
                                             {(selectedCommentsData?.total || 0) > 0
                                                ? commentsCountLabel
                                                : t('comments.empty')}
                                         </p>
                                     </div>
                                     {selectedCommentsData && selectedCommentsData.total > 0 && (
                                        <span className="text-xs text-gray-500">{commentsPageLabel}</span>
                                     )}
                                 </div>

                                 <div className="space-y-3">
                                     <textarea
                                        value={commentDraft}
                                        onChange={(e) => setCommentDraft(e.target.value)}
                                        maxLength={500}
                                        placeholder={user ? t('comments.placeholder') : t('comments.login_prompt')}
                                        className="w-full min-h-[96px] rounded-xl border border-gray-700 bg-[#0d1117] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                                        disabled={isSubmittingComment}
                                     />
                                     <div className="flex items-center justify-between gap-3">
                                         <span className="text-xs text-gray-500">{commentDraft.trim().length}/500</span>
                                         <button
                                            onClick={handleSubmitComment}
                                            disabled={isSubmittingComment}
                                            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700"
                                         >
                                            {isSubmittingComment ? t('comments.posting') : t('comments.submit')}
                                         </button>
                                     </div>
                                     {commentError && <p className="text-sm text-red-300">{commentError}</p>}
                                 </div>

                                 <div className="space-y-3 border-t border-gray-700 pt-4">
                                     {isCommentsLoading ? (
                                        <p className="text-sm text-gray-400">{t('comments.loading')}</p>
                                     ) : selectedComments.length === 0 ? (
                                        <p className="text-sm text-gray-400">{t('comments.empty')}</p>
                                     ) : (
                                        selectedComments.map((comment) => (
                                            <div key={comment.id} className="rounded-2xl border border-gray-800 bg-[#0d1117] px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-sm font-bold text-white">{comment.authorName}</span>
                                                        {comment.isOwner && (
                                                            <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                                                                {t('comments.you_badge')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs text-gray-500">
                                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString('zh-HK') : ''}
                                                        </span>
                                                        {comment.canDelete && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                disabled={deletingCommentId === comment.id}
                                                                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-red-900/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                                                                title={t('comments.delete')}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{comment.content}</p>
                                            </div>
                                        ))
                                     )}
                                 </div>

                                 {selectedCommentsData && selectedCommentsData.total > 0 && (
                                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                                        <button
                                            onClick={() => setCommentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={isCommentsLoading || (selectedCommentsData.page || 1) <= 1}
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-sm font-bold text-gray-200 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ArrowUpIcon className="w-4 h-4" />
                                            {t('comments.prev')}
                                        </button>
                                        <button
                                            onClick={() => setCommentPage((prev) => prev + 1)}
                                            disabled={isCommentsLoading || !selectedCommentsData.hasMore}
                                            className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-4 py-2 text-sm font-bold text-gray-200 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {t('comments.next')}
                                            <ArrowDownIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                 )}
                             </div>

                             <div className="flex gap-4 pt-2">
                                 <button 
                                    onClick={() => handleLikeClick(selectedCard.id)}
                                    className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm md:text-lg active:scale-95 relative overflow-hidden ${
                                        selectedCard.isLiked 
                                            ? 'bg-red-600 text-white shadow-red-900/20' 
                                            : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                    }`}
                                 >
                                     <SparkleBurst active={true} key={likeBursts[selectedCard.id!] || 0} count={16} color="#fca5a5" />
                                     <HeartIcon className="w-5 h-5 md:w-6 md:h-6" filled={selectedCard.isLiked} />
                                     {selectedCard.isLiked ? 'Liked' : 'Like'} ({selectedCard.likes})
                                 </button>
                                 <button 
                                    onClick={() => {
                                        if(!user) { onLoginRequired(); return; }
                                        onAddToCart(selectedCard); 
                                        setSelectedCard(null); 
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-sm md:text-lg active:scale-95"
                                 >
                                     <CartIcon className="w-5 h-5 md:w-6 md:h-6" />
                                     {t('btn.addtocart')}
                                 </button>
                             </div>
                             
                             <button 
                                onClick={() => {
                                    if(!user) { onLoginRequired(); return; }
                                    onLoadCard(selectedCard); 
                                    setSelectedCard(null); 
                                }}
                                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                             >
                                 <EditIcon className="w-4 h-4" />
                                 Edit / Copy Design
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};
