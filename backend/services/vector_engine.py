import numpy as np
from typing import List, Tuple

def cosine_distance(a: List[float], b: List[float]) -> float:
    """Cosine distance (0 = identical, 2 = opposite)."""
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    na, nb = np.linalg.norm(va), np.linalg.norm(vb)
    if na < 1e-9 or nb < 1e-9:
        return 1.0
    return float(1.0 - np.dot(va, vb) / (na * nb))

def brute_force_search(
    query_emb: List[float],
    candidates: List[Tuple[int, str, str, str, List[float]]],
    top_k: int = 5,
) -> List[Tuple[float, int, str, str, str]]:
    """
    Pure-Python brute force vector search (fallback when pgvector is unavailable).
    candidates: list of (chunk_id, document_id, title, text, embedding)
    Returns sorted list of (distance, chunk_id, document_id, title, text)
    """
    scored = []
    for chunk_id, document_id, title, text, emb in candidates:
        dist = cosine_distance(query_emb, emb)
        scored.append((dist, chunk_id, document_id, title, text))

    scored.sort(key=lambda x: x[0])
    return scored[:top_k]
