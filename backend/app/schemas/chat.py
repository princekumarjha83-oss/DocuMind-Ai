from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class CitationSchema(BaseModel):
    id: str
    documentId: str = Field(alias="document_id")
    document_id: str
    documentName: str = Field(alias="document_name")
    document_name: str
    pageNumber: Optional[int] = Field(alias="page_number", default=None)
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    sheet_name: Optional[str] = None
    row_number: Optional[int] = None
    sectionHeading: Optional[str] = Field(alias="section_heading", default=None)
    section_heading: Optional[str] = None
    excerpt: str
    full_content: Optional[str] = None
    relevanceScore: float = Field(alias="relevance_score", default=0.9)
    relevance_score: float = 0.9

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ChatMessageSchema(BaseModel):
    id: str
    role: str
    content: str
    timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None
    citations: Optional[List[CitationSchema]] = None
    token_count: Optional[int] = None
    status: Optional[str] = "complete"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ConversationSchema(BaseModel):
    id: str
    title: str
    documentIds: List[str] = Field(alias="document_ids", default=[])
    document_ids: List[str] = []
    documentNames: List[str] = Field(alias="document_names", default=[])
    document_names: List[str] = []
    createdAt: datetime = Field(alias="created_at")
    created_at: datetime
    updatedAt: datetime = Field(alias="updated_at")
    updated_at: datetime
    lastMessageSnippet: Optional[str] = Field(alias="last_message_snippet", default=None)
    last_message_snippet: Optional[str] = None
    messageCount: int = Field(alias="message_count", default=0)
    message_count: int = 0
    messages: Optional[List[ChatMessageSchema]] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Intelligence Chat"
    document_ids: Optional[List[str]] = []
    documentIds: Optional[List[str]] = []

class UpdateConversationRequest(BaseModel):
    title: Optional[str] = None
    document_ids: Optional[List[str]] = None
    documentIds: Optional[List[str]] = None

class AskQuestionRequest(BaseModel):
    conversation_id: Optional[str] = None
    conversationId: Optional[str] = None
    question: Optional[str] = None
    message: Optional[str] = None  # Compatible with frontend payload.message
    document_ids: Optional[List[str]] = []
    documentIds: Optional[List[str]] = []
    model: Optional[str] = None  # Specific Groq model e.g. 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b'
    include_general_knowledge: bool = False

class AskQuestionResponse(BaseModel):
    conversationId: str = Field(alias="conversation_id")
    conversation_id: str
    answer: str
    message: Optional[ChatMessageSchema] = None
    citations: List[CitationSchema]
    has_sufficient_evidence: bool = True
    suggested_followups: Optional[List[str]] = []
    latency_ms: Optional[int] = None
    token_usage: Optional[Dict[str, int]] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class SummarizeRequest(BaseModel):
    document_id: str
    format: str = "concise"  # 'concise' | 'detailed' | 'key_points' | 'action_items'

class SummarizeResponse(BaseModel):
    document_id: str
    format: str
    summary: str
    key_points: Optional[List[str]] = []
    action_items: Optional[List[Dict[str, Any]]] = []
    citations: List[CitationSchema] = []

class CompareRequest(BaseModel):
    document_ids: List[str]
    focus_topic: Optional[str] = None

class CompareResponse(BaseModel):
    document_ids: List[str]
    comparison_summary: str
    similarities: List[str]
    differences: List[str]
    citations: List[CitationSchema]

class ExtractRequest(BaseModel):
    document_id: str
    schema_fields: List[str]

class ExtractResponse(BaseModel):
    document_id: str
    extracted_data: Dict[str, Any]
    citations: List[CitationSchema]
