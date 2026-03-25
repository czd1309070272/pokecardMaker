# redis_utils.py
import json
import redis
import logging
from typing import Any, Optional, Union

# 配置日志（可选）
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================== Redis 连接配置 ==================
# 你可以改成自己的配置，或者通过环境变量注入
REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0
REDIS_PASSWORD = None  # 如果有密码就填字符串
REDIS_DECODE_RESPONSES = True  # 自动把 bytes 转成 str

# 创建连接池（全局单例，推荐整个应用只创建一个）
pool = redis.ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=REDIS_DECODE_RESPONSES,
    max_connections=20,  # 根据你的并发调整
)

r = redis.Redis(connection_pool=pool)


# ================== 通用工具函数 ==================

def set_value(
    key: str,
    value: Any,
    ex: Optional[int] = None,  # 过期时间（秒）
    use_json: bool = True
) -> bool:
    """
    通用存储函数
    :param key: redis key
    :param value: 要存储的值（str/int/float/dict/list 等）
    :param ex: 过期时间（秒），None 表示不过期
    :param use_json: 是否自动 JSON 序列化（推荐 True，除非你明确要存原始字符串）
    :return: 是否成功
    """
    try:
        if use_json:
            value = json.dumps(value, ensure_ascii=False)  # 支持中文
        r.set(key, value, ex=ex)
        return True
    except Exception as e:
        logger.error(f"Redis set_value 失败 key={key} error={e}")
        return False


def get_value(key: str, use_json: bool = True, default: Any = None) -> Any:
    """
    通用获取函数
    :param key: redis key
    :param use_json: 是否尝试 JSON 反序列化
    :param default: 如果 key 不存在或解析失败返回的默认值
    :return: 值
    """
    try:
        value = r.get(key)
        if value is None:
            return default

        if use_json:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                # 如果不是合法 JSON，就返回原始字符串
                return value
        return value
    except Exception as e:
        logger.error(f"Redis get_value 失败 key={key} error={e}")
        return default


# ================== 其他常用数据结构封装（可选）==================

def hset_value(hash_name: str, field: str, value: Any, use_json: bool = True) -> bool:
    """存 Hash"""
    try:
        if use_json:
            value = json.dumps(value, ensure_ascii=False)
        r.hset(hash_name, field, value)
        return True
    except Exception as e:
        logger.error(f"Redis hset_value 失败 error={e}")
        return False


def hget_value(hash_name: str, field: str, use_json: bool = True, default: Any = None) -> Any:
    """取 Hash"""
    try:
        value = r.hget(hash_name, field)
        if value is None:
            return default
        if use_json:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return value
    except Exception as e:
        logger.error(f"Redis hget_value 失败 error={e}")
        return default


def lpush_list(key: str, *values: Any, use_json: bool = True) -> int:
    """左推 List（可一次推多个）"""
    try:
        if use_json:
            values = [json.dumps(v, ensure_ascii=False) for v in values]
        return r.lpush(key, *values)
    except Exception as e:
        logger.error(f"Redis lpush_list 失败 error={e}")
        return 0


def rpop_list(key: str, use_json: bool = True):
    """从右弹出 List 一个元素"""
    try:
        value = r.rpop(key)
        if value is None:
            return None
        if use_json:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return value
    except Exception as e:
        logger.error(f"Redis rpop_list 失败 error={e}")
        return None


# ================== 测试示例（直接运行此文件时执行）==================
if __name__ == "__main__":
    # 存一个字典（自动 JSON）
    set_value("user:1001", {"name": "张三", "age": 28, "city": "北京"}, ex=3600)

    # 取出来
    user = get_value("user:1001")
    print("取出的用户:", user)

    # 存字符串（不序列化）
    set_value("welcome_msg", "欢迎使用系统", use_json=False)
    print("欢迎消息:", get_value("welcome_msg", use_json=False))