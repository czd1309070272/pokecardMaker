import json
from typing import Any, Dict, List, Optional

try:
    from sql.mysql_DB import db
except ModuleNotFoundError:
    from backend.sql.mysql_DB import db


class CardsRepository:
    @staticmethod
    def _card_fields_sql() -> str:
        return """
            name = %s,
            image_url = %s,
            supertype = %s,
            subtype = %s,
            rarity = %s,
            element_type = %s,
            hp = %s,
            illustrator = %s,
            set_number = %s,
            status = %s,
            source = %s,
            version = %s,
            views_count = %s,
            forks_count = %s,
            published_at = %s,
            deleted_at = %s,
            data_json = %s
        """

    def create_card(
        self,
        card_uuid: str,
        user_id: int,
        name: str,
        image_url: str | None,
        supertype: str | None,
        subtype: str | None,
        rarity: str | None,
        element_type: str | None,
        hp: str | None,
        illustrator: str | None,
        set_number: str | None,
        card_status: str | None,
        source: str | None,
        version: int | None,
        views_count: int,
        forks_count: int,
        published_at,
        deleted_at,
        card_payload: Dict[str, Any],
    ) -> int:
        sql = """
        INSERT INTO cards (
            uuid, user_id, name, image_url, supertype, subtype, rarity, element_type, hp,
            illustrator, set_number, status, source, version, views_count, forks_count,
            published_at, deleted_at, data_json, is_public, likes_count
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        payload = json.dumps(card_payload, ensure_ascii=False)
        return db.insert_and_get_id(
            sql,
            (
                card_uuid,
                user_id,
                name,
                image_url,
                supertype,
                subtype,
                rarity,
                element_type,
                hp,
                illustrator,
                set_number,
                card_status,
                source,
                version,
                views_count,
                forks_count,
                published_at,
                deleted_at,
                payload,
                False,
                0,
            ),
        )

    def update_card(
        self,
        card_uuid: str,
        user_id: int,
        name: str,
        image_url: str | None,
        supertype: str | None,
        subtype: str | None,
        rarity: str | None,
        element_type: str | None,
        hp: str | None,
        illustrator: str | None,
        set_number: str | None,
        card_status: str | None,
        source: str | None,
        version: int | None,
        views_count: int,
        forks_count: int,
        published_at,
        deleted_at,
        card_payload: Dict[str, Any],
    ) -> int:
        sql = f"""
        UPDATE cards
        SET {self._card_fields_sql()}
        WHERE uuid = %s AND user_id = %s AND deleted_at IS NULL
        """
        payload = json.dumps(card_payload, ensure_ascii=False)
        return db.execute(
            sql,
            (
                name,
                image_url,
                supertype,
                subtype,
                rarity,
                element_type,
                hp,
                illustrator,
                set_number,
                card_status,
                source,
                version,
                views_count,
                forks_count,
                published_at,
                deleted_at,
                payload,
                card_uuid,
                user_id,
            ),
        )

    def find_card_by_id(self, card_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT
            id, uuid, user_id, name, image_url, supertype, subtype, rarity, element_type, hp,
            illustrator, set_number, status, source, version, is_public, likes_count,
            views_count, forks_count, published_at, deleted_at, data_json, created_at, updated_at
        FROM cards
        WHERE id = %s AND user_id = %s AND deleted_at IS NULL
        LIMIT 1
        """
        return db.query_one(sql, (card_id, user_id))

    def find_card_by_uuid(self, card_uuid: str, user_id: int) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT
            id, uuid, user_id, name, image_url, supertype, subtype, rarity, element_type, hp,
            illustrator, set_number, status, source, version, is_public, likes_count,
            views_count, forks_count, published_at, deleted_at, data_json, created_at, updated_at
        FROM cards
        WHERE uuid = %s AND user_id = %s AND deleted_at IS NULL
        LIMIT 1
        """
        return db.query_one(sql, (card_uuid, user_id))

    def list_cards_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        sql = """
        SELECT
            id, uuid, user_id, name, image_url, supertype, subtype, rarity, element_type, hp,
            illustrator, set_number, status, source, version, is_public, likes_count,
            views_count, forks_count, published_at, deleted_at, data_json, created_at, updated_at
        FROM cards
        WHERE user_id = %s AND deleted_at IS NULL
        ORDER BY created_at DESC, id DESC
        """
        return db.query_all(sql, (user_id,))

    def delete_card(self, card_uuid: str, user_id: int) -> int:
        sql = """
        DELETE FROM cards
        WHERE uuid = %s AND user_id = %s
        """
        return db.execute(sql, (card_uuid, user_id))
