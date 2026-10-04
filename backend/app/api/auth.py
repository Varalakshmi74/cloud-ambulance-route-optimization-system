from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

class QuickLoginRequest(BaseModel):
    role: str  # PATIENT, DRIVER, HOSPITAL_ADMIN, DISPATCH_ADMIN
    target_id: int = 1  # ambulance_id or hospital_id if applicable

@router.get("/roles")
def get_available_demo_roles(db: Session = Depends(get_db)):
    """Returns preset accounts for seamless 1-click evaluation without typing passwords."""
    return [
        {
            "role": "PATIENT",
            "name": "Sarah Jenkins (Citizen)",
            "title": "Patient / Emergency Caller",
            "description": "Trigger SOS, view real-time incoming ambulance ETA and route preview",
            "badge": "Caller Portal",
            "avatar": "🚨"
        },
        {
            "role": "DRIVER",
            "name": "Captain David Miller (Paramedic)",
            "title": "Ambulance Driver / ALS-01",
            "description": "Receive dispatch, turn-by-turn navigation HUD, update status",
            "badge": "Ambulance Unit ALS-01",
            "avatar": "🚑"
        },
        {
            "role": "HOSPITAL_ADMIN",
            "name": "Dr. Aris Thorne (Chief of Emergency)",
            "title": "St. Jude Trauma Hospital",
            "description": "Incoming ambulance triage board, live ICU/general bed capacity manager",
            "badge": "Hospital Intake",
            "avatar": "🏥"
        },
        {
            "role": "DISPATCH_ADMIN",
            "name": "Commander Elena Vance",
            "title": "Central Cloud Command Center",
            "description": "Real-time fleet tracking, Cloud SLA analytics, dispatch overrides",
            "badge": "Central Cloud HQ",
            "avatar": "🛰️"
        }
    ]
