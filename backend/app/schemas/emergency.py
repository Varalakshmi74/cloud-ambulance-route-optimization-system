from pydantic import BaseModel
from typing import Optional, Any, List, Dict
from datetime import datetime
from app.schemas.ambulance import AmbulanceResponse
from app.schemas.hospital import HospitalResponse

class EmergencyCreate(BaseModel):
    patient_name: Optional[str] = "Anonymous Citizen"
    patient_phone: Optional[str] = "+1-555-0199"
    caller_notes: Optional[str] = None
    pickup_address: Optional[str] = "Current GPS Location"
    pickup_latitude: float
    pickup_longitude: float
    emergency_type: str = "GENERAL"  # CARDIAC, TRAUMA, RESPIRATORY, STROKE, PREGNANCY, BURN, GENERAL
    severity: str = "HIGH"  # CRITICAL, HIGH, MEDIUM
    symptoms: Optional[str] = None
    preferred_hospital_id: Optional[int] = None

class EmergencyUpdateStatus(BaseModel):
    status: str  # ASSIGNED, ON_THE_WAY, AT_SCENE, TRANSPORTING, HOSPITAL_REACHED, COMPLETED, CANCELLED
    notes: Optional[str] = None
    assigned_hospital_id: Optional[int] = None
    assigned_ambulance_id: Optional[int] = None

class EmergencyResponse(BaseModel):
    id: int
    case_code: str
    patient_name: str
    patient_phone: str
    caller_notes: Optional[str] = None
    pickup_address: str
    pickup_latitude: float
    pickup_longitude: float
    emergency_type: str
    severity: str
    symptoms: Optional[str] = None
    status: str
    assigned_ambulance_id: Optional[int] = None
    assigned_hospital_id: Optional[int] = None
    distance_km: float
    estimated_duration_minutes: float
    route_geometry: Optional[Any] = None
    alternative_routes: Optional[Any] = None
    created_at: datetime
    dispatched_at: Optional[datetime] = None
    at_scene_at: Optional[datetime] = None
    transporting_at: Optional[datetime] = None
    hospital_reached_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    assigned_ambulance: Optional[AmbulanceResponse] = None
    assigned_hospital: Optional[HospitalResponse] = None

    class Config:
        from_attributes = True
