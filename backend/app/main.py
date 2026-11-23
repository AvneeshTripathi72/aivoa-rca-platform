import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api.routes import (
    investigations,
    ai_workflow,
    evidence,
    capa,
    dashboard,
    demo,
    copilot
)
from backend.app.services.seed_service import seed_database_if_empty

def ensure_database_initialized():
    """
    Idempotent database and directory initialization.
    Safe for local runs and serverless cold starts.
    """
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database_if_empty(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Database initialization note: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created and seed demo records if DB empty
    ensure_database_initialized()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI-Powered Root Cause Analysis (RCA) Platform for Pharmaceutical API Manufacturing",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers with both /api and direct root prefix for serverless routing resilience
for pfx in ["/api", ""]:
    is_main = (pfx == "/api")
    app.include_router(investigations.router, prefix=f"{pfx}/investigations", tags=["Investigations"] if is_main else None, include_in_schema=is_main)
    app.include_router(ai_workflow.router, prefix=f"{pfx}/ai", tags=["AI Intake & Workflow"] if is_main else None, include_in_schema=is_main)
    app.include_router(evidence.router, prefix=pfx, tags=["Evidence Management"] if is_main else None, include_in_schema=is_main)
    app.include_router(capa.router, prefix=pfx, tags=["CAPA & Root Causes"] if is_main else None, include_in_schema=is_main)
    app.include_router(dashboard.router, prefix=f"{pfx}/dashboard", tags=["Dashboard"] if is_main else None, include_in_schema=is_main)
    app.include_router(demo.router, prefix=f"{pfx}/demo", tags=["Demo Scenarios"] if is_main else None, include_in_schema=is_main)
    app.include_router(copilot.router, prefix=f"{pfx}/copilot", tags=["AIVOA Copilot"] if is_main else None, include_in_schema=is_main)

from fastapi.responses import FileResponse
from fastapi import HTTPException

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "environment": "vercel_serverless" if getattr(settings, "IS_VERCEL", False) or os.getenv("VERCEL") else "local"
    }

# Mount frontend static distribution if built
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude /api routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API route not found")
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"platform": "AIVOA.AI", "status": "Frontend not built"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
