from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.ambulance import Ambulance
from app.schemas.ambulance import (
    AmbulanceResponse, AmbulanceCreate, AmbulanceUpdateLocation, AmbulanceUpdateStatus
)
from app.core.websocket_manager import manager

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceResponse])
def get_all_ambulances(
    status: Optional[str] = None,
    ambulance_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all ambulances in fleet with optional status / type filtering."""
    query = db.query(Ambulance)
    if status:
        query = query.filter(Ambulance.status == status)
    if ambulance_type:
        query = query.filter(Ambulance.ambulance_type == ambulance_type)
    return query.all()

@router.get("/{ambulance_id}", response_model=AmbulanceResponse)
def get_ambulance_by_id(ambulance_id: int, db: Session = Depends(get_db)):
    """Fetch specific ambulance telemetry."""
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb

@router.patch("/{ambulance_id}/location", response_model=AmbulanceResponse)
async def update_ambulance_location(
    ambulance_id: int,
    payload: AmbulanceUpdateLocation,
    db: Session = Depends(get_db)
):
    """Driver GPS location update endpoint."""
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    amb.current_latitude = payload.current_latitude
    amb.current_longitude = payload.current_longitude
    if payload.heading_degrees is not None:
        amb.heading_degrees = payload.heading_degrees
    if payload.current_speed_kmh is not None:
        amb.current_speed_kmh = payload.current_speed_kmh
    if payload.fuel_level_percent is not None:
        amb.fuel_level_percent = payload.fuel_level_percent
    if payload.status:
        amb.status = payload.status

    amb.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(amb)

    # Broadcast GPS telemetry
    await manager.broadcast_json({
        "type": "AMBULANCE_LOCATION_UPDATED",
        "ambulance_id": amb.id,
        "vehicle_number": amb.vehicle_number,
        "latitude": amb.current_latitude,
        "longitude": amb.current_longitude,
        "speed_kmh": amb.current_speed_kmh,
        "status": amb.status,
        "timestamp": amb.last_updated.isoformat()
    }, channel="all")

    return amb

@router.patch("/{ambulance_id}/status", response_model=AmbulanceResponse)
async def update_ambulance_status(
    ambulance_id: int,
    payload: AmbulanceUpdateStatus,
    db: Session = Depends(get_db)
):
    """Update driver availability status (AVAILABLE, ASSIGNED, MAINTENANCE, etc.)."""
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    amb.status = payload.status
    if payload.current_emergency_id is not None:
        amb.current_emergency_id = payload.current_emergency_id

    amb.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(amb)

    await manager.broadcast_json({
        "type": "AMBULANCE_STATUS_UPDATED",
        "ambulance_id": amb.id,
        "status": amb.status,
        "current_emergency_id": amb.current_emergency_id
    }, channel="all")

    return amb
