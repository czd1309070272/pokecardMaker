import json
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4

from fastapi import HTTPException, status

from .repository import CardsRepository


class CardsService:
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
            "rarity": self._as_optional_str(card_payload.get("rarity")),
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
        payload["rarity"] = record.get("rarity") or payload.get("rarity")
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
        external_id = record.get("uuid") or str(record["id"])
        payload.update(
            {
                "id": external_id,
                "uuid": record.get("uuid"),
                "likes": int(record.get("likes_count") or 0),
                "isLiked": False,
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
            "rarity": record.get("rarity"),
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
            "isLiked": False,
            "published_at": CardsService._serialize_datetime(record.get("published_at")),
            "deleted_at": CardsService._serialize_datetime(record.get("deleted_at")),
            "created_at": CardsService._serialize_datetime(record.get("created_at")),
            "updated_at": CardsService._serialize_datetime(record.get("updated_at")),
            "data": payload,
        }

    @staticmethod
    def _as_optional_str(value: Any) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None

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
