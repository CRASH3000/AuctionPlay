import requests
import pytest


class TestCommentsAPI:

    def test_get_comments_no_comments(self, base_url):
        response = requests.get(f"{base_url}/comments", params={"id": 999999})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert isinstance(data["comments"], list)
        assert len(data["comments"]) == 0

    def test_get_max_price_no_bids(self, base_url):
        response = requests.get(
            f"{base_url}/comments/max_price", params={"post_id": 999999}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["max_price"] is None
        assert data["user_id"] is None
        assert data["username"] is None

    def test_create_comment_requires_auth(self, base_url):
        response = requests.post(f"{base_url}/comments", data={})
        assert response.status_code == 401

    def test_create_comment_validation_error(self, base_url, test_user):
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        login = requests.post(
            f"{base_url}/auth",
            data={"username": test_user["username"], "password": test_user["password"]},
            headers=headers,
        )
        assert login.status_code == 200
        cookies = login.cookies

        response = requests.post(
            f"{base_url}/comments", data={}, cookies=cookies, headers=headers
        )
        assert response.status_code == 422
