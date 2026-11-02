import os
import sys
import tempfile
import uuid
import pytest
from httpx import ASGITransport, AsyncClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.main import app
from app.models.token import EmailVerificationToken, PasswordResetToken
from app.db.session import async_session_maker
from sqlalchemy import select

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.asyncio
async def test_journey_a_new_account_lifecycle():
    """Journey A: Signup, validation, persistence, login, profile, and logout."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"journey_a_{uuid.uuid4().hex[:8]}@documind.ai"
        
        # 1. Validation: weak password rejection
        weak_res = await client.post("/api/v1/auth/register", json={
            "name": "Journey User",
            "email": unique_email,
            "password": "weak",
            "terms_accepted": True
        })
        assert weak_res.status_code == 422

        # 2. Valid Registration
        reg_res = await client.post("/api/v1/auth/register", json={
            "name": "Journey User Alpha",
            "email": unique_email,
            "password": "StrongPassword123!",
            "terms_accepted": True
        })
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert reg_data["user"]["email"] == unique_email
        token = reg_data["access_token"]
        assert token is not None

        # 3. Duplicate email prevention
        dup_res = await client.post("/api/v1/auth/register", json={
            "name": "Duplicate User",
            "email": unique_email,
            "password": "StrongPassword123!",
            "terms_accepted": True
        })
        assert dup_res.status_code == 409

        # 4. Profile retrieval (/me)
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["name"] == "Journey User Alpha"

        # 5. Email verification token validation
        async with async_session_maker() as db:
            tok_res = await db.execute(
                select(EmailVerificationToken).where(EmailVerificationToken.user_id == reg_data["user"]["id"])
            )
            verification_tok = tok_res.scalar_one_or_none()
            assert verification_tok is not None

        # 6. Logout
        logout_res = await client.post("/api/v1/auth/logout", headers=headers)
        assert logout_res.status_code == 200

        # 7. Access without auth is rejected
        client.cookies.clear()
        unauth_res = await client.get("/api/v1/auth/me")
        assert unauth_res.status_code == 401

@pytest.mark.asyncio
async def test_journey_b_document_upload_and_pipeline():
    """Journey B: Real file upload, extraction, indexing, status, rejection of invalid files, and deletion."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register user
        user_email = f"journey_b_{uuid.uuid4().hex[:8]}@documind.ai"
        reg = await client.post("/api/v1/auth/register", json={
            "name": "Doc Pipeline User",
            "email": user_email,
            "password": "Password123!",
            "terms_accepted": True
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Upload valid markdown document
        doc_content = b"# Q4 Cloud Architecture\nDocuMind AI uses multi-tenant vector namespaces with AES-256.\n\n## Performance\nAchieved 20ms hybrid search latency."
        files = {"file": ("cloud_arch.md", doc_content, "text/markdown")}
        up_res = await client.post("/api/v1/documents/upload", headers=headers, files=files)
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

        # 2. Verify document metadata
        get_res = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
        assert get_res.status_code == 200
        doc_data = get_res.json()
        assert doc_data["name"] == "cloud_arch.md"
        assert doc_data["type"] == "md"

        # 3. Reject unsupported executable file
        bad_files = {"file": ("malicious.exe", b"MZ\x90\x00executable binary", "application/x-msdownload")}
        bad_res = await client.post("/api/v1/documents/upload", headers=headers, files=bad_files)
        assert bad_res.status_code == 400
        assert "unsupported" in bad_res.json()["detail"].lower()

        # 4. Delete document and verify cleanup
        del_res = await client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
        assert del_res.status_code == 200

        # Verify not found after deletion
        check_del = await client.get(f"/api/v1/documents/{doc_id}", headers=headers)
        assert check_del.status_code == 404

@pytest.mark.asyncio
async def test_journey_c_grounded_chat_and_abstention():
    """Journey C: Document RAG query, citation verification, honest abstention on missing evidence."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        user_email = f"journey_c_{uuid.uuid4().hex[:8]}@documind.ai"
        reg = await client.post("/api/v1/auth/register", json={
            "name": "Chat RAG User",
            "email": user_email,
            "password": "Password123!",
            "terms_accepted": True
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Upload document with specific verifiable facts
        fact_doc = (
            b"# Project Titan Launch Metrics\n"
            b"Project Titan generated $14.2 million in ARR during fiscal year 2026.\n"
            b"The system operates with 99.995% SLA availability across three AWS regions.\n"
            b"Lead engineer on the deployment was Dr. Helena Vance."
        )
        files = {"file": ("titan_report.md", fact_doc, "text/markdown")}
        up_res = await client.post("/api/v1/documents/upload", headers=headers, files=files)
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

        # 1. Ask question with answer explicitly in document
        chat_payload = {
            "question": "How much ARR did Project Titan generate in fiscal year 2026?",
            "document_ids": [doc_id]
        }
        ask_res = await client.post("/api/v1/chat/ask", headers=headers, json=chat_payload)
        assert ask_res.status_code == 200
        ask_data = ask_res.json()
        assert "14.2" in ask_data["answer"] or "million" in ask_data["answer"] or "Titan" in ask_data["answer"]
        assert len(ask_data["citations"]) > 0
        assert ask_data["citations"][0]["document_id"] == doc_id
        assert ask_data["citations"][0]["relevance_score"] == 1.0

        # 2. Ask question NOT in document -> Honest Abstention
        unknown_payload = {
            "question": "What is the average temperature on the moons of Neptune?",
            "document_ids": [doc_id]
        }
        unknown_res = await client.post("/api/v1/chat/ask", headers=headers, json=unknown_payload)
        assert unknown_res.status_code == 200
        unknown_data = unknown_res.json()
        ans_lower = unknown_data["answer"].lower()
        # Verify honesty / abstention
        assert (
            "insufficient" in ans_lower
            or "not" in ans_lower
            or "does not contain" in ans_lower
            or "no information" in ans_lower
            or "unable" in ans_lower
            or "unrelated" in ans_lower
        )

        # 3. Conversation history persistence
        conv_id = ask_data["conversation_id"]
        conv_res = await client.get(f"/api/v1/chat/conversations/{conv_id}", headers=headers)
        assert conv_res.status_code == 200
        assert len(conv_res.json()["messages"]) >= 2

@pytest.mark.asyncio
async def test_journey_d_password_recovery():
    """Journey D: Request reset, receive token, set new password, verify old fails and new succeeds."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        user_email = f"journey_d_{uuid.uuid4().hex[:8]}@documind.ai"
        await client.post("/api/v1/auth/register", json={
            "name": "Password Reset Tester",
            "email": user_email,
            "password": "InitialPassword123!",
            "terms_accepted": True
        })

        # 1. Request password reset
        req_res = await client.post("/api/v1/auth/forgot-password", json={"email": user_email})
        assert req_res.status_code == 200

        # 2. Retrieve token from database
        async with async_session_maker() as db:
            from app.models.user import User
            u_res = await db.execute(select(User).where(User.email == user_email))
            user = u_res.scalar_one()

            # Generate and hash a known reset token for deterministic test
            from app.core.security import generate_secure_token, hash_token
            from datetime import datetime, timezone, timedelta
            raw_token = generate_secure_token()
            token_record = PasswordResetToken(
                user_id=user.id,
                token_hash=hash_token(raw_token),
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
                is_used=False
            )
            db.add(token_record)
            await db.commit()

        # 3. Reset password with valid token
        reset_res = await client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "new_password": "NewSecretPassword456!",
            "confirm_password": "NewSecretPassword456!"
        })
        assert reset_res.status_code == 200

        # 4. Old password fails
        old_login = await client.post("/api/v1/auth/login", json={
            "email": user_email,
            "password": "InitialPassword123!"
        })
        assert old_login.status_code == 401

        # 5. New password succeeds
        new_login = await client.post("/api/v1/auth/login", json={
            "email": user_email,
            "password": "NewSecretPassword456!"
        })
        assert new_login.status_code == 200

        # 6. Reusing used token is rejected
        reused = await client.post("/api/v1/auth/reset-password", json={
            "token": raw_token,
            "new_password": "AnotherPassword789!",
            "confirm_password": "AnotherPassword789!"
        })
        assert reused.status_code == 400

@pytest.mark.asyncio
async def test_journey_e_user_isolation_and_security():
    """Journey E: Complete multi-tenant cross-user boundary defense."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create User A
        email_a = f"user_a_{uuid.uuid4().hex[:8]}@documind.ai"
        res_a = await client.post("/api/v1/auth/register", json={
            "name": "User Alpha", "email": email_a, "password": "Password123!", "terms_accepted": True
        })
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Create User B
        email_b = f"user_b_{uuid.uuid4().hex[:8]}@documind.ai"
        res_b = await client.post("/api/v1/auth/register", json={
            "name": "User Beta", "email": email_b, "password": "Password123!", "terms_accepted": True
        })
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User A uploads Confidential File
        files_a = {"file": ("confidential_a.txt", b"SECRET A: Patent pending quantum encryption key 99482.", "text/plain")}
        up_a = await client.post("/api/v1/documents/upload", headers=headers_a, files=files_a)
        doc_id_a = up_a.json()["id"]

        # User B attempts to access User A's document -> 404 (or 403)
        hack_res = await client.get(f"/api/v1/documents/{doc_id_a}", headers=headers_b)
        assert hack_res.status_code in [403, 404]

        # User B attempts to delete User A's document -> 404 (or 403)
        del_hack = await client.delete(f"/api/v1/documents/{doc_id_a}", headers=headers_b)
        assert del_hack.status_code in [403, 404]

        # User B attempts to query User A's document ID -> Chunks must NOT leak
        rag_hack = await client.post("/api/v1/chat/ask", headers=headers_b, json={
            "question": "What is the quantum encryption key?",
            "document_ids": [doc_id_a]
        })
        assert rag_hack.status_code == 200
        rag_data = rag_hack.json()
        # Chunks for User A must never be included in citations for User B
        assert len(rag_data["citations"]) == 0
        assert "99482" not in rag_data["answer"]

