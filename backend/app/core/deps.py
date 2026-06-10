"""
Common shared dependencies (RBAC helpers, tenant/company scoping).
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.core.security import get_current_user


def get_user_companies(user, db: Session) -> list:
    """Get all company IDs the user has any role in."""
    from app.models.models import UserRole
    rows = db.query(UserRole.company_id).filter(
        UserRole.user_id == user.id,
        UserRole.company_id.isnot(None),
    ).distinct().all()
    return [r[0] for r in rows]


def get_active_company_id(user, db: Session, requested_company_id: Optional[int] = None) -> int:
    """Resolve the company ID to scope this request to. Enforces tenant isolation."""
    accessible = get_user_companies(user, db)
    if user.is_admin and requested_company_id is None:
        # Admin: pick the first accessible, or 0
        return accessible[0] if accessible else 0
    if requested_company_id is None:
        if not accessible:
            raise HTTPException(status_code=403, detail="User has no company access")
        return accessible[0]
    if requested_company_id not in accessible and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this company",
        )
    return requested_company_id


def check_permission(db: Session, user, company_id: int, module: str, action: str) -> bool:
    """Check whether the user has a given module/action permission in a company."""
    if user.is_admin:
        return True
    from app.models.models import PermissionMatrix
    rows = db.query(PermissionMatrix).filter(
        PermissionMatrix.company_id == company_id,
        PermissionMatrix.is_active == True,
    ).all()
    from app.models.models import UserRole, Role
    role_names = [
        r.name for r in db.query(Role).join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id, UserRole.company_id == company_id).all()
    ]
    for row in rows:
        if row.role_name in role_names:
            perms = row.permissions or {}
            module_perms = perms.get(module, {})
            if isinstance(module_perms, dict):
                if module_perms.get(action, False) is True:
                    return True
            elif module_perms is True:
                return True
    return False


def require_permission(module: str, action: str):
    """Dependency factory: require a specific permission."""
    from fastapi import Request
    def dep(
        request: Request,
        user=Depends(get_current_user),
        db: Session = Depends(get_db),
    ):
        company_id = request.query_params.get("company_id") or request.path_params.get("company_id")
        try:
            cid = int(company_id) if company_id else get_active_company_id(user, db)
        except (TypeError, ValueError):
            cid = get_active_company_id(user, db)
        if not check_permission(db, user, cid, module, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {module}.{action}",
            )
        return user
    return dep
