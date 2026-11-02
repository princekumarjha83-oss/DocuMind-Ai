import json
import logging
import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.base import get_utc_now
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.extractors.registry import extract_document

logger = logging.getLogger("documind.document_service")

# Storage directory for private uploaded files
STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "uploads"))
os.makedirs(STORAGE_DIR, exist_ok=True)

# 50 MB max file size
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

SUPPORTED_EXTENSIONS = {
    ".pdf": ("pdf", "application/pdf"),
    ".docx": ("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ".txt": ("txt", "text/plain"),
    ".md": ("md", "text/markdown"),
    ".markdown": ("md", "text/markdown"),
    ".csv": ("csv", "text/csv"),
    ".xlsx": ("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    ".xls": ("xls", "application/vnd.ms-excel"),
    ".pptx": ("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    ".json": ("json", "application/json"),
}

class DocumentService:
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[str, str]:
        """Validate filename, extension, and content type."""
        if not file.filename:
            raise ValueError("No filename provided.")

        # Sanitize filename against path traversal
        filename = os.path.basename(file.filename)
        ext = os.path.splitext(filename)[1].lower()

        if ext not in SUPPORTED_EXTENSIONS:
            supported = ", ".join(sorted(SUPPORTED_EXTENSIONS.keys()))
            raise ValueError(f"Unsupported file format '{ext}'. Supported formats: {supported}")

        file_type, default_mime = SUPPORTED_EXTENSIONS[ext]
        mime_type = file.content_type or default_mime
        return file_type, mime_type

    @staticmethod
    async def save_uploaded_file(file: UploadFile, owner_id: str) -> Tuple[str, str, int]:
        """Store uploaded file into private storage with secure UUID name."""
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1].lower()
        storage_filename = f"{owner_id}_{file_id}{ext}"
        storage_path = os.path.join(STORAGE_DIR, storage_filename)

        total_bytes = 0
        with open(storage_path, "wb") as f_out:
            while chunk := await file.read(1024 * 1024):  # 1MB buffer
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    # Cleanup partial file
                    f_out.close()
                    if os.path.exists(storage_path):
                        os.remove(storage_path)
                    raise ValueError(f"File size exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.")
                f_out.write(chunk)

        return file_id, storage_path, total_bytes

    @classmethod
    async def process_document_pipeline(cls, db: AsyncSession, document_id: str):
        """Asynchronous document intelligence pipeline: Extract -> Chunk -> Embed -> Index -> Ready."""
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            logger.error(f"Document {document_id} not found for processing.")
            return

        try:
            # 1. Stage: Validating & Extracting (Progress 20%)
            doc.processing_status = "extracting"
            doc.processing_stage = "Extracting text and structural metadata"
            doc.processing_progress = 20
            await db.commit()

            if not os.path.exists(doc.storage_path):
                raise FileNotFoundError(f"Storage file missing: {doc.storage_path}")

            extraction = extract_document(doc.storage_path)
            doc.page_count = extraction.page_count
            cleaned_preview = (extraction.raw_text or "").replace("\x00", "").encode("utf-8", "ignore").decode("utf-8", "ignore")
            doc.extracted_text = cleaned_preview[:10000]
            doc.is_ocr_used = extraction.is_ocr_used

            # 2. Stage: Chunking (Progress 45%)
            doc.processing_status = "chunking"
            doc.processing_stage = "Generating semantic text chunks"
            doc.processing_progress = 45
            await db.commit()

            chunks = chunking_service.chunk_extraction_result(extraction)
            doc.chunks_count = len(chunks)

            # Defensive handling for documents with minimal or non-extractable text
            if not chunks:
                doc.processing_status = "ready"
                doc.processing_stage = "Ready (minimal text detected)"
                doc.processing_progress = 100
                doc.summary = "Document indexed. Minimal selectable text was detected."
                doc.updated_at = get_utc_now()
                await db.commit()
                return

            # 3. Stage: Embedding (Progress 70%)
            doc.processing_status = "embedding"
            doc.processing_stage = "Vectorizing semantic embeddings"
            doc.processing_progress = 70
            await db.commit()

            chunk_texts = [(c.content or "").replace("\x00", "").encode("utf-8", "ignore").decode("utf-8", "ignore") for c in chunks]
            embeddings = await embedding_service.get_embeddings_batch(chunk_texts)

            # 4. Stage: Indexing (Progress 90%)
            doc.processing_status = "indexing"
            doc.processing_stage = "Indexing vectors and building search catalogue"
            doc.processing_progress = 90
            await db.commit()

            # Clean any old chunks for idempotency
            await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))

            for idx, ch in enumerate(chunks):
                vec = embeddings[idx] if idx < len(embeddings) else []
                clean_chunk_content = (ch.content or "").replace("\x00", "").encode("utf-8", "ignore").decode("utf-8", "ignore")
                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    owner_id=doc.owner_id,
                    chunk_index=ch.chunk_index,
                    content=clean_chunk_content,
                    page_number=ch.page_number,
                    slide_number=ch.slide_number,
                    sheet_name=ch.sheet_name,
                    row_number=ch.row_number,
                    section_heading=ch.section_heading,
                    token_count=ch.token_count,
                    embedding_json=json.dumps(vec)
                )
                db.add(chunk_record)

            # 5. Stage: Ready (Progress 100%)
            doc.processing_status = "ready"
            doc.processing_stage = "Document ready for intelligence queries"
            doc.processing_progress = 100
            doc.summary = extraction.raw_text[:400] + "..." if len(extraction.raw_text) > 400 else extraction.raw_text
            doc.error_details = "; ".join(extraction.warnings) if extraction.warnings else None
            doc.updated_at = get_utc_now()
            await db.commit()

            logger.info(f"Successfully processed document {doc.id} ({doc.original_filename}): {len(chunks)} chunks indexed.")

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}", exc_info=True)
            doc.processing_status = "failed"
            doc.processing_stage = "Processing failed"
            doc.processing_progress = 0
            doc.error_details = str(e)
            await db.commit()

    @staticmethod
    async def delete_document_safely(db: AsyncSession, doc: Document):
        """Delete document record, associated chunks, and private disk storage."""
        # 1. Remove file on disk
        if doc.storage_path and os.path.exists(doc.storage_path):
            try:
                os.remove(doc.storage_path)
            except Exception as e:
                logger.warning(f"Failed to delete file from disk: {e}")

        # 2. Database cascade deletes document and its chunks
        await db.delete(doc)
        await db.commit()

document_service = DocumentService()

