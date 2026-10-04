import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { emergencyApi, ambulanceApi, hospitalApi } from "../services/api";
import { wsClient } from "../services/websocket";
import { soundEffects } from "../utils/soundEffects";
import confetti from "canvas-confetti";

const EmergencyContext = createContext(null);

export const EmergencyProvider = ({ children }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial data
  const refreshData = useCallback(async () => {
    try {
      const [emgList, ambList, hospList] = await Promise.all([
        emergencyApi.getAll(),
        ambulanceApi.getAll(),
        hospitalApi.getAll(),
      ]);

      setEmergencies(emgList);
      setAmbulances(ambList);
      setHospitals(hospList);

      // Find active ongoing emergency if any
      const ongoing = emgList.find((e) => !["COMPLETED", "CANCELLED"].includes(e.status));
      if (ongoing && !activeEmergency) {
        setActiveEmergency(ongoing);
      }
    } catch (err) {
      console.warn("Failed to fetch initial emergency state:", err);
    } finally {
      setLoading(false);
    }
  }, [activeEmergency]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // WebSocket event handler
  useEffect(() => {
    wsClient.connect("all");

    const unsubscribe = wsClient.subscribe((msg) => {
      if (msg.type === "WS_CONNECTED") {
        setWsConnected(true);
        return;
      }

      if (msg.type === "NEW_EMERGENCY_DISPATCH") {
        soundEffects.playSirenPing();
        addToast({
          type: "danger",
          title: `🚨 SOS DISPATCH: ${msg.case_code}`,
          message: `${msg.emergency_type} - Ambulance ${msg.ambulance_number || "Dispatched"} (ETA: ${msg.eta_minutes || "8"} min)`,
          duration: 7000,
        });
        refreshData();
      } else if (msg.type === "EMERGENCY_STATUS_UPDATED") {
        if (msg.new_status === "COMPLETED") {
          soundEffects.playSuccessChime();
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 },
          });
          addToast({
            type: "success",
            title: `✅ Mission Accomplished: ${msg.case_code}`,
            message: "Patient safely delivered to ER Trauma Bay. Case logged to cloud.",
            duration: 6000,
          });
        } else {
          addToast({
            type: "info",
            title: `Status Update: ${msg.case_code}`,
            message: `Current stage: ${msg.new_status.replace(/_/g, " ")}`,
            duration: 4000,
          });
        }
        refreshData();
      } else if (msg.type === "AMBULANCE_GPS_TELEMETRY" || msg.type === "AMBULANCE_LOCATION_UPDATED") {
        setAmbulances((prev) =>
          prev.map((a) =>
            a.id === msg.ambulance_id
              ? {
                  ...a,
                  current_latitude: msg.latitude,
                  current_longitude: msg.longitude,
                  current_speed_kmh: msg.speed_kmh || a.current_speed_kmh,
                  status: msg.status || a.status,
                }
              : a
          )
        );
      } else if (msg.type === "HOSPITAL_CAPACITY_UPDATED") {
        setHospitals((prev) =>
          prev.map((h) =>
            h.id === msg.hospital_id
              ? {
                  ...h,
                  available_general_beds: msg.available_general_beds,
                  available_icu_beds: msg.available_icu_beds,
                  available_ventilators: msg.available_ventilators,
                  is_accepting_emergencies: msg.is_accepting_emergencies,
                }
              : h
          )
        );
        addToast({
          type: "info",
          title: `🏥 Hospital Bed Update`,
          message: `${msg.hospital_name}: ${msg.available_icu_beds} ICU Beds available.`,
          duration: 3500,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addToast, refreshData]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.soundEnabled = next;
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        activeEmergency,
        setActiveEmergency,
        ambulances,
        hospitals,
        toasts,
        addToast,
        removeToast,
        soundEnabled,
        toggleSound,
        loading,
        wsConnected,
        refreshData,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
};
