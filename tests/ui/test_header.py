from tests.ui.pages.header_page import HeaderPage

def test_logo_navigates_home(driver):
    page = HeaderPage(driver)
    driver.get("http://localhost:5173")
    page.click_logo()
    assert driver.current_url.endswith("/home")


def test_active_filter_selected_by_default(driver):
    page = HeaderPage(driver)
    driver.get("http://localhost:5173/home")
    assert "selected" in page.get_active_filter_class()
    assert "unselected" in page.get_archive_filter_class()


def test_archive_filter_becomes_selected_on_click(driver):
    page = HeaderPage(driver)
    driver.get("http://localhost:5173/home")
    page.click_archive_filter()
    assert "selected" in page.get_archive_filter_class()
    assert "unselected" in page.get_active_filter_class()


def test_profile_icon_visible(driver):
    page = HeaderPage(driver)
    driver.get("http://localhost:5173/home")
    assert page.guest_icon_visible() or page.avatar_visible()