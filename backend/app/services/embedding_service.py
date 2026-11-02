import hashlib
import json
import logging
import math
import re
from typing import List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("documind.embedding")

class EmbeddingService:
    """Computes semantic embeddings with support for Cloud API (Gemini/OpenAI) and local deterministic vectorization."""

    EMBEDDING_DIM = 64  # Compact, high-speed dimension for local retrieval & testing

    def __init__(self):
        self.provider = getattr(settings, "EMBEDDING_PROVIDER", "local")

    async def get_embedding(self, text: str) -> List[float]:
        """Generate a normalized embedding vector for a single string."""
        vectors = await self.get_embeddings_batch([text])
        return vectors[0] if vectors else [0.0] * self.EMBEDDING_DIM

    async def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized embedding vectors for a list of strings."""
        if not texts:
            return []

        # 1. Cloud Provider: Gemini Embeddings if API key present
        gemini_key = getattr(settings, "GEMINI_API_KEY", None)
        if self.provider == "gemini" and gemini_key:
            try:
                return await self._get_gemini_embeddings(texts, gemini_key)
            except Exception as e:
                logger.warning(f"Gemini embedding API call failed: {e}. Falling back to local vectorizer.")

        # 2. Fast local deterministic semantic vectorizer (always available, 0 network dependencies)
        return [self._compute_local_vector(t) for t in texts]

    def _compute_local_vector(self, text: str) -> List[float]:
        """Deterministic subword n-gram & semantic feature hashing vector with L2 normalization."""
        vec = [0.0] * self.EMBEDDING_DIM
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        tokens = cleaned.split()

        if not tokens:
            return vec

        # Bag of words + character n-grams hashing
        for token in tokens:
            token_hash = int(hashlib.md5(token.encode("utf-8")).hexdigest()[:8], 16)
            dim = token_hash % self.EMBEDDING_DIM
            vec[dim] += 1.0

            # Subword bi-grams for semantic inflection capture
            for i in range(len(token) - 2):
                ngram = token[i:i+3]
                ng_hash = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest()[:8], 16)
                dim_ng = ng_hash % self.EMBEDDING_DIM
                vec[dim_ng] += 0.35

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 1e-9:
            vec = [x / norm for x in vec]

        return vec

    async def _get_gemini_embeddings(self, texts: List[str], api_key: str) -> List[List[float]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key={api_key}"
        requests_payload = [
            {"model": "models/text-embedding-004", "content": {"parts": [{"text": t[:2048]}]}}
            for t in texts
        ]
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json={"requests": requests_payload})
            if resp.status_code == 200:
                data = resp.json()
                embeddings = []
                for item in data.get("embeddings", []):
                    embeddings.append(item["values"])
                return embeddings
            else:
                raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """Compute cosine similarity between two float vectors."""
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 <= 1e-9 or norm2 <= 1e-9:
            return 0.0
        return dot_product / (norm1 * norm2)

embedding_service = EmbeddingService()

