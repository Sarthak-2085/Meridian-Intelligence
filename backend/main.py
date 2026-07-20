"""
Meridian - Geopolitical Market Intelligence Backend
FastAPI + SQLite. Mock/illustrative data only. No paid APIs.
"""
from __future__ import annotations
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

import config
from database import init_db
from routes import dashboard, commodities, misc

logging.basicConfig(level=config.LOG_LEVEL)
logger = logging.getLogger("meridian")

app = FastAPI(title="Meridian Intelligence API", version="0.1.0")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.exception(f"{request.method} {request.url.path} -> 500 ({duration_ms:.0f}ms)")
        raise
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms:.0f}ms)")
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logger.exception(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Check backend logs for details."},
    )


api.include_router(dashboard.router)
api.include_router(commodities.router)
api.include_router(misc.router)
app.include_router(api)


@app.get("/debug/routes")
def debug_routes():
    return [{"path": r.path, "methods": list(r.methods)} for r in app.routes]
@app.on_event("startup")
def _startup():
    init_db()
    logger.info("Meridian API ready.")

    print(f"[BOOT] main.py loaded from: {__file__}")
print(f"[BOOT] {len(app.routes)} routes registered: {[r.path for r in app.routes]}")

@app.get("/health")
async def health():
    return {"status": "ok"}