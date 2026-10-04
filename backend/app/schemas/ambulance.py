from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AmbulanceBase(BaseModel):
    vehicle_number: str
    model_name: str = "Mercedes Sprinter"
    ambulance_type: str = "ALS"
    status: str = "AVAILABLE"
    current_latitude: float
    current_longitude: float
    heading_degrees: float = 0.0
    current_speed_kmh: float = 0.0
    fuel_level_percent: float = 95.0
    driver_name: str = "Staff Paramedic"
    driver_phone: str = "+1-800-555-0199"
    current_emergency_id: Optional[int] = None

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdateLocation(BaseModel):
    current_latitude: float
    current_longitude: float
    heading_degrees: Optional[float] = 0.0
    current_speed_kmh: Optional[float] = 0.0
    fuel_level_percent: Optional[float] = None
    status: Optional[str] = None

class AmbulanceUpdateStatus(BaseModel):
    status: str
    current_emergency_id: Optional[int] = None

class AmbulanceResponse(AmbulanceBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True
