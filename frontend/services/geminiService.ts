
import { GoogleGenAI, Type } from "@google/genai";
import { CardData, ElementType, Rarity, Attack, Supertype, Subtype, HoloPattern } from "../types";

// Helper to get enum keys as strings for the prompt
const elementTypes = Object.values(ElementType).join(', ');

const getAI = () => {
    // [注意] 生产环境中，API Key 绝不应暴露在前端代码中。
    // 以下前端直接调用 GoogleGenAI 的逻辑应当迁移至后端 Node.js/Python 服务。
    const key = process.env.API_KEY;
    if (!key) {
        console.error("API Key is missing. Check vite.config.ts and your env variables.");
        throw new Error("API Key is missing. Please check your configuration.");
    }
    return new GoogleGenAI({ apiKey: key });
};

// Helper to format Gemini API errors into user-friendly messages
const formatGeminiError = (error: any): string => {
    const msg = error?.message || error?.toString() || "Unknown error";
    if (msg.includes('401') || msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
        return "Permission denied. Check your API Key.";
    }
    if (msg.includes('429') || msg.includes('QUOTA_EXCEEDED')) {
        return "API Quota exceeded. Please try again later.";
    }
    if (msg.includes('500') || msg.includes('503')) {
        return "AI Service is currently overloaded. Please try again.";
    }
    if (msg.includes('SAFETY') || msg.includes('BLOCKED')) {
        return "Generation blocked by safety filters. Try a different prompt.";
    }
    return msg;
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
export const generateCardData = async (prompt: string): Promise<Partial<CardData>> => {
  try {
      const ai = getAI();

      const systemInstruction = `
        You are a creative assistant designed to generate Pokémon Trading Card Game data.
        Based on the user's prompt, create a balanced and thematic card.
        If the prompt is vague, empty, or asks for 'random', be highly creative with the species, name, abilities, and attacks to create a unique card concept.
        
        MANDATORY REQUIREMENTS:
        1. 'attacks': You MUST generate 1 or 2 attacks. Each attack MUST have:
           - 'name': Creative attack name.
           - 'cost': Array of ElementTypes (e.g. ["Fire", "Colorless"]).
           - 'damage': String (e.g. "30", "120", "10+").
           - 'description': Effect text (e.g. "Flip a coin...").
        2. 'weakness': Must provide a valid ElementType.
        3. 'resistance': Provide a valid ElementType or leave empty.
        4. 'retreatCost': Integer between 0 and 4.

        Return ONLY JSON matching this exact schema:
        {
          "name": "string",
          "hp": "string (number)",
          "type": "string (One of: ${elementTypes})",
          "subtype": "string (e.g. Basic, Stage 1, ex, VMAX)",
          "evolvesFrom": "string (optional)",
          "attacks": [
            {
              "name": "string",
              "cost": ["string (One of: ${elementTypes})"],
              "damage": "string",
              "description": "string"
            }
          ],
          "weakness": "string (One of: ${elementTypes})",
          "resistance": "string (One of: ${elementTypes})",
          "retreatCost": number,
          "illustrator": "string",
          "setNumber": "string",
          "rarity": "string",
          "pokedexEntry": "string",
          "dexSpecies": "string",
          "dexHeight": "string",
          "dexWeight": "string"
        }
      `;

      // Switched to gemini-2.5-flash for better availability and speed
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [{ text: `Create a pokemon card concept based on: ${prompt}` }]
        },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hp: { type: Type.STRING },
              type: { type: Type.STRING },
              subtype: { type: Type.STRING },
              evolvesFrom: { type: Type.STRING },
              attacks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    cost: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING } 
                    },
                    damage: { type: Type.STRING },
                    description: { type: Type.STRING },
                  }
                }
              },
              weakness: { type: Type.STRING },
              resistance: { type: Type.STRING },
              retreatCost: { type: Type.NUMBER },
              illustrator: { type: Type.STRING },
              setNumber: { type: Type.STRING },
              rarity: { type: Type.STRING },
              pokedexEntry: { type: Type.STRING },
              dexSpecies: { type: Type.STRING },
              dexHeight: { type: Type.STRING },
              dexWeight: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        try {
          const data = JSON.parse(response.text);
          // Normalize Type casing if needed (e.g. "fire" -> "Fire")
          if (data.type) {
             data.type = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
          }
          if (data.weakness) {
             data.weakness = data.weakness.charAt(0).toUpperCase() + data.weakness.slice(1).toLowerCase();
          }
          if (data.resistance) {
             data.resistance = data.resistance.charAt(0).toUpperCase() + data.resistance.slice(1).toLowerCase();
          }
          // Add IDs to attacks for React keys
          if (data.attacks) {
            data.attacks = data.attacks.map((a: any, index: number) => ({ ...a, id: `gen-${Date.now()}-${index}` }));
          }
          return data;
        } catch (e) {
          console.error("Failed to parse Gemini JSON response:", response.text, e);
          throw new Error("Received malformed data from the AI. Please try a different prompt.");
        }
      }
      throw new Error("Empty response from AI.");
  } catch (error: any) {
      console.error("Gemini API Error (Text):", error);
      throw new Error(formatGeminiError(error));
  }
};

/**
 * [后端接口规范] 生成单个攻击技能
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/generate-attack
 * 2. 请求参数: { "name": string, "type": string }
 * 3. 返回值: { "id": "uuid", "name": "...", "cost": [], "damage": "...", "description": "..." }
 */
export const generateSingleAttack = async (name: string, type: string): Promise<Partial<Attack>> => {
  try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate one balanced Pokemon attack for ${name} (${type} type). Include name, cost, damage, and effect description. Return JSON only.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              cost: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              damage: { type: Type.STRING },
              description: { type: Type.STRING },
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      throw new Error("No attack generated.");
  } catch (error) {
      console.error("Gemini API Error (Attack):", error);
      throw new Error(formatGeminiError(error));
  }
};

/**
 * [后端接口规范] 生成图鉴描述
 * --------------------------------------------------------------
 * 1. 接口方法: POST /api/ai/generate-dex
 * 2. 请求参数: { "name": string, "species": string }
 * 3. 返回值: { "entry": "This pokemon lives in..." }
 */
export const generateDexEntry = async (name: string, species: string): Promise<string> => {
  try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a short, interesting Pokedex entry for ${name} (The ${species}). Max 3 sentences.`,
      });
      return response.text || "No entry generated.";
  } catch (error) {
      console.error("Gemini API Error (Dex):", error);
      throw new Error(formatGeminiError(error));
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
export const generateAppraisal = async (card: CardData): Promise<{ price: string, comment: string }> => {
    try {
        const ai = getAI();
        const cardSummary = JSON.stringify({
            name: card.name,
            hp: card.hp,
            type: card.supertype === 'Pokémon' ? card.type : card.supertype,
            attacks: card.attacks?.map(a => `${a.name} (${a.damage})`),
            rarity: card.rarity,
            illustrator: card.illustrator
        });

        const prompt = `
            Act as a snarky, ruthless, and funny Pokemon card appraiser (like a mean version of Pawn Stars or Antiques Roadshow).
            Analyze this card data: ${cardSummary}.
            
            Strictly follow these rules for the JSON output:
            1. 'price': A VERY SHORT string (max 12 characters). Examples: "$0.05", "$10.50", "$9,000", "Priceless".
               - Do NOT generate long sequences of numbers or repeated text.
               - Do NOT output "$0.051337...". Keep it to standard currency format.
            2. 'comment': A short, sarcastic roast (max 2 sentences).
            3. If the card stats are impossible (e.g. HP > 340), call it a fake and value it low.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7, // Lower temperature to prevent hallucination loops
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        price: { type: Type.STRING },
                        comment: { type: Type.STRING }
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            
            // Hard limit on price string length to prevent UI breakage from hallucinations
            if (data.price && data.price.length > 15) {
                // Try to find a valid currency part or just truncate
                const match = data.price.match(/^(\$?\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (match) {
                    data.price = match[0];
                } else {
                    data.price = data.price.substring(0, 12) + "...";
                }
            }
            
            return data;
        }
        throw new Error("AI failed to appraise.");
    } catch (error) {
        console.error("Gemini API Error (Appraisal):", error);
        throw new Error(formatGeminiError(error));
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
// 后端基础地址 (建议写在环境变量或配置文件中)
// api.ts
const API_BASE_URL = "http://127.0.0.1:8000";

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
