from typing import Any, Dict, Literal

from pydantic import BaseModel, Field


class GenerateCardTextRequest(BaseModel):
    prompt: str = Field(default="", max_length=1000)
    language: Literal["en", "zh-Hant"] = "zh-Hant"
    card: Dict[str, Any] = Field(default_factory=dict)


class GenerateCardTextPayload(BaseModel):
    card: Dict[str, Any]
    remainingCoins: int


class GenerateCardTextEnvelope(BaseModel):
    success: bool = True
    data: GenerateCardTextPayload


class AppraiseCardRequest(BaseModel):
    card: Dict[str, Any]
    language: Literal["en", "zh-Hant"] = "zh-Hant"


class AppraiseCardPayload(BaseModel):
    price: str
    comment: str
    remainingCoins: int


class AppraiseCardEnvelope(BaseModel):
    success: bool = True
    data: AppraiseCardPayload
