from openai import AsyncOpenAI
import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

current_dir = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(current_dir, "key_pool.json")

class LanguageModel:
    def __init__(self):
        self.temperature = 0.7
        self.key_pool = self._load_key_pool()

    def _load_key_pool(self) -> List[Dict]:
        if not os.path.exists(CONFIG_FILE):
            logger.error(f"❌ 配置文件不存在: {CONFIG_FILE}")
            return []
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return config.get("key_pool", [])
        except Exception as e:
            logger.error(f"❌ 加载密钥池失败: {e}")
            return []

    def safe_json_loads(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            logger.warning("LLM 返回内容为空")
            return {}

        text = text.strip()

        match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", text, re.IGNORECASE)
        if match:
            text = match.group(1).strip()

        try:
            start = text.index("{")
            end = text.rindex("}") + 1
            text = text[start:end]
        except ValueError:
            logger.warning(f"未找到 JSON 边界: {text[:200]}")
            return {}

        # 第1次尝试：直接解析
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 第2次尝试：单引号转双引号
        try:
            fixed = re.sub(r"'(\s*[\w]+\s*):\s*'", r'"\1": ', text)
            fixed = fixed.replace("'", '"')
            return json.loads(fixed)
        except Exception:
            pass

        # 第3次尝试：移除末尾多余逗号
        try:
            fixed = re.sub(r",\s*([}\]])", r"\1", text)
            return json.loads(fixed)
        except Exception:
            pass

        # 第4次尝试：补全截断的 JSON（末尾加 }）
        try:
            fixed = text
            open_braces = fixed.count("{") - fixed.count("}")
            open_brackets = fixed.count("[") - fixed.count("]")
            if open_brackets > 0:
                fixed += "]" * open_brackets
            if open_braces > 0:
                fixed += "}" * open_braces
            return json.loads(fixed)
        except Exception:
            pass

        logger.warning(f"JSON 所有修复尝试均失败 | 文本预览: {text[:500]}")
        return {}

    def _effective_chat_model(self, provider: str, model_name: str, enable_web_search: bool) -> str:
        """OpenRouter 专用 :online 联网后缀；DashScope 等兼容 OpenAI 的接口勿追加。"""
        if enable_web_search and provider == "openrouter":
            return f"{model_name}:online"
        return model_name

    async def llm_dashscope_api(
        self,
        user_message: str,
        model_name: str,
        temperature: float = 0.7,
        system_prompt: str = "",
    ) -> Dict[str, Any]:
        """
        异步调用阿里云 DashScope（通义千问）OpenAI 兼容接口，返回解析后的 JSON。
        使用 key_pool 中 provider 为 dashscope 的条目（base_url 通常为 compatible-mode/v1）。
        """
        self.temperature = temperature
        candidates = [
            item
            for item in self.key_pool
            if item.get("provider") == "dashscope" and item.get("model") == model_name
        ]
        if not candidates:
            raise ValueError(f"未找到 DashScope 模型 {model_name} 的配置（key_pool 中需 provider=dashscope）")

        for idx, resource in enumerate(candidates):
            api_key = resource["api_key"]
            base_url = resource["base_url"]

            client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=30.0)

            try:
                for attempt in range(1, 4):
                    try:
                        logger.info(
                            f"[dashscope] 使用模型 {model_name} (第 {idx+1}/{len(candidates)} 配置) "
                            f"第 {attempt} 次尝试 (key: {api_key[:10]}...)"
                        )

                        completion = await client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_message},
                            ],
                            temperature=self.temperature,
                            stream=False,
                        )

                        raw_content = completion.choices[0].message.content.strip()
                        if not raw_content:
                            raise ValueError("LLM 返回内容为空")

                        result = self.safe_json_loads(raw_content)
                        if not result:
                            raise ValueError("LLM 返回的 JSON 解析失败")
                        logger.info(f"✅ [dashscope] {model_name} JSON 解析成功")
                        return result

                    except Exception as e:
                        error_str = str(e).lower()
                        if any(
                            k in error_str
                            for k in [
                                "authentication",
                                "invalid api key",
                                "insufficient_quota",
                                "quota exceeded",
                                "rate limit",
                                "billing",
                                "not found",
                            ]
                        ):
                            logger.warning(f"永久性错误，立即切换下一个配置: {e}")
                            break

                        logger.warning(f"临时性错误，第 {attempt} 次失败: {e}")
                        if attempt < 3:
                            await asyncio.sleep(1)
            finally:
                await client.close()

            continue

        raise RuntimeError(f"所有 DashScope {model_name} 配置均调用失败，请检查密钥或网络")

    async def llm_engine_api(
        self,
        user_message: str,
        model_name: str,
        temperature: float = 0.7,
        system_prompt: str = "",
        enable_web_search: bool = False,
    ) -> Dict[str, Any]:
        """
        异步调用 LLM，返回解析后的 JSON。
        enable_web_search: 为 True 时，仅在 OpenRouter 下在模型名后追加 :online 启用联网搜索。
        """
        self.temperature = temperature

        candidates = [item for item in self.key_pool if item["model"] == model_name]
        if not candidates:
            raise ValueError(f"未找到模型 {model_name} 的配置")

        for idx, resource in enumerate(candidates):
            api_key = resource["api_key"]
            base_url = resource["base_url"]
            provider = resource["provider"]
            effective_model = self._effective_chat_model(provider, model_name, enable_web_search)

            client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=30.0)  # 30秒超时

            try:
                for attempt in range(1, 4):
                    try:
                        logger.info(
                            f"[{provider}] 使用模型 {effective_model} (第 {idx+1}/{len(candidates)} 配置) "
                            f"第 {attempt} 次尝试 (key: {api_key[:10]}...)"
                        )

                        completion = await client.chat.completions.create(
                            model=effective_model,
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_message},
                            ],
                            temperature=self.temperature,
                            stream=False
                        )

                        raw_content = completion.choices[0].message.content.strip()
                        if not raw_content:
                            raise ValueError("LLM 返回内容为空")

                        result = self.safe_json_loads(raw_content)
                        if not result:
                            raise ValueError("LLM 返回的 JSON 解析失败")
                        logger.info(f"✅ {model_name} JSON 解析成功")
                        return result

                    except Exception as e:
                        error_str = str(e).lower()

                        # 永久性错误：欠费、认证失败、模型不存在 → 立即切换，不重试
                        if any(k in error_str for k in ["authentication", "invalid api key", "insufficient_quota",
                                                       "quota exceeded", "rate limit", "billing", "not found"]):
                            logger.warning(f"永久性错误，立即切换下一个配置: {e}")
                            break  # 跳出重试，直接换下一个 resource

                        logger.warning(f"临时性错误，第 {attempt} 次失败: {e}")
                        if attempt < 3:
                            await asyncio.sleep(1)  # 短暂等待，异步不阻塞
            finally:
                await client.close()

            # 当前配置彻底失败，继续下一个
            continue

        raise RuntimeError(f"所有 {model_name} 配置均调用失败，请检查密钥或网络")

    async def chat_json(
        self,
        system_prompt: str,
        user_message: str,
        model_name: str,
        temperature: float = 0.2,
        enable_web_search: bool = False,
    ) -> Dict[str, Any]:
        """
        便捷方法：调用 LLM 获取结构化 JSON 响应，供 API 接口使用。
        enable_web_search: 用户输入含 URL 时可设为 True，启用 OpenRouter 联网搜索。
        """
        return await self.llm_engine_api(
            user_message=user_message,
            model_name=model_name,
            temperature=temperature,
            system_prompt=system_prompt,
            enable_web_search=enable_web_search,
        )

    async def chat_json_dashscope(
        self,
        system_prompt: str,
        user_message: str,
        model_name: str,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        """便捷方法：仅走 DashScope（通义千问）密钥池，返回结构化 JSON。"""
        return await self.llm_dashscope_api(
            user_message=user_message,
            model_name=model_name,
            temperature=temperature,
            system_prompt=system_prompt,
        )
