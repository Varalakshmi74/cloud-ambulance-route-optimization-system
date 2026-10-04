from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    role: str = "PATIENT"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
