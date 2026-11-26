from typing import List

def chunk_text(text: str, max_words: int = 250, overlap: int = 30) -> List[str]:
    """
    Split text into overlapping chunks for embedding.
    Each chunk has ~max_words words, with 'overlap' words
    carried over from the previous chunk.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start += max_words - overlap  # slide forward with overlap

    return chunks
