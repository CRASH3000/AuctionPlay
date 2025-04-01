import pytest
import requests


@pytest.fixture
def base_url():
    return "http://127.0.0.1:8000"


@pytest.fixture
def test_user(base_url):
    user_data = {
        "username": "testuser1",
        "email": "testuser1@example.com",
        "telegram_username": "testuser1",
        "password": "TempPass123",
        "firstname": "Test",
        "lastname": "User",
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    form_data = {k: str(v) for k, v in user_data.items()}  # <<< ВСЁ приводим к строке

    response = requests.post(
        f"{base_url}/registration", data=form_data, headers=headers
    )

    if response.status_code == 409:
        pass
    elif response.status_code != 200:
        raise Exception(f"Registration failed: {response.status_code} {response.text}")

    yield user_data

    # удаление
    admin_auth = requests.post(
        f"{base_url}/auth", data={"username": "admin", "password": "admin"}
    )

    if admin_auth.status_code == 200:
        jwt = admin_auth.cookies.get("jwt_access")
        login_as_user = requests.post(
            f"{base_url}/auth",
            data={"username": user_data["username"], "password": user_data["password"]},
        )
        user_jwt = login_as_user.cookies.get("jwt_access")
        me_response = requests.get(f"{base_url}/me", cookies={"jwt_access": user_jwt})
        if me_response.status_code == 200:
            user_id = me_response.json().get("id")
            requests.delete(f"{base_url}/users/{user_id}", cookies={"jwt_access": jwt})
