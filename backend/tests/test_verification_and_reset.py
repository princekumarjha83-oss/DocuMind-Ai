from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_token
from app.models.token import EmailVerificationToken, PasswordResetToken
from app.models.user import User

@pytest.mark.asyncio
async def test_email_verification_flow(client: AsyncClient, db_session: AsyncSession):
    # Register user
    reg_res = await client.post("/api/v1/auth/register", json={
        "name": "Verify Me",
        "email": "verifyme@documind.ai",
        "password": "Password123!",
        "terms_accepted": True
    })
    assert reg_res.status_code == 201

    # Retrieve user and verification token from db
    result = await db_session.execute(select(User).where(User.email == "verifyme@documind.ai"))
    user = result.scalar_one()

    # Create known test verification token
    raw_token = "valid_test_verification_token_12345"
    token_record = EmailVerificationToken(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        is_used=False
    )
    db_session.add(token_record)
    await db_session.commit()

    # 1. Verify email with valid token
    verify_res = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True

    # 2. Attempt reused token (must be rejected)
    reused_res = await client.post("/api/v1/auth/verify-email", json={"token": raw_token})
    assert reused_res.status_code == 400

@pytest.mark.asyncio
async def test_password_reset_flow(client: AsyncClient, db_session: AsyncSession):
    # Register user
    await client.post("/api/v1/auth/register", json={
        "name": "Reset Tester",
        "email": "resettester@documind.ai",
        "password": "InitialPassword123!",
        "terms_accepted": True
    })

    # 1. Request password reset (must succeed generically even for non-existent emails)
    req1 = await client.post("/api/v1/auth/forgot-password", json={"email": "resettester@documind.ai"})
    assert req1.status_code == 200
    assert req1.json()["success"] is True

    req2 = await client.post("/api/v1/auth/forgot-password", json={"email": "unknown@nowhere.com"})
    assert req2.status_code == 200
    assert req2.json()["success"] is True

    # 2. Create test reset token
    result = await db_session.execute(select(User).where(User.email == "resettester@documind.ai"))
    user = result.scalar_one()

    raw_reset_token = "valid_test_password_reset_token_67890"
    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_token(raw_reset_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        is_used=False
    )
    db_session.add(reset_record)
    await db_session.commit()

    # 3. Reset password using token
    reset_res = await client.post("/api/v1/auth/reset-password", json={
        "token": raw_reset_token,
        "new_password": "NewSecretPassword123!",
        "confirm_password": "NewSecretPassword123!"
    })
    assert reset_res.status_code == 200

    # 4. Old password must be rejected
    old_login = await client.post("/api/v1/auth/login", json={
        "email": "resettester@documind.ai",
        "password": "InitialPassword123!"
    })
    assert old_login.status_code == 401

    # 5. New password must authenticate
    new_login = await client.post("/api/v1/auth/login", json={
        "email": "resettester@documind.ai",
        "password": "NewSecretPassword123!"
    })
    assert new_login.status_code == 200

