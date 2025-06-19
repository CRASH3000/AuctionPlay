from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tests.ui.locators.auth_locators import AuthLocators
from selenium.common.exceptions import TimeoutException

class AuthPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def click_profile_icon(self):
        self.driver.find_element(*AuthLocators.PROFILE_BUTTON).click()

    def click_guest_login(self):
        self.wait.until(EC.visibility_of_element_located(AuthLocators.GUEST_MODAL))
        self.driver.find_element(*AuthLocators.GUEST_MODAL_LOGIN_BTN).click()

    def click_register_button(self):
        self.wait.until(EC.visibility_of_element_located(AuthLocators.AUTH_MODAL))
        self.driver.find_element(*AuthLocators.REG_BUTTON).click()

    def accept_terms(self):
        self.wait.until(EC.visibility_of_element_located(AuthLocators.TERMS_MODAL))
        self.driver.find_element(*AuthLocators.TERMS_CHECKBOX).click()
        self.driver.find_element(*AuthLocators.TERMS_CONTINUE).click()

    def fill_registration_form(self, username, email, password, tg):
        self.wait.until(EC.visibility_of_element_located(AuthLocators.REGISTRATION_MODAL))
        self.driver.find_element(*AuthLocators.FIELD_USERNAME).send_keys(username)
        self.driver.find_element(*AuthLocators.FIELD_EMAIL).send_keys(email)
        self.driver.find_element(*AuthLocators.FIELD_PASSWORD).send_keys(password)
        self.driver.find_element(*AuthLocators.FIELD_CONFIRM).send_keys(password)
        self.driver.find_element(*AuthLocators.FIELD_TELEGRAM).send_keys(tg)
        self.driver.find_element(*AuthLocators.CREATE_PROFILE_BTN).click()

    def skip_avatar_upload(self):
        self.wait.until(EC.visibility_of_element_located(AuthLocators.AVATAR_MODAL))
        self.driver.find_element(*AuthLocators.SKIP_BTN).click()

    def delete_profile(self):
        self.wait.until(EC.element_to_be_clickable(AuthLocators.DELETE_PROFILE_BTN)).click()
        try:
            WebDriverWait(self.driver, 5).until(EC.alert_is_present())
            self.driver.switch_to.alert.accept()
        except TimeoutException:
            raise AssertionError("Окно подтверждения удаления профиля не появилось.")