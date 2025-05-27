import os
from pathlib import Path
from dotenv import load_dotenv

# Получаем абсолютный путь до корня проекта
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Загружаем .env из корня проекта
load_dotenv(dotenv_path=BASE_DIR / ".env.example")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
