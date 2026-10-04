import asyncio
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.ambulance import Ambulance
from app.models.emergency import EmergencyRequest
from app.core.database import SessionLocal
from app.core.websocket_manager import manager

class SimulationService:
    @staticmethod
    async def step_simulation(emergency_id: int, step_index: int):
        """
        Advances the vehicle position for an emergency along its route coordinates.
        Broadcasts vehicle position telemetry.
        """
        db: Session = SessionLocal()
        try:
            emergency = db.query(EmergencyRequest).filter(EmergencyRequest.id == emergency_id).first()
            if not emergency or not emergency.assigned_ambulance:
                return

            ambulance = emergency.assigned_ambulance
            route_coords = []
            if emergency.route_geometry and isinstance(emergency.route_geometry, dict):
                route_coords = emergency.route_geometry.get("coordinates", [])

            if not route_coords:
                return

            total_pts = len(route_coords)
            target_idx = min(step_index, total_pts - 1)
            target_pt = route_coords[target_idx]

            # Update ambulance GPS in DB
            ambulance.current_latitude = target_pt[0]
            ambulance.current_longitude = target_pt[1]
            ambulance.current_speed_kmh = 52.0 if target_idx < total_pts - 1 else 0.0
            
            # Lifecycle milestone auto-progress based on percent complete
            pct = (target_idx / max(1, total_pts - 1)) * 100.0
            if pct < 35 and ambulance.status == "ASSIGNED":
                ambulance.status = "ON_THE_WAY"
                emergency.status = "ON_THE_WAY"
            elif 35 <= pct < 50 and ambulance.status != "AT_SCENE" and emergency.status != "TRANSPORTING":
                ambulance.status = "AT_SCENE"
                emergency.status = "AT_SCENE"
                if not emergency.at_scene_at:
                    emergency.at_scene_at = datetime.utcnow()
            elif 50 <= pct < 90 and emergency.status != "TRANSPORTING" and emergency.status != "HOSPITAL_REACHED":
                ambulance.status = "TRANSPORTING"
                emergency.status = "TRANSPORTING"
                if not emergency.transporting_at:
                    emergency.transporting_at = datetime.utcnow()
            elif pct >= 90 and emergency.status != "HOSPITAL_REACHED" and emergency.status != "COMPLETED":
                ambulance.status = "HOSPITAL_REACHED"
                emergency.status = "HOSPITAL_REACHED"
                if not emergency.hospital_reached_at:
                    emergency.hospital_reached_at = datetime.utcnow()

            db.commit()

            # Push live WebSocket GPS Telemetry
            telemetry = {
                "type": "AMBULANCE_GPS_TELEMETRY",
                "emergency_id": emergency.id,
                "ambulance_id": ambulance.id,
                "vehicle_number": ambulance.vehicle_number,
                "latitude": ambulance.current_latitude,
                "longitude": ambulance.current_longitude,
                "speed_kmh": ambulance.current_speed_kmh,
                "status": emergency.status,
                "progress_percent": round(pct, 1),
                "step_index": target_idx,
                "total_steps": total_pts,
                "timestamp": datetime.utcnow().isoformat()
            }
            await manager.broadcast_json(telemetry, channel="all")
            return telemetry
        finally:
            db.close()

simulation_service = SimulationService()
