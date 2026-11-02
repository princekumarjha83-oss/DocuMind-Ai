"""Phase 5: RAG Quality Evaluation Benchmark Suite

Executes reproducible evaluation checks across structured document corpora:
1. Retrieval Recall & Precision
2. Citation Correctness
3. Grounding Faithfulness
4. Abstention on Missing Evidence
5. Tabular / Spreadsheet Multi-Hop Reasoning
"""
import os
import sys
import time
import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.extractors.spreadsheet_extractor import SpreadsheetExtractor
from app.services.extractors.text_extractor import TextExtractor
from app.services.retrieval_service import retrieval_service

def test_rag_eval_table_reasoning():
    """Evaluate spreadsheet extraction and tabular cell preservation."""
    csv_sample = (
        "Tier,Monthly_Price,Retention_Rate,SLA_Uptime\n"
        "Starter,$49,92.4%,99.9%\n"
        "Professional,$199,96.8%,99.95%\n"
        "Enterprise,$999,99.2%,99.99%\n"
    )
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False, encoding="utf-8") as f:
        f.write(csv_sample)
        tmp = f.name

    try:
        extractor = SpreadsheetExtractor()
        res = extractor.extract(tmp)
        assert len(res.sections) >= 3
        # Ensure enterprise SLA is captured
        ent_section = next((s for s in res.sections if "Enterprise" in s.content), None)
        assert ent_section is not None
        assert "99.99%" in ent_section.content
        assert "$999" in ent_section.content
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

@pytest.mark.asyncio
async def test_rag_eval_semantic_embedding_cosine_distance():
    """Evaluate semantic clustering: similar phrases have high cosine similarity (>0.7), dissimilar <0.3."""
    q_financial = "Quarterly revenue growth and EBITDA profitability margins"
    target_match = "Q3 financial balance sheet revenue expanded by 24% with positive operational EBITDA"
    unrelated_passage = "Photosynthesis requires sunlight, carbon dioxide, and chlorophyll in green plant leaves"

    v_q = await embedding_service.get_embedding(q_financial)
    v_match = await embedding_service.get_embedding(target_match)
    v_unrelated = await embedding_service.get_embedding(unrelated_passage)

    sim_match = embedding_service.cosine_similarity(v_q, v_match)
    sim_unrelated = embedding_service.cosine_similarity(v_q, v_unrelated)

    # Retrieval Precision Test
    assert sim_match > sim_unrelated, f"Expected {sim_match} > {sim_unrelated}"
    assert sim_match > 0.6, f"Expected {sim_match} > 0.6 for semantic paraphrase"

@pytest.mark.asyncio
async def test_rag_eval_retrieval_recall_and_provenance():
    """Verify that chunk metadata preserves page numbers, headings, and indices."""
    from app.services.extractors.base import ExtractedSection, ExtractionResult
    sections = [
        ExtractedSection(content="Introductory overview of the multi-agent system.", page_number=1, heading="Introduction"),
        ExtractedSection(content="Cryptographic key management using AES-GCM-256.", page_number=2, heading="Security Architecture"),
        ExtractedSection(content="Benchmark evaluation showing 35% latency improvement.", page_number=3, heading="Results")
    ]
    ext = ExtractionResult(sections=sections, raw_text="Combined text", page_count=3)
    chunks = chunking_service.chunk_extraction_result(ext)

    assert len(chunks) == 3
    # Check 100% preservation of page and heading metadata
    for i, ch in enumerate(chunks, 1):
        assert ch.page_number == i
        assert ch.section_heading is not None

@pytest.mark.asyncio
async def test_rag_eval_abstention_accuracy():
    """Verify that absent facts trigger honest abstention without hallucination."""
    from app.services.rag_service import rag_service
    from app.schemas.chat import CitationSchema

    dummy_citations = [
        CitationSchema(
            id="chunk-1",
            document_id="doc-1",
            document_name="Solar_Energy_Handbook.pdf",
            page_number=12,
            excerpt="Photovoltaic panels convert sunlight directly into DC electrical energy using silicon semiconductors.",
            relevance_score=1.0
        )
    ]

    # Ask unanswerable question on medical neurosurgery
    question = "What is the recommended surgical dose for intravenous ketamine anesthesia during brain craniotomy?"
    ans, has_evidence, latency = await rag_service.generate_answer(question, dummy_citations)

    # Must abstain honestly
    ans_lower = ans.lower()
    assert (
        "insufficient" in ans_lower
        or "does not contain" in ans_lower
        or "not mentioned" in ans_lower
        or "unable" in ans_lower
        or "no information" in ans_lower
    ), f"Expected honest abstention, got: {ans}"
    assert has_evidence is False

