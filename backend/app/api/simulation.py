from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
from datetime import datetime

from app.core.database import get_db, SessionLocal
from app.models.ambulance import Ambulance
from app.models.emergency import EmergencyRequest
from app.services.dispatch_service import dispatch_service
from app.services.simulation_service import simulation_service
from app.seed_data import seed_database

router = APIRouter(prefix="/simulation", tags=["Demo Simulation Engine"])

class ScenarioRequest(BaseModel):
    scenario_type: str = "CARDIAC"  # CARDIAC, HIGHWAY_CRASH, RESPIRATORY, STROKE
    patient_name: Optional[str] = "Demo Subject"
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None

# Preset Demo Coordinates for realistic demonstration
SCENARIOS = {
    "CARDIAC": {
        "title": "Severe Cardiac Arrest in City Center",
        "patient_name": "Marcus Vance (Age 58)",
        "phone": "+1-555-8942",
        "lat": 12.9780,
        "lng": 77.5990,
        "address": "Central Metro Plaza, Sector 4",
        "emergency_type": "CARDIAC",
        "severity": "CRITICAL",
        "notes": "Patient collapsed, chest tightness, irregular pulse, bystanders administering CPR",
        "symptoms": "Chest pain radiating to left arm, severe shortness of breath"
    },
    "HIGHWAY_CRASH": {
        "title": "Multi-Vehicle Collision on Arterial Expressway",
        "patient_name": "Elena Rostova (Age 32)",
        "phone": "+1-555-3319",
        "lat": 12.9350,
        "lng": 77.6240,
        "address": "Koramangala Expressway Junction",
        "emergency_type": "TRAUMA",
        "severity": "CRITICAL",
        "notes": "Two car collision, driver trapped with limb fractures, bleeding",
        "symptoms": "Compound fracture, cranial trauma, active hemorrhage"
    },
    "RESPIRATORY": {
        "title": "Acute Asthmatic Hypoxia",
        "patient_name": "Aarav Sharma (Age 19)",
        "phone": "+1-555-7721",
        "lat": 12.9920,
        "lng": 77.5680,
        "address": "Malleshwaram 7th Cross, Tech Park",
        "emergency_type": "RESPIRATORY",
        "severity": "HIGH",
        "notes": "Severe wheezing, oxygen saturation dropping below 82%, inhaler ineffective",
        "symptoms": "Cyanosis, stridor, hyperventilation"
    },
    "STROKE": {
        "title": "Acute Ischemic Stroke Symptoms",
        "patient_name": "Grace Hopper (Age 67)",
        "phone": "+1-555-9081",
        "lat": 12.9550,
        "lng": 77.5850,
        "address": "Lalbagh West Gate Avenue",
        "emergency_type": "STROKE",
        "severity": "CRITICAL",
        "notes": "Sudden facial drooping, loss of speech, right-side paralysis within last 20 mins",
        "symptoms": "FAST positive, slurred speech, hemiplegia"
    }
}

async def run_live_simulation_task(emergency_id: int):
    """Background task that moves the ambulance point by point with realistic delays."""
    await asyncio.sleep(1.0)
    db = SessionLocal()
    try:
        emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
        if not emergency or not emergency.route_geometry:
            return
        coords = emergency.route_geometry.get("coordinates", [])
        total_pts = len(coords)
    finally:
        db.close()

    # Step through coordinates with 1.5 second intervals
    for idx in range(total_pts):
        await simulation_service.step_simulation(emergency_id, idx)
        await asyncio.sleep(1.5)

@router.post("/trigger")
async def trigger_scenario(
    payload: ScenarioRequest,
    background_tasks: BackgroundTasks,
    auto_run_movement: bool = False,
    db: Session = Depends(get_db)
):
    """
    Launch a 1-click comprehensive demo emergency scenario:
    - Automatically provisions emergency
    - Dispatches closest ambulance
    - Computes route & alternatives
    - Optionally steps coordinates automatically in background
    """
    scenario_info = SCENARIOS.get(payload.scenario_type.upper(), SCENARIOS["CARDIAC"])
    
    pickup_lat = payload.pickup_lat if payload.pickup_lat is not None else scenario_info["lat"]
    pickup_lng = payload.pickup_lng if payload.pickup_lng is not None else scenario_info["lng"]
    patient_name = payload.patient_name or scenario_info["patient_name"]

    emergency = await dispatch_service.create_and_dispatch_emergency(
        db=db,
        pickup_lat=pickup_lat,
        pickup_lng=pickup_lng,
        patient_name=patient_name,
        patient_phone=scenario_info["phone"],
        pickup_address=scenario_info["address"],
        emergency_type=scenario_info["emergency_type"],
        severity=scenario_info["severity"],
        caller_notes=scenario_info["notes"],
        symptoms=scenario_info["symptoms"]
    )

    if auto_run_movement:
        background_tasks.add_task(run_live_simulation_task, emergency.id)

    return {
        "message": f"Demo scenario '{scenario_info['title']}' launched successfully",
        "emergency": emergency
    }

@router.post("/step/{emergency_id}")
async def step_emergency_movement(
    emergency_id: int,
    step_index: int = 0
):
    """Manually step ambulance position to next waypoint along route."""
    telemetry = await simulation_service.step_simulation(emergency_id, step_index)
    return {"status": "ok", "telemetry": telemetry}

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Reset fleet and database to fresh demo seed state."""
    seed_database(db, force_reset=True)
    return {"message": "Demo environment reset with fresh hospitals, ambulances, and telemetry data."}
