import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='C:\\Users\\user\\PycharmProjects\\AuctionPlay\\.env')

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
