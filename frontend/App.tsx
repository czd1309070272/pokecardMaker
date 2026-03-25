
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { CardForm } from './components/CardForm';
import { CardPreview } from './components/CardPreview';
import { LoginModal } from './components/LoginModal';
import { Browse } from './components/Browse';
import { Cart } from './components/Cart';
import { Profile } from './components/Profile';
import { BattleArena } from './components/BattleArena';
import { Appraiser } from './components/Appraiser';
import { Recharge } from './components/Recharge';
import { TiltCard } from './components/TiltCard';
import { ToastContainer } from './components/Toast';
import { ActionDialog, ActionDialogOption } from './components/ActionDialog';
import { CardData, INITIAL_CARD_DATA, User, Notification, ElementType, Subtype, TrainerType, HoloPattern, Supertype } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UserIcon } from './components/Icons';
import { restoreCurrentUser } from './services/authService';
import { deleteCardFromServer, fetchMyCards, saveCardToServer, updateCardOnServer } from './services/cardsService';
import { applyCoinsToUser, rechargeCoins, spendCoins } from './services/walletService';

// [待删除 Mock 数据] 后端接入后，删除此静态数组，改由 API 获取
const MOCK_CARDS_INITIAL: CardData[] = [
    { ...INITIAL_CARD_DATA, id: '1', name: 'Charizard', setNumber: '006/165', holoPattern: HoloPattern.Sheen, likes: 342, isLiked: false },
    { 
        ...INITIAL_CARD_DATA, 
        id: '2',
        name: 'Pikachu', 
        type: ElementType.Lightning, 
        hp: '60', 
        subtype: Subtype.Basic,
        evolvesFrom: undefined,
        image: 'https://images.unsplash.com/photo-1606992523267-28df5283737b?q=80&w=1000&auto=format&fit=crop',
        attacks: [{ id: 'a1', name: 'Electro Ball', cost: [ElementType.Lightning], damage: '30', description: '' }],
        weakness: ElementType.Fighting,
        setNumber: '025/165',
        holoPattern: HoloPattern.None,
        likes: 856,
        isLiked: true
    },
    {
        ...INITIAL_CARD_DATA,
        id: '3',
        name: 'Blastoise',
        type: ElementType.Water,
        hp: '330',
        subtype: Subtype.Stage2,
        image: 'https://images.unsplash.com/photo-1542887800-83f06e5d22f2?q=80&w=1000&auto=format&fit=crop',
        attacks: [{ id: 'a1', name: 'Hydro Pump', cost: [ElementType.Water, ElementType.Water], damage: '180', description: '' }],
        weakness: ElementType.Lightning,
        setNumber: '009/165',
        holoPattern: HoloPattern.Cosmos,
        likes: 120,
        isLiked: false
    },
    {
        ...INITIAL_CARD_DATA,
        id: '4',
        supertype: Supertype.Trainer,
        name: 'Professor Research',
        trainerType: TrainerType.Supporter,
        rules: ['Discard your hand and draw 7 cards.'],
        image: 'https://images.unsplash.com/photo-1532188978303-453f5ce8a018?q=80&w=1000&auto=format&fit=crop',
        setNumber: '100/165',
        holoPattern: HoloPattern.None,
        likes: 45,
        isLiked: false
    },
     { ...INITIAL_CARD_DATA, id: '5', name: 'Charizard', subtype: Subtype.Stage2, hp: '330', setNumber: '223/165', holoPattern: HoloPattern.CrackedIce, likes: 2300, isLiked: false },
     { ...INITIAL_CARD_DATA, id: '6', name: 'Mewtwo', type: ElementType.Psychic, hp: '130', subtype: Subtype.Basic, setNumber: '150/165', image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop', holoPattern: HoloPattern.Starlight, likes: 890, isLiked: false }
];

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
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA);
  const [cart, setCart] = useState<CardData[]>([]);
  
  // State for User Creations
  const [myCards, setMyCards] = useState<CardData[]>([]); 
  
  // State for Browse Feed
  const [globalCards, setGlobalCards] = useState<CardData[]>(MOCK_CARDS_INITIAL); 
  
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
      // [待删除 Mock]: const data = await fetch('/api/cards/public').then(res => res.json());
      // setGlobalCards(data.data.list);
      console.log("Fetching public cards...");
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
      }
  }, [currentView, user]);

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

      openActionDialog({
          title: t('dialog.delete_card_title'),
          description: t('dialog.delete_card_desc'),
          options: [
              {
                  label: t('dialog.delete_confirm'),
                  variant: 'danger',
                  onClick: async () => {
                      try {
                          await deleteCardFromServer(id);
                          setMyCards(prev => prev.filter(c => c.id !== id));
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
  const handleToggleLike = (cardId: string) => {
      if (!user) {
          handleLoginRequired();
          return;
      }
      
      // [待删除 Mock]
      setGlobalCards(prev => prev.map(card => {
          if (card.id === cardId) {
              const isLiked = !card.isLiked;
              const likes = (card.likes || 0) + (isLiked ? 1 : -1);
              return { ...card, isLiked, likes };
          }
          return card;
      }));
  };

  /**
   * [后端接口规范] 发布卡牌 (公开)
   * --------------------------------------------------------------
   * 1. 接口方法: PATCH /api/cards/:id/publish
   * 2. 请求参数: { "isPublic": true }
   * 3. 数据库操作: UPDATE cards SET is_public = true WHERE id = :id AND user_id = :uid;
   * 4. 返回值: { "success": true }
   */
  const handlePublishCard = (card: CardData) => {
      if (!user) {
          handleLoginRequired();
          return;
      }
      
      // [待删除 Mock]
      const newGlobalCard = { ...card, id: Date.now().toString(), likes: 0, isLiked: false };
      setGlobalCards(prev => [newGlobalCard, ...prev]);
      addNotification('success', t('msg.published'));
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

  /**
   * [后端接口规范] 消耗金币 (通用扣费)
   * --------------------------------------------------------------
   * 1. 接口方法: POST /api/wallet/spend
   * 
   * 2. 请求参数: 
   *    { 
   *      "amount": number, // 金额 (如 20)
   *      "reason": string  // 用途 (如 "ai_appraisal", "ai_generate_image")
   *    }
   * 
   * 3. 数据库交互 (事务 Transaction):
   *    BEGIN;
   *    SELECT coins FROM users WHERE id = :uid FOR UPDATE;
   *    IF coins < amount THEN ROLLBACK; RETURN error;
   *    UPDATE users SET coins = coins - amount WHERE id = :uid;
   *    INSERT INTO transactions (user_id, amount, type, description) VALUES (:uid, -amount, 'DEBIT', :reason);
   *    COMMIT;
   * 
   * 4. 返回值:
   *    { "success": true, "newBalance": 980 }
   */
  const handleSpendCoins = async (amount: number): Promise<boolean> => {
      if (!user || (user.coins || 0) < amount) {
          addNotification('error', 'Not enough coins!');
          return false;
      }

      try {
          const nextCoins = await spendCoins(amount, 'ai_appraisal');
          setUser(prev => applyCoinsToUser(prev, nextCoins));
          addNotification('info', `Spent ${amount} coins.`);
          return true;
      } catch (error: any) {
          addNotification('error', error.message || 'Failed to spend coins.');
          return false;
      }
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
          <Browse 
            cards={globalCards}
            user={user}
            onToggleLike={handleToggleLike}
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
            globalCards={globalCards}
            onToggleLike={handleToggleLike}
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
            onSpendCoins={handleSpendCoins}
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
