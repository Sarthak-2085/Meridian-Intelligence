"""
Centralized configuration. All environment variables are read here, once,
so the rest of the codebase never calls os.environ.get() directly.
"""
from __future__ import annotations
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

ROOT_DIR = Path(__file__).parent
DB_PATH = ROOT_DIR / "meridian.db"

GROQ_API_KEY: str | None = os.environ.get("GROQ_API_KEY")
CORS_ORIGINS: list[str] = os.environ.get("CORS_ORIGINS", "*").split(",")

LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")