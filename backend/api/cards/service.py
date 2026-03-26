import json
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4

from fastapi import HTTPException, status

from .repository import CardsRepository


class CardsService:
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

    def __init__(self, repository: CardsRepository | None = None):
        self.repository = repository or CardsRepository()

    def save_card(self, user_id: int, card_payload: Dict[str, Any]) -> Dict[str, Any]:
        fields = self._build_card_fields(card_payload)
        card_uuid = str(uuid4())
        card_id = self.repository.create_card(card_uuid=card_uuid, user_id=user_id, **fields)
        if not card_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save card",
            )

        saved_card = self.repository.find_card_by_id(card_id, user_id)
        if not saved_card:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Saved card could not be loaded",
            )

        return self._serialize_card(saved_card)

    def update_card(self, user_id: int, card_uuid: str, card_payload: Dict[str, Any]) -> Dict[str, Any]:
        fields = self._build_card_fields(card_payload)
        updated = self.repository.update_card(card_uuid=card_uuid, user_id=user_id, **fields)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found",
            )

        saved_card = self.repository.find_card_by_uuid(card_uuid, user_id)
        if not saved_card:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Updated card could not be loaded",
            )

        return self._serialize_card(saved_card)

    def delete_card(self, user_id: int, card_uuid: str) -> None:
        deleted = self.repository.delete_card(card_uuid, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found",
            )

    def list_my_cards(self, user_id: int) -> list[Dict[str, Any]]:
        records = self.repository.list_cards_by_user(user_id)
        return [self._serialize_card(record) for record in records]

    def list_favorited_cards(self, user_id: int) -> list[Dict[str, Any]]:
        records = self.repository.list_favorited_cards_by_user(user_id)
        return [self._serialize_card(record) for record in records]

    def list_card_comments(
        self,
        card_uuid: str,
        page: int,
        limit: int,
        viewer_user_id: int | None = None,
    ) -> Dict[str, Any]:
        card = self.repository.find_public_card_by_uuid(card_uuid, viewer_user_id=viewer_user_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Public card not found",
            )

        safe_page = max(page, 1)
        safe_limit = min(max(limit, 1), 50)
        offset = (safe_page - 1) * safe_limit
        total = self.repository.count_card_comments(card_uuid)
        records = self.repository.list_card_comments(card_uuid, safe_limit, offset)
        return {
            "list": [
                self._serialize_comment(
                    record,
                    viewer_user_id=viewer_user_id,
                    card_owner_user_id=int(card.get("user_id") or 0),
                )
                for record in records
            ],
            "page": safe_page,
            "limit": safe_limit,
            "total": total,
            "hasMore": safe_page * safe_limit < total,
        }

    def toggle_favorite(self, user_id: int, card_uuid: str) -> Dict[str, Any]:
        already_favorited = self.repository.has_user_favorited_card(card_uuid, user_id)
        if already_favorited:
            self.repository.remove_card_favorite(card_uuid, user_id)
            favorited = False
        else:
            card = self.repository.find_public_card_by_uuid(card_uuid, viewer_user_id=user_id)
            if not card:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Public card not found",
                )
            if int(card.get("user_id") or 0) == user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You cannot favorite your own card",
                )
            self.repository.add_card_favorite(card_uuid, user_id)
            favorited = True

        return {
            "cardId": card_uuid,
            "favorited": favorited,
        }

    def list_public_cards(
        self,
        page: int,
        limit: int,
        sort: str,
        viewer_user_id: int | None = None,
    ) -> Dict[str, Any]:
        safe_page = max(page, 1)
        safe_limit = min(max(limit, 1), 50)
        safe_sort = sort if sort in self.repository.PUBLIC_SORTS else "trending"
        offset = (safe_page - 1) * safe_limit

        records = self.repository.list_public_cards(
            limit=safe_limit,
            offset=offset,
            sort=safe_sort,
            viewer_user_id=viewer_user_id,
        )
        total = self.repository.count_public_cards()
        cards = [self._serialize_card(record) for record in records]
        return {
            "list": cards,
            "page": safe_page,
            "limit": safe_limit,
            "total": total,
            "hasMore": safe_page * safe_limit < total,
        }

    def publish_card(self, user_id: int, card_uuid: str, is_public: bool = True) -> Dict[str, Any]:
        published_at = datetime.utcnow() if is_public else None
        card_status = "published" if is_public else "draft"
        updated = self.repository.set_card_public_state(
            card_uuid=card_uuid,
            user_id=user_id,
            is_public=is_public,
            published_at=published_at,
            card_status=card_status,
        )
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found",
            )

        saved_card = self.repository.find_card_by_uuid(card_uuid, user_id)
        if not saved_card:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Updated card could not be loaded",
            )

        return self._serialize_card(saved_card)

    def toggle_like(self, user_id: int, card_uuid: str) -> Dict[str, Any]:
        card = self.repository.find_public_card_by_uuid(card_uuid, viewer_user_id=user_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Public card not found",
            )
        if int(card.get("user_id") or 0) == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot like your own card",
            )

        already_liked = self.repository.has_user_liked_card(card_uuid, user_id)
        if already_liked:
            self.repository.remove_card_like(card_uuid, user_id)
            liked = False
        else:
            self.repository.add_card_like(card_uuid, user_id)
            liked = True

        self.repository.sync_card_likes_count(card_uuid)
        refreshed = self.repository.find_public_card_by_uuid(card_uuid, viewer_user_id=user_id)
        new_count = int((refreshed or {}).get("likes_count") or 0)
        return {
            "cardId": card_uuid,
            "liked": liked,
            "newCount": new_count,
        }

    def save_card_appraisal(
        self,
        user_id: int,
        card_uuid: str,
        appraisal_payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        price = self._as_optional_str(appraisal_payload.get("price"))
        comment = self._as_optional_str(appraisal_payload.get("comment"))
        language = self._as_optional_str(appraisal_payload.get("language")) or "zh-Hant"

        if not price or not comment:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Appraisal price and comment are required",
            )

        saved = self.repository.upsert_card_appraisal(
            card_uuid=card_uuid,
            user_id=user_id,
            price=price,
            comment=comment,
            language=language,
        )
        if not saved:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found",
            )

        card = self.repository.find_card_by_uuid(card_uuid, user_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Appraised card could not be loaded",
            )

        return self._serialize_card(card)

    def create_card_comment(self, user_id: int, card_uuid: str, content: str) -> Dict[str, Any]:
        normalized_content = self._as_optional_str(content)
        if not normalized_content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Comment content is required",
            )
        if len(normalized_content) > 500:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Comment is too long",
            )

        card = self.repository.find_public_card_by_uuid(card_uuid, viewer_user_id=user_id)
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Public card not found",
            )

        comment_id = self.repository.create_card_comment(card_uuid, user_id, normalized_content)
        if not comment_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create comment",
            )

        comment = self.repository.find_card_comment_by_id(comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Created comment could not be loaded",
            )

        return self._serialize_comment(
            comment,
            viewer_user_id=user_id,
            card_owner_user_id=int(card.get("user_id") or 0),
        )

    def delete_card_comment(self, user_id: int, card_uuid: str, comment_id: int) -> None:
        comment = self.repository.find_card_comment_by_id(comment_id)
        if not comment or str(comment.get("card_uuid") or "") != card_uuid:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found",
            )

        card_owner_user_id = int(comment.get("card_owner_user_id") or 0)
        comment_user_id = int(comment.get("user_id") or 0)
        if user_id not in {card_owner_user_id, comment_user_id}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this comment",
            )

        deleted = self.repository.delete_card_comment(card_uuid, comment_id, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found",
            )

    def _build_card_fields(self, card_payload: Dict[str, Any]) -> Dict[str, Any]:
        name = str(card_payload.get("name", "")).strip()
        if not name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Card name is required",
            )

        return {
            "name": name,
            "image_url": card_payload.get("image"),
            "supertype": card_payload.get("supertype"),
            "subtype": card_payload.get("subtype"),
            "rarity": self._normalize_rarity(card_payload.get("rarity")),
            "element_type": self._as_optional_str(card_payload.get("elementType") or card_payload.get("type")),
            "hp": self._as_optional_str(card_payload.get("hp")),
            "illustrator": self._as_optional_str(card_payload.get("illustrator")),
            "set_number": self._as_optional_str(card_payload.get("setNumber") or card_payload.get("set_number")),
            "card_status": self._as_optional_str(card_payload.get("status")) or "draft",
            "source": self._as_optional_str(card_payload.get("source")) or "manual",
            "version": self._as_optional_int(card_payload.get("version"), default=1),
            "views_count": self._as_optional_int(card_payload.get("viewsCount") or card_payload.get("views_count"), default=0) or 0,
            "forks_count": self._as_optional_int(card_payload.get("forksCount") or card_payload.get("forks_count"), default=0) or 0,
            "published_at": self._as_optional_datetime(card_payload.get("publishedAt") or card_payload.get("published_at")),
            "deleted_at": self._as_optional_datetime(card_payload.get("deletedAt") or card_payload.get("deleted_at")),
            "card_payload": card_payload,
        }

    @staticmethod
    def _serialize_card(record: Dict[str, Any]) -> Dict[str, Any]:
        try:
            payload = json.loads(record.get("data_json") or "{}")
        except json.JSONDecodeError:
            payload = {}

        payload["name"] = record.get("name") or payload.get("name") or ""
        payload["image"] = record.get("image_url") or payload.get("image")
        payload["supertype"] = record.get("supertype") or payload.get("supertype")
        payload["subtype"] = record.get("subtype") or payload.get("subtype")
        payload["rarity"] = CardsService._normalize_rarity(record.get("rarity") or payload.get("rarity"))
        payload["type"] = record.get("element_type") or payload.get("type")
        payload["hp"] = record.get("hp") or payload.get("hp")
        payload["illustrator"] = record.get("illustrator") or payload.get("illustrator")
        payload["setNumber"] = record.get("set_number") or payload.get("setNumber") or payload.get("set_number")
        payload["status"] = record.get("status") or payload.get("status")
        payload["source"] = record.get("source") or payload.get("source")
        payload["version"] = record.get("version") if record.get("version") is not None else payload.get("version")
        payload["viewsCount"] = int(record.get("views_count") or payload.get("viewsCount") or payload.get("views_count") or 0)
        payload["forksCount"] = int(record.get("forks_count") or payload.get("forksCount") or payload.get("forks_count") or 0)
        payload["publishedAt"] = CardsService._serialize_datetime(record.get("published_at")) or payload.get("publishedAt") or payload.get("published_at")
        payload["deletedAt"] = CardsService._serialize_datetime(record.get("deleted_at")) or payload.get("deletedAt") or payload.get("deleted_at")
        payload["isPublic"] = bool(record.get("is_public"))
        payload["isDeleted"] = bool(record.get("deleted_at"))
        payload["isFavorited"] = bool(record.get("viewer_favorited", False))
        payload["authorName"] = record.get("author_name") or payload.get("authorName")
        payload["favoritedAt"] = CardsService._serialize_datetime(record.get("favorited_at")) or payload.get("favoritedAt") or payload.get("favorited_at")
        appraisal_price = record.get("appraisal_price")
        appraisal_comment = record.get("appraisal_comment")
        if appraisal_price and appraisal_comment:
            payload["appraisal"] = {
                "price": str(appraisal_price),
                "comment": str(appraisal_comment),
                "language": record.get("appraisal_language"),
                "appraisedAt": CardsService._serialize_datetime(record.get("appraisal_appraised_at")),
            }
        external_id = record.get("uuid") or str(record["id"])
        payload.update(
            {
                "id": external_id,
                "uuid": record.get("uuid"),
                "likes": int(record.get("likes_count") or 0),
                "isLiked": bool(record.get("viewer_liked", False)),
                "isFavorited": bool(record.get("viewer_favorited", False)),
            }
        )

        return {
            "id": external_id,
            "uuid": record.get("uuid"),
            "user_id": int(record["user_id"]),
            "name": record.get("name") or payload.get("name") or "",
            "image": record.get("image_url"),
            "supertype": record.get("supertype"),
            "subtype": record.get("subtype"),
            "rarity": CardsService._normalize_rarity(record.get("rarity")),
            "element_type": record.get("element_type"),
            "hp": record.get("hp"),
            "illustrator": record.get("illustrator"),
            "set_number": record.get("set_number"),
            "status": record.get("status"),
            "source": record.get("source"),
            "version": record.get("version"),
            "is_public": bool(record.get("is_public")),
            "likes": int(record.get("likes_count") or 0),
            "views_count": int(record.get("views_count") or 0),
            "forks_count": int(record.get("forks_count") or 0),
            "isLiked": bool(record.get("viewer_liked", False)),
            "isFavorited": bool(record.get("viewer_favorited", False)),
            "author_name": record.get("author_name"),
            "published_at": CardsService._serialize_datetime(record.get("published_at")),
            "deleted_at": CardsService._serialize_datetime(record.get("deleted_at")),
            "favorited_at": CardsService._serialize_datetime(record.get("favorited_at")),
            "created_at": CardsService._serialize_datetime(record.get("created_at")),
            "updated_at": CardsService._serialize_datetime(record.get("updated_at")),
            "data": payload,
        }

    @staticmethod
    def _serialize_comment(
        record: Dict[str, Any],
        viewer_user_id: int | None = None,
        card_owner_user_id: int | None = None,
    ) -> Dict[str, Any]:
        comment_user_id = int(record.get("user_id") or 0)
        effective_card_owner_user_id = (
            card_owner_user_id if card_owner_user_id is not None else int(record.get("card_owner_user_id") or 0)
        )
        return {
            "id": int(record["id"]),
            "cardId": str(record.get("card_uuid") or ""),
            "userId": comment_user_id,
            "authorName": str(record.get("author_name") or "Unknown"),
            "content": str(record.get("content") or ""),
            "createdAt": CardsService._serialize_datetime(record.get("created_at")),
            "updatedAt": CardsService._serialize_datetime(record.get("updated_at")),
            "isOwner": bool(viewer_user_id and comment_user_id == viewer_user_id),
            "canDelete": bool(
                viewer_user_id and viewer_user_id in {comment_user_id, effective_card_owner_user_id}
            ),
        }

    @staticmethod
    def _as_optional_str(value: Any) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None

    @classmethod
    def _normalize_rarity(cls, value: Any) -> str:
        raw = cls._as_optional_str(value)
        if raw is None:
            return cls.DEFAULT_RARITY

        normalized = cls.RARITY_ALIASES.get(raw.strip().lower())
        if normalized:
            return normalized
        return cls.DEFAULT_RARITY

    @staticmethod
    def _as_optional_int(value: Any, default: int | None = None) -> int | None:
        if value is None or value == "":
            return default
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _as_optional_datetime(value: Any) -> datetime | None:
        if value in (None, ""):
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            normalized = value.strip()
            if not normalized:
                return None
            if normalized.endswith("Z"):
                normalized = normalized[:-1] + "+00:00"
            try:
                return datetime.fromisoformat(normalized)
            except ValueError:
                return None
        return None

    @staticmethod
    def _serialize_datetime(value: Any) -> str | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
