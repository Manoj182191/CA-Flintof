"""
Authentication API routes
Complete: register, login, refresh, logout, 2FA setup/verify, password reset,
          change password, sessions list/revoke, RBAC role management
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from pydantic import BaseModel, EmailStr, Field
import hashlib
import secrets

from app.database.base import get_db
from app.core.security import (
    get_current_user, hash_password, verify_password,
    create_access_token, create_refresh_token, create_password_reset_token,
    create_2fa_temp_token, verify_token, generate_totp_secret,
    verify_totp, generate_backup_codes, get_client_ip,
)
from app.models.models import (
    User, UserRole, Role, Company, AuditLog,
    TwoFactorAuth, PasswordResetToken, LoginAttempt, UserSession,
    SecurityLog, DeviceRegistration, EmailVerificationToken
)
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["authentication"])


# ============== Schemas ==============

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    full_name: str
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime
    two_factor_enabled: bool = False

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str
    totp_code: Optional[str] = None
    device_id: Optional[str] = None
    device_name: Optional[str] = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut
    requires_2fa: bool = False
    temp_token: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class TwoFactorSetupResponse(BaseModel):
    secret: str
    qr_uri: str
    backup_codes: list


class TwoFactorVerifyRequest(BaseModel):
    totp_code: str


class TwoFactorLoginRequest(BaseModel):
    temp_token: str
    totp_code: str


class RoleAssignRequest(BaseModel):
    user_id: int
    role_name: str
    company_id: int


# ============== Helpers ==============

def _log_security_event(db: Session, event_type: str, user_id: Optional[int] = None,
                        company_id: Optional[int] = None, ip: str = None,
                        risk: str = "Low", details: dict = None):
    """Record a security event for audit/alerting."""
    try:
        db.add(SecurityLog(
            user_id=user_id, company_id=company_id, event_type=event_type,
            ip_address=ip, risk_level=risk, details=details or {},
        ))
        db.commit()
    except Exception as e:
        logger.warning("Failed to log security event: %s", e)


def _create_session(db: Session, user: User, request: Request, device_id: Optional[str] = None):
    """Record the login session."""
    try:
        s = UserSession(
            user_id=user.id,
            device_id=device_id,
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("user-agent", ""),
            is_active=True,
        )
        db.add(s)
        db.commit()
    except Exception as e:
        logger.warning("Failed to record session: %s", e)


def _register_or_update_device(db: Session, user: User, device_id: str,
                               device_name: Optional[str], ip: str):
    """First-seen device handling."""
    if not device_id:
        return
    dev = db.query(DeviceRegistration).filter(
        DeviceRegistration.user_id == user.id, DeviceRegistration.device_id == device_id
    ).first()
    if dev:
        dev.last_seen = datetime.utcnow()
        dev.ip_address = ip
    else:
        db.add(DeviceRegistration(
            user_id=user.id, device_id=device_id,
            device_name=device_name or "Unknown",
            device_type="web", ip_address=ip, last_seen=datetime.utcnow(),
            is_trusted=False,
        ))
    db.commit()


# ============== Register / Login ==============

@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        or_(User.email == payload.email, User.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="User with this email or username already exists")

    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_active=False, # Must verify email to become active
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate and send verification email
    from app.core.security import create_email_verification_token
    from app.worker.tasks import send_verification_email_task
    
    raw_token = create_email_verification_token(user.id)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    evt = EmailVerificationToken(
        user_id=user.id, token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(evt)
    db.commit()

    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
    send_verification_email_task.delay(user.email, verify_link)

    return UserOut(
        id=user.id, email=user.email, username=user.username,
        full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
        created_at=user.created_at, two_factor_enabled=False,
    )

class VerifyEmailRequest(BaseModel):
    token: str

@router.post("/verify-email")
def verify_email(payload: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    """Consume an email verification token and activate the user."""
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    evt = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash
    ).first()
    
    if not evt:
        raise HTTPException(status_code=400, detail="Invalid token")
    if evt.verified_at is not None:
        raise HTTPException(status_code=400, detail="Email already verified")
    if evt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
        
    user = db.query(User).filter(User.id == evt.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.is_active = True
    evt.verified_at = datetime.utcnow()
    db.commit()
    
    _log_security_event(db, "EMAIL_VERIFIED", user_id=user.id,
                        ip=get_client_ip(request), risk="Low")
    return {"message": "Email verification successful. You can now login."}

@router.post("/test-email")
async def test_email(
    email: str = Body(..., embed=True)
):
    """
    Test endpoint to verify asynchronous email dispatch via Celery.
    """
    from app.worker.tasks import send_verification_email_task
    try:
        # Dispatch the celery task
        send_verification_email_task.delay(email, "http://localhost:3000/verify?token=test-token")
        return {"message": f"Test email queued for {email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue email task: {str(e)}")

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user. If 2FA is enabled, return a temp_token that must be exchanged via /2fa/verify."""
    user = db.query(User).filter(User.email == payload.email).first()
    ip = get_client_ip(request)

    # Brute force protection: block after 5 failed attempts in 15 minutes
    cutoff = datetime.utcnow() - timedelta(minutes=15)
    recent_failures = db.query(func.count(LoginAttempt.id)).filter(
        LoginAttempt.email == payload.email,
        LoginAttempt.success == False,
        LoginAttempt.attempted_at >= cutoff,
    ).scalar() or 0
    if recent_failures >= 5:
        _log_security_event(db, "BRUTE_FORCE_BLOCKED", user_id=user.id if user else None,
                            ip=ip, risk="High", details={"email": payload.email})
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please try again in 15 minutes.",
        )

    # Log the attempt
    attempt = LoginAttempt(
        email=payload.email, ip_address=ip,
        user_agent=request.headers.get("user-agent", ""),
        success=False,
    )

    if not user or not verify_password(payload.password, user.hashed_password):
        attempt.failure_reason = "Invalid credentials"
        db.add(attempt)
        db.commit()
        _log_security_event(db, "LOGIN_FAILED", user_id=user.id if user else None,
                            ip=ip, risk="Medium", details={"email": payload.email})
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        attempt.failure_reason = "Account inactive"
        db.add(attempt)
        db.commit()
        raise HTTPException(status_code=403, detail="Account is inactive")

    # 2FA flow
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if tfa and tfa.is_enabled and not payload.totp_code:
        attempt.success = True
        attempt.failure_reason = "2FA required"
        db.add(attempt)
        db.commit()
        temp = create_2fa_temp_token(user.id)
        return TokenPair(
            access_token="", refresh_token="",
            expires_in=600, user=UserOut(
                id=user.id, email=user.email, username=user.username,
                full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
                created_at=user.created_at, two_factor_enabled=True,
            ),
            requires_2fa=True, temp_token=temp,
        )

    if tfa and tfa.is_enabled and payload.totp_code:
        # Verify TOTP or backup code
        valid = verify_totp(tfa.totp_secret, payload.totp_code)
        if not valid and tfa.backup_codes and payload.totp_code.upper() in tfa.backup_codes:
            tfa.backup_codes = [c for c in tfa.backup_codes if c != payload.totp_code.upper()]
            valid = True
        if not valid:
            attempt.failure_reason = "2FA invalid"
            db.add(attempt)
            db.commit()
            _log_security_event(db, "2FA_FAILED", user_id=user.id, ip=ip, risk="High")
            raise HTTPException(status_code=401, detail="Invalid 2FA code")
        tfa.last_used_at = datetime.utcnow()
        db.commit()

    # Issue tokens
    access = create_access_token({"sub": str(user.id), "email": user.email})
    refresh = create_refresh_token({"sub": str(user.id), "email": user.email})

    attempt.success = True
    db.add(attempt)
    db.commit()

    _create_session(db, user, request, payload.device_id)
    _register_or_update_device(db, user, payload.device_id, payload.device_name, ip)
    _log_security_event(db, "LOGIN_SUCCESS", user_id=user.id, ip=ip)

    return TokenPair(
        access_token=access, refresh_token=refresh, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut(
            id=user.id, email=user.email, username=user.username,
            full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
            created_at=user.created_at, two_factor_enabled=bool(tfa and tfa.is_enabled),
        ),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    data = verify_token(payload.refresh_token, expected_type="refresh")
    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token({"sub": str(user.id), "email": user.email})
    new_refresh = create_refresh_token({"sub": str(user.id), "email": user.email})
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    return TokenPair(
        access_token=access, refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut(
            id=user.id, email=user.email, username=user.username,
            full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
            created_at=user.created_at, two_factor_enabled=bool(tfa and tfa.is_enabled),
        ),
    )


@router.post("/logout")
def logout(request: Request, user=Depends(get_current_user), db: Session = Depends(get_db)):
    ip = get_client_ip(request)
    # End active session for this user (best effort: deactivate current device session)
    db.query(UserSession).filter(
        UserSession.user_id == user.id, UserSession.is_active == True,
        UserSession.ip_address == ip,
    ).update({"is_active": False, "ended_at": datetime.utcnow()})
    db.commit()
    _log_security_event(db, "LOGOUT", user_id=user.id, ip=ip)
    return {"message": "Logged out"}


# ============== Current User ==============

@router.get("/me", response_model=UserOut)
def get_me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    return UserOut(
        id=user.id, email=user.email, username=user.username,
        full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
        created_at=user.created_at, two_factor_enabled=bool(tfa and tfa.is_enabled),
    )


# ============== Password Reset ==============

@router.post("/password/reset-request")
def password_reset_request(payload: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    """Generate a one-time password reset token and send via background task."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Do not leak account existence
        return {"message": "If the email exists, a reset link has been sent"}

    # Invalidate any previous unused tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None)
    ).update({"used_at": datetime.utcnow()})

    raw_token = create_password_reset_token(user.id)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    prt = PasswordResetToken(
        user_id=user.id, token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=1),
        ip_address=get_client_ip(request),
    )
    db.add(prt)
    db.commit()
    _log_security_event(db, "PASSWORD_RESET_REQUESTED", user_id=user.id,
                        ip=get_client_ip(request), risk="Medium")

    from app.worker.tasks import send_password_reset_email_task
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
    send_password_reset_email_task.delay(user.email, reset_link)

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password/reset-confirm")
def password_reset_confirm(payload: PasswordResetConfirm, request: Request, db: Session = Depends(get_db)):
    """Consume a password reset token and set the new password."""
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    prt = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()
    if not prt:
        raise HTTPException(status_code=400, detail="Invalid token")
    if prt.used_at is not None:
        raise HTTPException(status_code=400, detail="Token already used")
    if prt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
    user = db.query(User).filter(User.id == prt.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.hashed_password = hash_password(payload.new_password)
    prt.used_at = datetime.utcnow()
    db.commit()
    _log_security_event(db, "PASSWORD_RESET_COMPLETED", user_id=user.id,
                        ip=get_client_ip(request), risk="Medium")
    return {"message": "Password reset successful"}


@router.post("/password/change")
def change_password(payload: ChangePasswordRequest, request: Request,
                    user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    _log_security_event(db, "PASSWORD_CHANGED", user_id=user.id,
                        ip=get_client_ip(request))
    return {"message": "Password changed"}


# ============== 2FA ==============

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
def setup_2fa(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate a TOTP secret and backup codes. The user must call /2fa/enable with a valid code to activate."""
    secret = generate_totp_secret()
    backup = generate_backup_codes(10)
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if not tfa:
        tfa = TwoFactorAuth(user_id=user.id, totp_secret=secret, backup_codes=backup, is_enabled=False)
        db.add(tfa)
    else:
        tfa.totp_secret = secret
        tfa.backup_codes = backup
        tfa.is_enabled = False
    db.commit()
    issuer = "CA-ERP"
    uri = f"otpauth://totp/{issuer}:{user.email}?secret={secret}&issuer={issuer}"
    return TwoFactorSetupResponse(secret=secret, qr_uri=uri, backup_codes=backup)


@router.post("/2fa/enable")
def enable_2fa(payload: TwoFactorVerifyRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if not tfa:
        raise HTTPException(status_code=400, detail="Run /2fa/setup first")
    if not verify_totp(tfa.totp_secret, payload.totp_code):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    tfa.is_enabled = True
    tfa.enabled_at = datetime.utcnow()
    db.commit()
    return {"message": "2FA enabled", "backup_codes": tfa.backup_codes}


@router.post("/2fa/disable")
def disable_2fa(payload: TwoFactorVerifyRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if not tfa or not tfa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    if not verify_totp(tfa.totp_secret, payload.totp_code):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")
    tfa.is_enabled = False
    db.commit()
    return {"message": "2FA disabled"}


@router.post("/2fa/verify-login", response_model=TokenPair)
def verify_2fa_login(payload: TwoFactorLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Exchange a temp_token + valid TOTP code for full tokens."""
    data = verify_token(payload.temp_token, expected_type="2fa_pending")
    user = db.query(User).filter(User.id == int(data["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid temp token")
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == user.id).first()
    if not tfa or not tfa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled for this user")
    valid = verify_totp(tfa.totp_secret, payload.totp_code)
    if not valid and tfa.backup_codes and payload.totp_code.upper() in tfa.backup_codes:
        tfa.backup_codes = [c for c in tfa.backup_codes if c != payload.totp_code.upper()]
        valid = True
    if not valid:
        _log_security_event(db, "2FA_FAILED", user_id=user.id, ip=get_client_ip(request), risk="High")
        raise HTTPException(status_code=401, detail="Invalid 2FA code")
    tfa.last_used_at = datetime.utcnow()
    access = create_access_token({"sub": str(user.id), "email": user.email})
    refresh = create_refresh_token({"sub": str(user.id), "email": user.email})
    db.commit()
    _create_session(db, user, request)
    _log_security_event(db, "LOGIN_SUCCESS_2FA", user_id=user.id, ip=get_client_ip(request))
    return TokenPair(
        access_token=access, refresh_token=refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut(
            id=user.id, email=user.email, username=user.username,
            full_name=user.full_name, is_active=user.is_active, is_admin=user.is_admin,
            created_at=user.created_at, two_factor_enabled=True,
        ),
    )


# ============== Sessions & Devices ==============

@router.get("/sessions")
def list_sessions(user=Depends(get_current_user), db: Session = Depends(get_db)):
    """List active sessions for the current user."""
    rows = db.query(UserSession).filter(
        UserSession.user_id == user.id
    ).order_by(UserSession.started_at.desc()).limit(50).all()
    return [{
        "id": s.id, "device_id": s.device_id, "ip_address": s.ip_address,
        "user_agent": s.user_agent, "is_active": s.is_active,
        "started_at": s.started_at, "ended_at": s.ended_at,
    } for s in rows]


@router.delete("/sessions/{session_id}")
def revoke_session(session_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(UserSession).filter(
        UserSession.id == session_id, UserSession.user_id == user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    s.is_active = False
    s.ended_at = datetime.utcnow()
    db.commit()
    return {"message": "Session revoked"}


@router.get("/devices")
def list_devices(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(DeviceRegistration).filter(
        DeviceRegistration.user_id == user.id
    ).order_by(DeviceRegistration.last_seen.desc()).all()
    return [{
        "id": d.id, "device_id": d.device_id, "device_name": d.device_name,
        "device_type": d.device_type, "ip_address": d.ip_address,
        "last_seen": d.last_seen, "is_trusted": d.is_trusted, "is_blocked": d.is_blocked,
    } for d in rows]


@router.post("/devices/{device_id}/trust")
def trust_device(device_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    d = db.query(DeviceRegistration).filter(
        DeviceRegistration.user_id == user.id, DeviceRegistration.device_id == device_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Device not found")
    d.is_trusted = True
    db.commit()
    return {"message": "Device trusted"}


@router.delete("/devices/{device_id}")
def block_device(device_id: str, user=Depends(get_current_user), db: Session = Depends(get_db)):
    d = db.query(DeviceRegistration).filter(
        DeviceRegistration.user_id == user.id, DeviceRegistration.device_id == device_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Device not found")
    d.is_blocked = True
    # End all active sessions on this device
    db.query(UserSession).filter(
        UserSession.user_id == user.id, UserSession.device_id == device_id,
        UserSession.is_active == True,
    ).update({"is_active": False, "ended_at": datetime.utcnow()})
    db.commit()
    return {"message": "Device blocked and sessions terminated"}


# ============== Roles & RBAC ==============

@router.get("/roles")
def list_roles(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Role).order_by(Role.name).all()
    return [{"id": r.id, "name": r.name, "description": r.description} for r in rows]


@router.post("/roles/assign")
def assign_role(payload: RoleAssignRequest, user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Only admins or company admins can assign roles."""
    from app.core.deps import get_user_companies
    accessible = get_user_companies(user, db)
    if payload.company_id not in accessible and not user.is_admin:
        raise HTTPException(status_code=403, detail="No access to this company")
    target = db.query(User).filter(User.id == payload.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if not role:
        role = Role(name=payload.role_name, description=f"{payload.role_name} role")
        db.add(role)
        db.flush()
    existing = db.query(UserRole).filter(
        UserRole.user_id == payload.user_id,
        UserRole.role_id == role.id,
        UserRole.company_id == payload.company_id,
    ).first()
    if existing:
        return {"message": "Role already assigned"}
    db.add(UserRole(user_id=payload.user_id, role_id=role.id, company_id=payload.company_id))
    db.commit()
    return {"message": "Role assigned"}


@router.delete("/roles/{user_id}/{company_id}/{role_name}")
def remove_role(user_id: int, company_id: int, role_name: str,
                user=Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    ur = db.query(UserRole).filter(
        UserRole.user_id == user_id, UserRole.role_id == role.id,
        UserRole.company_id == company_id,
    ).first()
    if not ur:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    db.delete(ur)
    db.commit()
    return {"message": "Role removed"}
