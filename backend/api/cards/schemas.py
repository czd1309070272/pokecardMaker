from typing import Any, Dict, List, Literal

from pydantic import BaseModel, Field


class SaveCardRequest(BaseModel):
    card: Dict[str, Any]


class SaveCardAppraisalRequest(BaseModel):
    price: str
    comment: str
    language: Literal["en", "zh-Hant"] = "zh-Hant"


class CreateCardCommentRequest(BaseModel):
    content: str = Field(min_length=1, max_length=500)


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
    isFavorited: bool = False
    author_name: str | None = None
    published_at: str | None = None
    deleted_at: str | None = None
    favorited_at: str | None = None
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


class DeleteCommentEnvelope(BaseModel):
    success: bool = True


class PublishCardRequest(BaseModel):
    isPublic: bool = True


class PublishCardEnvelope(BaseModel):
    success: bool = True
    data: SavedCard


class PublicCardsQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=50)
    sort: Literal["trending", "newest", "top_rated"] = "trending"


class PublicCardsPayload(BaseModel):
    list: List[SavedCard]
    page: int
    limit: int
    total: int
    hasMore: bool


class PublicCardsEnvelope(BaseModel):
    success: bool = True
    data: PublicCardsPayload


class ToggleLikePayload(BaseModel):
    cardId: str
    liked: bool
    newCount: int


class ToggleLikeEnvelope(BaseModel):
    success: bool = True
    data: ToggleLikePayload


class ToggleFavoritePayload(BaseModel):
    cardId: str
    favorited: bool


class ToggleFavoriteEnvelope(BaseModel):
    success: bool = True
    data: ToggleFavoritePayload


class SaveCardAppraisalEnvelope(BaseModel):
    success: bool = True
    data: SavedCard


class CardComment(BaseModel):
    id: int
    cardId: str
    userId: int
    authorName: str
    content: str
    createdAt: str | None = None
    updatedAt: str | None = None
    isOwner: bool = False
    canDelete: bool = False


class CardCommentListPayload(BaseModel):
    list: List[CardComment]
    page: int
    limit: int
    total: int
    hasMore: bool


class CardCommentListEnvelope(BaseModel):
    success: bool = True
    data: CardCommentListPayload


class CardCommentEnvelope(BaseModel):
    success: bool = True
    data: CardComment
