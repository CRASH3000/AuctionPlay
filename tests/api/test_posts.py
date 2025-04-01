import requests
import pytest

BASE_URL = "http://127.0.0.1:8000"


class TestPostAPI:

    def test_get_posts(self):
        response = requests.get(f"{BASE_URL}/posts")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_post_not_found(self):
        response = requests.get(f"{BASE_URL}/posts/999999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Пост не найден"

    def test_get_post_by_id(self, test_post_id):
        response = requests.get(f"{BASE_URL}/posts/{test_post_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_post_id

    def test_create_post_forbidden_for_non_seller(self, test_user_cookies):
        form_data = {
            "title": "Forbidden Post",
            "text": "No access",
            "cover": "https://example.com/image.png",
            "price": 100,
            "duration": "24h",
        }
        response = requests.post(
            f"{BASE_URL}/posts", data=form_data, cookies=test_user_cookies
        )
        assert response.status_code == 403
        assert response.json()["detail"] == "Пользователь не является продавцом"

    def test_create_post_success(self, seller_user_cookies):
        form_data = {
            "title": "New Auction",
            "text": "Selling something nice",
            "cover": "https://example.com/item.png",
            "price": 200,
            "duration": "3d",
        }
        response = requests.post(
            f"{BASE_URL}/posts", data=form_data, cookies=seller_user_cookies
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "post_id" in data
