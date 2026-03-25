from typing import Any, Dict, Optional

try:
    from sql.mysql_DB import db
except ModuleNotFoundError:
    from backend.sql.mysql_DB import db


class AuthRepository:
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT id, email, nickname, password_hash, coins, created_at
        FROM users
        WHERE email = %s
        LIMIT 1
        """
        return db.query_one(sql, (email,))

    def find_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        sql = """
        SELECT id, email, nickname, coins, created_at
        FROM users
        WHERE id = %s
        LIMIT 1
        """
        return db.query_one(sql, (user_id,))

    def create_user(self, email: str, password_hash: str, nickname: str) -> int:
        sql = """
        INSERT INTO users (email, nickname, password_hash, provider, coins)
        VALUES (%s, %s, %s, %s, %s)
        """
        return db.insert_and_get_id(sql, (email, nickname, password_hash, "local", 1000))
