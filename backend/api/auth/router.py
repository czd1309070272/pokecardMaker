from fastapi import APIRouter, Depends, status

from .dependencies import get_current_user
from .schemas import AuthEnvelope, LoginRequest, MeEnvelope, RegisterRequest
from .service import AuthService


router = APIRouter(prefix="/api/auth", tags=["auth"])
auth_service = AuthService()


@router.post("/register", response_model=AuthEnvelope, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    result = auth_service.register_user(
        email=payload.email,
        password=payload.password,
        nickname=payload.nickname,
    )
    return {"success": True, "data": result}


@router.post("/login", response_model=AuthEnvelope)
def login(payload: LoginRequest):
    result = auth_service.login_user(email=payload.email, password=payload.password)
    return {"success": True, "data": result}


@router.get("/me", response_model=MeEnvelope)
def me(current_user=Depends(get_current_user)):
    return {"success": True, "data": current_user}
