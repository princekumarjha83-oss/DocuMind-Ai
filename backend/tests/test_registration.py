import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

@pytest.mark.asyncio
async def test_valid_registration(client: AsyncClient, db_session: AsyncSession):
    payload = {
        "name": "Dr. Sarah Connor",
        "email": "sarah.connor@cyberdyne.org",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "terms_accepted": True
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sarah.connor@cyberdyne.org"
    assert data["user"]["name"] == "Dr. Sarah Connor"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

    # Verify database record
    result = await db_session.execute(select(User).where(User.email == "sarah.connor@cyberdyne.org"))
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.password_hash.startswith("$argon2id$")
    assert user.password_hash != "Password123!"

@pytest.mark.asyncio
async def test_invalid_email(client: AsyncClient):
    payload = {
        "name": "Invalid Email",
        "email": "not-an-email",
        "password": "Password123!",
        "terms_accepted": True
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_weak_password_rejected(client: AsyncClient):
    payload = {
        "name": "Weak Pass",
        "email": "weak@example.com",
        "password": "short",
        "terms_accepted": True
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_duplicate_email_registration(client: AsyncClient):
    payload = {
        "name": "Original User",
        "email": "duplicate@example.com",
        "password": "Password123!",
        "terms_accepted": True
    }
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt duplicate
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()

