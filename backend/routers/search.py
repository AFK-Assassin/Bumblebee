import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Chunk, Document, ChatHistory
from schemas import SearchQuery, SearchResponse, SearchResult, StatusResponse
from services.ollama_client import ollama
from services.vector_engine import brute_force_search

logger = logging.getLogger("bumblebee.search")
router = APIRouter(prefix="/api", tags=["Search & Status"])


@router.post("/search", response_model=SearchResponse)
async def semantic_search(req: SearchQuery, db: AsyncSession = Depends(get_db)):
    """Semantic vector search over all uploaded documents."""
    q_emb = await ollama.embed(req.query)
    if not q_emb:
        raise HTTPException(503, "Ollama is not available.")

    result = await db.execute(
        select(Chunk.id, Chunk.document_id, Chunk.title, Chunk.text, Chunk.embedding)
    )
    rows = result.all()

    if not rows:
        return SearchResponse(results=[], query=req.query, total=0)

    candidates = [(r[0], r[1], r[2], r[3], r[4] or []) for r in rows]
    hits = brute_force_search(q_emb, candidates, top_k=req.top_k)

    results = [
        SearchResult(
            chunk_id=chunk_id,
            document_id=doc_id,
            title=title,
            text=text,
            distance=round(dist, 4),
        )
        for dist, chunk_id, doc_id, title, text in hits
    ]
    return SearchResponse(results=results, query=req.query, total=len(results))


@router.get("/status", response_model=StatusResponse)
async def get_status(db: AsyncSession = Depends(get_db)):
    """Health check: Ollama, database, models."""
    ollama_up = await ollama.is_available()

    try:
        doc_count = (await db.execute(select(func.count(Document.id)))).scalar() or 0
        chunk_count = (await db.execute(select(func.count(Chunk.id)))).scalar() or 0
        db_connected = True
    except Exception:
        doc_count = 0
        chunk_count = 0
        db_connected = False

    return StatusResponse(
        ollama_online=ollama_up,
        embed_model=ollama.embed_model,
        gen_model=ollama.gen_model,
        document_count=doc_count,
        chunk_count=chunk_count,
        db_connected=db_connected,
    )
