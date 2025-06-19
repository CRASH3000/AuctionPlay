from tests.ui.pages.auth_page import AuthPage
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_full_registration_flow(driver):
    page = AuthPage(driver)
    driver.get("http://localhost:5173/home")

    page.click_profile_icon()
    page.click_guest_login()

    assert driver.current_url.endswith("/login")

    page.click_register_button()
    page.accept_terms()

    page.fill_registration_form(
        username="AutoTest3000",
        email="auto@test.coma",
        password="AutoTest123_456",
        tg="@AutoTest3000"
    )

    page.skip_avatar_upload()

    assert driver.current_url.endswith("/profile")

    page.delete_profile()

    WebDriverWait(driver, 5).until(EC.url_contains("/login"))
    assert driver.current_url.endswith("/login")