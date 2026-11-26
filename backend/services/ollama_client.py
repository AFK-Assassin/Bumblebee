import logging
from typing import List, Optional
import httpx
from config import settings

logger = logging.getLogger("bumblebee.ollama")

class OllamaClient:
    def __init__(self):
        self.host = settings.OLLAMA_HOST
        self.embed_model = settings.EMBED_MODEL
        self.gen_model = settings.GEN_MODEL

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{self.host}/api/tags")
                return r.status_code == 200
        except Exception:
            return False

    async def embed(self, text: str) -> List[float]:
        """Generate a 768-dim embedding vector for a text string."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {"model": self.embed_model, "prompt": text}
                r = await client.post(f"{self.host}/api/embeddings", json=payload)
                if r.status_code != 200:
                    logger.error(f"Ollama embed error {r.status_code}: {r.text}")
                    return []
                data = r.json()
                return data.get("embedding", [])
        except Exception as e:
            logger.error(f"Ollama embed exception: {e}")
            return []

    async def generate(self, prompt: str, system: Optional[str] = None) -> str:
        """Generate a text response using the local LLM."""
        try:
            payload: dict = {
                "model": self.gen_model,
                "prompt": prompt,
                "stream": False,
            }
            if system:
                payload["system"] = system

            async with httpx.AsyncClient(timeout=180.0) as client:
                r = await client.post(f"{self.host}/api/generate", json=payload)
                if r.status_code != 200:
                    return f"Error: Ollama returned {r.status_code}. Run: ollama serve"
                data = r.json()
                return data.get("response", "").strip()
        except Exception as e:
            logger.error(f"Ollama generate exception: {e}")
            return f"Error: Could not reach Ollama. Make sure it is running: ollama serve"

    async def list_models(self) -> List[str]:
        """List all locally available models."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.host}/api/tags")
                if r.status_code == 200:
                    models = r.json().get("models", [])
                    return [m["name"] for m in models]
        except Exception:
            pass
        return []

ollama = OllamaClient()
