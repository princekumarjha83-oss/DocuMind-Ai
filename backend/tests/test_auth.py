import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success_and_logout(client: AsyncClient):
    # 1. Register user
    reg_payload = {
        "name": "Auth Tester",
        "email": "authtest@documind.ai",
        "password": "SecurePassword123!",
        "terms_accepted": True
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201

    # 2. Login
    login_payload = {
        "email": "authtest@documind.ai",
        "password": "SecurePassword123!",
        "remember_me": True
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # 3. Access protected route with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "authtest@documind.ai"

    # 4. Access protected route without token and without cookie (401)
    client.cookies.clear()
    unauth_res = await client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # 5. Logout
    logout_res = await client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

@pytest.mark.asyncio
async def test_invalid_login_credentials(client: AsyncClient):
    # Register user
    reg_payload = {
        "name": "Wrong Pass User",
        "email": "wrongpass@documind.ai",
        "password": "CorrectPassword123!",
        "terms_accepted": True
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Wrong password
    bad_pass_res = await client.post("/api/v1/auth/login", json={
        "email": "wrongpass@documind.ai",
        "password": "WrongPassword999!"
    })
    assert bad_pass_res.status_code == 401
    assert "invalid email or password" in bad_pass_res.json()["detail"].lower()

    # Unknown email
    unknown_email_res = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@documind.ai",
        "password": "SomePassword123!"
    })
    assert unknown_email_res.status_code == 401
    assert "invalid email or password" in unknown_email_res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_change_password(client: AsyncClient):
    reg_payload = {
        "name": "Password Changer",
        "email": "changer@documind.ai",
        "password": "OldPassword123!",
        "terms_accepted": True
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong current password
    fail_res = await client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "IncorrectPassword123!",
        "new_password": "NewBrandPassword123!"
    })
    assert fail_res.status_code == 400

    # Successful change
    success_res = await client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "OldPassword123!",
        "new_password": "NewBrandPassword123!",
        "confirm_password": "NewBrandPassword123!"
    })
    assert success_res.status_code == 200

    # Verify old password fails
    old_login = await client.post("/api/v1/auth/login", json={
        "email": "changer@documind.ai",
        "password": "OldPassword123!"
    })
    assert old_login.status_code == 401

    # Verify new password succeeds
    new_login = await client.post("/api/v1/auth/login", json={
        "email": "changer@documind.ai",
        "password": "NewBrandPassword123!"
    })
    assert new_login.status_code == 200
