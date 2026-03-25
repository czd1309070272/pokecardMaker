import requests
import base64
import time
import logging
from http import HTTPStatus
from urllib.parse import urlparse, unquote
from pathlib import PurePosixPath

# 只有在使用万相时才需要这个库
try:
    from dashscope import ImageSynthesis
except ImportError:
    ImageSynthesis = None

# ================== 配置 ==================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# ================== 辅助工具：统一解析 OpenRouter 响应 ==================
def _parse_openrouter_image(data: dict) -> bytes:
    """从 OpenRouter 返回的 JSON 中提取图片"""
    try:
        message = data["choices"][0]["message"]
        img_b64_url = ""

        if "images" in message and message["images"]:
            img_b64_url = message["images"][0]["image_url"]["url"]
        elif isinstance(message.get("content"), list):
            for item in message["content"]:
                if item.get("type") == "image_url":
                    img_b64_url = item["image_url"]["url"]
                    break
        
        if not img_b64_url:
            raise ValueError(f"模型未返回图片内容: {message.get('content')}")

        raw_b64 = img_b64_url.split(",")[1] if "," in img_b64_url else img_b64_url
        return base64.b64decode(raw_b64)
    except Exception as e:
        raise ValueError(f"OpenRouter 响应解析失败: {str(e)}")

# ================== 函数 1: OpenRouter 文生图 (Gemini等) ==================
def call_openrouter_text_to_image(description: str, api_key: str, model_name: str, max_retries: int = 3) -> bytes:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    prompt = (
        f"Centered composition with the pokemon inspired by: {description}. "
        "High quality digital art in anime style, vibrant colors, detailed features, "
        "beautiful scenic background, no text."
    )
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "3:4"}
    }

    for attempt in range(max_retries):
        try:
            r = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=90)
            r.raise_for_status()
            return _parse_openrouter_image(r.json())
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep((attempt + 1) * 3)
                continue
            raise e

# ================== 函数 2: OpenRouter 图生图 (Gemini等) ==================
def call_openrouter_image_to_image(image_url: str, api_key: str, model_name: str, prompt: str = None, max_retries: int = 3) -> bytes:
    print(image_url)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    if not prompt:
        prompt = "Remodel this image into a high quality Pokémon style, Maintain the original posture, Anime style, vibrant colors, no text."

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ],
        "modalities": ["image", "text"]
    }

    for attempt in range(max_retries):
        try:
            r = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=100)
            r.raise_for_status()
            return _parse_openrouter_image(r.json())
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep((attempt + 1) * 3)
                continue
            raise e

# ================== 函数 3: 阿里万相文生图 (DashScope) ==================
def call_wanx_text_to_image(description: str, api_key: str, model_name: str = "wanx2.1-t2i-turbo", max_retries: int = 3) -> bytes:
    if not ImageSynthesis:
        raise ImportError("请安装阿里云 SDK: pip install dashscope")
    
    prompt = f"A high quality, digital art style illustration of a pokemon: {description}. Anime style, vibrant colors, dynamic pose, beautiful background, no text."

    for attempt in range(max_retries):
        try:
            rsp = ImageSynthesis.call(
                api_key=api_key,
                model=model_name,
                prompt=prompt,
                n=1,
                size='864*1184',
                prompt_extend=True,
                watermark=False
            )
            if rsp.status_code == HTTPStatus.OK:
                # 阿里返回 URL，我们需要下载并转为 bytes 以保持接口一致
                img_url = rsp.output.results[0].url
                img_content = requests.get(img_url, timeout=30).content
                return img_content
            else:
                raise ValueError(f"万相报错: {rsp.message}")
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep((attempt + 1) * 3)
                continue
            raise e
        
# ================== 函数 4: poorguyMon卡牌数据生成 ==================
def call_poorguymon_card_data(poorguymon_name: str, api_key: str):
    pass

# ================== 函数 6: poorguyMon卡牌评鉴 ==================
def call_poorguymon_card_appraisal(poorguymon_name: str, api_key: str):
    pass