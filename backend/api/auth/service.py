import re

from fastapi import HTTPException, status

from .repository import AuthRepository
from .schemas import UserProfile
from .security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, repository: AuthRepository | None = None):
        self.repository = repository or AuthRepository()

    def register_user(self, email: str, password: str, nickname: str | None = None) -> dict:
        normalized_email = email.strip().lower()
        self._validate_email(normalized_email)
        existing_user = self.repository.find_user_by_email(normalized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user_nickname = (nickname or normalized_email.split("@", 1)[0]).strip() or "user"
        password_hash = hash_password(password)
        user_id = self.repository.create_user(normalized_email, password_hash, user_nickname)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user",
            )

        token, expires_in = create_access_token(user_id, normalized_email)
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in,
            "user": UserProfile(id=user_id, email=normalized_email, nickname=user_nickname, coins=1000),
        }

    def login_user(self, email: str, password: str) -> dict:
        normalized_email = email.strip().lower()
        self._validate_email(normalized_email)
        user = self.repository.find_user_by_email(normalized_email)
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token, expires_in = create_access_token(user["id"], user["email"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in,
            "user": UserProfile(
                id=user["id"],
                email=user["email"],
                nickname=user["nickname"],
                coins=int(user.get("coins", 0)),
            ),
        }

    def get_current_user(self, user_id: int) -> UserProfile:
        user = self.repository.find_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        return UserProfile(
            id=user["id"],
            email=user["email"],
            nickname=user["nickname"],
            coins=int(user.get("coins", 0)),
        )

    @staticmethod
    def _validate_email(email: str) -> None:
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid email format",
            )
