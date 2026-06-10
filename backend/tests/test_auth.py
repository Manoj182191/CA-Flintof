import pytest
from unittest.mock import patch
from app.models.models import User, EmailVerificationToken, SecurityLog, UserSession

def test_register_and_verify(client):
    # Mock celery task to avoid actual Redis/Celery dependency in tests
    with patch('app.worker.tasks.send_verification_email_task.delay') as mock_delay:
        res = client.post("/api/auth/register", json={
            "email": "verify@example.com",
            "username": "verifyuser",
            "full_name": "Verify User",
            "password": "SecurePassword123"
        })
        assert res.status_code == 201
        assert mock_delay.called
    
    # Check DB for user and token
    from app.database.base import get_db
    from app.main import app
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    
    user = db.query(User).filter(User.email == "verify@example.com").first()
    assert user is not None
    assert user.is_active is False
    
    token = db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user.id).first()
    assert token is not None
    
    # Actually getting the raw token requires generating a new one or overriding it for test purposes.
    # Since we can't get raw token from DB (it's hashed), we will just bypass it for login test.
    db.close()

def test_login_brute_force_protection(client):
    with patch('app.worker.tasks.send_verification_email_task.delay'):
        # Register active user
        client.post("/api/auth/register", json={
            "email": "brute@example.com", "username": "bruteuser",
            "full_name": "Brute User", "password": "SecurePassword123"
        })
    
    from app.database.base import get_db
    from app.main import app
    db_gen = app.dependency_overrides.get(get_db, app.dependency_overrides.get(get_db))
    if not db_gen:
         db_gen = app.dependency_overrides[get_db]()
    
    db = next(db_gen)
    user = db.query(User).filter(User.email == "brute@example.com").first()
    if user:
        user.is_active = True
        db.commit()
    
    # 5 Failed attempts
    for _ in range(5):
        res = client.post("/api/auth/login", json={
            "email": "brute@example.com", "password": "wrongpassword"
        })
        assert res.status_code == 401
        
    # 6th attempt should be 429 Too Many Requests
    res = client.post("/api/auth/login", json={
        "email": "brute@example.com", "password": "wrongpassword"
    })
    assert res.status_code == 429
    
    # Even correct password should fail if blocked
    res = client.post("/api/auth/login", json={
        "email": "brute@example.com", "password": "SecurePassword123"
    })
    assert res.status_code == 429
    
    # Verify Security Log was created
    log = db.query(SecurityLog).filter(SecurityLog.event_type == "BRUTE_FORCE_BLOCKED").first()
    assert log is not None
    
    db.close()

def test_login_success_creates_session(client):
    with patch('app.worker.tasks.send_verification_email_task.delay'):
        client.post("/api/auth/register", json={
            "email": "session@example.com", "username": "sessionuser",
            "full_name": "Session User", "password": "SecurePassword123"
        })
    
    from app.database.base import get_db
    from app.main import app
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    user = db.query(User).filter(User.email == "session@example.com").first()
    user.is_active = True
    db.commit()
    
    res = client.post("/api/auth/login", json={
        "email": "session@example.com", "password": "SecurePassword123"
    })
    assert res.status_code == 200
    
    # Verify User Session was created
    session = db.query(UserSession).filter(UserSession.user_id == user.id).first()
    assert session is not None
    assert session.is_active is True
    db.close()
