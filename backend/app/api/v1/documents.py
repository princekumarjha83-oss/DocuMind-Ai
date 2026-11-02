import os
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.db.session import async_session_maker, get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import (
    DocumentBatchUploadResponse,
    DocumentResponse,
    DocumentStatusResponse,
    DocumentUploadResponse,
)
from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])

async def run_document_processing_job(document_id: str):
    """Background task worker using an isolated database session."""
    async with async_session_maker() as db:
        await document_service.process_document_pipeline(db, document_id)

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a supported document, store privately, and trigger asynchronous processing."""
    try:
        file_type, mime_type = document_service.validate_file(file)
        file_id, storage_path, file_size = await document_service.save_uploaded_file(file, current_user.id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    # Persist document metadata
    doc = Document(
        id=file_id,
        owner_id=current_user.id,
        original_filename=os.path.basename(file.filename or "uploaded_file"),
        storage_path=storage_path,
        mime_type=mime_type,
        file_type=file_type,
        file_size_bytes=file_size,
        processing_status="queued",
        processing_stage="Queued for processing",
        processing_progress=5
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Enqueue background intelligence extraction and indexing (or process inline during in-memory tests)
    is_test_env = getattr(db.bind, "url", None) and str(db.bind.url).startswith("sqlite+aiosqlite:///:memory:")
    if is_test_env:
        await document_service.process_document_pipeline(db, doc.id)
    else:
        background_tasks.add_task(run_document_processing_job, doc.id)

    return DocumentUploadResponse(
        id=doc.id,
        name=doc.original_filename,
        size=doc.file_size_bytes,
        type=doc.file_type,
        status=doc.processing_status,
        message="Document uploaded successfully. Processing pipeline started."
    )

@router.post("/upload-batch", response_model=DocumentBatchUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document_batch(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload multiple documents in a single operation."""
    uploaded_docs = []

    for file in files:
        try:
            file_type, mime_type = document_service.validate_file(file)
            file_id, storage_path, file_size = await document_service.save_uploaded_file(file, current_user.id)

            doc = Document(
                id=file_id,
                owner_id=current_user.id,
                original_filename=os.path.basename(file.filename or "uploaded_file"),
                storage_path=storage_path,
                mime_type=mime_type,
                file_type=file_type,
                file_size_bytes=file_size,
                processing_status="queued",
                processing_stage="Queued for processing",
                processing_progress=5
            )
            db.add(doc)
            await db.commit()
            await db.refresh(doc)

            is_test_env = getattr(db.bind, "url", None) and str(db.bind.url).startswith("sqlite+aiosqlite:///:memory:")
            if is_test_env:
                await document_service.process_document_pipeline(db, doc.id)
            else:
                background_tasks.add_task(run_document_processing_job, doc.id)

            uploaded_docs.append(
                DocumentUploadResponse(
                    id=doc.id,
                    name=doc.original_filename,
                    size=doc.file_size_bytes,
                    type=doc.file_type,
                    status=doc.processing_status,
                    message="Uploaded and queued for processing."
                )
            )
        except Exception as e:
            uploaded_docs.append(
                DocumentUploadResponse(
                    id="error",
                    name=file.filename or "unknown",
                    size=0,
                    type="unknown",
                    status="failed",
                    message=f"Failed to upload: {str(e)}"
                )
            )

    return DocumentBatchUploadResponse(documents=uploaded_docs)

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    file_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status")
):
    """List authenticated user's documents with strict tenant isolation."""
    stmt = select(Document).where(Document.owner_id == current_user.id).order_by(desc(Document.created_at))

    if file_type:
        stmt = stmt.where(Document.file_type == file_type)
    if status_filter:
        stmt = stmt.where(Document.processing_status == status_filter)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve document details by ID verifying ownership."""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return doc

@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get real-time document processing progress and stage for frontend polling."""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return DocumentStatusResponse(
        id=doc.id,
        status=doc.processing_status,
        stage=doc.processing_stage,
        progress=doc.processing_progress,
        page_count=doc.page_count,
        chunks_count=doc.chunks_count,
        error=doc.error_details
    )

@router.get("/{document_id}/content")
async def get_document_content(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get extracted text preview of an authorized document."""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    return {
        "id": doc.id,
        "name": doc.original_filename,
        "page_count": doc.page_count,
        "extracted_text": doc.extracted_text or "No text content extracted."
    }

@router.post("/{document_id}/retry", response_model=DocumentStatusResponse)
async def retry_document_processing(
    document_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retry processing a failed document."""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    doc.processing_status = "queued"
    doc.processing_stage = "Re-queued for processing"
    doc.processing_progress = 5
    doc.error_details = None
    await db.commit()

    background_tasks.add_task(run_document_processing_job, doc.id)

    return DocumentStatusResponse(
        id=doc.id,
        status=doc.processing_status,
        stage=doc.processing_stage,
        progress=doc.processing_progress,
        page_count=doc.page_count,
        chunks_count=doc.chunks_count,
        error=None
    )

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a document, its stored file, and associated chunks with ownership validation."""
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    await document_service.delete_document_safely(db, doc)
    return {"success": True, "message": "Document deleted successfully."}
