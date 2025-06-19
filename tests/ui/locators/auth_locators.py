from selenium.webdriver.common.by import By

class AuthLocators:
    PROFILE_BUTTON = (By.CSS_SELECTOR, '[data-testid="guest-icon"]')
    GUEST_MODAL = (By.CSS_SELECTOR, '.pom-modal')
    GUEST_MODAL_LOGIN_BTN = (By.CSS_SELECTOR, '.pom-action-btn')

    AUTH_MODAL = (By.CSS_SELECTOR, '.auth-modal')
    AUTH_TITLE = (By.CSS_SELECTOR, '.auth-modal h2')
    REG_BUTTON = (By.XPATH, '//button[text()="Регистрация"]')

    TERMS_MODAL = (By.CSS_SELECTOR, '.terms-modal')
    TERMS_CHECKBOX = (By.CSS_SELECTOR, '.terms-footer input[type="checkbox"]')
    TERMS_CONTINUE = (By.CSS_SELECTOR, '.terms-continue')

    REGISTRATION_MODAL = (By.CSS_SELECTOR, '.auth-modal')
    FIELD_USERNAME = (By.XPATH, '//label[text()="Имя пользователя"]/following-sibling::input')
    FIELD_EMAIL = (By.XPATH, '//label[text()="Email"]/following-sibling::input')
    FIELD_PASSWORD = (By.XPATH, '//label[text()="Пароль"]/following-sibling::input')
    FIELD_CONFIRM = (By.XPATH, '//label[text()="Подтвердите пароль"]/following-sibling::input')
    FIELD_TELEGRAM = (By.XPATH, '//label[text()="Telegram-логин"]/following-sibling::input')
    CREATE_PROFILE_BTN = (By.CSS_SELECTOR, '.create-profile-btn')

    AVATAR_MODAL = (By.CSS_SELECTOR, '.uav-modal')
    SKIP_BTN = (By.CSS_SELECTOR, '.uav-skip-btn')

    CONFIRM_DELETE_BTN = (By.XPATH, '//button[text()="OK"]')
    DELETE_PROFILE_BTN = (By.CSS_SELECTOR, '.delete-profile-btn')

