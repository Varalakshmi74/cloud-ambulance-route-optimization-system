from fastapi import APIRouter, HTTPException
from app.schemas.routing import RouteCalculationRequest, RouteCalculationResponse
from app.services.routing_service import routing_service

router = APIRouter(prefix="/routing", tags=["Routing Optimization"])

@router.post("/calculate", response_model=RouteCalculationResponse)
async def calculate_route(payload: RouteCalculationRequest):
    """
    Calculate optimal ambulance route using OpenStreetMap OSRM:
    - Analyzes fastest corridor
    - Generates turn-by-turn navigation steps
    - Returns alternative routes (Expressway vs Arterial)
    - Returns total distance and duration with emergency traffic clearance factors
    """
    waypoints = None
    if payload.waypoints:
        waypoints = [(wp.lat, wp.lng) for wp in payload.waypoints]

    route_data = await routing_service.get_osrm_route(
        lat1=payload.origin.lat,
        lon1=payload.origin.lng,
        lat2=payload.destination.lat,
        lon2=payload.destination.lng,
        waypoints=waypoints
    )

    return route_data
