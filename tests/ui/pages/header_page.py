from tests.ui.locators.header_locators import HeaderLocators
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class HeaderPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 5)

    def click_logo(self):
        self.driver.find_element(*HeaderLocators.LOGO).click()

    def get_active_filter_class(self):
        return self.driver.find_element(*HeaderLocators.FILTER_ACTIVE).get_attribute("class")

    def get_archive_filter_class(self):
        return self.driver.find_element(*HeaderLocators.FILTER_ARCHIVE).get_attribute("class")

    def click_archive_filter(self):
        self.driver.find_element(*HeaderLocators.FILTER_ARCHIVE).click()

    def click_active_filter(self):
        self.driver.find_element(*HeaderLocators.FILTER_ACTIVE).click()

    def guest_icon_visible(self):
        return self.driver.find_element(*HeaderLocators.GUEST_ICON).is_displayed()

    def avatar_visible(self):
        # Либо дефолтный, либо пользовательский аватар
        try:
            return self.driver.find_element(*HeaderLocators.USER_AVATAR).is_displayed()
        except:
            return self.driver.find_element(*HeaderLocators.DEFAULT_AVATAR).is_displayed()