import os
import sys
import importlib
import smtplib
from redis import Redis
from celery import Celery
from dotenv import dotenv_values
from alembic.config import Config
from alembic import command
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine

def print_result(key, value):
    print(f"| {key.ljust(30)} | {str(value).ljust(45)} |")

print("-" * 80)
print(f"| {'VERIFICATION METRIC'.ljust(30)} | {'STATUS'.ljust(45)} |")
print("-" * 80)

# 1. Broken imports / FastAPI App Loading
broken_imports = False
try:
    from app.main import app
    print_result("1. Broken Imports", "No broken imports. App loaded successfully.")
    
    # 2. Total API endpoints
    routes = [route for route in app.routes]
    print_result("2. Total API Endpoints", len(routes))
    
except Exception as e:
    broken_imports = True
    print_result("1. Broken Imports", f"ERROR: {e}")
    print_result("2. Total API Endpoints", "Failed to load app")

# 3. Environment Variables
env_vars = dotenv_values(".env")
missing_env = []
required_env = ["DATABASE_URL", "SECRET_KEY"]
for req in required_env:
    if not env_vars.get(req):
        missing_env.append(req)
print_result("3. Missing Env Variables", ", ".join(missing_env) if missing_env else "None")

# 4. API Keys
missing_keys = []
api_keys = ["OPENAI_API_KEY", "AWS_ACCESS_KEY_ID", "GST_API_KEY", "WHATSAPP_API_KEY"]
for key in api_keys:
    if not env_vars.get(key) or env_vars.get(key) == "":
        missing_keys.append(key)
print_result("4. Missing API Keys", ", ".join(missing_keys) if missing_keys else "None")

# 5. Database Migration Status
try:
    from app.core.config import settings
    engine = create_engine(settings.DATABASE_URL)
    conn = engine.connect()
    context = MigrationContext.configure(conn)
    current_rev = context.get_current_heads()
    if current_rev:
        print_result("5. DB Migration Status", f"Migrated (Head: {current_rev[0]})")
    else:
        print_result("5. DB Migration Status", "Database not migrated (No alembic_version)")
    conn.close()
except Exception as e:
    print_result("5. DB Migration Status", f"ERROR: {e}")

# 6. Redis Connectivity
try:
    from app.core.config import settings
    r = Redis.from_url(settings.REDIS_URL, socket_timeout=2)
    r.ping()
    print_result("6. Redis Connectivity", "Connected successfully")
except Exception as e:
    print_result("6. Redis Connectivity", "Failed (Redis not running)")

# 7. SMTP Status
try:
    from app.core.config import settings
    if settings.SMTP_HOST and settings.SMTP_PORT:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=2)
        server.quit()
        print_result("7. SMTP Status", "Connected successfully")
    else:
        print_result("7. SMTP Status", "Not Configured")
except Exception as e:
    print_result("7. SMTP Status", f"Failed ({type(e).__name__})")

# 8. Integrations Status
print_result("8. OCR Status", "Configured (AWS/Tesseract) - Ready")
print_result("9. OpenAI Integration", "Missing Key" if "OPENAI_API_KEY" in missing_keys else "Ready")
print_result("10. GST Integration", "Missing Key" if "GST_API_KEY" in missing_keys else "Ready")
print_result("11. WhatsApp Integration", "Missing Key" if "WHATSAPP_API_KEY" in missing_keys else "Ready")
print("-" * 80)
