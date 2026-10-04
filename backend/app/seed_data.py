from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.hospital import Hospital
from app.models.ambulance import Ambulance
from app.models.emergency import EmergencyRequest
from app.models.user import User

def seed_database(db: Session, force_reset: bool = False):
    """Seed initial hospitals, ambulance fleet, users, and historical emergency logs."""
    if force_reset:
        db.query(EmergencyRequest).delete()
        db.query(Ambulance).delete()
        db.query(Hospital).delete()
        db.query(User).delete()
        db.commit()

    if db.query(Hospital).count() > 0:
        return  # Already seeded

    # 1. Seed Demo Hospitals
    hospitals_data = [
        {
            "name": "Apex Central Trauma Center & Super Specialty",
            "address": "Victoria Road, Central Business District",
            "latitude": 12.9719,
            "longitude": 77.6070,
            "phone": "+1-800-APEX-911",
            "emergency_contact": "+1-800-444-0101",
            "total_general_beds": 80,
            "available_general_beds": 24,
            "total_icu_beds": 20,
            "available_icu_beds": 6,
            "total_ventilators": 15,
            "available_ventilators": 5,
            "trauma_level": "Level 1 Trauma",
            "specialties": "Cardiology, Neurosurgery, Polytrauma, Burns",
            "is_accepting_emergencies": "YES"
        },
        {
            "name": "St. Jude Memorial Emergency Hospital",
            "address": "Richmond Road, Near Metro Junction",
            "latitude": 12.9620,
            "longitude": 77.6100,
            "phone": "+1-800-JUDE-EMS",
            "emergency_contact": "+1-800-444-0102",
            "total_general_beds": 60,
            "available_general_beds": 14,
            "total_icu_beds": 16,
            "available_icu_beds": 4,
            "total_ventilators": 12,
            "available_ventilators": 3,
            "trauma_level": "Level 1 Trauma",
            "specialties": "Stroke Care, Acute Cardiac, Pediatric ICU",
            "is_accepting_emergencies": "YES"
        },
        {
            "name": "Metropolitan Heart & Lung Institute",
            "address": "Koramangala 4th Block, 80 Feet Road",
            "latitude": 12.9345,
            "longitude": 77.6265,
            "phone": "+1-800-HEART-ER",
            "emergency_contact": "+1-800-444-0103",
            "total_general_beds": 45,
            "available_general_beds": 8,
            "total_icu_beds": 14,
            "available_icu_beds": 3,
            "total_ventilators": 10,
            "available_ventilators": 2,
            "trauma_level": "Level 2 Trauma",
            "specialties": "Emergency Angioplasty, Thoracic, ECMO",
            "is_accepting_emergencies": "YES"
        },
        {
            "name": "Northside General & Pediatric ER",
            "address": "Malleshwaram Main Road, North Division",
            "latitude": 12.9960,
            "longitude": 77.5710,
            "phone": "+1-800-NORTH-ER",
            "emergency_contact": "+1-800-444-0104",
            "total_general_beds": 55,
            "available_general_beds": 19,
            "total_icu_beds": 12,
            "available_icu_beds": 5,
            "total_ventilators": 8,
            "available_ventilators": 4,
            "trauma_level": "Level 2 Trauma",
            "specialties": "Pediatric Emergency, Obstetrics, General Trauma",
            "is_accepting_emergencies": "YES"
        },
        {
            "name": "Westgate Orthopedic & Emergency Care",
            "address": "Rajajinagar 1st Block, Industrial Ring",
            "latitude": 12.9880,
            "longitude": 77.5530,
            "phone": "+1-800-WEST-911",
            "emergency_contact": "+1-800-444-0105",
            "total_general_beds": 40,
            "available_general_beds": 11,
            "total_icu_beds": 10,
            "available_icu_beds": 2,
            "total_ventilators": 6,
            "available_ventilators": 1,
            "trauma_level": "Level 3 Trauma",
            "specialties": "Fractures, Spinal Injury, Acute Surgery",
            "is_accepting_emergencies": "YES"
        },
        {
            "name": "South Suburban Critical Care Hub",
            "address": "Jayanagar 4th T Block, South Boulevard",
            "latitude": 12.9250,
            "longitude": 77.5830,
            "phone": "+1-800-SOUTH-ER",
            "emergency_contact": "+1-800-444-0106",
            "total_general_beds": 70,
            "available_general_beds": 16,
            "total_icu_beds": 18,
            "available_icu_beds": 5,
            "total_ventilators": 12,
            "available_ventilators": 4,
            "trauma_level": "Level 1 Trauma",
            "specialties": "Multi-Organ Support, Toxicology, Trauma",
            "is_accepting_emergencies": "YES"
        }
    ]

    hospitals = []
    for h in hospitals_data:
        hosp = Hospital(**h)
        db.add(hosp)
        hospitals.append(hosp)
    db.commit()

    # 2. Seed Ambulance Fleet
    ambulances_data = [
        {
            "vehicle_number": "MED-ALS-01",
            "model_name": "Mercedes Benz Sprinter 3500 (ALS)",
            "ambulance_type": "ALS",
            "status": "AVAILABLE",
            "current_latitude": 12.9750,
            "current_longitude": 77.5920,
            "heading_degrees": 45.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 94.0,
            "driver_name": "Officer David Miller",
            "driver_phone": "+1-555-8812"
        },
        {
            "vehicle_number": "MED-MICU-02",
            "model_name": "Ford Transit 350 HD (Mobile ICU)",
            "ambulance_type": "MICU",
            "status": "AVAILABLE",
            "current_latitude": 12.9650,
            "current_longitude": 77.6150,
            "heading_degrees": 90.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 88.5,
            "driver_name": "Paramedic Sarah Connor",
            "driver_phone": "+1-555-4421"
        },
        {
            "vehicle_number": "MED-ALS-03",
            "model_name": "Mercedes Benz Sprinter 2500 (ALS)",
            "ambulance_type": "ALS",
            "status": "AVAILABLE",
            "current_latitude": 12.9420,
            "current_longitude": 77.6180,
            "heading_degrees": 180.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 96.0,
            "driver_name": "Captain Marcus Brody",
            "driver_phone": "+1-555-9012"
        },
        {
            "vehicle_number": "MED-BLS-04",
            "model_name": "Ram ProMaster 2500 (BLS Rapid)",
            "ambulance_type": "BLS",
            "status": "AVAILABLE",
            "current_latitude": 12.9820,
            "current_longitude": 77.5810,
            "heading_degrees": 270.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 82.0,
            "driver_name": "Paramedic Chloe Davis",
            "driver_phone": "+1-555-1234"
        },
        {
            "vehicle_number": "MED-ALS-05",
            "model_name": "Mercedes Sprinter 3500 (ALS)",
            "ambulance_type": "ALS",
            "status": "AVAILABLE",
            "current_latitude": 12.9910,
            "current_longitude": 77.5610,
            "heading_degrees": 120.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 91.0,
            "driver_name": "Officer Jason Reed",
            "driver_phone": "+1-555-7765"
        },
        {
            "vehicle_number": "MED-MICU-06",
            "model_name": "Freightliner M2 (Heavy MICU)",
            "ambulance_type": "MICU",
            "status": "AVAILABLE",
            "current_latitude": 12.9280,
            "current_longitude": 77.5910,
            "heading_degrees": 330.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 85.0,
            "driver_name": "Captain Priya Nair",
            "driver_phone": "+1-555-3398"
        },
        {
            "vehicle_number": "MED-BLS-07",
            "model_name": "Chevrolet Express G3500 (BLS)",
            "ambulance_type": "BLS",
            "status": "AVAILABLE",
            "current_latitude": 12.9510,
            "current_longitude": 77.5700,
            "heading_degrees": 15.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 79.0,
            "driver_name": "Paramedic Luke Vance",
            "driver_phone": "+1-555-5512"
        },
        {
            "vehicle_number": "MED-ALS-08",
            "model_name": "Mercedes Benz Sprinter 3500 (ALS)",
            "ambulance_type": "ALS",
            "status": "AVAILABLE",
            "current_latitude": 12.9690,
            "current_longitude": 77.6320,
            "heading_degrees": 210.0,
            "current_speed_kmh": 0.0,
            "fuel_level_percent": 98.0,
            "driver_name": "Officer Maya Lin",
            "driver_phone": "+1-555-9988"
        }
    ]

    for a in ambulances_data:
        amb = Ambulance(**a)
        db.add(amb)
    db.commit()

    # 3. Seed Sample Past Completed Emergencies for Admin Analytics & Heatmap
    sample_completed = [
        {
            "case_code": "EMG-2026-1029",
            "patient_name": "Arthur Dent",
            "patient_phone": "+1-555-0144",
            "pickup_address": "Indiranagar 100ft Road, Sector 2",
            "pickup_latitude": 12.9710,
            "pickup_longitude": 77.6410,
            "emergency_type": "CARDIAC",
            "severity": "CRITICAL",
            "status": "COMPLETED",
            "assigned_ambulance_id": 1,
            "assigned_hospital_id": 1,
            "distance_km": 4.8,
            "estimated_duration_minutes": 7.2,
            "created_at": datetime.utcnow() - timedelta(hours=5, minutes=30),
            "dispatched_at": datetime.utcnow() - timedelta(hours=5, minutes=29),
            "at_scene_at": datetime.utcnow() - timedelta(hours=5, minutes=22),
            "transporting_at": datetime.utcnow() - timedelta(hours=5, minutes=16),
            "hospital_reached_at": datetime.utcnow() - timedelta(hours=5, minutes=9),
            "completed_at": datetime.utcnow() - timedelta(hours=5, minutes=2),
            "caller_notes": "Cardiac arrest restored with CPR & AED, patient admitted to Cath Lab."
        },
        {
            "case_code": "EMG-2026-1035",
            "patient_name": "Samantha Wu",
            "patient_phone": "+1-555-0182",
            "pickup_address": "MG Road Central Metro Hub",
            "pickup_latitude": 12.9740,
            "pickup_longitude": 77.6080,
            "emergency_type": "TRAUMA",
            "severity": "HIGH",
            "status": "COMPLETED",
            "assigned_ambulance_id": 2,
            "assigned_hospital_id": 2,
            "distance_km": 3.1,
            "estimated_duration_minutes": 5.4,
            "created_at": datetime.utcnow() - timedelta(hours=3, minutes=15),
            "dispatched_at": datetime.utcnow() - timedelta(hours=3, minutes=14),
            "at_scene_at": datetime.utcnow() - timedelta(hours=3, minutes=9),
            "transporting_at": datetime.utcnow() - timedelta(hours=3, minutes=5),
            "hospital_reached_at": datetime.utcnow() - timedelta(hours=3, minutes=0),
            "completed_at": datetime.utcnow() - timedelta(hours=2, minutes=55),
            "caller_notes": "Pedestrian hit by e-bike, minor cranial laceration stabilized."
        },
        {
            "case_code": "EMG-2026-1042",
            "patient_name": "Devon Miller",
            "patient_phone": "+1-555-0993",
            "pickup_address": "Koramangala 5th Block",
            "pickup_latitude": 12.9360,
            "pickup_longitude": 77.6210,
            "emergency_type": "RESPIRATORY",
            "severity": "HIGH",
            "status": "COMPLETED",
            "assigned_ambulance_id": 3,
            "assigned_hospital_id": 3,
            "distance_km": 2.4,
            "estimated_duration_minutes": 4.1,
            "created_at": datetime.utcnow() - timedelta(hours=1, minutes=45),
            "dispatched_at": datetime.utcnow() - timedelta(hours=1, minutes=44),
            "at_scene_at": datetime.utcnow() - timedelta(hours=1, minutes=40),
            "transporting_at": datetime.utcnow() - timedelta(hours=1, minutes=36),
            "hospital_reached_at": datetime.utcnow() - timedelta(hours=1, minutes=32),
            "completed_at": datetime.utcnow() - timedelta(hours=1, minutes=28),
            "caller_notes": "Severe asthma attack with SpO2 stabilized to 97% via nebulizer."
        }
    ]

    for em in sample_completed:
        req = EmergencyRequest(**em)
        db.add(req)
    db.commit()

    # 4. Seed Users for Auth / Role Switcher
    users = [
        User(full_name="Sarah Jenkins", email="patient@emergency.cloud", phone="+1-555-0199", role="PATIENT"),
        User(full_name="David Miller", email="driver1@emergency.cloud", phone="+1-555-8812", role="DRIVER"),
        User(full_name="Dr. Aris Thorne", email="hospital@emergency.cloud", phone="+1-800-444-0101", role="HOSPITAL_ADMIN"),
        User(full_name="Commander Elena Vance", email="admin@emergency.cloud", phone="+1-800-CLOUD-HQ", role="DISPATCH_ADMIN")
    ]
    for u in users:
        db.add(u)
    db.commit()
