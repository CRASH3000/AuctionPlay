from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.ui.locators.home_page_locators import HomePageLocators

class HomePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 5)

    def open(self):
        self.driver.get("http://localhost:5173/home")

    def wait_for_add_post_button(self):
        self.wait.until(EC.element_to_be_clickable(HomePageLocators.ADD_POST_BUTTON))

    def click_add_post(self):
        self.driver.find_element(*HomePageLocators.ADD_POST_BUTTON).click()

    def wait_for_modal(self):
        self.wait.until(EC.visibility_of_element_located(HomePageLocators.POST_MODAL))

    def is_modal_visible(self):
        return self.driver.find_element(*HomePageLocators.POST_MODAL).is_displayed()