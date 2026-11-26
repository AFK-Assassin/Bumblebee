from pydantic import BaseModel
from typing import Optional, List
import datetime

# ── Document ──────────────────────────────────────────────────
class DocumentCreate(BaseModel):
    title: str
    text: str

class DocumentOut(BaseModel):
    id: str
    title: str
    chunk_count: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ── Chunk ─────────────────────────────────────────────────────
class ChunkOut(BaseModel):
    id: int
    document_id: str
    chunk_index: int
    title: str
    text: str

    class Config:
        from_attributes = True

# ── Search ────────────────────────────────────────────────────
class SearchQuery(BaseModel):
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    chunk_id: int
    document_id: str
    title: str
    text: str
    distance: float

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query: str
    total: int

# ── Chat / RAG ────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    top_k: int = 3

class ContextChip(BaseModel):
    chunk_id: int
    document_id: str
    title: str
    text: str
    distance: float

class ChatResponse(BaseModel):
    answer: str
    model: str
    contexts: List[ContextChip]
    question: str

# ── Chat History ──────────────────────────────────────────────
class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    model: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ── Status ────────────────────────────────────────────────────
class StatusResponse(BaseModel):
    ollama_online: bool
    embed_model: str
    gen_model: str
    document_count: int
    chunk_count: int
    db_connected: bool
    version: str = "1.0.0"
    name: str = "Bumblebee AI"
