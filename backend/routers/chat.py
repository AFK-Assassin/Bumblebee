import logging
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from database import get_db
from models import Document, Chunk, ChatHistory
from schemas import ChatRequest, ChatResponse, ContextChip, ChatHistoryItem
from services.ollama_client import ollama
from services.vector_engine import brute_force_search
from config import settings

logger = logging.getLogger("bumblebee.chat")
router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def ask_bumblebee(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """RAG: embed question → find relevant chunks → generate answer."""

    # 1. Embed the question
    q_emb = await ollama.embed(req.question)
    if not q_emb:
        raise HTTPException(503, "Ollama is not available. Run: ollama serve")

    # 2. Retrieve all chunk embeddings from DB (brute force via Python)
    result = await db.execute(
        select(Chunk.id, Chunk.document_id, Chunk.title, Chunk.text, Chunk.embedding)
    )
    rows = result.all()

    if not rows:
        # No documents uploaded yet — just answer from model knowledge
        answer = await ollama.generate(req.question, system=settings.SYSTEM_PROMPT)
        return ChatResponse(
            answer=answer,
            model=ollama.gen_model,
            contexts=[],
            question=req.question,
        )

    # 3. Vector search
    candidates = [(r[0], r[1], r[2], r[3], r[4] or []) for r in rows]
    top_hits = brute_force_search(q_emb, candidates, top_k=req.top_k)

    contexts = [
        ContextChip(
            chunk_id=chunk_id,
            document_id=doc_id,
            title=title,
            text=text,
            distance=round(dist, 4),
        )
        for dist, chunk_id, doc_id, title, text in top_hits
        if dist < 0.75          # relevance threshold
    ]

    # 4. Build prompt
    context_text = "\n\n".join(
        f"[{i+1}] {c.title}:\n{c.text}" for i, c in enumerate(contexts)
    )
    prompt = (
        f"Context:\n{context_text}\n\n"
        f"Question: {req.question}\n\n"
        f"Answer:"
    ) if contexts else req.question

    # 5. Generate answer
    answer = await ollama.generate(prompt, system=settings.SYSTEM_PROMPT)

    # 6. Save to chat history
    history_entry = ChatHistory(
        question=req.question,
        answer=answer,
        model=ollama.gen_model,
        retrieved_chunks=json.dumps([c.model_dump() for c in contexts]),
    )
    db.add(history_entry)
    await db.commit()

    return ChatResponse(
        answer=answer,
        model=ollama.gen_model,
        contexts=contexts,
        question=req.question,
    )


@router.get("/history", response_model=list[ChatHistoryItem])
async def get_chat_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Retrieve past chat messages."""
    result = await db.execute(
        select(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(limit)
    )
    rows = result.scalars().all()
    rows.reverse()
    return rows


@router.delete("/history")
async def clear_chat_history(db: AsyncSession = Depends(get_db)):
    """Clear all chat history."""
    await db.execute(delete(ChatHistory))
    await db.commit()
    return {"message": "Chat history cleared."}
