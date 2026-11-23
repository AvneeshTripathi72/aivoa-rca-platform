import os
from pydantic_settings import BaseSettings
from typing import List

IS_VERCEL = bool(os.getenv("VERCEL"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIVOA.AI — Root Cause Analysis (RCA) Module"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:////tmp/aivoa_rca.db" if IS_VERCEL else "sqlite:///./aivoa_rca.db"
    )
    
    # Groq AI
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_FALLBACK_MODEL: str = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")
    
    # Document storage
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR", 
        "/tmp/uploads" if IS_VERCEL else "./uploads"
    )
    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt", ".eml"]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://*.vercel.app",
        "*"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
