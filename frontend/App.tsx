
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import { LoginModal } from './components/LoginModal';
import { Browse } from './components/Browse';
import { PackBrowse } from './components/PackBrowse';
import { Cart } from './components/Cart';
import { Profile } from './components/Profile';
import { BattleArena } from './components/BattleArena';
import { Appraiser } from './components/Appraiser';
import { Recharge } from './components/Recharge';
import { TiltCard } from './components/TiltCard';
import { ToastContainer } from './components/Toast';
import { ActionDialog, ActionDialogOption } from './components/ActionDialog';
import { CardData, INITIAL_CARD_DATA, Notification, PurchasedPack, User } from './types';
import { initialMarketPacks } from './data/mockPacks';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { GlobeIcon, SparklesIcon, UserIcon } from './components/Icons';
import { restoreCurrentUser } from './services/authService';
import {
  deleteCardFromServer,
  fetchMyCards,
  fetchFavoritedCards,
  fetchPublicCards,
  publishCardToServer,
  saveCardToServer,
  saveCardAppraisalToServer,
  toggleCardLikeOnServer,
  toggleCardFavoriteOnServer,
  updateCardOnServer,
} from './services/cardsService';
import { applyCoinsToUser, rechargeCoins } from './services/walletService';

// Helper for responsive scaling of the preview card in App layout
const ResponsivePreviewContainer = ({ children }: { children?: React.ReactNode }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            
            // Standard card size
            const cardW = 420;
            const cardH = 588;
            
            // Add padding/margin
            const padding = 32;
            const availW = width - padding;
            const availH = height - padding;

            const scaleW = availW / cardW;
            const scaleH = availH / cardH;
            
            // Fit within container maintaining aspect ratio
            setScale(Math.min(scaleW, scaleH, 1)); // Max scale 1 to prevent blurriness
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        // Resize observer for container changes
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center relative overflow-hidden">
             {/* Grid Pattern Background */}
             <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                     style={{ 
                        backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', 
                        backgroundSize: '40px 40px' 
                     }}>
            </div>

            <div 
                style={{ 
                    transform: `scale(${scale})`, 
                    transformOrigin: 'center center',
                    width: '420px',
                    height: '588px',
                    flexShrink: 0
                }}
            >
                {children}
            </div>
            
            <div className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 text-[10px] sm:text-xs text-gray-600 font-mono pointer-events-none">
                Preview Mode
            </div>
        </div>
    );
};

// Reusable Sign In Required Component
const SignInRequiredView = ({ onLogin, t }: { onLogin: () => void, t: any }) => (
    <div className="flex-grow flex items-center justify-center bg-[#090b10] text-center p-8">
        <div className="max-w-md bg-[#161b22] border border-gray-800 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('auth.signin_req')}</h2>
            <p className="text-gray-400 mb-8">{t('auth.signin_desc')}</p>
            <button 
                onClick={onLogin}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
            >
                {t('nav.signin')}
            </button>
        </div>
    </div>
);

function AppContent() {
  const [currentView, setCurrentView] = useState<'create' | 'browse' | 'cart' | 'profile' | 'arena' | 'appraiser' | 'recharge'>('create');
  const [browseSection, setBrowseSection] = useState<'cards' | 'packs'>('cards');
  const [isBrowseHeaderCollapsed, setIsBrowseHeaderCollapsed] = useState(false);
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA);
  const [cart, setCart] = useState<CardData[]>([]);
  
  // State for User Creations
  const [myCards, setMyCards] = useState<CardData[]>([]);

  // State for Browse Feed
  const [globalCards, setGlobalCards] = useState<CardData[]>([]);

  // State for Liked Cards (Favorites)
  const [likedCards, setLikedCards] = useState<CardData[]>([]);
  const [marketPacks, setMarketPacks] = useState(initialMarketPacks);
  const [purchasedPacks, setPurchasedPacks] = useState<PurchasedPack[]>([]);

  // Login State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // New state for image generation loading
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    title: string;
    description: string;
    options: ActionDialogOption[];
  } | null>(null);
  const { t } = useLanguage();
  const isPublishedCard = (card: CardData) => Boolean(card.isPublic || card.status === 'published' || card.publishedAt);

  const refreshMyCards = async (targetUser?: User | null) => {
      const activeUser = targetUser ?? user;
      if (!activeUser) {
          setMyCards([]);
          return;
      }

      try {
          const cards = await fetchMyCards();
          setMyCards(cards);
      } catch {
          setMyCards([]);
      }
  };

  const refreshPublicCards = async () => {
      try {
          const { cards } = await fetchPublicCards({ page: 1, limit: 50, sort: 'trending' });
          setGlobalCards(cards);
      } catch {
          setGlobalCards([]);
      }
  };

  const refreshLikedCards = async (targetUser?: User | null) => {
      const activeUser = targetUser ?? user;
      if (!activeUser) {
          setLikedCards([]);
          return;
      }

      try {
          const cards = await fetchFavoritedCards();
          setLikedCards(cards);
      } catch {
          setLikedCards([]);
      }
  };

  /**
   * [后端接口规范] 初始化：获取广场公开卡牌 (Browse Feed)
   * --------------------------------------------------------------
   * 1. 接口方法: GET /api/cards/public
   * 
   * 2. 请求参数 (Query Params):
   *    - page: number (默认 1)
   *    - limit: number (默认 20)
   *    - sort: 'trending' | 'newest' | 'top_rated' (排序方式)
   *    - userId: string (可选，当前登录用户ID，用于判断 isLiked 状态)
   * 
   * 3. 后端数据库建表规范 (cards 表):
   *    | 列名 (Column) | 类型 (Type) | 约束 (Constraint) | 说明 (Description) |
   *    |--------------|------------|------------------|-------------------|
   *    | is_public    | boolean    | DEFAULT false    | 是否公开可见 |
   *    | likes_count  | integer    | DEFAULT 0        | 点赞总数缓存字段 |
   *    | created_at   | timestamp  | NOT NULL         | 创建时间 |
   * 
   * 4. 返回值 (Response):
   *    {
   *      "code": 200,
   *      "data": {
   *        "list": [
   *          {
   *            "id": "uuid-string",
   *            "name": "Charizard",
   *            "image": "https://s3.bucket/cards/xxx.png",
   *            "supertype": "Pokémon",
   *            "subtype": "Stage 2",
   *            "likes": 342,
   *            "isLiked": false, // 如果传入了 userId，需计算当前用户是否点赞
   *            "user": { "id": "u1", "name": "CreatorName", "avatar": "..." }
   *            // ...其他 CardData 字段
   *          }
   *        ],
   *        "total": 100,
   *        "hasMore": true
   *      }
   *    }
   */
  useEffect(() => {
      refreshPublicCards();
  }, []);

  // Check for active session on load
  useEffect(() => {
    restoreCurrentUser().then((restoredUser) => {
        if (restoredUser) {
            setUser(restoredUser);
            console.log("Fetching user cards for:", restoredUser.email);
        }
    });
  }, []);

  useEffect(() => {
      if (currentView === 'profile' && user) {
          refreshMyCards();
          refreshLikedCards();
      }
  }, [currentView, user]);

  useEffect(() => {
      if (currentView === 'browse') {
          refreshPublicCards();
      }
  }, [currentView]);

  useEffect(() => {
      refreshPublicCards();
  }, [user]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const closeActionDialog = () => setActionDialog(null);

  const openActionDialog = (config: {
      title: string;
      description: string;
      options: ActionDialogOption[];
  }) => setActionDialog(config);

  const handleLogin = (nextUser: User) => {
      setUser(nextUser);
      setIsLoginOpen(false);
      refreshMyCards(nextUser);
      addNotification('success', `${t('auth.welcome')}, ${nextUser.name}!`);
  };

  const handleLogout = () => {
      setUser(null);
      setMyCards([]);
      setCurrentView('create');
      addNotification('info', t('nav.signout'));
  };

  const handleLoginRequired = () => {
      setIsLoginOpen(true);
      addNotification('info', t('auth.signin_req'));
  };

  const addToCart = (card: CardData) => {
      setCart([...cart, { ...card, id: Date.now().toString() }]);
  };

  const removeFromCart = (id: string) => {
      setCart(cart.filter(item => item.id !== id));
      addNotification('info', 'Item removed from cart.');
  };

  /**
   * [后端接口规范] 保存/创建卡牌
   * --------------------------------------------------------------
   * 1. 接口方法: POST /api/cards
   * 
   * 2. 请求参数 (Request Body JSON) - 必须包含所有字段，不得省略:
   *    {
   *       "supertype": "Pokémon", // 或 "Trainer", "Energy"
   *       "name": "Charizard",
   *       "image": "https://your-bucket-url/images/charizard.png", // 必须是上传后的持久化URL
   *       "hp": "330",
   *       "type": "Fire", // ElementType 枚举
   *       "subtype": "Stage 2", // Subtype 枚举
   *       "evolvesFrom": "Charmeleon",
   *       "attacks": [
   *          {
   *             "id": "uuid-v4-generated",
   *             "name": "Fire Blast",
   *             "cost": ["Fire", "Fire", "Colorless"],
   *             "damage": "120",
   *             "description": "Discard an energy card from this Pokémon."
   *          }
   *       ],
   *       "weakness": "Water",
   *       "resistance": "None",
   *       "retreatCost": 2,
   *       "illustrator": "5ban Graphics",
   *       "setNumber": "006/165",
   *       "rarity": "Double Rare",
   *       "regulationMark": "G",
   *       "setSymbolImage": "https://your-bucket-url/symbols/obsidian.png",
   *       "pokedexEntry": "It spits fire that is hot enough to melt boulders.",
   *       "dexSpecies": "Flame Pokémon",
   *       "dexHeight": "5'07\"",
   *       "dexWeight": "199.5 lbs.",
   *       "trainerType": null, // Pokemon卡牌此字段为 null
   *       "rules": [], // Pokemon卡牌此字段为空数组
   *       "holoPattern": "Sheen",
   *       "zoom": 1.2,
   *       "xOffset": 0,
   *       "yOffset": 10
   *    }
   * 
   * 3. 后端数据库建表规范 (Table: cards):
   *    | Column          | Type      | Note |
   *    |-----------------|-----------|------|
   *    | id              | uuid      | PK, 主键 |
   *    | user_id         | uuid      | FK -> users.id, 外键关联用户 |
   *    | name            | varchar   | 卡牌名称 (索引字段) |
   *    | image_url       | varchar   | 卡牌主图 URL |
   *    | is_public       | boolean   | default false, 是否公开 |
   *    | likes_count     | int       | default 0, 点赞计数缓存 |
   *    | deleted_at      | timestamp | nullable (软删除) |
   *    | created_at      | timestamp | default now() |
   *    | updated_at      | timestamp | default now() |
   *    | data            | jsonb     | 存储卡牌的所有属性详情，完整 Schema 如下：|
   * 
   *    [data 字段 JSONB 完整结构定义 (TypeScript Interface)]:
   *    {
   *      "supertype": "string (Enum: Pokémon, Trainer, Energy)",
   *      "subtype": "string (Enum: Basic, Stage 1, VMAX, etc.)",
   *      "hp": "string",
   *      "type": "string (Enum: Fire, Water, etc.)",
   *      "evolvesFrom": "string | null",
   *      "attacks": [
   *        {
   *          "id": "string",
   *          "name": "string",
   *          "cost": ["string (ElementType)"],
   *          "damage": "string",
   *          "description": "string"
   *        }
   *      ],
   *      "weakness": "string (ElementType) | null",
   *      "resistance": "string (ElementType) | null",
   *      "retreatCost": "number",
   *      "trainerType": "string (Enum: Item, Supporter, Stadium) | null",
   *      "rules": ["string"],
   *      "illustrator": "string",
   *      "setNumber": "string",
   *      "rarity": "string (Enum: Common, Rare, etc.)",
   *      "regulationMark": "string",
   *      "setSymbolImage": "string (URL) | null",
   *      "pokedexEntry": "string | null",
   *      "dexSpecies": "string | null",
   *      "dexHeight": "string | null",
   *      "dexWeight": "string | null",
   *      "holoPattern": "string (Enum: None, Cosmos, Sheen, etc.)",
   *      "zoom": "number",
   *      "xOffset": "number",
   *      "yOffset": "number"
   *    }
   * 
   * 4. 返回值:
   *    {
   *      "success": true,
   *      "cardId": "new-uuid-123",
   *      "message": "Card created successfully"
   *    }
   */
  const handleSaveCard = async (card: CardData) => {
      if (!user) {
          handleLoginRequired();
          return;
      }

      const persistNewCard = async () => {
          try {
              const createPayload = { ...card, id: undefined };
              const savedCard = await saveCardToServer(createPayload);
              setMyCards(prev => [savedCard, ...prev]);
              setCardData(savedCard);
              addNotification('success', card.id ? t('msg.card_copied') : t('msg.saved'));
          } catch (error: any) {
              addNotification('error', error.message || 'Failed to save card.');
          } finally {
              closeActionDialog();
          }
      };

      const persistOverwrite = async () => {
          try {
              const savedCard = await updateCardOnServer(card.id!, card);
              setMyCards(prev => prev.map(existing => existing.id === card.id ? savedCard : existing));
              setCardData(savedCard);
              addNotification('success', t('msg.card_updated'));
          } catch (error: any) {
              addNotification('error', error.message || 'Failed to save card.');
          } finally {
              closeActionDialog();
          }
      };

      if (card.id) {
          openActionDialog({
              title: t('dialog.save_changes_title'),
              description: t('dialog.save_changes_desc'),
              options: [
                  { label: t('dialog.overwrite_card'), onClick: () => void persistOverwrite(), variant: 'primary' },
                  { label: t('dialog.create_new_card'), onClick: () => void persistNewCard(), variant: 'secondary' },
                  { label: t('dialog.cancel'), onClick: closeActionDialog, variant: 'secondary' },
              ],
          });
          return;
      }

      await persistNewCard();
  };

  /**
   * [后端接口规范] 删除卡牌
   * --------------------------------------------------------------
   * 1. 接口方法: DELETE /api/cards/:id
   * 2. 请求参数: URL Path Parameter `id`
   * 3. 数据库操作: UPDATE cards SET deleted_at = NOW() WHERE id = :id AND user_id = :currentUserId;
   * 4. 返回值: { "success": true }
   */
  const handleDeleteCard = async (id: string) => {
      if (!user) {
          handleLoginRequired();
          return;
      }

      const targetCard = myCards.find(card => card.id === id);
      const isPublished = targetCard ? isPublishedCard(targetCard) : false;

      openActionDialog({
          title: t('dialog.delete_card_title'),
          description: isPublished ? t('dialog.delete_published_card_desc') : t('dialog.delete_card_desc'),
          options: [
              {
                  label: t('dialog.delete_confirm'),
                  variant: 'danger',
                  onClick: async () => {
                      try {
                          await deleteCardFromServer(id);
                          setMyCards(prev => prev.filter(c => c.id !== id));
                          setGlobalCards(prev => prev.filter(c => c.id !== id));
                          if (cardData.id === id) {
                              setCardData(INITIAL_CARD_DATA);
                          }
                          addNotification('info', t('msg.card_deleted'));
                      } catch (error: any) {
                          addNotification('error', error.message || 'Failed to delete card.');
                      } finally {
                          closeActionDialog();
                      }
                  },
              },
              { label: t('dialog.keep_card'), onClick: closeActionDialog, variant: 'secondary' },
          ],
      });
  };
  
  /**
   * [后端接口规范] 点赞/取消点赞
   * --------------------------------------------------------------
   * 1. 接口方法: POST /api/cards/:id/like
   * 
   * 2. 数据库交互 (Table: card_likes):
   *    - user_id (FK), card_id (FK), created_at
   *    - 逻辑: 检查是否存在。存在则 DELETE (取消点赞)，不存在则 INSERT (点赞)。
   *    - 触发器: 更新 cards 表的 likes_count 字段。
   * 
   * 4. 返回值:
   *    {
   *      "liked": boolean, // 当前最新状态
   *      "newCount": number // 最新点赞数
   *    }
   */
  const handleToggleLike = async (cardId: string) => {
      if (!user) {
          handleLoginRequired();
          return;
      }

      try {
          // 点赞和收藏同时进行
          const [likeResult] = await Promise.all([
              toggleCardLikeOnServer(cardId),
              toggleCardFavoriteOnServer(cardId)
          ]);

          setGlobalCards(prev => prev.map(card => (
              card.id === cardId
                  ? { ...card, isLiked: likeResult.liked, likes: likeResult.newCount }
                  : card
          )));

          // Refresh favorited cards after toggling
          refreshLikedCards();
      } catch (error: any) {
          addNotification('error', error.message || 'Failed to update like.');
      }
  };

  const handleRemoveFavorite = async (cardId: string) => {
      if (!user) {
          handleLoginRequired();
          return;
      }

      try {
          await toggleCardFavoriteOnServer(cardId);
          setLikedCards(prev => prev.filter(card => card.id !== cardId));
          setGlobalCards(prev => prev.map(card => (
              card.id === cardId
                  ? { ...card, isFavorited: false }
                  : card
          )));
          addNotification('info', t('msg.favorite_removed'));
      } catch (error: any) {
          addNotification('error', error.message || 'Failed to remove favorite.');
      }
  };

  /**
   * [后端接口规范] 发布卡牌 (公开)
   * --------------------------------------------------------------
   * 1. 接口方法: PATCH /api/cards/:id/publish
   * 2. 请求参数: { "isPublic": true }
   * 3. 数据库操作: UPDATE cards SET is_public = true WHERE id = :id AND user_id = :uid;
   * 4. 返回值: { "success": true }
   */
  const handlePublishCard = async (card: CardData) => {
      if (!user) {
          handleLoginRequired();
          return;
      }

      if (!card.id) {
          addNotification('error', 'Please save the card before publishing.');
          return;
      }

      const nextIsPublic = !isPublishedCard(card);

      const executePublishStateChange = async () => {
          try {
              const publishedCard = await publishCardToServer(card.id!, nextIsPublic);
              setMyCards(prev => prev.map(existing => (
                  existing.id === publishedCard.id
                      ? { ...existing, ...publishedCard }
                      : existing
              )));
              if (!nextIsPublic) {
                  setGlobalCards(prev => prev.filter(existing => existing.id !== card.id));
              }
              await refreshPublicCards();
              addNotification('success', nextIsPublic ? t('msg.published') : t('msg.card_unpublished'));
          } catch (error: any) {
              addNotification('error', error.message || (nextIsPublic ? 'Failed to publish card.' : 'Failed to unpublish card.'));
          } finally {
              closeActionDialog();
          }
      };

      if (!nextIsPublic) {
          openActionDialog({
              title: t('dialog.unpublish_card_title'),
              description: t('dialog.unpublish_card_desc'),
              options: [
                  { label: t('dialog.unpublish_confirm'), onClick: () => void executePublishStateChange(), variant: 'danger' },
                  { label: t('dialog.keep_card'), onClick: closeActionDialog, variant: 'secondary' },
              ],
          });
          return;
      }

      await executePublishStateChange();
  };

  const handleLoadCard = (card: CardData) => {
      if (!user) {
          handleLoginRequired();
          return;
      }
      // 此处无需后端交互，仅前端状态复制
      setCardData({ ...card });
      setCurrentView('create');
      addNotification('info', 'Card loaded into editor.');
  };

  const handleCreateNew = () => {
      setCardData(INITIAL_CARD_DATA);
      setCurrentView('create');
  };

  const handleSaveCardAppraisal = async (
      cardId: string,
      appraisal: { price: string; comment: string; language: 'en' | 'zh-Hant' },
  ): Promise<CardData> => {
      const savedCard = await saveCardAppraisalToServer(cardId, appraisal);
      setMyCards(prev => prev.map(card => (card.id === savedCard.id ? savedCard : card)));
      setGlobalCards(prev => prev.map(card => (card.id === savedCard.id ? savedCard : card)));
      setCardData(prev => (prev.id === savedCard.id ? savedCard : prev));
      return savedCard;
  };

  const handleRecharge = async (amount: number): Promise<boolean> => {
      if (!user) return false;
      try {
          const nextCoins = await rechargeCoins(amount, 'mock_payment_recharge');
          setUser(prev => applyCoinsToUser(prev, nextCoins));
          addNotification('success', t('msg.recharge_success'));
          return true;
      } catch (error: any) {
          addNotification('error', error.message || 'Recharge failed.');
          return false;
      }
  }

  const handleOpenPackPreview = (pack: Omit<PurchasedPack, 'purchasedAt' | 'ownedCount'>) => {
      setMarketPacks((prev) => prev.filter((item) => item.id !== pack.id));
      setPurchasedPacks((prev) => {
          const existing = prev.find((item) => item.id === pack.id);
          if (existing) {
              return prev.map((item) =>
                  item.id === pack.id
                      ? { ...item, ownedCount: item.ownedCount + 1, purchasedAt: new Date().toISOString() }
                      : item,
              );
          }
          return [
              {
                  ...pack,
                  purchasedAt: new Date().toISOString(),
                  ownedCount: 1,
              },
              ...prev,
          ];
      });
      addNotification('success', `${pack.name} · ${t('packs.bought_success')}`);
  };

  const handleOpenPurchasedPack = (pack: PurchasedPack) => {
      addNotification('info', `${pack.name} · ${t('packs.opening_soon')}`);
  };

  const browseTabs = [
      {
          key: 'cards' as const,
          title: t('browse.tab_cards'),
          description: t('browse.tab_cards_desc'),
          icon: GlobeIcon,
          activeClassName: 'border-cyan-300/35 bg-cyan-300/14 text-cyan-50 shadow-[0_16px_36px_rgba(34,211,238,0.16)]',
          iconClassName: 'bg-cyan-300/18 text-cyan-100',
      },
      {
          key: 'packs' as const,
          title: t('browse.tab_packs'),
          description: t('browse.tab_packs_desc'),
          icon: SparklesIcon,
          activeClassName: 'border-orange-300/35 bg-orange-300/14 text-orange-50 shadow-[0_16px_36px_rgba(251,146,60,0.18)]',
          iconClassName: 'bg-orange-300/18 text-orange-100',
      },
  ];

  return (
    <div className="h-[100dvh] flex flex-col font-sans bg-[#020617] text-white overflow-hidden">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        cartCount={cart.length}
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin} 
      />

      <ActionDialog
        isOpen={Boolean(actionDialog)}
        title={actionDialog?.title || ''}
        description={actionDialog?.description || ''}
        options={actionDialog?.options || []}
        onClose={closeActionDialog}
      />

      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      {currentView === 'create' && (
          <div className="flex flex-col lg:flex-row flex-grow h-[calc(100dvh-64px)] overflow-hidden animate-in fade-in duration-300">
            
            {/* 1. Preview Panel (Mobile: Top, Desktop: Right) */}
            <div className="w-full lg:flex-grow h-[35vh] sm:h-[45vh] lg:h-full lg:order-2 bg-[#090b10] border-b lg:border-b-0 lg:border-l border-gray-800">
                 <ResponsivePreviewContainer>
                    <div className="relative z-10 transform transition-all duration-500 ease-out">
                        <TiltCard className="rounded-[24px]" maxAngle={15}>
                            <CardPreview data={cardData} isGeneratingImage={isGeneratingImage} />
                        </TiltCard>
                    </div>
                 </ResponsivePreviewContainer>
            </div>

            {/* 2. Form Panel (Mobile: Bottom, Desktop: Left) */}
            <div className="flex-grow lg:flex-none w-full lg:w-auto lg:h-full lg:order-1 overflow-hidden">
                <CardForm 
                  data={cardData} 
                  onChange={setCardData} 
                  onAddToCart={addToCart}
                  onSave={handleSaveCard}
                  onPublish={handlePublishCard}
                  onUpdateUserCoins={(coins) => setUser(prev => applyCoinsToUser(prev, coins))}
                  addNotification={addNotification}
                  user={user}
                  onLoginRequired={handleLoginRequired}
                  isGeneratingImage={isGeneratingImage}
                  setIsGeneratingImage={setIsGeneratingImage}
                />
            </div>

          </div>
      )}

      {currentView === 'browse' && (
          <div className="flex flex-grow flex-col overflow-hidden bg-[#090b10]">
            <div className={`border-b border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.08),transparent_24%),linear-gradient(180deg,rgba(5,10,19,0.96)_0%,rgba(5,10,19,0.82)_100%)] px-3 backdrop-blur-xl transition-all duration-300 md:px-8 ${
              isBrowseHeaderCollapsed ? 'py-3' : 'py-4 md:py-5'
            }`}>
              <div className="mx-auto max-w-[1400px]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 px-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">{t('browse.section_label')}</p>
                    <h2 className="truncate text-lg font-black tracking-tight text-white md:text-xl">
                      {isBrowseHeaderCollapsed ? t('browse.section_title_compact') : t('browse.section_title')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsBrowseHeaderCollapsed((prev) => !prev)}
                    className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {isBrowseHeaderCollapsed ? t('browse.expand') : t('browse.collapse')}
                  </button>
                </div>

                <div className={`grid gap-3 transition-all duration-300 ${isBrowseHeaderCollapsed ? 'md:grid-cols-[1fr]' : 'md:grid-cols-[1.1fr_1.4fr] md:items-end'}`}>
                  {!isBrowseHeaderCollapsed && (
                    <div className="space-y-2 px-1">
                      <p className="max-w-xl text-sm leading-6 text-slate-400">{t('browse.section_desc')}</p>
                    </div>
                  )}

                  <div className={`grid gap-3 ${isBrowseHeaderCollapsed ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
                    {browseTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = browseSection === tab.key;

                      return (
                        <button
                          key={tab.key}
                          onClick={() => setBrowseSection(tab.key)}
                          className={`group rounded-[24px] border px-4 text-left transition-all duration-300 md:px-5 ${
                            isBrowseHeaderCollapsed ? 'py-3' : 'py-4'
                          } ${
                            isActive
                              ? `${tab.activeClassName} -translate-y-0.5`
                              : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className={`flex gap-4 ${isBrowseHeaderCollapsed ? 'items-center' : 'items-start'}`}>
                            <div className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 ${isActive ? tab.iconClassName : 'bg-white/6 text-white/75'} ${
                              isBrowseHeaderCollapsed ? 'h-10 w-10' : 'h-11 w-11'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black uppercase tracking-[0.18em]">{tab.title}</span>
                                {isActive && (
                                  <span className="rounded-full border border-white/15 bg-black/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]">
                                    Live
                                  </span>
                                )}
                              </div>
                              {!isBrowseHeaderCollapsed && (
                                <p className={`mt-1 text-sm leading-6 ${isActive ? 'text-white/78' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                  {tab.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {browseSection === 'cards' ? (
              <Browse 
                cards={globalCards}
                user={user}
                onToggleLike={handleToggleLike}
                addNotification={addNotification}
                onAddToCart={(card) => {
                    if(!user) {
                        handleLoginRequired();
                        return;
                    }
                    addToCart(card);
                    addNotification('success', t('msg.added_cart'));
                }}
                onLoadCard={handleLoadCard}
                onLoginRequired={handleLoginRequired}
              />
            ) : (
              <PackBrowse
                packs={marketPacks}
                user={user}
                onLoginRequired={handleLoginRequired}
                onOpenPack={handleOpenPackPreview}
              />
            )}
          </div>
      )}

      {currentView === 'cart' && (
          !user ? <SignInRequiredView onLogin={handleLoginRequired} t={t} /> : (
              <Cart 
                items={cart} 
                onRemove={removeFromCart} 
                onCheckout={() => addNotification('info', 'Checkout functionality coming soon!')} 
              />
          )
      )}

      {currentView === 'profile' && (
          <Profile
            user={user}
            onLoginClick={() => setIsLoginOpen(true)}
            savedCards={myCards}
            likedCards={likedCards}
            purchasedPacks={purchasedPacks}
            onRemoveFavorite={handleRemoveFavorite}
            onOpenPurchasedPack={handleOpenPurchasedPack}
            onPublishCard={handlePublishCard}
            onLoadCard={handleLoadCard}
            onCreateNew={handleCreateNew}
            onDeleteCard={handleDeleteCard}
            onRecharge={() => setCurrentView('recharge')}
          />
      )}
      
      {currentView === 'arena' && (
          !user ? <SignInRequiredView onLogin={handleLoginRequired} t={t} /> : (
              <BattleArena />
          )
      )}

      {currentView === 'appraiser' && (
          <Appraiser
            user={user}
            myCards={myCards}
            onUpdateUserCoins={(coins) => setUser(prev => applyCoinsToUser(prev, coins))}
            onSaveAppraisal={handleSaveCardAppraisal}
            addNotification={addNotification}
            onLoginRequired={handleLoginRequired}
          />
      )}

      {currentView === 'recharge' && (
          !user ? <SignInRequiredView onLogin={handleLoginRequired} t={t} /> : (
              <Recharge 
                  user={user}
                  onBack={() => setCurrentView('profile')}
                  onRecharge={handleRecharge}
              />
          )
      )}

    </div>
  );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App;
