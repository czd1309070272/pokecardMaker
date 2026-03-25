from typing import Any, Dict, Optional

try:
    from sql.mysql_DB import db
except ModuleNotFoundError:
    from backend.sql.mysql_DB import db


class WalletRepository:
    def get_wallet(self, user_id: int) -> Optional[Dict[str, Any]]:
        sql = "SELECT id, coins FROM users WHERE id = %s LIMIT 1"
        return db.query_one(sql, (user_id,))

    def spend_coins(self, user_id: int, amount: int) -> int:
        sql = "UPDATE users SET coins = coins - %s WHERE id = %s AND coins >= %s"
        return db.execute(sql, (amount, user_id, amount))

    def add_coins(self, user_id: int, amount: int) -> int:
        sql = "UPDATE users SET coins = coins + %s WHERE id = %s"
        return db.execute(sql, (amount, user_id))
