from typing import Any, Dict, List
import re

from fastapi import HTTPException, status

try:
    from llm.llm import LanguageModel
except ModuleNotFoundError:
    from backend.llm.llm import LanguageModel

try:
    from api.wallet.service import WalletService
except ModuleNotFoundError:
    from backend.api.wallet.service import WalletService


class AIService:
    GENERATE_CARD_COST = 1
    APPRAISAL_COST = 20
    GENERATE_CARD_MODEL = "qwen-flash"
    DEFAULT_RARITY = "defective"
    RARITY_ALIASES = {
        "trash": "trash",
        "trash tier": "trash",
        "common": "trash",
        "烂胶级": "trash",
        "爛膠級": "trash",
        "defective": "defective",
        "defective tier": "defective",
        "uncommon": "defective",
        "残次品级": "defective",
        "殘次品級": "defective",
        "promising": "promising",
        "promising tier": "promising",
        "rare": "promising",
        "有啲料级": "promising",
        "有啲料級": "promising",
        "unhinged": "unhinged",
        "unhinged tier": "unhinged",
        "double rare": "unhinged",
        "黐线级": "unhinged",
        "黐線級": "unhinged",
        "mad_king": "mad_king",
        "mad king": "mad_king",
        "mad king tier": "mad_king",
        "ultra rare": "mad_king",
        "癫皇级": "mad_king",
        "癲皇級": "mad_king",
        "untouchable": "untouchable",
        "untouchable tier": "untouchable",
        "secret rare": "untouchable",
        "illustration rare": "untouchable",
        "冇人够胆掂级": "untouchable",
        "冇人夠膽掂級": "untouchable",
    }
    GUTTER_ATTRIBUTE_GUIDE = {
        "Grass": "发霉草 / Mold Grass",
        "Fire": "爆辣 / Blaze Spice",
        "Water": "霉水 / Rot Water",
        "Lightning": "神经电 / Nerve Shock",
        "Psychic": "痴线波 / Mad Wave",
        "Fighting": "街口霸气 / Street Swagger",
        "Darkness": "死黑 / Dead Black",
        "Metal": "烂铁 / Scrap Metal",
        "Dragon": "反骨龙 / Rebel Dragon",
        "Fairy": "花哩碌 / Extra Sparkle",
        "Colorless": "求其 / Whatever",
        "Ice": "冷亲 / Cold Snap",
        "Poison": "阴毒 / Petty Venom",
        "Ground": "烂泥 / Mud Mess",
        "Flying": "走佬风 / Runaway Wind",
        "Bug": "夜光虫 / Glow Bug",
        "Rock": "烂石 / Trash Rock",
        "Ghost": "阴气 / Spook Fog",
    }
    GUTTER_SUBTYPE_GUIDE = {
        "Basic": "烂胶仔 / Trash Kid",
        "Stage 1": "黐线仔 / Unhinged Kid",
        "Stage 2": "癫皇仔 / Mad King Kid",
        "VMAX": "爆表仔 / Overclock Kid",
        "Radiant": "神台仔 / Altar Kid",
    }
    TRAINER_TYPE_GUIDE = {
        "Item": "道具 / Item",
        "Supporter": "支援者 / Supporter",
        "Stadium": "场地 / Stadium",
        "Pokémon Tool": "痴线配件 / Chaos Rig",
    }

    def __init__(
        self,
        llm: LanguageModel | None = None,
        wallet_service: WalletService | None = None,
    ):
        self.llm = llm or LanguageModel()
        self.wallet_service = wallet_service or WalletService()

    async def generate_card_text(
        self,
        user_id: int,
        prompt: str,
        language: str = "zh-Hant",
        card_payload: Dict[str, Any] | None = None,
    ) -> Dict[str, Any]:
        card_payload = card_payload or {}
        prompt_text = prompt.strip() or "Create a completely random, creative, and balanced trading card concept."
        supertype = self._normalize_supertype(card_payload.get("supertype"))
        if supertype == "Energy":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Energy cards do not support AI text generation",
            )
        current_balance = self.wallet_service.get_balance(user_id)
        if int(current_balance["coins"]) < self.GENERATE_CARD_COST:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough coins")

        try:
            raw = await self.llm.chat_json(
                system_prompt=self._build_system_prompt(language, supertype),
                user_message=self._build_card_user_prompt(prompt_text, card_payload, supertype),
                model_name=self.GENERATE_CARD_MODEL,
                temperature=0.8,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI generation failed: {exc}",
            ) from exc

        normalized_card = self._normalize_generated_card(
            raw,
            language,
            supertype,
            card_payload,
            prompt_text,
        )
        balance = self.wallet_service.spend(user_id, self.GENERATE_CARD_COST, "ai_generate_card_text")
        return {
            "card": normalized_card,
            "remainingCoins": int(balance["coins"]),
        }

    async def appraise_card(
        self,
        user_id: int,
        card_payload: Dict[str, Any] | None = None,
        language: str = "zh-Hant",
    ) -> Dict[str, Any]:
        card_payload = card_payload or {}
        current_balance = self.wallet_service.get_balance(user_id)
        if int(current_balance["coins"]) < self.APPRAISAL_COST:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough coins")

        try:
            raw = await self.llm.chat_json(
                system_prompt=self._build_appraisal_system_prompt(language),
                user_message=self._build_appraisal_user_prompt(card_payload, language),
                model_name=self.GENERATE_CARD_MODEL,
                temperature=0.8,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI appraisal failed: {exc}",
            ) from exc

        appraisal = self._normalize_appraisal(raw, language)
        balance = self.wallet_service.spend(user_id, self.APPRAISAL_COST, "ai_appraisal")
        appraisal["remainingCoins"] = int(balance["coins"])
        return appraisal

    @staticmethod
    def _build_system_prompt(language: str, supertype: str) -> str:
        element_types = [
            "Grass",
            "Fire",
            "Water",
            "Lightning",
            "Psychic",
            "Fighting",
            "Darkness",
            "Metal",
            "Dragon",
            "Fairy",
            "Colorless",
            "Ice",
            "Poison",
            "Ground",
            "Flying",
            "Bug",
            "Rock",
            "Ghost",
        ]
        element_text = ", ".join(element_types)
        gutter_element_text = "; ".join(
            f"{key} = {label}" for key, label in AIService.GUTTER_ATTRIBUTE_GUIDE.items()
        )
        gutter_subtype_text = "; ".join(
            f"{key} = {label}" for key, label in AIService.GUTTER_SUBTYPE_GUIDE.items()
        )
        language_instruction = (
            "Write all user-facing text fields in English."
            if language == "en"
            else "Write all user-facing text fields in authentic Hong Kong Traditional Cantonese. Do not use Simplified Chinese, Taiwan wording, or stiff Mandarin phrasing."
        )
        style_instruction = (
            "The card must feel gutter-tier absurd, loud, shameless, and memorable. "
            "Names, attack names, species names, and effect flavor should sound wild, cocky, trashy, dramatic, and a little ridiculous, but still readable and cool. "
            "Avoid bland fantasy names like Mystic, Shadow, Flame Beast, or Hero Guardian unless twisted into something much weirder."
        )
        if supertype == "Trainer":
            return f"""
You generate Trainer trading card concepts.
Return JSON only with this exact shape:
{{
  "name": "string",
  "trainerType": "string",
  "rules": ["string"],
  "illustrator": "string",
  "setNumber": "string",
  "rarity": "string"
}}
Rules:
- trainerType must be one of: Item, Supporter, Stadium, Pokémon Tool.
- trainerType is an internal enum field and must stay in English exactly as one of the allowed values.
- name must sound gutter, absurd, Hong Kong flavored, punchy, and instantly memorable. It should feel like a notorious prop, scam gadget, shady venue, or chaotic street character.
- Do not output a polished bland fantasy name. Make it feel bold, local, dramatic, and a bit stupid in a good way.
- rules must contain 1 short effect text that matches the prompt and trainer type.
- Make the effect useful and relevant to the theme.
- Effects should read cleanly, but the card identity and naming must still carry the gutter vibe.
- Internal trainer type mapping reference: {"; ".join(f"{k} = {v}" for k, v in AIService.TRAINER_TYPE_GUIDE.items())}
- {style_instruction}
- {language_instruction}
""".strip()

        return f"""
You generate gutter creature trading card concepts for the Pokecard universe.
Return JSON only with this exact shape:
{{
  "name": "string",
  "hp": "string",
  "type": "string",
  "subtype": "string",
  "evolvesFrom": "string",
  "attacks": [
    {{
      "name": "string",
      "cost": ["string"],
      "damage": "string",
      "description": "string"
    }}
  ],
  "weakness": "string",
  "resistance": "string",
  "retreatCost": 0,
  "illustrator": "string",
  "setNumber": "string",
  "rarity": "string",
  "pokedexEntry": "string",
  "dexSpecies": "string",
  "dexHeight": "string",
  "dexWeight": "string"
}}
Rules:
- name must feel gutter, shameless, dramatic, and iconic, not generic or elegant.
- Do not output boring names like Fire Beast, Shadow Dragon, Mystic Cat, or Thunder Lord unless the prompt explicitly demands parody.
- names, attack names, dexSpecies, and pokedexEntry should all reflect the gutter persona of the card.
- Never use the words Pokemon, Pokémon, 宝可梦, or 寶可夢 in any user-facing text field.
- Generate 1 or 2 attacks.
- type, weakness, resistance, and attack cost values are internal enum fields and must use one of: {element_text}
- retreatCost must be an integer from 0 to 4.
- subtype is an internal enum field and must stay compatible with this card system, using only: Basic, Stage 1, Stage 2, VMAX, Radiant.
- Make the card feel balanced and flavorful.
- Gutter attribute flavor reference: {gutter_element_text}
- Gutter subtype flavor reference: {gutter_subtype_text}
- {style_instruction}
- {language_instruction}
""".strip()

    @staticmethod
    def _build_card_user_prompt(prompt_text: str, card_payload: Dict[str, Any], supertype: str) -> str:
        card_summary = {
            "currentSupertype": supertype,
            "currentName": card_payload.get("name"),
            "currentType": card_payload.get("type"),
            "currentSubtype": card_payload.get("subtype"),
            "currentTrainerType": card_payload.get("trainerType"),
            "currentRules": card_payload.get("rules"),
            "currentHP": card_payload.get("hp"),
            "currentSpecies": card_payload.get("dexSpecies"),
            "currentLoreEntry": card_payload.get("pokedexEntry"),
            "rarity": card_payload.get("rarity"),
        }
        return (
            f"Create a {supertype} card concept based on this prompt: {prompt_text}\n"
            "Treat the prompt as a theme, fantasy, or design brief. Do not simply copy the prompt into the card name.\n"
            "Push the result toward a gutter, absurd, Hong Kong street-chaos vibe instead of safe generic fantasy.\n"
            "Respect the card supertype and keep the generated fields relevant to it.\n"
            f"Current card context: {card_summary}"
        )

    @staticmethod
    def _normalize_text_for_compare(value: Any) -> str:
        return "".join(str(value or "").strip().lower().split())

    @classmethod
    def _build_name_fallback(cls, prompt_text: str, supertype: str, language: str, extra: str | None = None) -> str:
        theme = str(prompt_text or "").strip()
        extra = str(extra or "").strip()
        if not theme:
            if supertype == "Trainer":
                return "Dodgy Street Gadget" if language == "en" else "街口老千器"
            if supertype == "Energy":
                return "Chaos Juice" if language == "en" else "乱流汁能量"
            return "Back Alley Freak" if language == "en" else "後巷癲種"

        if supertype == "Trainer":
            if language == "en":
                suffix_map = {
                    "Item": "Contraption",
                    "Supporter": "Big Mouth",
                    "Stadium": "Joint",
                    "Pokémon Tool": "Rig",
                }
                suffix = suffix_map.get(extra or "Item", "Device")
                if cls._normalize_text_for_compare(suffix) in cls._normalize_text_for_compare(theme):
                    return theme
                return f"{theme} {suffix}"

            suffix_map = {
                "Item": "老千器",
                "Supporter": "吹水王",
                "Stadium": "烂场",
                "Pokémon Tool": "痴線配件",
            }
            suffix = suffix_map.get(extra or "Item", "裝置")
            if cls._normalize_text_for_compare(suffix) in cls._normalize_text_for_compare(theme):
                return theme
            return f"{theme}{suffix}"

        if supertype == "Energy":
            suffix = " Juice" if language == "en" else "能量"
            if cls._normalize_text_for_compare("energy" if language == "en" else "能量") in cls._normalize_text_for_compare(theme):
                return theme
            return f"{theme}{suffix}"

        if language == "en":
            return f"{theme} Menace"
        return f"{theme}怪"

    @classmethod
    def _resolve_generated_name(
        cls,
        payload_name: Any,
        prompt_text: str,
        supertype: str,
        language: str,
        fallback_name: str,
        extra: str | None = None,
    ) -> str:
        candidate = str(payload_name or "").strip()
        if not candidate:
            return fallback_name

        if cls._normalize_text_for_compare(candidate) == cls._normalize_text_for_compare(prompt_text):
            return cls._build_name_fallback(prompt_text, supertype, language, extra)

        return candidate

    @staticmethod
    def _normalize_supertype(value: Any) -> str:
        normalized = str(value or "Pokémon").strip().lower()
        if normalized == "trainer":
            return "Trainer"
        if normalized == "energy":
            return "Energy"
        return "Pokémon"

    @classmethod
    def _normalize_rarity(cls, value: Any) -> str:
        raw = str(value or "").strip()
        if not raw:
            return cls.DEFAULT_RARITY
        normalized = cls.RARITY_ALIASES.get(raw.lower())
        if normalized:
            return normalized
        return cls.DEFAULT_RARITY

    @staticmethod
    def _strip_banned_universe_terms(value: Any, language: str = "zh-Hant") -> str:
        text = str(value or "").strip()
        if not text:
            return ""

        replacements = [
            (r"(?i)opponent'?s pok[eé]mon", "opponent creature"),
            (r"(?i)your pok[eé]mon", "your creature"),
            (r"(?i)this pok[eé]mon", "this creature"),
            (r"(?i)pok[eé]mon tool", "chaos rig"),
            (r"(?i)pok[eé]dex", "street log"),
            (r"(?i)pok[eé]mon", "creature"),
            (r"寶可夢", "怪物"),
            (r"宝可梦", "怪物"),
        ]

        for pattern, replacement in replacements:
            text = re.sub(pattern, replacement, text)

        if language != "en":
            zh_replacements = [
                (r"this creature", "呢隻怪"),
                (r"your creature", "你隻怪"),
                (r"opponent creature", "對家隻怪"),
                (r"creature", "怪物"),
                (r"chaos rig", "痴線配件"),
                (r"street log", "街頭檔案"),
            ]
            for src, target in zh_replacements:
                text = re.sub(src, target, text, flags=re.IGNORECASE)

        return text.strip()

    @staticmethod
    def _build_appraisal_system_prompt(language: str) -> str:
        language_instruction = (
            "Write both price and comment in English where applicable."
            if language == "en"
            else "Write the comment in authentic Hong Kong Traditional Cantonese, using natural Cantonese wording and sentence rhythm. Do not use Simplified Chinese, Mandarin phrasing, or Taiwan-style wording. The price can keep normal currency formatting."
        )
        return f"""
You are a savage, witty, and highly opinionated underground Pokecard collector who appraises cards like a toxic veteran stall expert.
Return JSON only with this exact shape:
{{
  "price": "string",
  "comment": "string"
}}
Rules:
- price must be very short, maximum 12 characters, and should usually stay in a believable novelty-card range between "$5" and "$500".
- Avoid joke extremes like "$0.05", "$9,000", "$999,999", or "Priceless" unless the card is truly catastrophically bad or absurdly iconic.
- comment must be a brutally sharp, funny roast in at most 2 sentences.
- If the card is wildly overpowered, obviously fake, or absurdly designed, call that out and value it lower.
- {language_instruction}
- Stay in character as a snobbish collector who has seen too many fake cards, overhyped customs, and embarrassing binder fillers.
- For zh-Hant output, the roast should sound like a mean but entertaining Hong Kong collector mocking the card face-to-face, with local flavor and stronger sarcasm.
- Do not repeat the prompt. Do not add extra keys. Do not wrap in markdown.
""".strip()

    @staticmethod
    def _build_appraisal_user_prompt(card_payload: Dict[str, Any], language: str) -> str:
        attacks = card_payload.get("attacks") or []
        attack_summary: List[Dict[str, Any]] = []
        if isinstance(attacks, list):
            for attack in attacks[:2]:
                if not isinstance(attack, dict):
                    continue
                attack_summary.append(
                    {
                        "name": attack.get("name"),
                        "cost": attack.get("cost"),
                        "damage": attack.get("damage"),
                        "description": attack.get("description"),
                    }
                )

        summary = {
            "name": card_payload.get("name"),
            "supertype": card_payload.get("supertype"),
            "type": card_payload.get("type"),
            "subtype": card_payload.get("subtype"),
            "hp": card_payload.get("hp"),
            "trainerType": card_payload.get("trainerType"),
            "rules": card_payload.get("rules"),
            "attacks": attack_summary,
            "weakness": card_payload.get("weakness"),
            "resistance": card_payload.get("resistance"),
            "retreatCost": card_payload.get("retreatCost"),
            "rarity": card_payload.get("rarity"),
            "illustrator": card_payload.get("illustrator"),
            "pokedexEntry": card_payload.get("pokedexEntry"),
        }
        language_hint = (
            "Respond in English."
            if language == "en"
            else "請用香港地道繁體粵語回覆，語氣要刻薄、串嘴、好笑，但唔好爆粗。"
        )
        return f"Appraise this custom Pokecard and roast it if deserved. {language_hint} Card summary: {summary}"

    @staticmethod
    def _normalize_element(value: Any, fallback: str = "Colorless") -> str:
        allowed = {
            "grass": "Grass",
            "发霉草": "Grass",
            "發霉草": "Grass",
            "mold grass": "Grass",
            "fire": "Fire",
            "爆辣": "Fire",
            "blaze spice": "Fire",
            "water": "Water",
            "霉水": "Water",
            "rot water": "Water",
            "lightning": "Lightning",
            "神经电": "Lightning",
            "神經電": "Lightning",
            "nerve shock": "Lightning",
            "psychic": "Psychic",
            "痴线波": "Psychic",
            "痴線波": "Psychic",
            "mad wave": "Psychic",
            "fighting": "Fighting",
            "街口霸气": "Fighting",
            "街口霸氣": "Fighting",
            "street swagger": "Fighting",
            "darkness": "Darkness",
            "死黑": "Darkness",
            "dead black": "Darkness",
            "metal": "Metal",
            "烂铁": "Metal",
            "爛鐵": "Metal",
            "scrap metal": "Metal",
            "dragon": "Dragon",
            "反骨龙": "Dragon",
            "反骨龍": "Dragon",
            "rebel dragon": "Dragon",
            "fairy": "Fairy",
            "花哩碌": "Fairy",
            "extra sparkle": "Fairy",
            "colorless": "Colorless",
            "求其": "Colorless",
            "whatever": "Colorless",
            "ice": "Ice",
            "冷亲": "Ice",
            "冷親": "Ice",
            "cold snap": "Ice",
            "poison": "Poison",
            "阴毒": "Poison",
            "陰毒": "Poison",
            "petty venom": "Poison",
            "ground": "Ground",
            "烂泥": "Ground",
            "爛泥": "Ground",
            "mud mess": "Ground",
            "flying": "Flying",
            "走佬风": "Flying",
            "走佬風": "Flying",
            "runaway wind": "Flying",
            "bug": "Bug",
            "夜光虫": "Bug",
            "夜光蟲": "Bug",
            "glow bug": "Bug",
            "rock": "Rock",
            "烂石": "Rock",
            "爛石": "Rock",
            "trash rock": "Rock",
            "ghost": "Ghost",
            "阴气": "Ghost",
            "陰氣": "Ghost",
            "spook fog": "Ghost",
        }
        key = str(value or "").strip().lower()
        return allowed.get(key, fallback)

    @staticmethod
    def _extract_numeric_price(value: str) -> float | None:
        match = re.search(r"(\d[\d,]*(?:\.\d{1,2})?)", value or "")
        if not match:
            return None
        try:
            return float(match.group(1).replace(",", ""))
        except ValueError:
            return None

    @staticmethod
    def _format_price(amount: float) -> str:
        rounded = round(amount)
        if rounded >= 1000:
            return f"${rounded:,.0f}"
        if rounded >= 100:
            return f"${rounded:.0f}"
        if rounded >= 10:
            return f"${rounded:.0f}"
        return f"${amount:.2f}"

    @classmethod
    def _normalize_appraisal_price(cls, raw_price: str) -> str:
        numeric_price = cls._extract_numeric_price(raw_price)
        if numeric_price is None:
            return "$48"

        # Keep the joke price in a tighter, more believable band for custom cards.
        clamped = min(max(numeric_price, 4.0), 480.0)

        # Avoid ugly values like $4.17 or $479.32.
        if clamped < 10:
            snapped = round(clamped * 2) / 2
        elif clamped < 100:
            snapped = round(clamped / 5) * 5
        else:
            snapped = round(clamped / 10) * 10

        return cls._format_price(snapped)

    @classmethod
    def _normalize_appraisal(cls, payload: Dict[str, Any], language: str) -> Dict[str, str]:
        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI returned malformed appraisal data",
            )

        price = str(payload.get("price") or "").strip()
        comment = str(payload.get("comment") or "").strip()

        price = cls._normalize_appraisal_price(price)

        if not comment:
            comment = (
                "This thing looks like it lost a fight with a microwave and a fanfic generator."
                if language == "en"
                else "呢張卡望落似係微波爐燒壞咗之後，再俾同人小說生成器亂咁砌出嚟嘅殘次品。"
            )

        return {
            "price": price,
            "comment": comment,
        }

    @classmethod
    def _normalize_attacks(cls, attacks: Any) -> List[Dict[str, Any]]:
        if not isinstance(attacks, list) or not attacks:
            return [
                {
                    "id": "gen-attack-1",
                    "name": "Cheap Shot Pulse",
                    "cost": ["Colorless"],
                    "damage": "30",
                    "description": "",
                }
            ]

        normalized_attacks: List[Dict[str, Any]] = []
        for index, attack in enumerate(attacks[:2], start=1):
            if not isinstance(attack, dict):
                continue
            costs = attack.get("cost")
            normalized_costs = []
            if isinstance(costs, list):
                normalized_costs = [cls._normalize_element(item) for item in costs if item]
            if not normalized_costs:
                normalized_costs = ["Colorless"]
            normalized_attacks.append(
                {
                    "id": f"gen-attack-{index}",
                    "name": str(attack.get("name") or f"Generated Attack {index}").strip(),
                    "cost": normalized_costs,
                    "damage": str(attack.get("damage") or "30").strip(),
                    "description": str(attack.get("description") or "").strip(),
                }
            )

        return normalized_attacks or [
                {
                    "id": "gen-attack-1",
                    "name": "Cheap Shot Pulse",
                    "cost": ["Colorless"],
                    "damage": "30",
                    "description": "",
            }
        ]

    @classmethod
    def _normalize_generated_card(
        cls,
        payload: Dict[str, Any],
        language: str = "zh-Hant",
        supertype: str = "Pokémon",
        card_payload: Dict[str, Any] | None = None,
        prompt_text: str = "",
    ) -> Dict[str, Any]:
        card_payload = card_payload or {}
        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI returned malformed card data",
            )

        retreat_cost = payload.get("retreatCost", 1)
        try:
            retreat_cost = max(0, min(int(retreat_cost), 4))
        except (TypeError, ValueError):
            retreat_cost = 1

        default_entry = (
            "An AI-generated gutter monster with a deeply suspicious vibe."
            if language == "en"
            else "一隻由 AI 整出嚟、气场鬼鬼祟祟又够沟嘅怪物。"
        )
        default_species = "Chaotic Creature" if language == "en" else "离谱怪种"
        default_illustrator = "AI Back Alley Lab" if language == "en" else "AI 後巷工場"

        if supertype == "Trainer":
            trainer_type = str(payload.get("trainerType") or card_payload.get("trainerType") or "Item").strip()
            rules = payload.get("rules")
            if not isinstance(rules, list) or not rules:
                fallback_rule = "Draw 2 cards." if language == "en" else "抽 2 張牌。"
                rules = [str(payload.get("rule") or fallback_rule).strip()]
            fallback_name = card_payload.get("name") or ("Dodgy Street Gadget" if language == "en" else "街口老千器")
            trainer_name = cls._strip_banned_universe_terms(
                cls._resolve_generated_name(
                    payload.get("name"),
                    prompt_text,
                    supertype,
                    language,
                    str(fallback_name).strip(),
                    trainer_type,
                ),
                language,
            )
            return {
                "supertype": "Trainer",
                "name": trainer_name,
                "trainerType": trainer_type,
                "rules": [cls._strip_banned_universe_terms(str(rules[0]).strip(), language)],
                "illustrator": str(payload.get("illustrator") or default_illustrator).strip(),
                "setNumber": str(payload.get("setNumber") or card_payload.get("setNumber") or "001/165").strip(),
                "rarity": cls._normalize_rarity(payload.get("rarity") or card_payload.get("rarity")),
                "hp": "",
                "attacks": [],
                "evolvesFrom": "",
                "pokedexEntry": "",
                "dexSpecies": "",
                "dexHeight": "",
                "dexWeight": "",
                "weakness": None,
                "resistance": None,
                "retreatCost": 0,
            }

        if supertype == "Energy":
            rules = payload.get("rules")
            if not isinstance(rules, list):
                rules = []
            fallback_name = card_payload.get("name") or ("Chaos Juice" if language == "en" else "亂流汁能量")
            energy_name = cls._strip_banned_universe_terms(
                cls._resolve_generated_name(
                    payload.get("name"),
                    prompt_text,
                    supertype,
                    language,
                    str(fallback_name).strip(),
                ),
                language,
            )
            return {
                "supertype": "Energy",
                "name": energy_name,
                "type": cls._normalize_element(payload.get("type") or card_payload.get("type"), "Colorless"),
                "rules": [cls._strip_banned_universe_terms(str(rule).strip(), language) for rule in rules[:1] if str(rule).strip()],
                "illustrator": str(payload.get("illustrator") or default_illustrator).strip(),
                "setNumber": str(payload.get("setNumber") or card_payload.get("setNumber") or "001/165").strip(),
                "rarity": cls._normalize_rarity(payload.get("rarity") or card_payload.get("rarity")),
                "hp": "",
                "attacks": [],
                "evolvesFrom": "",
                "pokedexEntry": "",
                "dexSpecies": "",
                "dexHeight": "",
                "dexWeight": "",
                "weakness": None,
                "resistance": None,
                "retreatCost": 0,
                "trainerType": None,
            }

        creature_name = cls._strip_banned_universe_terms(
            cls._resolve_generated_name(
                payload.get("name"),
                prompt_text,
                supertype,
                language,
                "Back Alley Freak" if language == "en" else "後巷癲種",
            ),
            language,
        )
        normalized_attacks = cls._normalize_attacks(payload.get("attacks"))
        for attack in normalized_attacks:
            attack["name"] = cls._strip_banned_universe_terms(attack.get("name"), language)
            attack["description"] = cls._strip_banned_universe_terms(attack.get("description"), language)

        return {
            "supertype": "Pokémon",
            "name": creature_name,
            "hp": str(payload.get("hp") or "100").strip(),
            "type": cls._normalize_element(payload.get("type"), "Fire"),
            "subtype": str(payload.get("subtype") or "Basic").strip(),
            "evolvesFrom": str(payload.get("evolvesFrom") or "").strip() or None,
            "attacks": normalized_attacks,
            "weakness": cls._normalize_element(payload.get("weakness"), "Water"),
            "resistance": cls._normalize_element(payload.get("resistance"), "Colorless"),
            "retreatCost": retreat_cost,
            "illustrator": str(payload.get("illustrator") or default_illustrator).strip(),
            "setNumber": str(payload.get("setNumber") or "001/165").strip(),
            "rarity": cls._normalize_rarity(payload.get("rarity")),
            "pokedexEntry": cls._strip_banned_universe_terms(str(payload.get("pokedexEntry") or default_entry).strip(), language),
            "dexSpecies": cls._strip_banned_universe_terms(str(payload.get("dexSpecies") or default_species).strip(), language),
            "dexHeight": str(payload.get("dexHeight") or "3'03\"").strip(),
            "dexWeight": str(payload.get("dexWeight") or "33.1 lbs.").strip(),
        }
