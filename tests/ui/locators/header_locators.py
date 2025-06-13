from selenium.webdriver.common.by import By

class HeaderLocators:
    LOGO = (By.CSS_SELECTOR, '[data-testid="header-logo"]')
    FILTER_ACTIVE = (By.CSS_SELECTOR, '[data-testid="filter-active-lot"]')
    FILTER_ARCHIVE = (By.CSS_SELECTOR, '[data-testid="filter-archive-lot"]')
    PROFILE_BUTTON = (By.CSS_SELECTOR, '[data-testid="profile-button"]')
    GUEST_ICON = (By.CSS_SELECTOR, '[data-testid="guest-icon"]')
    DEFAULT_AVATAR = (By.CSS_SELECTOR, '[data-testid="default-avatar"]')
    USER_AVATAR = (By.CSS_SELECTOR, '[data-testid="user-avatar"]')