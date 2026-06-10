"""
Pytest configuration: ensure the backend package is importable and provide global fixtures.
"""
import os
import sys
import pytest

# Add the backend directory to sys.path so `import app.*` works
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

# Set test environment variables BEFORE any app imports
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_ca_erp.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DEBUG", "False")
os.environ.setdefault("OPENAI_API_KEY", "")

@pytest.fixture
def client():
    """Test client with in-memory SQLite database."""
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool
    from sqlalchemy.orm import sessionmaker
    from app.database.base import Base, get_db
    from app.main import app

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    """Register and login a test user, return auth headers."""
    client.post("/api/auth/register", json={
        "email": "test@example.com", "username": "testuser",
        "full_name": "Test User", "password": "testpass123"
    })
    
    # Bypass email verification for tests
    from app.database.base import get_db
    from app.models.models import User
    from app.main import app
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    user = db.query(User).filter(User.email == "test@example.com").first()
    if user:
        user.is_active = True
        db.commit()
    db.close()

    res = client.post("/api/auth/login", json={
        "email": "test@example.com", "password": "testpass123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_token_headers(client):
    """Register and login an admin user, return auth headers."""
    client.post("/api/auth/register", json={
        "email": "admin@example.com", "username": "admin",
        "full_name": "Admin User", "password": "testpass123"
    })
    # Make them admin and active in the DB
    from app.database.base import get_db
    from app.models.models import User
    from app.main import app
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    user = db.query(User).filter(User.email == "admin@example.com").first()
    if user:
        user.is_admin = True
        user.is_active = True
        db.commit()
    db.close()

    res = client.post("/api/auth/login", json={
        "email": "admin@example.com", "password": "testpass123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
