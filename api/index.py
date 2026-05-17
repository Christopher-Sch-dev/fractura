"""FRACTURA API — Vercel Serverless (FastAPI)"""
import sys
import os

# Add project root so backend.* imports work
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault("SLOWAPI_SILENT", "1")

from backend.main import app
app.title = "FRACTURA API"
app.version = "0.3.0"
