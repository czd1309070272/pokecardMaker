# main.py

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

try:
    from sql.mysql_DB import db
except ModuleNotFoundError:
    from backend.sql.mysql_DB import db


logger = logging.getLogger('api_logger')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup：db 已经在 __init__ 时创建了连接池
    yield
    # Shutdown：关闭连接池
    db.close_pool()

app = FastAPI(title="Pet App API",
              lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# ✅ 批量注册所有路由
try:
    from autoRouters import all_routers
except ModuleNotFoundError:
    from backend.autoRouters import all_routers
for router in all_routers:
    print(f"[+] 注册路由：{router}")
    app.include_router(router)
# # ✅ 自动注册所有路由
# def init_routers(app):
#     register_api_routers(app, "api")
# init_routers(app)

@app.get("/health")
async def health_check():
    return {"status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
