import requests
import pytest

BASE_URL = "http://127.0.0.1:8000"


class TestAuthAPI:

    def test_registration_success(self, base_url):
        user_data = {
            "username": "new_testuser",
            "email": "new_testuser@example.com",
            "telegram_username": "new_testuser",
            "password": "TempPass123",
            "firstname": "Test",
            "lastname": "User",
        }
        response = requests.post(f"{base_url}/registration", data=user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "user" in data
        assert "jwt_access" in data["user"]
        assert "jwt_request" in data["user"]

    def test_successful_auth(self, base_url, test_user):
        response = requests.post(
            f"{base_url}/auth",
            data={"username": test_user["username"], "password": test_user["password"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "jwt_access" in data
        assert "jwt_request" in data

    def test_auth_invalid_password(self, base_url, test_user):
        response = requests.post(
            f"{base_url}/auth",
            data={"username": test_user["username"], "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Неверный логин или пароль"

    def test_auth_nonexistent_user(self, base_url):
        response = requests.post(
            f"{base_url}/auth",
            data={"username": "nosuchuser123", "password": "whatever"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Неверный логин или пароль"

    def test_auth_missing_username(self, base_url):
        response = requests.post(f"{base_url}/auth", data={"password": "TempPass123"})
        assert response.status_code == 422

    def test_auth_missing_password(self, base_url, test_user):
        response = requests.post(
            f"{base_url}/auth", data={"username": test_user["username"]}
        )
        assert response.status_code == 422

    def test_registration_validation_error(self, base_url):
        response = requests.post(f"{base_url}/registration", data={})
        assert response.status_code == 422

    def test_auth_validation_error(self, base_url):
        response = requests.post(f"{base_url}/auth", data={})
        assert response.status_code == 422

    def test_me_without_auth(self, base_url):
        response = requests.get(f"{base_url}/me")
        assert response.status_code == 401

    def test_jwt_without_token(self, base_url):
        response = requests.post(f"{base_url}/jwt")
        assert response.status_code == 401

    def test_logout_without_auth(self, base_url):
        response = requests.post(f"{base_url}/logout")
        assert response.status_code == 401
