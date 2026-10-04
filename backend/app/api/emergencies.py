from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.emergency import EmergencyRequest
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.schemas.emergency import EmergencyCreate, EmergencyResponse, EmergencyUpdateStatus
from app.services.dispatch_service import dispatch_service
from app.core.websocket_manager import manager

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])

@router.post("", response_model=EmergencyResponse)
async def create_emergency_sos(payload: EmergencyCreate, db: Session = Depends(get_db)):
    """
    Trigger 1-Click SOS:
    - Creates Emergency Request
    - Automatically finds nearest available ambulance
    - Identifies optimal destination hospital
    - Computes OSRM routing geometry
    - Broadcasts WebSocket alert
    """
    emergency = await dispatch_service.create_and_dispatch_emergency(
        db=db,
        pickup_lat=payload.pickup_latitude,
        pickup_lng=payload.pickup_longitude,
        patient_name=payload.patient_name or "Anonymous Citizen",
        patient_phone=payload.patient_phone or "+1-555-0199",
        pickup_address=payload.pickup_address or "Current GPS Location",
        emergency_type=payload.emergency_type,
        severity=payload.severity,
        caller_notes=payload.caller_notes,
        symptoms=payload.symptoms,
        preferred_hospital_id=payload.preferred_hospital_id
    )
    return emergency

@router.get("", response_model=List[EmergencyResponse])
def get_emergencies(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List recent and active emergencies with optional status filter."""
    query = db.query(EmergencyRequest).order_by(EmergencyRequest.created_at.desc())
    if status:
        query = query.filter(EmergencyRequest.status == status)
    return query.limit(limit).all()

@router.get("/active", response_model=List[EmergencyResponse])
def get_active_emergencies(db: Session = Depends(get_db)):
    """Get all currently ongoing emergencies (excluding COMPLETED and CANCELLED)."""
    return db.query(EmergencyRequest).filter(
        EmergencyRequest.status.notin_(["COMPLETED", "CANCELLED"])
    ).order_by(EmergencyRequest.created_at.desc()).all()

@router.get("/{emergency_id}", response_model=EmergencyResponse)
def get_emergency_by_id(emergency_id: int, db: Session = Depends(get_db)):
    """Fetch full details for a single emergency case."""
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    return emergency

@router.patch("/{emergency_id}/status", response_model=EmergencyResponse)
async def update_emergency_status(
    emergency_id: int,
    payload: EmergencyUpdateStatus,
    db: Session = Depends(get_db)
):
    """
    Update lifecycle stage of an emergency:
    - ASSIGNED -> ON_THE_WAY -> AT_SCENE -> TRANSPORTING -> HOSPITAL_REACHED -> COMPLETED
    """
    emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    old_status = emergency.status
    emergency.status = payload.status
    now = datetime.utcnow()

    # Milestone timestamps
    if payload.status == "ON_THE_WAY" and not emergency.dispatched_at:
        emergency.dispatched_at = now
    elif payload.status == "AT_SCENE" and not emergency.at_scene_at:
        emergency.at_scene_at = now
    elif payload.status == "TRANSPORTING" and not emergency.transporting_at:
        emergency.transporting_at = now
    elif payload.status == "HOSPITAL_REACHED" and not emergency.hospital_reached_at:
        emergency.hospital_reached_at = now
    elif payload.status == "COMPLETED":
        emergency.completed_at = now
        # Free up assigned ambulance
        if emergency.assigned_ambulance:
            emergency.assigned_ambulance.status = "AVAILABLE"
            emergency.assigned_ambulance.current_emergency_id = None

    if payload.assigned_hospital_id:
        emergency.assigned_hospital_id = payload.assigned_hospital_id
    if payload.assigned_ambulance_id:
        emergency.assigned_ambulance_id = payload.assigned_ambulance_id

    db.commit()
    db.refresh(emergency)

    # Broadcast update
    await manager.broadcast_json({
        "type": "EMERGENCY_STATUS_UPDATED",
        "emergency_id": emergency.id,
        "case_code": emergency.case_code,
        "old_status": old_status,
        "new_status": emergency.status,
        "timestamp": now.isoformat()
    }, channel="all")

    return emergency
