from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Auction backend is running"}
