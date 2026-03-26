import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List

from openai import AsyncOpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(CURRENT_DIR, "key_pool.json")


class LanguageModel:
    def __init__(self) -> None:
        self.key_pool = self._load_key_pool()

    def _load_key_pool(self) -> List[Dict[str, Any]]:
        if not os.path.exists(CONFIG_FILE):
            logger.error("LLM config file does not exist: %s", CONFIG_FILE)
            return []

        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as file:
                payload = json.load(file)
        except Exception as exc:
            logger.error("Failed to load LLM key pool: %s", exc)
            return []

        resources = payload.get("key_pool", [])
        return [item for item in resources if item.get("api_key") and item.get("base_url") and item.get("model")]

    @staticmethod
    def safe_json_loads(text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            logger.warning("LLM returned empty content")
            return {}

        normalized = text.strip()
        fenced_match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", normalized, re.IGNORECASE)
        if fenced_match:
            normalized = fenced_match.group(1).strip()

        try:
            start = normalized.index("{")
            end = normalized.rindex("}") + 1
            normalized = normalized[start:end]
        except ValueError:
            logger.warning("Could not find JSON boundaries in LLM output")
            return {}

        candidates = [
            normalized,
            re.sub(r",\s*([}\]])", r"\1", normalized),
            normalized.replace("'", '"'),
        ]

        for candidate in candidates:
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

        logger.warning("All JSON parse attempts failed for LLM output")
        return {}

    async def chat_json(
        self,
        system_prompt: str,
        user_message: str,
        model_name: str,
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        candidates = [item for item in self.key_pool if item.get("model") == model_name]
        if not candidates:
            raise ValueError(f"Model configuration not found: {model_name}")

        last_error: Exception | None = None

        for index, resource in enumerate(candidates, start=1):
            client = AsyncOpenAI(
                api_key=resource["api_key"],
                base_url=resource["base_url"],
                timeout=30.0,
            )

            try:
                for attempt in range(1, 4):
                    try:
                        logger.info(
                            "Calling LLM model=%s provider=%s candidate=%s/%s attempt=%s",
                            model_name,
                            resource.get("provider", "unknown"),
                            index,
                            len(candidates),
                            attempt,
                        )

                        completion = await client.chat.completions.create(
                            model=model_name,
                            messages=[
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_message},
                            ],
                            temperature=temperature,
                            stream=False,
                        )

                        content = (completion.choices[0].message.content or "").strip()
                        result = self.safe_json_loads(content)
                        if result:
                            return result
                        raise ValueError("LLM JSON parsing failed")
                    except Exception as exc:
                        last_error = exc
                        error_text = str(exc).lower()
                        if any(
                            keyword in error_text
                            for keyword in (
                                "authentication",
                                "invalid api key",
                                "insufficient_quota",
                                "quota exceeded",
                                "billing",
                                "not found",
                            )
                        ):
                            logger.warning("Skipping invalid LLM credential/model config: %s", exc)
                            break
                        if attempt < 3:
                            await asyncio.sleep(1)
            finally:
                await client.close()

        raise RuntimeError(f"All LLM calls failed for model {model_name}") from last_error
