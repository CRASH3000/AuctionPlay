import requests
import pytest

BASE_URL = "http://127.0.0.1:8000"


class TestProfileAPI:

    def test_get_profile_me_unauthorized(self, base_url):
        response = requests.get(f"{base_url}/profile/me")
        assert response.status_code == 401

    def test_update_profile_unauthorized(self, base_url):
        response = requests.patch(
            f"{base_url}/profile/update",
            data={
                "username": "test",
                "email": "test@example.com",
                "telegram_username": "testuser",
                "firstname": "New",
                "lastname": "Name",
            },
        )
        assert response.status_code == 401

    def test_update_avatar_unauthorized(self, base_url):
        response = requests.post(
            f"{base_url}/profile/avatar", data={"image": "new_avatar.png"}
        )
        assert response.status_code == 401

    def test_get_public_profile_invalid_id(self, base_url):
        response = requests.get(f"{base_url}/profile/999999")
        assert response.status_code == 404

    def test_get_favorites_unauthorized(self, base_url):
        response = requests.get(f"{base_url}/me/favorites")
        assert response.status_code == 401

    def test_get_profile_me_authorized(self, base_url, test_user, auth_cookies):
        response = requests.get(f"{base_url}/profile/me", cookies=auth_cookies)
        assert response.status_code == 200
        assert response.json()["username"] == test_user["username"]

    def test_update_profile_success(self, base_url, auth_cookies):
        response = requests.patch(
            f"{base_url}/profile/update",
            data={
                "username": "updated_user",
                "email": "updated@example.com",
                "telegram_username": "updated_tg",
                "firstname": "Updated",
                "lastname": "User",
            },
            cookies=auth_cookies,
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_get_favorites_success(self, base_url, auth_cookies):
        response = requests.get(f"{base_url}/me/favorites", cookies=auth_cookies)
        assert response.status_code == 200
        assert "favorites" in response.json()

    def test_get_public_profile_success(self, base_url, test_user):
        # Получаем ID пользователя
        auth_response = requests.post(
            f"{base_url}/auth",
            data={"username": test_user["username"], "password": test_user["password"]},
        )
        jwt_access = auth_response.cookies.get("jwt_access")
        me_response = requests.get(f"{base_url}/me", cookies={"jwt_access": jwt_access})
        user_id = me_response.json()["id"]

        response = requests.get(f"{base_url}/profile/{user_id}")
        assert response.status_code == 200
        assert response.json()["user"]["id"] == user_id
