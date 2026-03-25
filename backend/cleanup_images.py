import os
import time
import logging
import mysql.connector # 需要确保安装了 mysql-connector-python

# ================== 配置 ==================
IMAGE_DIR = "pokemon_images"
DAYS_TO_KEEP = 8  # 保持 8 天，比 Redis 的 7 天略长，更稳妥

# 数据库配置（请替换为你自己的）
db_config = {
    "host": "95.40.33.105",
    "user": "root",
    "password": "!Smartcmhk123",
    "database": "pokemaker_dev"
}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='cleanup_log.log'
)

def cleanup_task():
    conn = None
    try:
        # 1. 连接数据库
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # 2. 【核心】清理数据库记录
        # 删除所有创建时间早于 8 天前的记录
        sql_del_db = "DELETE FROM user_cards WHERE created_at < DATE_SUB(NOW(), INTERVAL %s DAY)"
        cursor.execute(sql_del_db, (DAYS_TO_KEEP,))
        db_deleted_count = cursor.rowcount
        conn.commit()
        logging.info(f"💾 数据库清理完成：删除了 {db_deleted_count} 条旧记录")

        # 3. 清理物理文件
        if not os.path.exists(IMAGE_DIR):
            logging.warning("目录不存在，跳过文件清理")
            return

        now = time.time()
        cutoff = now - (DAYS_TO_KEEP * 86400)
        
        file_deleted_count = 0
        for filename in os.listdir(IMAGE_DIR):
            file_path = os.path.join(IMAGE_DIR, filename)
            if os.path.isfile(file_path):
                if os.path.getmtime(file_path) < cutoff:
                    try:
                        os.remove(file_path)
                        file_deleted_count += 1
                    except Exception as e:
                        logging.error(f"删除文件 {filename} 失败: {e}")

        logging.info(f"📂 物理文件清理完成：删除了 {file_deleted_count} 个文件")
        print(f"✅ 清理成功：数据库({db_deleted_count}) | 文件({file_deleted_count})")

    except Exception as e:
        logging.error(f"清理过程中发生严重错误: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    cleanup_task()