from fastapi import FastAPI
from app.routers import auth, profile, posts, comments, favorites, admin
from fastapi.openapi.utils import get_openapi

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Auction backend is running"}


app.include_router(auth.router, tags=["Authentication"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(posts.router, tags=["Posts"])
app.include_router(comments.router, tags=["Comments"])
app.include_router(favorites.router, tags=["Favorites"])
app.include_router(admin.router, tags=["Admin"])

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Auction backend",
        version="1.0.0",
        description="API для аукциона",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "cookieAuth": {
            "type": "apiKey",
            "in": "cookie",
            "name": "jwt"
        }
    }

    if "/me" in openapi_schema["paths"]:
        openapi_schema["paths"]["/me"]["get"]["security"] = [{"cookieAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
