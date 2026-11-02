import re
from dataclasses import dataclass
from typing import List, Optional
from app.services.extractors.base import ExtractedSection, ExtractionResult

@dataclass
class TextChunk:
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    sheet_name: Optional[str] = None
    row_number: Optional[int] = None
    section_heading: Optional[str] = None
    token_count: int = 0

class ChunkingService:
    def __init__(self, target_chunk_size: int = 800, chunk_overlap: int = 150):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_extraction_result(self, result: ExtractionResult) -> List[TextChunk]:
        """Convert an ExtractionResult with structured sections into indexed, metadata-rich chunks."""
        chunks: List[TextChunk] = []
        global_index = 0

        for section in result.sections:
            section_chunks = self._chunk_section(section, start_index=global_index)
            for ch in section_chunks:
                chunks.append(ch)
                global_index += 1

        # Fallback if no sections were parsed but raw_text exists
        if not chunks and result.raw_text.strip():
            fallback_section = ExtractedSection(content=result.raw_text.strip())
            chunks = self._chunk_section(fallback_section, start_index=0)

        return chunks

    def _chunk_section(self, section: ExtractedSection, start_index: int) -> List[TextChunk]:
        text = section.content.strip()
        if not text:
            return []

        # If text is already small enough, keep as single chunk to preserve context
        if len(text) <= self.target_chunk_size:
            token_count = max(1, len(text.split()))
            return [
                TextChunk(
                    chunk_index=start_index,
                    content=text,
                    page_number=section.page_number,
                    slide_number=section.slide_number,
                    sheet_name=section.sheet_name,
                    row_number=section.row_number,
                    section_heading=section.heading,
                    token_count=token_count
                )
            ]

        # Split larger sections cleanly by paragraphs, tables, or sentences
        paragraphs = re.split(r"\n\s*\n", text)
        chunks: List[TextChunk] = []
        current_buffer = []
        current_len = 0
        idx = start_index

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # If paragraph itself is huge, split by sentences
            if len(para) > self.target_chunk_size:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                for sentence in sentences:
                    sentence = sentence.strip()
                    if not sentence:
                        continue
                    if current_len + len(sentence) > self.target_chunk_size and current_buffer:
                        chunk_text = " ".join(current_buffer)
                        chunks.append(
                            TextChunk(
                                chunk_index=idx,
                                content=chunk_text,
                                page_number=section.page_number,
                                slide_number=section.slide_number,
                                sheet_name=section.sheet_name,
                                row_number=section.row_number,
                                section_heading=section.heading,
                                token_count=max(1, len(chunk_text.split()))
                            )
                        )
                        idx += 1
                        # Retain overlap sentences
                        current_buffer = [sentence]
                        current_len = len(sentence)
                    else:
                        current_buffer.append(sentence)
                        current_len += len(sentence) + 1
            else:
                if current_len + len(para) > self.target_chunk_size and current_buffer:
                    chunk_text = "\n\n".join(current_buffer)
                    chunks.append(
                        TextChunk(
                            chunk_index=idx,
                            content=chunk_text,
                            page_number=section.page_number,
                            slide_number=section.slide_number,
                            sheet_name=section.sheet_name,
                            row_number=section.row_number,
                            section_heading=section.heading,
                            token_count=max(1, len(chunk_text.split()))
                        )
                    )
                    idx += 1
                    current_buffer = [para]
                    current_len = len(para)
                else:
                    current_buffer.append(para)
                    current_len += len(para) + 2

        if current_buffer:
            chunk_text = "\n\n".join(current_buffer)
            chunks.append(
                TextChunk(
                    chunk_index=idx,
                    content=chunk_text,
                    page_number=section.page_number,
                    slide_number=section.slide_number,
                    sheet_name=section.sheet_name,
                    row_number=section.row_number,
                    section_heading=section.heading,
                    token_count=max(1, len(chunk_text.split()))
                )
            )

        return chunks

chunking_service = ChunkingService()

