
import { CardData, ElementType, Rarity, Supertype, Subtype, HoloPattern } from "../types";
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const formatBackendError = (error: any): string => {
    const msg = error?.message || error?.toString() || "Unknown error";
    if (msg.includes('Authentication required')) return 'Authentication required';
    if (msg.includes('Not enough coins')) return 'Not enough coins';
    return msg;
};

const authorizedJsonRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(init?.headers || {}),
        },
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(json?.detail || json?.message || 'AI request failed');
    }

    return json as T;
};

/**
 * [后端接口规范] 生成卡牌文本数据 (AI Text Generation)
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/generate-text
 * 
 * 2. 请求参数 (Request Payload):
 *    {
 *      "prompt": string,      // 用户输入的提示词，例如 "Fire Dragon"
 *      "userId": string       // 当前用户ID，用于扣费校验
 *    }
 * 
 * 3. 后端数据库建表规范 (Table: users & ai_logs):
 *    - 表 users: 检查 `coins` 字段 >= 1 (单次生成费用)
 *    - 事务操作: UPDATE users SET coins = coins - 1 WHERE id = :userId;
 *    - 表 ai_logs (审计日志):
 *      | Column      | Type      | Description |
 *      |-------------|-----------|-------------|
 *      | id          | uuid      | PK |
 *      | user_id     | uuid      | FK |
 *      | type        | varchar   | 'text_generation' |
 *      | prompt      | text      | 用户输入 |
 *      | tokens_used | int       | 消耗Token数 |
 *      | cost        | int       | 消耗金币数 (1) |
 *      | created_at  | timestamp | |
 * 
 * 4. 返回值 (Response):
 *    {
 *      "success": true,
 *      "data": {
 *         "name": "Inferno Drake",
 *         "hp": "180",
 *         "type": "Fire",
 *         "subtype": "Stage 2",
 *         "attacks": [ ... ],
 *         // ...其他 CardData 字段
 *      },
 *      "remainingCoins": 999
 *    }
 * 
 * 5. 需删除的 Mock 数据: 前端直接调用 `new GoogleGenAI()` 的逻辑应全部移除，改为 fetch('/api/ai/generate-text')。
 */
export const generateCardData = async (
  prompt: string,
  language: 'en' | 'zh-Hant',
  card: CardData,
): Promise<{ card: Partial<CardData>; remainingCoins: number }> => {
  try {
      const response = await authorizedJsonRequest<{
        success: boolean;
        data: {
          card: Partial<CardData>;
          remainingCoins: number;
        };
      }>('/api/ai/generate-text', {
        method: 'POST',
        body: JSON.stringify({ prompt, language, card }),
      });

      return response.data;
  } catch (error: any) {
      console.error("AI API Error (Text):", error);
      throw new Error(formatBackendError(error));
  }
};

/**
 * [后端接口规范] 鉴定/评价卡牌 (Appraisal)
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/appraise
 * 
 * 2. 请求参数 (Request Payload):
 *    {
 *      "cardData": CardData, // 完整的卡牌JSON数据
 *      "userId": string
 *    }
 * 
 * 3. 后端逻辑:
 *    - 验证用户余额 >= 20金币。
 *    - 扣除金币 (UPDATE users SET coins = coins - 20)。
 *    - 调用 AI 接口。
 *    - 记录交易 (INSERT INTO transactions type='appraisal').
 * 
 * 4. 返回值:
 *    {
 *      "success": true,
 *      "data": {
 *          "price": "$9,000",
 *          "comment": "This card is so broken it's banned in 3 galaxies."
 *      },
 *      "remainingCoins": 980
 *    }
 */
export const generateAppraisal = async (
  card: CardData,
  language: 'en' | 'zh-Hant',
): Promise<{ price: string; comment: string; remainingCoins: number }> => {
    try {
        const response = await authorizedJsonRequest<{
          success: boolean;
          data: {
            price: string;
            comment: string;
            remainingCoins: number;
          };
        }>('/api/ai/appraise', {
          method: 'POST',
          body: JSON.stringify({ card, language }),
        });

        return response.data;
    } catch (error) {
        console.error("AI API Error (Appraisal):", error);
        throw new Error(formatBackendError(error));
    }
};

/**
 * [后端接口规范] 生成卡牌插图 (AI Image)
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/generate-image
 * 
 * 2. 请求参数 (Request Payload):
 *    {
 *      "prompt": string, // "Fire dragon breathing blue flames..."
 *      "userId": string
 *    }
 * 
 * 3. 数据库交互与存储逻辑:
 *    - 扣除金币 (UPDATE users SET coins = coins - 1 WHERE id = :uid)。
 *    - 调用 AI 绘图接口获取 Base64。
 *    - **关键**: 后端将 Base64 转为 .png 文件。
 *    - 上传至对象存储 (S3 / Supabase Storage / OSS)。
 *    - 插入 ai_logs 记录，包含 `image_url`。
 * 
 * 4. 返回值 (Response):
 *    {
 *      "success": true,
 *      "imageUrl": "https://your-bucket.com/generated-images/uuid.png", // 返回 URL，非 Base64
 *      "remainingCoins": 999
 *    }
 * 
 * 5. 需删除的 Mock 数据: 前端目前直接接收 Base64 并显示，这会消耗大量内存且无法持久化，需改为接收 URL。
 */
export const generateCardImage = async (prompt: string, userId: number): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        description: prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "生成失败");
    }

    const data = await response.json();

    // --- 优化点 1: 提示用户资产消耗情况 ---
    // 后端传回来的 msg 会告诉你“本次免费”还是“消耗了金币”
    if (data.msg) {
      console.log("服务器提示:", data.msg);
      // 如果你有 Toast 组件（如 react-hot-toast 或 el-message），可以在这里调用
      // toast.success(data.msg); 
    }

    // --- 优化点 2: 完整 URL 拼接 ---
    // 确保图片地址是绝对路径
    return `${API_BASE_URL}${data.image_url}`;

  } catch (error: any) {
    console.error("生成异常:", error.message);
    throw error;
  }
};
/**
 * [后端接口规范] 重绘图片 (Image-to-Image)
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/redraw-image
 * 2. 请求参数: { "imageUrl": string, "prompt": string, "userId": string }
 * 3. 返回值: { "imageUrl": "https://new-image-url..." }
 */
export const redrawCardImage = async (userId: number, imageFile: File | Blob, prompt: string): Promise<string> => {
    try {
        // 1. 创建 FormData 对象 (multipart/form-data)
        const formData = new FormData();
        
        // 2. 这里的 Key 必须与后端参数名完全一致
        formData.append("user_id", '1'); // 对应后端的 user_id: int
        formData.append("description", prompt);        // 对应后端的 description: str
        formData.append("file", imageFile);             // 对应后端的 file: UploadFile
        // 3. 发起 POST 请求
        const response = await fetch(`${API_BASE_URL}/generate/transform`, {
            method: "POST",
            // 注意：使用 FormData 时，千万不要手动设置 'Content-Type'
            // 浏览器会自动加上 boundary 标识
            body: formData,
        });

        // 4. 错误处理
        if (!response.ok) {
            const errorData = await response.json();
            // 如果余额不足或后端报错，detail 会包含具体信息
            throw new Error(errorData.detail || "召唤阵启动失败");
        }

        const data = await response.json();
        
        // 5. 拼接完整的图片访问地址并返回
        // 假设后端返回 data.image_url 为 "/images/xxx.png"
        return `${API_BASE_URL}${data.image_url}`;

    } catch (error: any) {
        console.error("Redraw API Error:", error);
        throw error;
    }
};
