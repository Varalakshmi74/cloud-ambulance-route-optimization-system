from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalResponse, HospitalCreate, HospitalUpdateCapacity
from app.services.routing_service import haversine_distance_km
from app.core.websocket_manager import manager

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalResponse])
def get_hospitals(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    accepting_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    List all hospitals. If `lat` and `lng` are provided, computes distance (km) and estimated arrival time.
    """
    query = db.query(Hospital)
    if accepting_only:
        query = query.filter(Hospital.is_accepting_emergencies == "YES")
    
    hospitals = query.all()
    results = []

    for hosp in hospitals:
        # Create dictionary response
        hosp_dict = {c.name: getattr(hosp, c.name) for c in hosp.__table__.columns}
        if lat is not None and lng is not None:
            dist = haversine_distance_km(lat, lng, hosp.latitude, hosp.longitude)
            hosp_dict["distance_km"] = dist
            hosp_dict["estimated_arrival_minutes"] = round(max(2.0, (dist / 45.0) * 60.0), 1)
        results.append(hosp_dict)

    if lat is not None and lng is not None:
        results.sort(key=lambda x: x.get("distance_km", 999.0))

    return results

@router.get("/{hospital_id}", response_model=HospitalResponse)
def get_hospital_by_id(hospital_id: int, db: Session = Depends(get_db)):
    """Fetch specific hospital detail with bed counts."""
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hosp

@router.patch("/{hospital_id}/capacity", response_model=HospitalResponse)
async def update_hospital_capacity(
    hospital_id: int,
    payload: HospitalUpdateCapacity,
    db: Session = Depends(get_db)
):
    """Hospital emergency department updates available beds, ICU units, and intake status."""
    hosp = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")

    if payload.available_general_beds is not None:
        hosp.available_general_beds = payload.available_general_beds
    if payload.available_icu_beds is not None:
        hosp.available_icu_beds = payload.available_icu_beds
    if payload.available_ventilators is not None:
        hosp.available_ventilators = payload.available_ventilators
    if payload.is_accepting_emergencies is not None:
        hosp.is_accepting_emergencies = payload.is_accepting_emergencies

    hosp.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(hosp)

    # Broadcast capacity change to Central Dispatch & Ambulances
    await manager.broadcast_json({
        "type": "HOSPITAL_CAPACITY_UPDATED",
        "hospital_id": hosp.id,
        "hospital_name": hosp.name,
        "available_general_beds": hosp.available_general_beds,
        "available_icu_beds": hosp.available_icu_beds,
        "available_ventilators": hosp.available_ventilators,
        "is_accepting_emergencies": hosp.is_accepting_emergencies,
        "timestamp": hosp.updated_at.isoformat()
    }, channel="all")

    return hosp
