"""
Database connection and session management.
Robust to missing drivers: if psycopg/psycopg2 is missing, the app
still imports cleanly and only fails when an actual query is run.
"""
import os
import logging
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_database_url() -> str:
    """
    Build a SQLAlchemy URL that works whether the user has
    psycopg (v3) or psycopg2 installed. The default URL
    in .env / settings uses `postgresql://` (libpq); we add
    the driver suffix only if a known driver is installed.
    """
    url = settings.DATABASE_URL
    if not url:
        return "sqlite:///./ca_erp.db"

    # If already a sqlite URL, use as-is
    if url.startswith("sqlite"):
        return url

    # If user already specified a driver, trust them
    if "+psycopg" in url or "+psycopg2" in url or "+pg8000" in url:
        return url

    # Try psycopg (v3) first, then psycopg2
    try:
        import psycopg  # noqa: F401
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    except ImportError:
        pass

    try:
        import psycopg2  # noqa: F401
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    except ImportError:
        pass

    # No driver installed yet. Return plain postgresql://
    # and let SQLAlchemy raise a clear error on first query.
    return url


_engine: Optional[Engine] = None


def get_engine() -> Engine:
    """Lazy-create the engine so import-time never fails on driver mismatch."""
    global _engine
    if _engine is None:
        url = _build_database_url()
        connect_args = {}
        if url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        try:
            _engine = create_engine(
                url,
                echo=settings.DATABASE_ECHO,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args=connect_args,
            )
        except Exception as e:
            logger.error("Failed to create DB engine: %s", e)
            raise
    return _engine


# Backwards-compat: `engine` and `Base` referenced via the original names.
# Use lazy properties so import-time never breaks even if the driver
# is missing.
def __getattr__(name):
    if name == "engine":
        return get_engine()
    if name == "SessionLocal":
        global _sessionlocal
        try:
            _sessionlocal
        except NameError:
            _sessionlocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
        return _sessionlocal
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


# Base class for models (declarative)
Base = declarative_base()


# Eager SessionLocal at import-time but defer engine creation
def _make_session_local() -> sessionmaker:
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


# Use a proxy that creates the engine on first use
class _LazySessionLocal:
    def __init__(self):
        self._factory: Optional[sessionmaker] = None

    def __call__(self, *args, **kwargs) -> Session:
        if self._factory is None:
            self._factory = _make_session_local()
        return self._factory(*args, **kwargs)

    def __getattr__(self, name):
        if self._factory is None:
            self._factory = _make_session_local()
        return getattr(self._factory, name)


SessionLocal = _LazySessionLocal()


def get_db() -> Session:
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
