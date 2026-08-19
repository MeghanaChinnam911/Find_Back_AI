import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "FIND-BACK AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("JWT_SECRET", "findback_secret_key_demo_2026_super_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./findback.db")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # Storage & Supabase Settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "person-photos")
    
    # Matching Weights
    WEIGHT_VISUAL: float = 0.65
    WEIGHT_AGE: float = 0.15
    WEIGHT_GEO: float = 0.10
    WEIGHT_TIME: float = 0.10
    
    # LLM Settings
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
