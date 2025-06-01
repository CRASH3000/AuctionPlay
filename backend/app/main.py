app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

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
        "cookieAuth": {"type": "apiKey", "in": "cookie", "name": "jwt"}
    }

    if "/me" in openapi_schema["paths"]:
        openapi_schema["paths"]["/me"]["get"]["security"] = [{"cookieAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
