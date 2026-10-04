from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    case_code = Column(String(30), unique=True, index=True)  # e.g., "EMG-2026-8492"
    
    # Patient info
    patient_name = Column(String(100), default="Anonymous Citizen")
    patient_phone = Column(String(30), default="+1-555-0199")
    caller_notes = Column(Text, nullable=True)
    
    # Location
    pickup_address = Column(String(255), default="Detected GPS Location")
    pickup_latitude = Column(Float, nullable=False)
    pickup_longitude = Column(Float, nullable=False)
    
    # Triage Classification
    emergency_type = Column(String(50), default="GENERAL")  # CARDIAC, TRAUMA, RESPIRATORY, STROKE, PREGNANCY, BURN, GENERAL
    severity = Column(String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM
    symptoms = Column(String(255), nullable=True)
    
    # Dispatch Status Lifecycle
    # REQUESTED -> ASSIGNED -> ON_THE_WAY -> AT_SCENE -> TRANSPORTING -> HOSPITAL_REACHED -> COMPLETED -> CANCELLED
    status = Column(String(30), default="REQUESTED", index=True)
    
    # Assignments
    assigned_ambulance_id = Column(Integer, ForeignKey("ambulances.id", ondelete="SET NULL"), nullable=True)
    assigned_hospital_id = Column(Integer, ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    
    # Route & Telemetry info
    distance_km = Column(Float, default=0.0)
    estimated_duration_minutes = Column(Float, default=0.0)
    route_geometry = Column(JSON, nullable=True)  # GeoJSON coordinates for map rendering
    alternative_routes = Column(JSON, nullable=True) # Alternative routes (Shortest, Arterial)
    
    # Timestamps for SLA tracking (Cloud Telemetry)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    dispatched_at = Column(DateTime, nullable=True)
    at_scene_at = Column(DateTime, nullable=True)
    transporting_at = Column(DateTime, nullable=True)
    hospital_reached_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    assigned_ambulance = relationship("Ambulance", foreign_keys=[assigned_ambulance_id])
    assigned_hospital = relationship("Hospital", foreign_keys=[assigned_hospital_id])
