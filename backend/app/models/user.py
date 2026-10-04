from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    role = Column(String(30), default="PATIENT")  # PATIENT, DRIVER, HOSPITAL_ADMIN, DISPATCH_ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
