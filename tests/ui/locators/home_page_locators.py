from selenium.webdriver.common.by import By

class HomePageLocators:
    ADD_POST_BUTTON = (By.CSS_SELECTOR, '[data-testid="add-post-btn"]')
    POST_MODAL = (By.CSS_SELECTOR, '[data-testid="post-modal"]')
