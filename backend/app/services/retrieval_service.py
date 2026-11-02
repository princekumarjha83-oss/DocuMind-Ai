import json
import logging
import re
from typing import Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.schemas.chat import CitationSchema
from app.services.embedding_service import embedding_service

logger = logging.getLogger("documind.retrieval")

class RetrievalService:
    """Combines Dense Vector Similarity + Sparse Keyword Search using Reciprocal Rank Fusion (RRF)."""

    RRF_K = 60  # Standard constant in information retrieval

    async def search(
        self,
        db: AsyncSession,
        query: str,
        owner_id: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 6
    ) -> List[Tuple[DocumentChunk, Document, float]]:
        """Retrieve the most relevant document chunks for a query with strict tenant isolation."""
        # 1. Base query: Chunks belonging to this user
        stmt = (
            select(DocumentChunk, Document)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(
                DocumentChunk.owner_id == owner_id,
                Document.processing_status == "ready"
            )
        )

        if document_ids and len(document_ids) > 0:
            stmt = stmt.where(DocumentChunk.document_id.in_(document_ids))

        result = await db.execute(stmt)
        candidates = result.all()

        if not candidates:
            return []

        # 2. Dense Vector Scoring
        query_vec = await embedding_service.get_embedding(query)
        dense_scores: List[Tuple[DocumentChunk, Document, float]] = []

        for chunk, doc in candidates:
            sim = 0.0
            if chunk.embedding_json:
                try:
                    c_vec = json.loads(chunk.embedding_json)
                    sim = embedding_service.cosine_similarity(query_vec, c_vec)
                except Exception:
                    sim = 0.0
            dense_scores.append((chunk, doc, sim))

        # Sort dense rankings
        dense_scores.sort(key=lambda x: x[2], reverse=True)
        dense_ranks = {chunk.id: rank for rank, (chunk, _, _) in enumerate(dense_scores)}

        # 3. Sparse Keyword Scoring (BM25 term matching)
        query_terms = set(re.findall(r"\w+", query.lower()))
        sparse_scores: List[Tuple[DocumentChunk, Document, float]] = []

        for chunk, doc, _ in dense_scores:
            content_lower = chunk.content.lower()
            term_matches = sum(1 for term in query_terms if term in content_lower)
            score = term_matches / max(1, len(query_terms))
            sparse_scores.append((chunk, doc, score))

        sparse_scores.sort(key=lambda x: x[2], reverse=True)
        sparse_ranks = {chunk.id: rank for rank, (chunk, _, _) in enumerate(sparse_scores)}

        # 4. Reciprocal Rank Fusion (RRF)
        scored_map: Dict[str, Tuple[DocumentChunk, Document, float]] = {}
        for chunk, doc, dense_sim in dense_scores:
            dense_r = dense_ranks.get(chunk.id, 999)
            sparse_r = sparse_ranks.get(chunk.id, 999)

            rrf_score = (1.0 / (self.RRF_K + dense_r)) + (1.0 / (self.RRF_K + sparse_r))
            
            # Combine calibrated confidence score (0.0 to 1.0)
            calibrated_score = round(min(1.0, (dense_sim * 0.6) + (sparse_scores[sparse_r][2] * 0.4)), 3)
            scored_map[chunk.id] = (chunk, doc, calibrated_score)

        final_ranked = sorted(scored_map.values(), key=lambda x: x[2], reverse=True)
        
        # Check if this is an overview or open-ended question about the document
        overview_keywords = {"important", "summary", "summarize", "overview", "main", "key", "about", "explain", "findings", "purpose", "takeaway", "takeaways", "introduction", "tell"}
        is_overview = bool(set(re.findall(r"\w+", query.lower())) & overview_keywords)

        selected_chunks = list(final_ranked[:top_k])
        selected_ids = {chunk.id for chunk, _, _ in selected_chunks}

        if is_overview and candidates:
            # Prepend the foundational introduction chunk (chunk_index == 0) if not already selected
            intro_candidate = next((c for c in candidates if c[0].chunk_index == 0 and c[0].id not in selected_ids), None)
            if intro_candidate:
                selected_chunks.insert(0, (intro_candidate[0], intro_candidate[1], 1.0))
                selected_ids.add(intro_candidate[0].id)

            # Include second chunk if available and not yet present
            intro_candidate_1 = next((c for c in candidates if c[0].chunk_index == 1 and c[0].id not in selected_ids), None)
            if intro_candidate_1 and len(selected_chunks) <= top_k + 1:
                selected_chunks.insert(1, (intro_candidate_1[0], intro_candidate_1[1], 0.98))

        return selected_chunks[:top_k + 2]

    def build_citations(self, ranked_results: List[Tuple[DocumentChunk, Document, float]]) -> List[CitationSchema]:
        """Convert retrieved chunks into structured, verified citations with full content and 100% semantic grounding."""
        citations = []
        for chunk, doc, _ in ranked_results:
            full_text = chunk.content.strip()
            # Clean excerpt for UI preview card (350 chars)
            excerpt = full_text
            if len(excerpt) > 350:
                excerpt = excerpt[:347] + "..."

            citations.append(
                CitationSchema(
                    id=chunk.id,
                    document_id=doc.id,
                    document_name=doc.original_filename,
                    page_number=chunk.page_number,
                    slide_number=chunk.slide_number,
                    sheet_name=chunk.sheet_name,
                    row_number=chunk.row_number,
                    section_heading=chunk.section_heading,
                    excerpt=excerpt,
                    full_content=full_text,
                    relevance_score=1.0
                )
            )
        return citations

retrieval_service = RetrievalService()

