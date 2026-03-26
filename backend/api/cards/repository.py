import json
from typing import Any, Dict, List, Optional

try:
    from sql.mysql_DB import db
except ModuleNotFoundError:
    from backend.sql.mysql_DB import db


class CardsRepository:
    PUBLIC_SORTS = {
        "trending": "c.likes_count DESC, c.views_count DESC, c.published_at DESC, c.id DESC",
        "top_rated": "c.likes_count DESC, c.published_at DESC, c.id DESC",
        "newest": "c.published_at DESC, c.id DESC",
    }

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
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at
        FROM cards c
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE c.id = %s AND c.user_id = %s AND c.deleted_at IS NULL
        LIMIT 1
        """
        return db.query_one(sql, (card_id, user_id))

    def find_card_by_uuid(self, card_uuid: str, user_id: int) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at
        FROM cards c
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE c.uuid = %s AND c.user_id = %s AND c.deleted_at IS NULL
        LIMIT 1
        """
        return db.query_one(sql, (card_uuid, user_id))

    def list_cards_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        sql = """
        SELECT
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at
        FROM cards c
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE c.user_id = %s AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC, c.id DESC
        """
        return db.query_all(sql, (user_id,))

    def list_public_cards(
        self,
        limit: int,
        offset: int,
        sort: str,
        viewer_user_id: int | None = None,
    ) -> List[Dict[str, Any]]:
        order_by = self.PUBLIC_SORTS.get(sort, self.PUBLIC_SORTS["trending"])
        viewer_like_sql = "0 AS viewer_liked"
        params: list[Any] = []

        if viewer_user_id is not None:
            viewer_like_sql = """
            CASE WHEN EXISTS (
                SELECT 1
                FROM card_likes cl
                WHERE cl.card_uuid = c.uuid AND cl.user_id = %s
            ) THEN 1 ELSE 0 END AS viewer_liked
            """
            params.append(viewer_user_id)

        sql = f"""
        SELECT
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at,
            u.nickname AS author_name,
            {viewer_like_sql}
        FROM cards c
        INNER JOIN users u ON u.id = c.user_id
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE c.is_public = 1 AND c.deleted_at IS NULL
        ORDER BY {order_by}
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])
        return db.query_all(sql, tuple(params))

    def count_public_cards(self) -> int:
        sql = """
        SELECT COUNT(*) AS total
        FROM cards
        WHERE is_public = 1 AND deleted_at IS NULL
        """
        row = db.query_one(sql)
        return int((row or {}).get("total") or 0)

    def set_card_public_state(
        self,
        card_uuid: str,
        user_id: int,
        is_public: bool,
        published_at,
        card_status: str | None = None,
    ) -> int:
        sql = """
        UPDATE cards
        SET is_public = %s,
            published_at = %s,
            status = COALESCE(%s, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = %s AND user_id = %s AND deleted_at IS NULL
        """
        return db.execute(sql, (1 if is_public else 0, published_at, card_status, card_uuid, user_id))

    def find_public_card_by_uuid(self, card_uuid: str, viewer_user_id: int | None = None) -> Optional[Dict[str, Any]]:
        viewer_like_sql = "0 AS viewer_liked"
        params: list[Any] = []

        if viewer_user_id is not None:
            viewer_like_sql = """
            CASE WHEN EXISTS (
                SELECT 1
                FROM card_likes cl
                WHERE cl.card_uuid = c.uuid AND cl.user_id = %s
            ) THEN 1 ELSE 0 END AS viewer_liked
            """
            params.append(viewer_user_id)

        sql = f"""
        SELECT
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at,
            u.nickname AS author_name,
            {viewer_like_sql}
        FROM cards c
        INNER JOIN users u ON u.id = c.user_id
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE c.uuid = %s AND c.is_public = 1 AND c.deleted_at IS NULL
        LIMIT 1
        """
        params.append(card_uuid)
        return db.query_one(sql, tuple(params))

    def upsert_card_appraisal(
        self,
        card_uuid: str,
        user_id: int,
        price: str,
        comment: str,
        language: str,
    ) -> int:
        sql = """
        INSERT INTO card_appraisals (card_uuid, user_id, price, comment, language, appraised_at)
        SELECT c.uuid, c.user_id, %s, %s, %s, CURRENT_TIMESTAMP
        FROM cards c
        WHERE c.uuid = %s AND c.user_id = %s AND c.deleted_at IS NULL
        ON DUPLICATE KEY UPDATE
            price = VALUES(price),
            comment = VALUES(comment),
            language = VALUES(language),
            appraised_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        """
        return db.execute(sql, (price, comment, language, card_uuid, user_id))

    def has_user_liked_card(self, card_uuid: str, user_id: int) -> bool:
        sql = """
        SELECT 1 AS liked
        FROM card_likes
        WHERE card_uuid = %s AND user_id = %s
        LIMIT 1
        """
        return bool(db.query_one(sql, (card_uuid, user_id)))

    def add_card_like(self, card_uuid: str, user_id: int) -> int:
        sql = """
        INSERT IGNORE INTO card_likes (card_uuid, user_id)
        VALUES (%s, %s)
        """
        return db.execute(sql, (card_uuid, user_id))

    def remove_card_like(self, card_uuid: str, user_id: int) -> int:
        sql = """
        DELETE FROM card_likes
        WHERE card_uuid = %s AND user_id = %s
        """
        return db.execute(sql, (card_uuid, user_id))

    def sync_card_likes_count(self, card_uuid: str) -> int:
        sql = """
        UPDATE cards c
        SET c.likes_count = (
            SELECT COUNT(*)
            FROM card_likes cl
            WHERE cl.card_uuid = c.uuid
        ),
            c.updated_at = CURRENT_TIMESTAMP
        WHERE c.uuid = %s
        """
        return db.execute(sql, (card_uuid,))

    def delete_card(self, card_uuid: str, user_id: int) -> int:
        sql = """
        UPDATE cards
        SET deleted_at = CURRENT_TIMESTAMP,
            is_public = 0,
            published_at = NULL,
            status = 'deleted',
            updated_at = CURRENT_TIMESTAMP
        WHERE uuid = %s AND user_id = %s AND deleted_at IS NULL
        """
        return db.execute(sql, (card_uuid, user_id))

    def list_favorited_cards_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        sql = """
        SELECT
            c.id, c.uuid, c.user_id, c.name, c.image_url, c.supertype, c.subtype, c.rarity, c.element_type, c.hp,
            c.illustrator, c.set_number, c.status, c.source, c.version, c.is_public, c.likes_count,
            c.views_count, c.forks_count, c.published_at, c.deleted_at, c.data_json, c.created_at, c.updated_at,
            ca.price AS appraisal_price,
            ca.comment AS appraisal_comment,
            ca.language AS appraisal_language,
            ca.appraised_at AS appraisal_appraised_at,
            u.nickname AS author_name,
            cf.created_at AS favorited_at,
            CASE WHEN EXISTS (
                SELECT 1 FROM card_likes cl2 WHERE cl2.card_uuid = c.uuid AND cl2.user_id = %s
            ) THEN 1 ELSE 0 END AS viewer_liked,
            1 AS viewer_favorited
        FROM card_favorites cf
        INNER JOIN cards c ON c.uuid = cf.card_uuid
        INNER JOIN users u ON u.id = c.user_id
        LEFT JOIN card_appraisals ca ON ca.card_uuid = c.uuid
        WHERE cf.user_id = %s
        ORDER BY cf.created_at DESC
        """
        return db.query_all(sql, (user_id, user_id))

    def has_user_favorited_card(self, card_uuid: str, user_id: int) -> bool:
        sql = """
        SELECT 1 AS favorited
        FROM card_favorites
        WHERE card_uuid = %s AND user_id = %s
        LIMIT 1
        """
        return bool(db.query_one(sql, (card_uuid, user_id)))

    def add_card_favorite(self, card_uuid: str, user_id: int) -> int:
        sql = """
        INSERT IGNORE INTO card_favorites (card_uuid, user_id)
        VALUES (%s, %s)
        """
        return db.execute(sql, (card_uuid, user_id))

    def remove_card_favorite(self, card_uuid: str, user_id: int) -> int:
        sql = """
        DELETE FROM card_favorites
        WHERE card_uuid = %s AND user_id = %s
        """
        return db.execute(sql, (card_uuid, user_id))

    def count_card_comments(self, card_uuid: str) -> int:
        sql = """
        SELECT COUNT(*) AS total
        FROM card_comments cc
        INNER JOIN cards c ON c.uuid = cc.card_uuid
        WHERE cc.card_uuid = %s
          AND c.is_public = 1
          AND c.deleted_at IS NULL
        """
        row = db.query_one(sql, (card_uuid,))
        return int((row or {}).get("total") or 0)

    def list_card_comments(self, card_uuid: str, limit: int, offset: int) -> List[Dict[str, Any]]:
        sql = """
        SELECT
            cc.id,
            cc.card_uuid,
            cc.user_id,
            cc.content,
            cc.created_at,
            cc.updated_at,
            u.nickname AS author_name,
            c.user_id AS card_owner_user_id
        FROM card_comments cc
        INNER JOIN cards c ON c.uuid = cc.card_uuid
        INNER JOIN users u ON u.id = cc.user_id
        WHERE cc.card_uuid = %s
          AND c.is_public = 1
          AND c.deleted_at IS NULL
        ORDER BY cc.created_at DESC, cc.id DESC
        LIMIT %s OFFSET %s
        """
        return db.query_all(sql, (card_uuid, limit, offset))

    def create_card_comment(self, card_uuid: str, user_id: int, content: str) -> int:
        sql = """
        INSERT INTO card_comments (card_uuid, user_id, content)
        SELECT c.uuid, %s, %s
        FROM cards c
        WHERE c.uuid = %s AND c.is_public = 1 AND c.deleted_at IS NULL
        """
        return db.insert_and_get_id(sql, (user_id, content, card_uuid))

    def find_card_comment_by_id(self, comment_id: int) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT
            cc.id,
            cc.card_uuid,
            cc.user_id,
            cc.content,
            cc.created_at,
            cc.updated_at,
            u.nickname AS author_name,
            c.user_id AS card_owner_user_id
        FROM card_comments cc
        INNER JOIN cards c ON c.uuid = cc.card_uuid
        INNER JOIN users u ON u.id = cc.user_id
        WHERE cc.id = %s
          AND c.is_public = 1
          AND c.deleted_at IS NULL
        LIMIT 1
        """
        return db.query_one(sql, (comment_id,))

    def delete_card_comment(self, card_uuid: str, comment_id: int, user_id: int) -> int:
        sql = """
        DELETE cc
        FROM card_comments cc
        INNER JOIN cards c ON c.uuid = cc.card_uuid
        WHERE cc.id = %s
          AND cc.card_uuid = %s
          AND c.is_public = 1
          AND c.deleted_at IS NULL
          AND (cc.user_id = %s OR c.user_id = %s)
        """
        return db.execute(sql, (comment_id, card_uuid, user_id, user_id))
