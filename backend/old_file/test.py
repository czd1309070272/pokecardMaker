# import asyncio
# import time
# import os
# from tabulate import tabulate
# import pokemon_generator
# from redis_utils import r as redis_client
# import logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)
# import json
# async def run_real_task(t_id, prompt):
#     start_time = time.time()
#     try:
#         # 调用真实生成逻辑
#         filepath = await pokemon_generator.generate_image_async(
#             user_id=f"real_p_{t_id}", 
#             description=prompt
#         )
#         duration = time.time() - start_time
#         filename = os.path.basename(filepath)
        
#         # 从文件名解析使用的供应商
#         provider = "万相" if "dashscope" in filename else "Gemini"
        
#         return [t_id, provider, "✅ 成功", f"{duration:.2f}s", filename]
#     except Exception as e:
#         duration = time.time() - start_time
#         return [t_id, "失败", f"❌ {str(e)[:30]}", f"{duration:.2f}s", "N/A"]

# async def main():
#     print("🧹 清理 Redis 信号量...")
#     # 只清理本项目的 key，避免误删其他数据
#     keys = redis_client.keys("pokemon:*")
#     if keys: redis_client.delete(*keys)

#     # 准备 5 个不同的宝可梦描述词
#     prompts = [
#         "A lightning-type cyberpunk Pikachu",
#         "A lava-type armored Charizard",
#         "A crystal-type ice Eevee",
#         "A robotic ancient Bulbasaur",
#         "A galaxy-themed mythical Mew"
#     ]

#     print("\n🚀 启动真实并行测试 (5个任务同时出发)...")
#     print(f"预期分布: 2x Turbo, 2x Plus, 1x Gemini")
#     print("-" * 85)

#     start_all = time.time()

#     # 使用 asyncio.gather 实现真正的并行 HTTP 请求
#     tasks = [run_real_task(i+1, prompts[i]) for i in range(5)]
#     results = await asyncio.gather(*tasks)

#     end_all = time.time()

#     print("\n📊 真实 API 并发测试结果：")
#     headers = ["ID", "供应商", "状态", "耗时", "文件"]
#     print(tabulate(results, headers=headers, tablefmt="grid"))
    
#     print(f"\n🏁 总计 5 个任务并行执行总跨度: {end_all - start_all:.2f} 秒")
#     print(f"💡 提示：由于万相 Turbo 生成速度通常在 3-5 秒左右，而 Gemini 约为 10-15 秒，你会发现万相的任务会率先返回。")

# if __name__ == "__main__":
#     asyncio.run(main())
# main.py
# main.py 示例
# main.py 伪代码演示
# test_logic.py
from user_manager import UserManager
import time

def test_generation_flow(user_id, task_type, simulate_fail=False):
    manager = UserManager()
    print(f"\n>>> 开始测试: 用户[{user_id}] 执行 [{task_type}]，模拟失败={simulate_fail}")
    
    # 1. 预扣费
    result = manager.check_and_deduct_assets(user_id, task_type)
    
    if not result["success"]:
        print(f"❌ 预扣费失败: {result['msg']}")
        return

    print(f"✅ 预扣费成功: 扣除类型={result['deduct_type']}, 扣除数量={result['deduct_amount']}")
    
    # 记录扣费凭据
    d_type = result["deduct_type"]
    d_amount = result["deduct_amount"]

    try:
        print("🎨 正在调用生图引擎...")
        time.sleep(1) # 模拟生图耗时
        
        if simulate_fail:
            raise Exception("显存溢出 (Out of Memory)")
        
        print("🎉 生图成功！")

    except Exception as e:
        print(f"⚠️ 生图过程中发生错误: {str(e)}")
        print("🔄 正在执行自动退费...")
        
        # 2. 执行退费
        refund_ok = manager.refund_assets(user_id, d_type, d_amount)
        if refund_ok:
            print("✅ 退费成功，资产已返还。")
        else:
            print("❌ 退费失败，请人工检查数据库。")

if __name__ == "__main__":
    # 请确保数据库中 ID 为 1 的用户存在，且有足够的资产
    TEST_USER_ID = 1 
    
    # 场景 A: 模拟生图成功（钱扣了不退）
    test_generation_flow(TEST_USER_ID, "t2i", simulate_fail=False)
    
    # 场景 B: 模拟生图失败（钱扣了又退回来）
    test_generation_flow(TEST_USER_ID, "i2i", simulate_fail=True)