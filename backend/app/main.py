from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.websocket_manager import manager
from app.seed_data import seed_database

# Routers
from app.api.emergencies import router as emergencies_router
from app.api.ambulances import router as ambulances_router
from app.api.hospitals import router as hospitals_router
from app.api.routing import router as routing_router
from app.api.analytics import router as analytics_router
from app.api.simulation import router as simulation_router
from app.api.auth import router as auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("emergency_cloud")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables & seed initial data
    logger.info("Initializing Cloud Emergency Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database seeded successfully.")
    finally:
        db.close()
    yield
    logger.info("Shutting down Cloud Emergency System.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Cloud-Based Ambulance Route Optimization & Emergency Response System REST API & Real-time Telemetry Service",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(emergencies_router, prefix=settings.API_V1_STR)
app.include_router(ambulances_router, prefix=settings.API_V1_STR)
app.include_router(hospitals_router, prefix=settings.API_V1_STR)
app.include_router(routing_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "ONLINE",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "cloud_provider": "AWS Ready (ECS/EC2 + RDS PostgreSQL + S3)",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "routing_engine": "OSRM / Active",
        "websocket_subscribers": len(manager.active_connections)
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, channel: str = "all"):
    """
    Real-time bidirectional WebSocket connection for live telemetry, GPS broadcast, and emergency dispatch alerts.
    """
    await manager.connect(websocket, channel)
    try:
        while True:
            # Keep-alive listen / client echo
            data = await websocket.receive_text()
            # Optional ping-pong reply
            if data == "ping":
                await websocket.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
