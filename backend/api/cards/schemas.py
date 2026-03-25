from typing import Any, Dict, List

from pydantic import BaseModel, Field


class SaveCardRequest(BaseModel):
    card: Dict[str, Any]


class SavedCard(BaseModel):
    id: str
    uuid: str | None = None
    user_id: int
    name: str
    image: str | None = None
    supertype: str | None = None
    subtype: str | None = None
    rarity: str | None = None
    element_type: str | None = None
    hp: str | None = None
    illustrator: str | None = None
    set_number: str | None = None
    status: str | None = None
    source: str | None = None
    version: int | None = None
    is_public: bool = False
    likes: int = 0
    views_count: int = 0
    forks_count: int = 0
    isLiked: bool = False
    published_at: str | None = None
    deleted_at: str | None = None
    created_at: str | None = None
    updated_at: str | None = None
    data: Dict[str, Any]


class SavedCardEnvelope(BaseModel):
    success: bool = True
    data: SavedCard


class SavedCardListEnvelope(BaseModel):
    success: bool = True
    data: List[SavedCard]


class DeleteCardEnvelope(BaseModel):
    success: bool = True
