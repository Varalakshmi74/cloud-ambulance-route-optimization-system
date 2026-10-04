from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class RouteStep(BaseModel):
    instruction: str
    distance_meters: float
    duration_seconds: float
    name: Optional[str] = ""

class RouteOption(BaseModel):
    id: str  # "fastest", "shortest", "arterial"
    name: str
    distance_km: float
    duration_minutes: float
    coordinates: List[List[float]]  # [[lat, lng], ...]
    steps: List[RouteStep] = []
    traffic_level: str = "MODERATE"  # LOW, MODERATE, HEAVY
    badge: Optional[str] = None

class RouteCalculationRequest(BaseModel):
    origin: Coordinates
    destination: Coordinates
    waypoints: Optional[List[Coordinates]] = None
    emergency_priority: Optional[str] = "HIGH"

class RouteCalculationResponse(BaseModel):
    recommended_route: RouteOption
    alternative_routes: List[RouteOption] = []
    total_distance_km: float
    total_estimated_minutes: float
    traffic_delay_minutes: float = 0.0
