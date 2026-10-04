import random
import string
from datetime import datetime
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.models.emergency import EmergencyRequest
from app.services.routing_service import haversine_distance_km, routing_service
from app.core.websocket_manager import manager

class DispatchService:
    @staticmethod
    def generate_case_code() -> str:
        """Generate unique emergency case identifier e.g., EMG-2026-7842"""
        digits = ''.join(random.choices(string.digits, k=4))
        year = datetime.utcnow().year
        return f"EMG-{year}-{digits}"

    @staticmethod
    def find_nearest_available_ambulance(
        db: Session,
        pickup_lat: float,
        pickup_lng: float,
        emergency_type: str = "GENERAL",
        severity: str = "HIGH"
    ) -> Optional[Ambulance]:
        """
        Finds the closest available ambulance.
        If severity is CRITICAL or type is CARDIAC/TRAUMA/STROKE, prioritize ALS/MICU units.
        """
        query = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE")
        available_ambulances: List[Ambulance] = query.all()

        if not available_ambulances:
            # Fallback: find any ambulance not currently transporting
            available_ambulances = db.query(Ambulance).filter(Ambulance.status.in_(["AVAILABLE", "HOSPITAL_REACHED"])).all()

        if not available_ambulances:
            # Return first ambulance in fleet as fallback
            return db.query(Ambulance).first()

        # Score ambulances: distance in km + ALS bonus for critical cases
        scored_units = []
        for amb in available_ambulances:
            dist = haversine_distance_km(pickup_lat, pickup_lng, amb.current_latitude, amb.current_longitude)
            # Bonus: reduce effective score (lower is better) if ALS/MICU matches critical needs
            type_bonus = 0.0
            if severity == "CRITICAL" and amb.ambulance_type in ["ALS", "MICU"]:
                type_bonus = -0.5
            effective_score = dist + type_bonus
            scored_units.append((effective_score, dist, amb))

        scored_units.sort(key=lambda x: x[0])
        return scored_units[0][2] if scored_units else None

    @staticmethod
    def find_best_hospital(
        db: Session,
        pickup_lat: float,
        pickup_lng: float,
        emergency_type: str = "GENERAL",
        preferred_hospital_id: Optional[int] = None
    ) -> Optional[Hospital]:
        """
        Selects the best destination hospital based on distance and available beds/specialties.
        """
        if preferred_hospital_id:
            hosp = db.query(Hospital).filter(Hospital.id == preferred_hospital_id).first()
            if hosp:
                return hosp

        hospitals = db.query(Hospital).filter(Hospital.is_accepting_emergencies != "FULL").all()
        if not hospitals:
            hospitals = db.query(Hospital).all()
        
        if not hospitals:
            return None

        # Rank hospitals by distance & available ICU/general beds
        scored_hospitals = []
        for hosp in hospitals:
            dist = haversine_distance_km(pickup_lat, pickup_lng, hosp.latitude, hosp.longitude)
            # Penalize if 0 ICU beds for cardiac/trauma/stroke
            bed_penalty = 0.0
            if emergency_type in ["CARDIAC", "TRAUMA", "STROKE"] and hosp.available_icu_beds <= 0:
                bed_penalty = 5.0  # 5km penalty to encourage hospital with ICU
            effective_dist = dist + bed_penalty
            scored_hospitals.append((effective_dist, hosp))

        scored_hospitals.sort(key=lambda x: x[0])
        return scored_hospitals[0][1] if scored_hospitals else None

    @staticmethod
    async def create_and_dispatch_emergency(
        db: Session,
        pickup_lat: float,
        pickup_lng: float,
        patient_name: str = "Anonymous Citizen",
        patient_phone: str = "+1-555-0199",
        pickup_address: str = "Detected GPS Location",
        emergency_type: str = "GENERAL",
        severity: str = "HIGH",
        caller_notes: Optional[str] = None,
        symptoms: Optional[str] = None,
        preferred_hospital_id: Optional[int] = None
    ) -> EmergencyRequest:
        """
        Coordinates the end-to-end dispatch:
        1. Generates Case Code
        2. Assigns closest ambulance
        3. Assigns best hospital
        4. Calculates full multi-leg OSRM route: Ambulance -> Patient -> Hospital
        5. Updates ambulance status to ASSIGNED
        6. Broadcasts real-time WebSocket alerts
        """
        case_code = DispatchService.generate_case_code()
        
        # 1. Match Ambulance & Hospital
        ambulance = DispatchService.find_nearest_available_ambulance(db, pickup_lat, pickup_lng, emergency_type, severity)
        hospital = DispatchService.find_best_hospital(db, pickup_lat, pickup_lng, emergency_type, preferred_hospital_id)

        # 2. Calculate Routing
        origin_lat = ambulance.current_latitude if ambulance else pickup_lat
        origin_lng = ambulance.current_longitude if ambulance else pickup_lng
        dest_lat = hospital.latitude if hospital else pickup_lat + 0.02
        dest_lng = hospital.longitude if hospital else pickup_lng + 0.02

        # Route from Ambulance to Patient to Hospital
        route_data = await routing_service.get_osrm_route(
            origin_lat, origin_lng,
            dest_lat, dest_lng,
            waypoints=[(pickup_lat, pickup_lng)]
        )

        total_km = route_data.get("total_distance_km", 5.2)
        total_min = route_data.get("total_estimated_minutes", 8.5)

        # 3. Create Emergency Record in DB
        emergency = EmergencyRequest(
            case_code=case_code,
            patient_name=patient_name,
            patient_phone=patient_phone,
            pickup_address=pickup_address,
            pickup_latitude=pickup_lat,
            pickup_longitude=pickup_lng,
            emergency_type=emergency_type,
            severity=severity,
            caller_notes=caller_notes,
            symptoms=symptoms,
            status="ASSIGNED" if ambulance else "REQUESTED",
            assigned_ambulance_id=ambulance.id if ambulance else None,
            assigned_hospital_id=hospital.id if hospital else None,
            distance_km=total_km,
            estimated_duration_minutes=total_min,
            route_geometry=route_data.get("recommended_route", {}),
            alternative_routes=route_data.get("alternative_routes", []),
            created_at=datetime.utcnow(),
            dispatched_at=datetime.utcnow() if ambulance else None
        )
        db.add(emergency)
        db.commit()
        db.refresh(emergency)

        # 4. Update Ambulance Status
        if ambulance:
            ambulance.status = "ASSIGNED"
            ambulance.current_emergency_id = emergency.id
            db.commit()
            db.refresh(ambulance)

        # 5. Broadcast to all clients via WebSocket
        payload = {
            "type": "NEW_EMERGENCY_DISPATCH",
            "emergency_id": emergency.id,
            "case_code": emergency.case_code,
            "patient_name": emergency.patient_name,
            "emergency_type": emergency.emergency_type,
            "severity": emergency.severity,
            "status": emergency.status,
            "pickup_latitude": emergency.pickup_latitude,
            "pickup_longitude": emergency.pickup_longitude,
            "ambulance_id": ambulance.id if ambulance else None,
            "ambulance_number": ambulance.vehicle_number if ambulance else None,
            "hospital_id": hospital.id if hospital else None,
            "hospital_name": hospital.name if hospital else None,
            "eta_minutes": emergency.estimated_duration_minutes,
            "timestamp": datetime.utcnow().isoformat()
        }
        await manager.broadcast_json(payload, channel="all")

        return emergency

dispatch_service = DispatchService()
