import logging
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db
from routers import chat, documents, search

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(name)s — %(message)s",
)
logger = logging.getLogger("bumblebee")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🐝 Bumblebee AI starting up...")
    try:
        await init_db()
        logger.info("✅ Database tables ready.")
    except Exception as e:
        logger.warning(f"⚠️  Database init failed (is PostgreSQL running?): {e}")
    yield
    logger.info("🐝 Bumblebee AI shutting down.")


app = FastAPI(
    title="Bumblebee AI",
    description="Your personal AI assistant — Python + PostgreSQL + Ollama",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(search.router)


@app.get("/")
def root():
    return {
        "name": "Bumblebee AI",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "/api/status",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
