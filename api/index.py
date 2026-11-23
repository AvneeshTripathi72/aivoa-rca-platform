import os
import sys

# Ensure project root is in sys.path so 'backend' package is resolvable on Vercel
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the main FastAPI application instance from backend
from backend.app.main import app, ensure_database_initialized

# Ensure database tables and initial seed records are ready in serverless cold start
ensure_database_initialized()
