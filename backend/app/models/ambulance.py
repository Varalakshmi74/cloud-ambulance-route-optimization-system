from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, index=True, nullable=False)
    model_name = Column(String(100), default="Mercedes Sprinter / Force Traveller")
    ambulance_type = Column(String(30), default="ALS")  # ALS (Advanced Life Support), BLS (Basic), MICU (Mobile ICU)
    
    # Status: AVAILABLE, ASSIGNED, ON_THE_WAY, AT_SCENE, TRANSPORTING, HOSPITAL_REACHED, MAINTENANCE
    status = Column(String(30), default="AVAILABLE", index=True)
    
    current_latitude = Column(Float, nullable=False)
    current_longitude = Column(Float, nullable=False)
    heading_degrees = Column(Float, default=0.0)
    current_speed_kmh = Column(Float, default=0.0)
    fuel_level_percent = Column(Float, default=95.0)
    
    # Assigned Driver Info
    driver_name = Column(String(100), default="Staff Paramedic")
    driver_phone = Column(String(30), default="+1-800-555-0199")
    
    # Active Assigned Request
    current_emergency_id = Column(Integer, ForeignKey("emergency_requests.id", ondelete="SET NULL"), nullable=True)
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    active_emergency = relationship("EmergencyRequest", foreign_keys=[current_emergency_id], post_update=True)
