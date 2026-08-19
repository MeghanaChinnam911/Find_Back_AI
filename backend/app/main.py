from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database

# Include API routers
from app.api import auth, missing_persons, unidentified_persons, matching, agent, analytics, notifications, health

# Create DB Tables automatically
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed database on application startup if empty
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Startup database seed check: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FIND-BACK AI - AI-Powered Missing Persons Discovery, Matching & Intelligence Platform API",
    lifespan=lifespan
)

# Configurable CORS origins
cors_origins_list = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not cors_origins_list:
    cors_origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(missing_persons.router, prefix=settings.API_V1_STR)
app.include_router(unidentified_persons.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(agent.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Welcome to FIND-BACK AI Platform API",
        "health_check": "/health",
        "docs_url": "/docs"
    }
