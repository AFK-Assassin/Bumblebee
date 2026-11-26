import logging
import socket
from urllib.parse import urlparse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from config import settings

logger = logging.getLogger("bumblebee.database")

class Base(DeclarativeBase):
    pass

def can_connect_tcp(host: str, port: int, timeout: float = 0.5) -> bool:
    try:
        sock = socket.create_connection((host, port), timeout=timeout)
        sock.close()
        return True
    except OSError:
        return False

is_db_connected = False
current_db_type = "none"
engine = None
AsyncSessionLocal = None

def get_engine_and_session(url: str):
    eng = create_async_engine(url, echo=False, pool_pre_ping=True)
    session_factory = async_sessionmaker(eng, class_=AsyncSession, expire_on_commit=False)
    return eng, session_factory

async def init_db():
    global is_db_connected, current_db_type, engine, AsyncSessionLocal

    target_url = settings.DATABASE_URL
    use_postgres = False

    if target_url.startswith("postgresql"):
        # Quick port check to prevent hanging if PostgreSQL is not installed/running
        try:
            parsed = urlparse(target_url.replace("+asyncpg", ""))
            host = parsed.hostname or "localhost"
            port = parsed.port or 5432
            if can_connect_tcp(host, port, timeout=0.6):
                use_postgres = True
            else:
                logger.warning(f"PostgreSQL port {host}:{port} is not open.")
        except Exception:
            pass

    if use_postgres:
        try:
            engine, AsyncSessionLocal = get_engine_and_session(target_url)
            async with engine.begin() as conn:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                await conn.run_sync(Base.metadata.create_all)
            is_db_connected = True
            current_db_type = "postgresql"
            logger.info("Connected to PostgreSQL with pgvector!")
            return True
        except Exception as e:
            logger.warning(f"PostgreSQL initialization failed: {e}")

    # Fallback to SQLite so user can run and test immediately
    logger.info("Initializing local database (bumblebee.db)...")
    try:
        fallback_url = "sqlite+aiosqlite:///./bumblebee.db"
        engine, AsyncSessionLocal = get_engine_and_session(fallback_url)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        is_db_connected = True
        current_db_type = "sqlite"
        logger.info("Local database ready (bumblebee.db).")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize local fallback database: {e}")
        is_db_connected = False
        return False

async def get_db():
    if AsyncSessionLocal is None:
        await init_db()
    async with AsyncSessionLocal() as session:
        yield session
