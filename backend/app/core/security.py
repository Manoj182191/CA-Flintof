"""
Authentication and security utilities
Complete RBAC, 2FA, password reset, sessions
"""
from datetime import datetime, timedelta
from typing import Optional, Tuple
import secrets
import hashlib
import hmac
import base64

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.base import get_db
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT bearer
security = HTTPBearer(auto_error=False)


# ============ Password Hashing ============

def hash_password(password: str) -> str:
    """Hash a password with bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


# ============ JWT Tokens ============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token (longer-lived)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh", "jti": secrets.token_urlsafe(16)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_email_verification_token(user_id: int) -> str:
    """Create a single-use email verification token (24 hour expiry)"""
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "email_verification", "jti": secrets.token_urlsafe(16)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_password_reset_token(user_id: int) -> str:
    """Create a single-use password reset token (1 hour expiry)"""
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "password_reset", "jti": secrets.token_urlsafe(16)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_2fa_temp_token(user_id: int) -> str:
    """Create a short-lived token that requires 2FA completion (10 minutes)"""
    expire = datetime.utcnow() + timedelta(minutes=10)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "2fa_pending", "jti": secrets.token_urlsafe(16)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, expected_type: Optional[str] = None) -> dict:
    """Verify a JWT token. Optionally check type. Raises 401 on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        logger.warning("JWT verification failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if expected_type and payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload


# ============ TOTP (2FA) - RFC 6238 ============

def _base32_decode(secret: str) -> bytes:
    """Decode base32 string (handles padding)."""
    secret = secret.replace(" ", "").upper()
    padding = "=" * (-len(secret) % 8)
    return base64.b32decode(secret + padding)


def _base32_encode(data: bytes) -> str:
    return base64.b32encode(data).decode("ascii").rstrip("=")


def generate_totp_secret() -> str:
    """Generate a new TOTP secret for a user."""
    return _base32_encode(secrets.token_bytes(20))


def _hotp(secret_bytes: bytes, counter: int, digits: int = 6) -> str:
    """HMAC-based OTP per RFC 4226."""
    counter_bytes = counter.to_bytes(8, "big")
    h = hmac.new(secret_bytes, counter_bytes, hashlib.sha1).digest()
    offset = h[-1] & 0x0F
    code = ((h[offset] & 0x7F) << 24 |
            (h[offset + 1] & 0xFF) << 16 |
            (h[offset + 2] & 0xFF) << 8 |
            (h[offset + 3] & 0xFF))
    return str(code % (10 ** digits)).zfill(digits)


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
    """Verify a TOTP code. `window` allows +/- 1 time-step drift."""
    if not code or not code.isdigit():
        return False
    try:
        secret_bytes = _base32_decode(secret)
    except Exception:
        return False
    timestep = int(datetime.utcnow().timestamp()) // 30
    for w in range(-window, window + 1):
        if hmac.compare_digest(_hotp(secret_bytes, timestep + w), code):
            return True
    return False


def generate_backup_codes(count: int = 10) -> list:
    """Generate a list of single-use backup codes (8 digits each)."""
    return [secrets.token_hex(4).upper() for _ in range(count)]


# ============ Dependencies ============

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Get the currently authenticated user from JWT."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(credentials.credentials, expected_type="access")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )
    # Import here to avoid circular imports
    from app.models.models import User
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    return user


def require_role(*allowed_roles: str):
    """Dependency factory: require user to have one of the given roles."""
    def role_checker(user=Depends(get_current_user), db: Session = Depends(get_db)):
        from app.models.models import UserRole, Role
        user_role_names = [
            r.name for r in db.query(Role).join(UserRole, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == user.id).all()
        ]
        if not any(r in user_role_names for r in allowed_roles) and not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(allowed_roles)}",
            )
        return user
    return role_checker


def require_admin(user=Depends(get_current_user)):
    """Require admin user."""
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, accounting for proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
