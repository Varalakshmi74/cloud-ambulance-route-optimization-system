import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  PATIENT: {
    role: "PATIENT",
    name: "Sarah Jenkins",
    email: "sarah.patient@emergency.cloud",
    phone: "+1-555-0199",
    title: "Citizen / Emergency Requester",
    avatarColor: "bg-red-500",
  },
  DRIVER: {
    role: "DRIVER",
    name: "Capt. David Miller",
    email: "driver.als01@emergency.cloud",
    phone: "+1-555-8812",
    title: "ALS Paramedic Driver (Unit MED-ALS-01)",
    ambulanceId: 1,
    vehicleNumber: "MED-ALS-01",
    avatarColor: "bg-amber-500",
  },
  HOSPITAL_ADMIN: {
    role: "HOSPITAL_ADMIN",
    name: "Dr. Aris Thorne",
    email: "dr.thorne@apex-trauma.med",
    phone: "+1-800-444-0101",
    title: "Chief of Emergency Services (Apex Trauma)",
    hospitalId: 1,
    hospitalName: "Apex Central Trauma Center",
    avatarColor: "bg-emerald-500",
  },
  DISPATCH_ADMIN: {
    role: "DISPATCH_ADMIN",
    name: "Commander Elena Vance",
    email: "elena.vance@cloud-command.gov",
    phone: "+1-800-CLOUD-HQ",
    title: "Central Cloud Dispatch & Fleet Director",
    avatarColor: "bg-blue-500",
  },
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("cloud_emergency_role") || "PATIENT";
  });

  const [activeAmbulanceId, setActiveAmbulanceId] = useState(1);
  const [activeHospitalId, setActiveHospitalId] = useState(1);

  const currentUser = DEFAULT_USERS[currentRole] || DEFAULT_USERS.PATIENT;

  const switchRole = (newRole) => {
    if (DEFAULT_USERS[newRole]) {
      setCurrentRole(newRole);
      localStorage.setItem("cloud_emergency_role", newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        switchRole,
        activeAmbulanceId,
        setActiveAmbulanceId,
        activeHospitalId,
        setActiveHospitalId,
        availableRoles: Object.keys(DEFAULT_USERS),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
