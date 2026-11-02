import pytest
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.extractors.base import ExtractedSection, ExtractionResult

@pytest.mark.asyncio
async def test_chunking_preserves_provenance():
    sections = [
        ExtractedSection(content="Page 1 header and intro.", page_number=1, heading="Introduction"),
        ExtractedSection(content="Page 2 technical controls and encrypted keys.", page_number=2, heading="Security"),
        ExtractedSection(content="Slide 3 roadmap and future outlook.", slide_number=3, heading="Roadmap"),
    ]
    extraction = ExtractionResult(sections=sections, raw_text="Combined text", page_count=2)
    chunks = chunking_service.chunk_extraction_result(extraction)

    assert len(chunks) == 3
    assert chunks[0].page_number == 1
    assert chunks[0].section_heading == "Introduction"
    assert chunks[1].page_number == 2
    assert chunks[2].slide_number == 3
    assert chunks[2].section_heading == "Roadmap"

@pytest.mark.asyncio
async def test_embedding_vector_dimensions_and_similarity():
    v1 = await embedding_service.get_embedding("Revenue growth in financial quarters")
    v2 = await embedding_service.get_embedding("Revenue growth and financial quarterly performance")
    v3 = await embedding_service.get_embedding("Completely unrelated topic about gardening and cooking recipes")

    assert len(v1) == embedding_service.EMBEDDING_DIM
    assert len(v2) == embedding_service.EMBEDDING_DIM

    # Semantic similarity between related texts should be higher than unrelated
    sim_related = embedding_service.cosine_similarity(v1, v2)
    sim_unrelated = embedding_service.cosine_similarity(v1, v3)

    assert sim_related > sim_unrelated

