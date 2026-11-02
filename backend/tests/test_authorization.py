import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_user_data_isolation(client: AsyncClient):
    # 1. Register User A
    res_a = await client.post("/api/v1/auth/register", json={
        "name": "User Alpha",
        "email": "alpha@documind.ai",
        "password": "PasswordAlpha123!",
        "terms_accepted": True
    })
    token_a = res_a.json()["access_token"]
    user_a_id = res_a.json()["user"]["id"]

    # 2. Register User B
    res_b = await client.post("/api/v1/auth/register", json={
        "name": "User Beta",
        "email": "beta@documind.ai",
        "password": "PasswordBeta123!",
        "terms_accepted": True
    })
    token_b = res_b.json()["access_token"]
    user_b_id = res_b.json()["user"]["id"]

    assert user_a_id != user_b_id

    # 3. User A accessing /api/v1/users/me returns User A's data only
    headers_a = {"Authorization": f"Bearer {token_a}"}
    me_a = await client.get("/api/v1/users/me", headers=headers_a)
    assert me_a.status_code == 200
    assert me_a.json()["id"] == user_a_id
    assert me_a.json()["email"] == "alpha@documind.ai"

    # 4. User B accessing /api/v1/users/me returns User B's data only
    headers_b = {"Authorization": f"Bearer {token_b}"}
    me_b = await client.get("/api/v1/users/me", headers=headers_b)
    assert me_b.status_code == 200
    assert me_b.json()["id"] == user_b_id
    assert me_b.json()["email"] == "beta@documind.ai"

    # 5. User A updating preferences updates only User A
    pref_update_a = await client.patch("/api/v1/users/me/preferences", headers=headers_a, json={
        "theme": "light",
        "language": "es"
    })
    assert pref_update_a.status_code == 200
    assert pref_update_a.json()["theme"] == "light"

    # Verify User B's preferences remain default
    pref_b = await client.get("/api/v1/users/me/preferences", headers=headers_b)
    assert pref_b.status_code == 200
    assert pref_b.json()["theme"] == "dark"  # Default

