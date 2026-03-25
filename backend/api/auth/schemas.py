from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6, max_length=128)
    nickname: str | None = Field(default=None, max_length=50)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=6, max_length=128)


class UserProfile(BaseModel):
    id: int
    email: str
    nickname: str
    coins: int = 0


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfile


class AuthEnvelope(BaseModel):
    success: bool = True
    data: TokenResponse


class MeEnvelope(BaseModel):
    success: bool = True
    data: UserProfile
