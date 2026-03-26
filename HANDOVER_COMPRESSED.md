# Pokemon 制卡站 - Handover 文档

## 项目目标
Pokemon 制卡站，前端 React/Vite，后端 Python + MySQL。

## 核心功能
- 登录/注册（JWT 7天）、金币系统
- 卡牌 CRUD、发布/取消发布、点赞
- AI 生成卡牌信息、AI 刷技能、AI 毒舌鉴宝
- **收藏功能**（新增）

## 关键决策
- 后端：`backend/autoRouters.py` 扫描 `backend/api/**/router.py`
- 卡牌外部标识用 `uuid`，前端 `card.id` = `cards.uuid`
- 当前删除是物理删除
- AI 统一走后端 `backend/llm/llm.py` + DashScope `qwen-flash`
- AI 生成扣 1 金币，支持 `en / zh-Hant`
- Energy 禁用 AI 文本生成
- 鉴宝是后端原子接口（鉴定 + 扣费）
- 鉴宝中文输出：香港繁体粤语 + "毒舌收藏家"人设
- **点赞和收藏独立存储**：`card_likes` 表存点赞，`card_favorites` 表存收藏
- **点赞时自动触发收藏**：前端点赞按钮同时调用点赞和收藏接口

## 当前代码状态

### 后端完成
- 鉴权：`/api/auth/register|login|me`
- 钱包：`/api/wallet/balance|spend|recharge`
- 卡牌：`/api/cards/save|{id}|me|public|{id}/publish|{id}/like|{id}/appraisal`
- AI：`/api/ai/generate-text|generate-attack|appraise`
- **收藏（新增）**：
  - `GET /api/cards/favorited` - 获取收藏列表
  - `POST /api/cards/{id}/favorite` - 切换收藏状态
  - `backend/api/cards/repository.py` - 新增 `list_favorited_cards_by_user`, `has_user_favorited_card`, `add_card_favorite`, `remove_card_favorite`
  - `backend/api/cards/service.py` - 新增 `list_favorited_cards`, `toggle_favorite`
  - `backend/api/cards/schemas.py` - 新增 `ToggleFavoritePayload`, `ToggleFavoriteEnvelope`

### 前端完成
- 主鉴权、钱包、卡牌 CRUD、发布、广场、点赞已接后端
- 鉴宝保存已接后端，支持本地状态同步
- **收藏（新增）**：
  - `frontend/services/cardsService.ts` - 新增 `fetchFavoritedCards`, `toggleCardFavoriteOnServer`
  - `frontend/App.tsx` - 新增 `likedCards` 状态、`refreshLikedCards` 函数
  - `handleToggleLike` 修改为同时调用点赞和收藏接口
  - 切换到广场页面时自动刷新数据
  - `frontend/components/Profile.tsx` - "我的收藏"标签页显示收藏的卡牌

### 数据库状态
- `users.id` 是 `BIGINT UNSIGNED`
- `cards.uuid` 已有唯一索引
- `card_appraisals` 表已建立，按 `card_uuid` 唯一覆盖
- **收藏表（新增）**：
  - `card_favorites` 表已创建，支持收藏夹分组（`folder_name`）、备注（`note`）、排序（`sort_order`）
  - 所有外键约束已配置 `ON DELETE CASCADE`：
    - `card_likes` - 两个外键都有 CASCADE
    - `card_favorites` - 两个外键都有 CASCADE
    - `card_appraisals` - 两个外键都有 CASCADE
  - 当卡牌或用户被删除时，相关的点赞、收藏、鉴定记录自动清理

## 未完成事项
- `generateDexEntry` 未迁到后端
- `generateCardImage / redrawCardImage` 未迁到后端
- 找回密码接口未完成
- Google 登录 / 手机号 / 头像未推进
- 钱包流水表未做
- 卡牌版本表未做
- "已鉴定"文案未接入 i18n
- `FormArtwork123.tsx` 旧 TS 错误未处理

## 最近修改（本次对话）
1. 实现了独立的收藏功能（区别于点赞）
2. 创建 `card_favorites` 表，支持未来拓展（分组、备注、排序）
3. 添加数据库级联删除约束，保证数据一致性
4. 前端点赞时同时触发收藏，实现"点赞即收藏"
5. 修复了响应模型错误（`ToggleFavoriteEnvelope`）
6. 广场页面每次进入时自动刷新数据
