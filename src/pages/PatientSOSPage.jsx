import React, { useState, useEffect } from "react";
import { useEmergency } from "../context/EmergencyContext";
import { emergencyApi, hospitalApi } from "../services/api";
import { EMERGENCY_TYPES, STATUS_STEPS, SEVERITY_BADGES } from "../utils/constants";
import { LiveMap } from "../components/map/LiveMap";
import { Badge } from "../components/common/Badge";
import { DemoControlPanel } from "../components/simulation/DemoControlPanel";
import {
  Siren,
  MapPin,
  HeartPulse,
  Navigation,
  Phone,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  CheckCircle2,
  User,
  Activity,
  Loader2,
  Sparkles
} from "lucide-react";

export const PatientSOSPage = () => {
  const { emergencies, activeEmergency, setActiveEmergency, ambulances, hospitals, addToast, refreshData } =
    useEmergency();

  const [selectedType, setSelectedType] = useState("CARDIAC");
  const [patientName, setPatientName] = useState("Sarah Jenkins");
  const [patientPhone, setPatientPhone] = useState("+1-555-0199");
  const [callerNotes, setCallerNotes] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);

  // Default GPS Location: Bangalore City Center
  const [pickupLocation, setPickupLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    address: "MG Road Central Plaza, Bangalore",
  });

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect browser GPS
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      addToast({
        type: "warning",
        title: "GPS Unavailable",
        message: "Geolocation is not supported by your browser. Using city center preset.",
      });
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickupLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `Detected GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        });
        setIsDetectingGps(false);
        addToast({
          type: "success",
          title: "GPS Location Acquired",
          message: "High-accuracy coordinates captured.",
        });
      },
      (err) => {
        console.warn("Geolocation fallback:", err);
        setIsDetectingGps(false);
        addToast({
          type: "info",
          title: "Using High-Precision Demo Coordinates",
          message: "Location pinned to Metro Center for realistic routing simulation.",
        });
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const handleMapLocationSelect = (coords) => {
    setPickupLocation({
      lat: coords.lat,
      lng: coords.lng,
      address: `Custom Pinned Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
    });
    addToast({
      type: "info",
      title: "Pickup Location Updated",
      message: "Pinned emergency location on map.",
    });
  };

  const handleTriggerSOS = async () => {
    try {
      setIsSubmitting(true);
      const selectedObj = EMERGENCY_TYPES.find((t) => t.id === selectedType) || EMERGENCY_TYPES[0];

      const res = await emergencyApi.createSOS({
        patient_name: patientName,
        patient_phone: patientPhone,
        pickup_latitude: pickupLocation.lat,
        pickup_longitude: pickupLocation.lng,
        pickup_address: pickupLocation.address,
        emergency_type: selectedType,
        severity: selectedObj.severity,
        caller_notes: callerNotes || selectedObj.description,
        preferred_hospital_id: selectedHospitalId,
      });

      setActiveEmergency(res);
      await refreshData();

      addToast({
        type: "danger",
        title: "🚨 SOS DISPATCH ACTIVE",
        message: `Case ${res.case_code} assigned to nearest ambulance. Live route calculated!`,
        duration: 8000,
      });
    } catch (err) {
      addToast({
        type: "danger",
        title: "SOS Trigger Failed",
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find active emergency data
  const currentOngoing =
    activeEmergency || emergencies.find((e) => !["COMPLETED", "CANCELLED"].includes(e.status));

  return (
    <div className="space-y-6 pb-12">
      {/* Evaluator Simulation Toolbar */}
      <DemoControlPanel onScenarioTriggered={(emg) => setActiveEmergency(emg)} />

      {/* Main Grid: Left SOS & Live Status | Right Map & Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Emergency Status Banner if ongoing */}
          {currentOngoing && (
            <div className="glass-emergency p-5 rounded-2xl border border-red-500/50 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-600 text-white animate-sos-pulse">
                    <Siren className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                      LIVE EMERGENCY TRACKER
                    </span>
                    <h3 className="text-lg font-black text-white">{currentOngoing.case_code}</h3>
                    <p className="text-xs text-red-200">
                      {currentOngoing.emergency_type} • {currentOngoing.severity} Severity
                    </p>
                  </div>
                </div>
                <Badge variant="danger">{currentOngoing.status.replace(/_/g, " ")}</Badge>
              </div>

              {/* Status Stepper Progression */}
              <div className="py-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                  <span>Dispatch Lifecycle</span>
                  <span className="text-red-400">
                    {STATUS_STEPS.findIndex((s) => s.key === currentOngoing.status) + 1} of{" "}
                    {STATUS_STEPS.length} Steps
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.findIndex((s) => s.key === currentOngoing.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div
                        key={step.key}
                        title={step.label}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCurrent
                            ? "bg-red-500 animate-pulse ring-2 ring-red-400/50"
                            : isDone
                            ? "bg-emerald-500"
                            : "bg-slate-800"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Assigned Ambulance & ETA Details */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Unit</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {currentOngoing.assigned_ambulance?.vehicle_number || "MED-ALS-01"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentOngoing.assigned_ambulance?.driver_name || "Paramedic Officer"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Est. Arrival Time</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{currentOngoing.estimated_duration_minutes || 6.5} mins
                  </p>
                  <p className="text-[11px] text-slate-400">{currentOngoing.distance_km || 3.4} km away</p>
                </div>
              </div>

              {/* Destination Hospital */}
              {currentOngoing.assigned_hospital && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{currentOngoing.assigned_hospital.name}</p>
                      <p className="text-[10px] text-blue-300">
                        {currentOngoing.assigned_hospital.available_icu_beds} ICU Beds Available
                      </p>
                    </div>
                  </div>
                  <Badge variant="info">Target ER</Badge>
                </div>
              )}
            </div>
          )}

          {/* SOS Trigger Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Siren className="w-5 h-5 text-red-500" />
                  Emergency SOS Request
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-Click cloud dispatch calculates fastest route and notifies nearest paramedic.
                </p>
              </div>
            </div>

            {/* Giant SOS Button */}
            <div className="flex flex-col items-center justify-center py-4">
              <button
                onClick={handleTriggerSOS}
                disabled={isSubmitting}
                className="relative group w-44 h-44 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 p-2 shadow-2xl shadow-red-600/60 hover:shadow-red-600/90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center border-4 border-red-400/40 animate-sos-pulse"
              >
                <div className="w-full h-full rounded-full bg-red-600 flex flex-col items-center justify-center text-white border-2 border-white/20">
                  {isSubmitting ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : (
                    <>
                      <Siren className="w-12 h-12 mb-1 group-hover:animate-bounce transition-transform" />
                      <span className="font-heading font-black text-2xl tracking-wider">SOS</span>
                      <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest">
                        EMERGENCY
                      </span>
                    </>
                  )}
                </div>
              </button>
              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Pressing SOS instantly dispatches the nearest ambulance to your GPS coordinates.
              </p>
            </div>

            {/* GPS Location Auto-detect */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Emergency Pickup Location</span>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetectingGps}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  Auto-Detect GPS
                </button>
              </label>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{pickupLocation.address}</p>
                  <p className="text-[10px] text-slate-400">
                    Lat: {pickupLocation.lat.toFixed(4)}, Lng: {pickupLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Triage Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Emergency Triage Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${type.bg} border-red-500 text-white shadow-md shadow-red-500/20`
                          : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{type.label.split("/")[0]}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            type.severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {type.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caller Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Patient / Caller Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Emergency Phone</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Live Map & Nearby Hospitals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live OpenStreetMap Leaflet View */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  Live Fleet Radar & Route Optimization
                </h4>
                <p className="text-xs text-slate-400">
                  OpenStreetMap + OSRM Engine displaying fastest siren corridors and hospital capacity.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-300 font-semibold">{ambulances.length} Ambulances Active</span>
              </div>
            </div>

            <LiveMap
              center={[pickupLocation.lat, pickupLocation.lng]}
              zoom={13}
              ambulances={ambulances}
              hospitals={hospitals}
              emergencyLocation={pickupLocation}
              activeRoute={currentOngoing?.route_geometry}
              alternativeRoutes={currentOngoing?.alternative_routes || []}
              onSelectLocation={handleMapLocationSelect}
              selectedHospitalId={selectedHospitalId}
              onHospitalClick={(hosp) => {
                setSelectedHospitalId(hosp.id);
                addToast({
                  type: "info",
                  title: `Selected ${hosp.name}`,
                  message: `Preferred destination hospital set. Available ICU Beds: ${hosp.available_icu_beds}`,
                });
              }}
              height="440px"
            />
          </div>

          {/* Nearby Hospital Directory Cards with Live Bed & ICU Capacity */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Nearby Emergency Hospitals & Real-time ICU Beds
                </h4>
                <p className="text-xs text-slate-400">
                  Cloud synchronized bed inventory helping ambulances route to hospitals with matching capacity.
                </p>
              </div>
              <span className="text-xs text-blue-400 font-bold">{hospitals.length} Hospitals Online</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hospitals.map((hosp) => {
                const isSelected = selectedHospitalId === hosp.id;
                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospitalId(isSelected ? null : hosp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "glass-emergency border-blue-500 shadow-lg shadow-blue-500/20"
                        : "glass-card border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-white leading-snug">{hosp.name}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">{hosp.address}</p>
                      </div>
                      <Badge variant={hosp.available_icu_beds > 0 ? "success" : "danger"}>
                        {hosp.trauma_level}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 font-medium">Gen Beds</span>
                        <p className="text-xs font-bold text-slate-200">
                          {hosp.available_general_beds}/{hosp.total_general_beds}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/20">
                        <span className="text-[9px] text-red-300 font-medium">ICU Beds</span>
                        <p className="text-xs font-bold text-red-400">
                          {hosp.available_icu_beds}/{hosp.total_icu_beds}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20">
                        <span className="text-[9px] text-blue-300 font-medium">Ventilators</span>
                        <p className="text-xs font-bold text-blue-400">
                          {hosp.available_ventilators}/{hosp.total_ventilators}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Emergency Contact:</span>
                      <a
                        href={`tel:${hosp.phone}`}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3 h-3" />
                        {hosp.phone}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
