from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    phone = Column(String(30), default="+1-800-EMERGENCY")
    emergency_contact = Column(String(30), default="+1-800-HOTLINE")
    
    # Bed Capacities
    total_general_beds = Column(Integer, default=50)
    available_general_beds = Column(Integer, default=12)
    total_icu_beds = Column(Integer, default=15)
    available_icu_beds = Column(Integer, default=4)
    total_ventilators = Column(Integer, default=10)
    available_ventilators = Column(Integer, default=3)
    
    # Capabilities & Trauma level (Level 1, Level 2, Level 3)
    trauma_level = Column(String(20), default="Level 1")
    specialties = Column(String(255), default="Cardiology, Neurology, Trauma, Pediatric")
    
    # Status
    is_accepting_emergencies = Column(String(10), default="YES")  # YES, BUSY, FULL
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
