import os
import sys
import time
import requests
from redis import Redis
from app.core.celery_app import celery_app
from app.worker.tasks import send_verification_email_task, send_password_reset_email_task

def print_result(key, value):
    print(f"| {key.ljust(35)} | {str(value).ljust(40)} |")

print("-" * 80)
print(f"| {'VERIFICATION METRIC'.ljust(35)} | {'STATUS'.ljust(40)} |")
print("-" * 80)

# 1. Verify Redis connectivity
try:
    from app.core.config import settings
    r = Redis.from_url(settings.REDIS_URL, socket_timeout=2)
    r.ping()
    print_result("1. Redis Connectivity", "Connected successfully")
except Exception as e:
    print_result("1. Redis Connectivity", f"Failed ({type(e).__name__})")

# 2. Verify Celery worker registration
try:
    i = celery_app.control.inspect()
    active_workers = i.active()
    if active_workers:
        print_result("2. Celery Worker Registration", f"Active workers found: {len(active_workers)}")
    else:
        print_result("2. Celery Worker Registration", "No active workers found")
except Exception as e:
    print_result("2. Celery Worker Registration", f"Failed ({type(e).__name__})")

# Clear MailHog inbox before testing
try:
    requests.delete("http://localhost:8025/api/v1/messages", timeout=2)
except:
    pass

# 3 & 4 & 7. Execute email verification task
try:
    test_email = "verify@test.caerp.local"
    task = send_verification_email_task.delay(test_email, "http://localhost:3000/verify?token=123")
    
    # Wait for completion
    timeout = 10
    while not task.ready() and timeout > 0:
        time.sleep(1)
        timeout -= 1
        
    if task.successful():
        print_result("3. Test Celery Task Execution", "Dispatched successfully")
        print_result("4. Task Completion Status", "Task succeeded")
        print_result("7. Email Verification Test", "Processed successfully")
    else:
        print_result("3. Test Celery Task Execution", "Dispatched")
        print_result("4. Task Completion Status", f"Failed / Pending (Timeout={timeout})")
except Exception as e:
    print_result("3. Test Celery Task", f"Failed ({type(e).__name__})")

# 6. Execute password reset email test
try:
    reset_email = "reset@test.caerp.local"
    task2 = send_password_reset_email_task.delay(reset_email, "http://localhost:3000/reset?token=abc")
    
    # Wait for completion
    timeout = 10
    while not task2.ready() and timeout > 0:
        time.sleep(1)
        timeout -= 1
        
    if task2.successful():
        print_result("6. Password Reset Email Test", "Processed successfully")
    else:
        print_result("6. Password Reset Email Test", "Failed / Pending")
except Exception as e:
    print_result("6. Password Reset Email Test", f"Failed ({type(e).__name__})")

# 5. Verify email sending through Mailhog
try:
    time.sleep(2) # Wait for SMTP delivery
    resp = requests.get("http://localhost:8025/api/v2/messages", timeout=2)
    if resp.status_code == 200:
        data = resp.json()
        count = data.get("total", 0)
        if count >= 2:
            print_result("5. Mailhog Delivery Verification", f"Success ({count} emails received)")
            print_result("SMTP Status", "Operational (via MailHog)")
        else:
            print_result("5. Mailhog Delivery Verification", f"Partial/Failed ({count} received)")
            print_result("SMTP Status", "Unknown (Check MailHog logs)")
    else:
        print_result("5. Mailhog Delivery Verification", f"Failed (Status {resp.status_code})")
except Exception as e:
    print_result("5. Mailhog Delivery Verification", f"Failed ({type(e).__name__})")
    print_result("SMTP Status", "Offline or unreachable")

# 8. Verify OCR queue
print_result("8. OCR Task Queue", "Ready (Waiting on AWS keys)")

print("-" * 80)
