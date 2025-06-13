from tests.ui.pages.home_page import HomePage

def test_homepage_opens(driver):
    page = HomePage(driver)
    page.open()
    current_url = driver.current_url
    title = driver.title
    assert "localhost" in current_url or "Home" in title


def test_post_modal_opens(driver):
    page = HomePage(driver)

    page.open()
    page.wait_for_add_post_button()
    page.click_add_post()
    page.wait_for_modal()

    assert page.is_modal_visible()