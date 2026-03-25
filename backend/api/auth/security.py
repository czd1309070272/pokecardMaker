import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import HTTPException, status

try:
    import jwt
except ModuleNotFoundError:
    from . import jwt_compat as jwt


JWT_SECRET = os.getenv("JWT_SECRET", "change-this-jwt-secret-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
PASSWORD_HASH_ITERATIONS = 100_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ITERATIONS)
    return "pbkdf2_sha256${iterations}${salt}${digest}".format(
        iterations=PASSWORD_HASH_ITERATIONS,
        salt=base64.b64encode(salt).decode("utf-8"),
        digest=base64.b64encode(digest).decode("utf-8"),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_b64, digest_b64 = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64.encode("utf-8"))
        expected = base64.b64decode(digest_b64.encode("utf-8"))
        current = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(current, expected)
    except Exception:
        return False


def create_access_token(user_id: int, email: str) -> tuple[str, int]:
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": email,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, int(timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS).total_seconds())


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc
