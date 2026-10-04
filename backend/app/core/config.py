import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cloud Ambulance Route Optimization & Emergency Response System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Cloud / Environment configuration
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./emergency_cloud.db")
    
    # AWS Cloud Deployment readiness settings
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "ambulance-emergency-telemetry-logs")
    
    # OSRM Routing Engine (Public OpenStreetMap OSRM Server)
    OSRM_ROUTING_URL: str = os.getenv("OSRM_ROUTING_URL", "https://router.project-osrm.org")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demo City Center (Bangalore / Tech Hub Coordinates default, fully customizable)
    DEFAULT_LAT: float = 12.9716
    DEFAULT_LNG: float = 77.5946

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
