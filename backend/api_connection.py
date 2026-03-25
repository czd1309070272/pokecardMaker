import os
import uuid
import logging
import hashlib
import uvicorn
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from mysql_DB import db
# 导入业务逻辑
from pokemon_generator import generate_image_async, IMAGE_DIR
from user_manager import UserManager
from redis_utils import get_value # 确保你已经导出了 get_value

logger = logging.getLogger('api_logger')
app = FastAPI(title="Pokemon AI Generator API")

user_manager = UserManager()

UPLOAD_DIR = "user_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

BASE_URL = "http://127.0.0.1:8000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ================== 工具函数：计算 Prompt 哈希 (需与生成层对齐) ==================
def get_prompt_hash(mode: str, content: str) -> str:
    # content 对于 t2i 是描述词，对于 i2i 是图片 URL
    clean_content = content.strip().lower() if mode == "TXT2IMG" else content.strip()
    return hashlib.md5(clean_content.encode()).hexdigest()[:16]

# ================== 响应模型 ==================
class GenerateResponse(BaseModel):
    user_id: int
    status: str
    image_url: str = None
    msg: str = None

# ================== 接口 1: 纯文生图 (t2i) ==================
class TextRequest(BaseModel):
    user_id: int 
    description: str

@app.post("/generate/text", response_model=GenerateResponse)
async def generate_from_text(request: TextRequest):
    # 1. 基础校验
    if len(request.description) > 15:
        raise HTTPException(status_code=400, detail="输入文本过长")

    # 2. 【核心修改】：任何情况先扣费
    # 不再预检查缓存，只要你点了召唤，法阵就要金币驱动
    asset_res = user_manager.check_and_deduct_assets(request.user_id, "t2i")
    if not asset_res["success"]:
        raise HTTPException(status_code=403, detail=asset_res["msg"])

    deduct_type = asset_res["deduct_type"]
    deduct_amount = asset_res["deduct_amount"]

    try:
        # 3. 调用生成逻辑
        # generate_image_async 内部会判断是“给缓存”还是“调 API”
        filepath = await generate_image_async(str(request.user_id), description=request.description)
        filename = os.path.basename(filepath)
        sql = "INSERT INTO user_cards_history (user_id, prompt, image_name) VALUES (%s, %s, %s)"
        db.execute(sql, (request.user_id, request.description, filename))
        return GenerateResponse(
            user_id=request.user_id,
            status="success",
            image_url=f"/images/{os.path.basename(filepath)}",
            msg=f"召唤成功！消耗 {deduct_amount} {deduct_type}" # 统一文案
        )

    except Exception as e:
        # 4. 只有真正的“系统性失败”（如所有 API 都挂了）才退款
        logger.error(f"召唤失败，触发退款: {str(e)}")
        user_manager.refund_assets(request.user_id, deduct_type, deduct_amount)
        raise HTTPException(status_code=500, detail=f"召唤阵波动，资产已退回")

# ================== 接口 2: 纯图生图 (i2i) ==================
@app.post("/generate/transform", response_model=GenerateResponse)
async def generate_from_image(
    user_id: int = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...)
):
    # 图生图通常具有极高的随机性，且图片 URL 难以命中缓存（文件名带随机 UUID）
    # 但我们依然保留退款逻辑
    print(file)
    asset_res = user_manager.check_and_deduct_assets(user_id, "i2i")
    if not asset_res["success"]:
        raise HTTPException(status_code=403, detail=asset_res["msg"])

    deduct_type = asset_res["deduct_type"]
    deduct_amount = asset_res["deduct_amount"]
    upload_path = None
    
    try:
        if not file.content_type.startswith("image/"):
            user_manager.refund_assets(user_id, deduct_type, deduct_amount)
            raise HTTPException(status_code=400, detail="请上传有效的图片文件")

        # 保存临时原图
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"ref_{uuid.uuid4().hex[:8]}{file_ext}"
        upload_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(upload_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        reference_url = f"{BASE_URL}/uploads/{unique_filename}"
        
        # 调用生成
        filepath = await generate_image_async(
            user_id=str(user_id), 
            description=description, 
            image_url=reference_url
        )
        
        return GenerateResponse(
            user_id=user_id,
            status="success",
            image_url=f"/images/{os.path.basename(filepath)}",
            msg=f"召唤成功！消耗 {deduct_amount} {deduct_type}"
        )

    except Exception as e:
        logger.error(f"图生图失败，触发退款: {str(e)}")
        user_manager.refund_assets(user_id, deduct_type, deduct_amount)
        raise HTTPException(status_code=500, detail=f"转换失败: {str(e)}")
        
    finally:
        await file.close()
        if upload_path and os.path.exists(upload_path):
            try:
                os.remove(upload_path)
            except: pass

@app.get("/health")
async def health_check():
    return {"status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)