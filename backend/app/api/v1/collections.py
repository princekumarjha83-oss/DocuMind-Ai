import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/collections", tags=["Collections"])

class CollectionSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6366F1"
    documentIds: List[str] = Field(default_factory=list)
    createdAt: str
    updatedAt: str

class CreateCollectionRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6366F1"
    documentIds: Optional[List[str]] = None

# In-memory user collection storage per user
_user_collections: dict = {}

def _get_user_cols(user_id: str) -> List[dict]:
    if user_id not in _user_collections:
        _user_collections[user_id] = [
            {
                "id": "col-1",
                "name": "Financials & Quarterly",
                "description": "Financial reports, balance sheets, investor updates, and audit filings.",
                "color": "#6366F1",
                "documentIds": [],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": "col-2",
                "name": "Engineering & Compliance",
                "description": "Security architectures, API specs, SOC2 policies, and AI research benchmarks.",
                "color": "#06B6D4",
                "documentIds": [],
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
        ]
    return _user_collections[user_id]

@router.get("", response_model=List[CollectionSchema])
async def list_collections(current_user: User = Depends(get_current_user)):
    return _get_user_cols(current_user.id)

@router.post("", response_model=CollectionSchema, status_code=status.HTTP_201_CREATED)
async def create_collection(
    req: CreateCollectionRequest,
    current_user: User = Depends(get_current_user)
):
    cols = _get_user_cols(current_user.id)
    now_iso = datetime.now(timezone.utc).isoformat()
    new_col = {
        "id": f"col-{uuid.uuid4().hex[:8]}",
        "name": req.name,
        "description": req.description or "",
        "color": req.color or "#6366F1",
        "documentIds": req.documentIds or [],
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }
    cols.insert(0, new_col)
    return new_col

@router.delete("/{collection_id}", status_code=status.HTTP_200_OK)
async def delete_collection(
    collection_id: str,
    current_user: User = Depends(get_current_user)
):
    cols = _get_user_cols(current_user.id)
    _user_collections[current_user.id] = [c for c in cols if c["id"] != collection_id]
    return {"success": True, "message": "Collection deleted."}

