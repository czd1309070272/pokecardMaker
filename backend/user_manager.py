# user_manager.py
from mysql_DB import db
import logging

logger = logging.getLogger(__name__)

COST_CONFIG = {"t2i": 2, "i2i": 4}

class UserManager:
    """处理用户权益与原子扣费逻辑"""

    def check_and_deduct_assets(self, user_id: int, task_type: str) -> dict:
        """
        核心逻辑：检查并扣费
        返回受影响行数后，我们使用 > 0 来确保数据库确实执行了修改
        """
        if task_type not in COST_CONFIG:
            return {"success": False, "msg": "无效任务类型", "deduct_type": None}

        cost = COST_CONFIG[task_type]

        # 1. 实时拉取最新数据（用于预判和返回结果）
        user_info = db.query_one("SELECT coins, remain_free_count FROM users WHERE id = %s", (user_id,))
        if not user_info:
            return {"success": False, "msg": "用户不存在", "deduct_type": None}

        current_free = int(user_info.get('remain_free_count', 0))
        current_coins = int(user_info.get('coins', 0))

        # 2. 严格分流逻辑
        # 情况 A: 尝试扣除免费额度
        if current_free > 0:
            update_sql = "UPDATE users SET remain_free_count = remain_free_count - 1 WHERE id = %s AND remain_free_count > 0"
            # 修改点：判断受影响行数是否 > 0
            if db.execute(update_sql, (user_id,)) > 0:
                logger.info(f"用户 {user_id} 成功扣除 1 次免费次数")
                return {
                    "success": True, 
                    "deduct_type": "free", 
                    "deduct_amount": 1,
                    "msg": "扣除免费次数成功"
                }

        # 情况 B: 免费额度不足，尝试扣除金币
        if current_coins >= cost:
            update_sql = "UPDATE users SET coins = coins - %s WHERE id = %s AND coins >= %s"
            # 修改点：判断受影响行数是否 > 0
            if db.execute(update_sql, (cost, user_id, cost)) > 0:
                logger.info(f"用户 {user_id} 成功扣除 {cost} 金币")
                return {
                    "success": True, 
                    "deduct_type": "coin", 
                    "deduct_amount": cost,
                    "msg": "扣除金币成功"
                }

        # 情况 C: 资产不足
        return {
            "success": False, 
            "msg": "余额或免费次数不足", 
            "deduct_type": None,
            "remaining_free": current_free,
            "remaining_coin": current_coins
        }

    def refund_assets(self, user_id: int, deduct_type: str, amount: int) -> bool:
        """
        退费逻辑：生图失败时调用
        """
        if not deduct_type or amount <= 0:
            return False

        if deduct_type == "free":
            sql = "UPDATE users SET remain_free_count = remain_free_count + %s WHERE id = %s"
        elif deduct_type == "coin":
            sql = "UPDATE users SET coins = coins + %s WHERE id = %s"
        else:
            logger.error(f"无效的退费类型: {deduct_type}")
            return False

        # 修改点：返回是否成功影响了行数
        rows = db.execute(sql, (amount, user_id))
        if rows > 0:
            logger.info(f"用户 {user_id} 退费成功: {amount} {deduct_type}")
            return True
        return False