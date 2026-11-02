from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    last_message_snippet: Optional[str] = None
    message_count: int
    created_at: datetime
    updated_at: datetime
