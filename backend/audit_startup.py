"""Audit script to identify startup issues."""
import sys
import traceback

print("=" * 60)
print("CA ERP Backend Startup Audit")
print("=" * 60)

errors = []
warnings_list = []

# Phase 1: Test database imports
print("\n[1] Testing app.models import...")
try:
    from app.models import models
    print(f"  OK: {len(models.Base.__subclasses__())} model classes registered")
except Exception as e:
    errors.append(f"models import failed: {e}")
    traceback.print_exc()

# Phase 2: Test core imports
print("\n[2] Testing app.core.security import...")
try:
    from app.core import security
    print(f"  OK: security module loaded; functions: hash_password, verify_password, generate_totp_secret, verify_totp")
except Exception as e:
    errors.append(f"security import failed: {e}")
    traceback.print_exc()

print("\n[3] Testing app.core.deps import...")
try:
    from app.core import deps
    print(f"  OK: deps module loaded")
except Exception as e:
    errors.append(f"deps import failed: {e}")
    traceback.print_exc()

# Phase 3: Test service imports
print("\n[4] Testing all service modules...")
services = [
    "accounting_service", "accounting_reports", "gst_service", "tds_service",
    "payroll_service", "inventory_service", "ai_service", "audit_service",
    "government_service", "whatsapp_voice_service", "saas_service",
]
for s in services:
    try:
        __import__(f"app.services.{s}")
        print(f"  OK: {s}")
    except Exception as e:
        errors.append(f"service {s} import failed: {e}")
        traceback.print_exc()

# Phase 4: Test route imports
print("\n[5] Testing all route modules...")
routes = [
    "auth", "companies", "accounting", "invoicing", "gst", "payroll",
    "income_tax", "audit", "ca_practice", "business_intelligence", "enterprise",
]
for r in routes:
    try:
        __import__(f"app.api.routes.{r}")
        print(f"  OK: {r}")
    except Exception as e:
        errors.append(f"route {r} import failed: {e}")
        traceback.print_exc()

# Phase 5: Test full app load
print("\n[6] Testing app.main import (full app)...")
try:
    from app.main import app
    routes_list = [r for r in app.routes if hasattr(r, "path")]
    print(f"  OK: app loaded; {len(routes_list)} routes registered")
    print(f"  Sample routes:")
    for r in routes_list[:20]:
        methods = ",".join(r.methods) if hasattr(r, "methods") and r.methods else "?"
        print(f"    {methods:10} {r.path}")
except Exception as e:
    errors.append(f"app.main import failed: {e}")
    traceback.print_exc()

# Summary
print("\n" + "=" * 60)
print("AUDIT SUMMARY")
print("=" * 60)
if errors:
    print(f"\n{len(errors)} ERRORS FOUND:\n")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("\n[OK] No import errors. Backend should start successfully.")
    sys.exit(0)
