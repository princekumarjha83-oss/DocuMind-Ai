from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator

class DocumentResponse(BaseModel):
    id: str
    original_filename: str = Field(alias="original_filename")
    name: Optional[str] = None
    file_size_bytes: int = Field(alias="file_size_bytes")
    size: Optional[int] = None
    file_type: str = Field(alias="file_type")
    type: Optional[str] = None
    processing_status: str = Field(alias="processing_status")
    status: Optional[str] = None
    processing_stage: str = Field(alias="processing_stage", default="ready")
    stage: Optional[str] = "ready"
    processing_progress: int = Field(alias="processing_progress", default=100)
    progress: Optional[int] = 100
    
    # Support both camelCase and snake_case for frontend & API compatibility
    created_at: datetime = Field(alias="created_at")
    uploadedAt: Optional[datetime] = None
    uploaded_at: Optional[datetime] = None
    page_count: Optional[int] = None
    pageCount: Optional[int] = None
    chunks_count: Optional[int] = None
    chunksCount: Optional[int] = None
    collection_id: Optional[str] = None
    collectionId: Optional[str] = None
    summary: Optional[str] = None
    extracted_text: Optional[str] = None
    extractedText: Optional[str] = None
    error_details: Optional[str] = None
    error: Optional[str] = None
    is_ocr_used: bool = False

    @model_validator(mode="after")
    def populate_dual_names(self):
        if not self.name:
            self.name = self.original_filename
        if self.size is None:
            self.size = self.file_size_bytes
        if not self.type:
            self.type = self.file_type
        if not self.status:
            self.status = self.processing_status
        if not self.stage:
            self.stage = self.processing_stage
        if self.progress is None:
            self.progress = self.processing_progress
        if self.uploadedAt is None:
            self.uploadedAt = self.created_at
        if self.uploaded_at is None:
            self.uploaded_at = self.created_at
        if self.pageCount is None:
            self.pageCount = self.page_count
        if self.chunksCount is None:
            self.chunksCount = self.chunks_count
        if self.collectionId is None:
            self.collectionId = self.collection_id
        if self.extractedText is None:
            self.extractedText = self.extracted_text
        if self.error is None:
            self.error = self.error_details
        return self

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class DocumentUploadResponse(BaseModel):
    id: str
    name: str
    size: int
    type: str
    status: str
    message: str

class DocumentBatchUploadResponse(BaseModel):
    documents: List[DocumentUploadResponse]

class DocumentStatusResponse(BaseModel):
    id: str
    status: str
    stage: str
    progress: int
    pageCount: Optional[int] = Field(alias="page_count", default=None)
    page_count: Optional[int] = None
    chunksCount: Optional[int] = Field(alias="chunks_count", default=None)
    chunks_count: Optional[int] = None
    error: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class DocumentChunkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    sheet_name: Optional[str] = None
    row_number: Optional[int] = None
    section_heading: Optional[str] = None
    token_count: Optional[int] = None
