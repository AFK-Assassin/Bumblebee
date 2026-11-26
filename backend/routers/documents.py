import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from database import get_db
from models import Document, Chunk
from schemas import DocumentCreate, DocumentOut, ChunkOut
from services.ollama_client import ollama
from services.text_processor import chunk_text

logger = logging.getLogger("bumblebee.documents")
router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("", response_model=dict)
async def upload_document(body: DocumentCreate, db: AsyncSession = Depends(get_db)):
    """Chunk a document, embed each chunk, store in PostgreSQL."""

    if not body.title.strip() or not body.text.strip():
        raise HTTPException(400, "Title and text are required.")

    # 1. Chunk the text
    chunks = chunk_text(body.text, max_words=250, overlap=30)
    if not chunks:
        raise HTTPException(400, "Text is too short to process.")

    # 2. Create the document record
    doc = Document(
        title=body.title.strip(),
        text=body.text.strip(),
        chunk_count=len(chunks),
    )
    db.add(doc)
    await db.flush()   # get doc.id assigned

    # 3. Embed each chunk and store
    chunk_records = []
    for i, chunk_text_str in enumerate(chunks):
        emb = await ollama.embed(chunk_text_str)
        if not emb:
            await db.rollback()
            raise HTTPException(
                503,
                "Ollama is not available. Install from https://ollama.com "
                "then run: ollama pull nomic-embed-text"
            )

        chunk_title = (
            f"{body.title} [{i+1}/{len(chunks)}]"
            if len(chunks) > 1
            else body.title
        )
        chunk_records.append(Chunk(
            document_id=doc.id,
            chunk_index=i,
            title=chunk_title,
            text=chunk_text_str,
            embedding=emb,
        ))

    db.add_all(chunk_records)
    await db.commit()
    await db.refresh(doc)

    logger.info(f"Inserted document '{doc.title}' with {len(chunks)} chunks.")
    return {
        "id": doc.id,
        "title": doc.title,
        "chunks": len(chunks),
        "message": f"Document embedded and stored with {len(chunks)} chunk(s).",
    }


@router.get("", response_model=list[DocumentOut])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all uploaded documents."""
    result = await db.execute(
        select(Document).order_by(Document.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a document and all its chunks."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found.")
    await db.delete(doc)
    await db.commit()
    return {"message": f"Document '{doc.title}' deleted."}


@router.get("/{doc_id}/chunks", response_model=list[ChunkOut])
async def get_chunks(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Get all text chunks for a specific document."""
    result = await db.execute(
        select(Chunk)
        .where(Chunk.document_id == doc_id)
        .order_by(Chunk.chunk_index)
    )
    return result.scalars().all()
