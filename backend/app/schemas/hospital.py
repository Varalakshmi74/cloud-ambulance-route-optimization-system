from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HospitalBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone: Optional[str] = "+1-800-EMERGENCY"
    emergency_contact: Optional[str] = "+1-800-HOTLINE"
    total_general_beds: int = 50
    available_general_beds: int = 12
    total_icu_beds: int = 15
    available_icu_beds: int = 4
    total_ventilators: int = 10
    available_ventilators: int = 3
    trauma_level: str = "Level 1"
    specialties: str = "Cardiology, Neurology, Trauma, Pediatric"
    is_accepting_emergencies: str = "YES"

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdateCapacity(BaseModel):
    available_general_beds: Optional[int] = None
    available_icu_beds: Optional[int] = None
    available_ventilators: Optional[int] = None
    is_accepting_emergencies: Optional[str] = None

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    distance_km: Optional[float] = None
    estimated_arrival_minutes: Optional[float] = None

    class Config:
        from_attributes = True
