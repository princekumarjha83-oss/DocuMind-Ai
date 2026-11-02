import io
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_document_lifecycle_and_rag(client: AsyncClient):
    # 1. Register User A
    user_payload = {
        "name": "DocuMind Tester",
        "email": "doctest@documind.ai",
        "password": "SecurePassword123!",
        "terms_accepted": True
    }
    reg_res = await client.post("/api/v1/auth/register", json=user_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload a sample Markdown document
    doc_content = b"""# Q3 Performance Report
Total revenue reached $48.6M with a 28% year-over-year growth rate.
Gross margin expanded to 74.2% due to vector compression optimizations.
Cash reserves stand at $94.2M providing runway through 2027.
"""
    files = {"file": ("Q3_Report.md", io.BytesIO(doc_content), "text/markdown")}
    upload_res = await client.post("/api/v1/documents/upload", files=files, headers=headers)
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_id is not None
    assert doc_data["name"] == "Q3_Report.md"

    # 3. Check document status
    status_res = await client.get(f"/api/v1/documents/{doc_id}/status", headers=headers)
    assert status_res.status_code == 200

    # 4. List user documents
    list_res = await client.get("/api/v1/documents", headers=headers)
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) >= 1
    assert any(d["id"] == doc_id for d in docs)

    # 5. Query RAG engine
    ask_payload = {
        "question": "What was the revenue and gross margin?",
        "document_ids": [doc_id]
    }
    ask_res = await client.post("/api/v1/chat/ask", json=ask_payload, headers=headers)
    assert ask_res.status_code == 200
    ask_data = ask_res.json()
    assert ask_data["answer"] is not None
    assert "conversation_id" in ask_data

    # 6. Delete document
    del_res = await client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert del_res.status_code == 200

    # Confirm deletion
    get_res = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert get_res.status_code == 404

@pytest.mark.asyncio
async def test_document_tenant_isolation(client: AsyncClient):
    # Register User 1
    u1_res = await client.post("/api/v1/auth/register", json={
        "name": "User One", "email": "user1@documind.ai", "password": "Password123!", "terms_accepted": True
    })
    token1 = u1_res.json()["access_token"]
    h1 = {"Authorization": f"Bearer {token1}"}

    # Register User 2
    u2_res = await client.post("/api/v1/auth/register", json={
        "name": "User Two", "email": "user2@documind.ai", "password": "Password123!", "terms_accepted": True
    })
    token2 = u2_res.json()["access_token"]
    h2 = {"Authorization": f"Bearer {token2}"}

    # User 1 uploads confidential file
    files = {"file": ("Confidential.txt", io.BytesIO(b"Secret merger details between Corp A and Corp B"), "text/plain")}
    up1 = await client.post("/api/v1/documents/upload", files=files, headers=h1)
    doc1_id = up1.json()["id"]

    # User 2 tries to access User 1's document (should be 404)
    access_attempt = await client.get(f"/api/v1/documents/{doc1_id}", headers=h2)
    assert access_attempt.status_code == 404

    # User 2 tries to delete User 1's document (should be 404)
    del_attempt = await client.delete(f"/api/v1/documents/{doc1_id}", headers=h2)
    assert del_attempt.status_code == 404

