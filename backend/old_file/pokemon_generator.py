import asyncio
import os
import time
import hashlib
import logging
import json
import uuid
from redis_utils import r as redis_client, set_value, get_value
from llm_client import (
    call_openrouter_text_to_image, 
    call_openrouter_image_to_image, 
    call_wanx_text_to_image
)

# ================== 1. 配置与路径管理 ==================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IMAGE_DIR = "pokemon_images"
os.makedirs(IMAGE_DIR, exist_ok=True)

# 动态定位配置文件绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(current_dir, "key_pool.json")

# --- 熔断配置 ---
FAIL_THRESHOLD = 3 
BREAKER_TIME = 300 

def load_key_pool():
    if not os.path.exists(CONFIG_FILE):
        logger.error(f"❌ 配置文件不存在: {CONFIG_FILE}")
        return []
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
            return config.get("key_pool", [])
    except Exception as e:
        logger.error(f"❌ 加载配置文件失败: {e}")
        return []

# ================== 2. 工具函数 ==================

def get_key_id(api_key: str, model_name: str) -> str:
    return hashlib.md5(f"{api_key}_{model_name}".encode()).hexdigest()[:16]

async def record_failure(api_key: str, model_name: str):
    key_id = get_key_id(api_key, model_name)
    fail_count_key = f"pokemon:fail_count:{key_id}"
    sem_key_name = f"pokemon:sem:key:{key_id}"
    breaker_key = f"pokemon:breaker:{sem_key_name}"
    new_count = redis_client.incr(fail_count_key)
    redis_client.expire(fail_count_key, 600)
    if new_count >= FAIL_THRESHOLD:
        logger.error(f"🚨 触发熔断！模型 {model_name} (ID:{key_id}) 将屏蔽 {BREAKER_TIME}s")
        redis_client.set(breaker_key, "1", ex=BREAKER_TIME)
        redis_client.delete(fail_count_key)

async def record_success(api_key: str, model_name: str):
    key_id = get_key_id(api_key, model_name)
    redis_client.delete(f"pokemon:fail_count:{key_id}")

async def acquire_resource_async(mode: str, exclude_keys: list = None):
    current_pool = load_key_pool()
    exclude_str = ",".join(exclude_keys) if exclude_keys else ""
    script = """
    local expire = tonumber(ARGV[1])
    local exclude_str = ARGV[2]
    for i, key_name in ipairs(KEYS) do
        local limit = tonumber(ARGV[i + 2])
        local breaker_key = "pokemon:breaker:" .. key_name
        local is_excluded = string.find(exclude_str, key_name)
        if not is_excluded then
            local is_broken = redis.call('GET', breaker_key)
            if not is_broken then
                local current = tonumber(redis.call('GET', key_name) or '0')
                if current < limit then
                    redis.call('INCR', key_name)
                    redis.call('EXPIRE', key_name, expire)
                    return i 
                end
            end
        end
    end
    return 0
    """
    available_resources = [r for r in current_pool if not (mode == "IMG2IMG" and r["provider"] == "dashscope")]
    if not available_resources: return None, None
    sem_keys = [f"pokemon:sem:key:{get_key_id(r['api_key'], r['model'])}" for r in available_resources]
    limits = [r["limit"] for r in available_resources]
    idx = await asyncio.to_thread(redis_client.eval, script, len(sem_keys), *sem_keys, 120, exclude_str, *limits)
    if idx > 0: return available_resources[idx - 1], sem_keys[idx - 1]
    return None, None

# ================== 3. 核心生成逻辑 (完美的省钱/同步机制) ==================

async def generate_image_async(user_id: str, description: str = None, image_url: str = None) -> str:
    # 3.1 确定 Prompt 唯一标识
    if image_url:
        mode = "IMG2IMG"
        prompt_hash = hashlib.md5(image_url.encode()).hexdigest()[:16]
        final_desc = description.strip() if description and description.strip() else "Pokémon style"
    else:
        if not description or not description.strip(): raise ValueError("描述词不能为空")
        mode = "TXT2IMG"
        final_desc = description.strip().lower()
        prompt_hash = hashlib.md5(final_desc.encode()).hexdigest()[:16]

    # --- 关键 Key 定义 ---
    global_cache_key = f"pokemon:global:cache:{mode}:{prompt_hash}" # 全服最新图
    user_seen_key = f"pokemon:user:seen:{user_id}:{prompt_hash}"   # 该用户看过的图
    lock_key = f"pokemon:lock:{mode}:{prompt_hash}"               # 针对该词的分布式锁

    # 3.2 逻辑分流点：白嫖他人的成果
    latest_path = get_value(global_cache_key, use_json=False)
    user_last_path = get_value(user_seen_key, use_json=False)

    # 2. 如果全服有其他人刷出了更好的（最新的），且我还没看过
    if latest_path and os.path.exists(latest_path):
        if latest_path != user_last_path:
            # 【省钱点】：用户交了钱，但我直接给他缓存，我不花 API 钱
            set_value(user_seen_key, latest_path, ex=86400*7, use_json=False)
            return latest_path

    # 3.3 分布式锁排队 (如果 A 正在生图，BCD 在这里等待白嫖 A 的结果)
    got_lock = False
    start_wait = time.time()
    while time.time() - start_wait < 60:
        if redis_client.set(lock_key, user_id, nx=True, ex=60):
            got_lock = True
            break
        await asyncio.sleep(1.5)
        # 等待锁期间，再次检查全局缓存（可能排在前面的 A 已经做好了）
        new_latest = get_value(global_cache_key, use_json=False)
        if new_latest and new_latest != user_last_path:
            logger.info(f"🤝 用户 {user_id} 在排队中白嫖到了刚出炉的新图")
            set_value(user_seen_key, new_latest, ex=86400*7, use_json=False)
            return new_latest
    
    if not got_lock: raise TimeoutError("服务器召唤阵太拥挤，请稍后再试")

    # 3.4 走到这里说明：必须花钱调 API 刷图了
    tried_keys = []
    current_pool = load_key_pool()
    max_attempts = len(current_pool)
    sem_key = None

    try:
        for attempt in range(max_attempts):
            chosen_res, sem_key = await acquire_resource_async(mode, exclude_keys=tried_keys)
            if not chosen_res: raise Exception("无可用 API 通道")

            api_key, model, provider = chosen_res["api_key"], chosen_res["model"], chosen_res["provider"]
            logger.info(f"🚀 [User:{user_id}] 启动真实 API 召唤: {provider}({model})")

            try:
                loop = asyncio.get_event_loop()
                if provider == "dashscope":
                    img_data = await loop.run_in_executor(None, call_wanx_text_to_image, final_desc, api_key, model)
                else:
                    if mode == "IMG2IMG":
                        img_data = await loop.run_in_executor(None, call_openrouter_image_to_image, image_url, api_key, model, final_desc)
                    else:
                        img_data = await loop.run_in_executor(None, call_openrouter_text_to_image, final_desc, api_key, model)

                if not isinstance(img_data, bytes) or len(img_data) < 1000: raise ValueError("图片数据不完整")

                await record_success(api_key, model)

                # --- 存储本地 ---
                # 使用 UUID 确保即便同一个 Prompt，物理文件也不重名，避免覆盖
                unique_id = uuid.uuid4().hex[:8]
                filename = f"{mode}_{prompt_hash}_{unique_id}_{int(time.time())}.png"
                filepath = os.path.join(IMAGE_DIR, filename)

                with open(filepath, "wb") as f: f.write(img_data)

                # --- 【核心：全局同步】 ---
                # 1. 更新全服最新指针，让 BCD 用户能白嫖到这张
                set_value(global_cache_key, filepath, ex=86400*7, use_json=False)
                # 2. 更新我自己的已看记录，防止我自己下次点又中这张
                set_value(user_seen_key, filepath, ex=86400*7, use_json=False)

                return filepath

            except Exception as e:
                error_msg = str(e).lower()
                logger.warning(f"⚠️ {provider} 调用失败: {error_msg}")
                safe_errors = ["safety", "policy", "content filter", "blocked"]
                if not any(word in error_msg for word in safe_errors):
                    await record_failure(api_key, model)
                
                tried_keys.append(sem_key)
                if sem_key:
                    redis_client.decr(sem_key)
                    sem_key = None
                
                if attempt < max_attempts - 1: continue
                else: raise e
    finally:
        if sem_key: redis_client.decr(sem_key)
        try:
            current_owner = redis_client.get(lock_key)
            if current_owner and current_owner.decode() == user_id:
                redis_client.delete(lock_key)
        except: pass