import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmergency } from "../context/EmergencyContext";
import { emergencyApi, ambulanceApi, simulationApi } from "../services/api";
import { LiveMap } from "../components/map/LiveMap";
import { Badge } from "../components/common/Badge";
import {
  Truck,
  Navigation,
  CheckCircle2,
  Phone,
  AlertTriangle,
  User,
  Building2,
  Clock,
  Radio,
  Gauge,
  Fuel,
  Compass,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Play,
  RotateCcw
} from "lucide-react";

export const DriverDashboard = () => {
  const { activeAmbulanceId, setActiveAmbulanceId } = useAuth();
  const { emergencies, ambulances, hospitals, addToast, refreshData } = useEmergency();

  const [selectedRouteType, setSelectedRouteType] = useState("fastest");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isStepping, setIsStepping] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Find assigned ambulance
  const currentAmbulance =
    ambulances.find((a) => a.id === activeAmbulanceId) || ambulances[0] || null;

  // Find active emergency assigned to this driver or any ongoing emergency
  const assignedEmergency =
    emergencies.find(
      (e) =>
        e.assigned_ambulance_id === currentAmbulance?.id &&
        !["COMPLETED", "CANCELLED"].includes(e.status)
    ) ||
    emergencies.find((e) => !["COMPLETED", "CANCELLED"].includes(e.status)) ||
    null;

  const handleStatusTransition = async (nextStatus) => {
    if (!assignedEmergency) return;
    try {
      setIsUpdatingStatus(true);
      await emergencyApi.updateStatus(assignedEmergency.id, nextStatus);
      await refreshData();
      addToast({
        type: "success",
        title: "Status Transited",
        message: `Emergency marked as: ${nextStatus.replace(/_/g, " ")}`,
      });
    } catch (err) {
      addToast({
        type: "danger",
        title: "Status Update Error",
        message: err.message,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStepSimulation = async () => {
    if (!assignedEmergency) return;
    try {
      setIsStepping(true);
      const nextIdx = currentStepIdx + 2;
      setCurrentStepIdx(nextIdx);
      await simulationApi.stepMovement(assignedEmergency.id, nextIdx);
      await refreshData();
    } catch (err) {
      console.warn("Step error:", err);
    } finally {
      setIsStepping(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Driver HUD Status Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {currentAmbulance?.vehicle_number || "MED-ALS-01"}
              </h3>
              <Badge variant={currentAmbulance?.status === "AVAILABLE" ? "success" : "danger"}>
                {currentAmbulance?.status || "IN SERVICE"}
              </Badge>
              <Badge variant="cloud">{currentAmbulance?.ambulance_type || "ALS"}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentAmbulance?.model_name} • Driver: {currentAmbulance?.driver_name || "Capt. David Miller"}
            </p>
          </div>
        </div>

        {/* Switch Ambulance Unit for testing */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Select Unit:</span>
            <select
              value={currentAmbulance?.id || 1}
              onChange={(e) => setActiveAmbulanceId(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none"
            >
              {ambulances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.vehicle_number} ({a.ambulance_type} - {a.status})
                </option>
              ))}
            </select>
          </div>

          {/* Telemetry chips */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 text-slate-300">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>{currentAmbulance?.current_speed_kmh || 0} km/h</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 text-slate-300">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>{currentAmbulance?.fuel_level_percent || 92}% Fuel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Navigation & Turn-by-Turn | Right Map & Triage Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {assignedEmergency ? (
            <div className="glass-panel p-5 rounded-2xl border border-red-500/40 shadow-2xl space-y-5">
              {/* Emergency Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
                    ACTIVE DISPATCH ASSIGNMENT
                  </span>
                  <h4 className="text-xl font-black text-white">{assignedEmergency.case_code}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {assignedEmergency.emergency_type} • {assignedEmergency.severity} Severity
                  </p>
                </div>
                <Badge variant="danger">{assignedEmergency.status.replace(/_/g, " ")}</Badge>
              </div>

              {/* Patient Profile Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">{assignedEmergency.patient_name}</span>
                  </div>
                  <a
                    href={`tel:${assignedEmergency.patient_phone}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {assignedEmergency.patient_phone}
                  </a>
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Pickup:</strong> {assignedEmergency.pickup_address}
                </div>
                {assignedEmergency.caller_notes && (
                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300">
                    <strong>Medical Notes:</strong> {assignedEmergency.caller_notes}
                  </div>
                )}
              </div>

              {/* Destination Hospital Card */}
              {assignedEmergency.assigned_hospital && (
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">
                        {assignedEmergency.assigned_hospital.name}
                      </span>
                    </div>
                    <Badge variant="info">{assignedEmergency.assigned_hospital.trauma_level}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {assignedEmergency.assigned_hospital.address}
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    {assignedEmergency.assigned_hospital.available_icu_beds} ICU Beds Ready • Cath Lab on Standby
                  </p>
                </div>
              )}

              {/* Turn-by-Turn Navigation Steps */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  Turn-by-Turn OSRM Route Instructions
                </h5>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {(assignedEmergency.route_geometry?.steps || [
                    { instruction: "Depart ambulance bay onto Main Expressway", distance_meters: 600 },
                    { instruction: "Take siren priority lane towards incident address", distance_meters: 2400 },
                    { instruction: "Arrive at patient pickup pinpoint", distance_meters: 200 }
                  ]).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">{step.instruction}</p>
                        <p className="text-[10px] text-slate-400">{Math.round(step.distance_meters)} meters</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Progression Control Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Update Dispatch Milestone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleStatusTransition("ON_THE_WAY")}
                    disabled={isUpdatingStatus}
                    className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/30 disabled:opacity-50"
                  >
                    <Navigation className="w-4 h-4" />
                    En Route to Scene
                  </button>

                  <button
                    onClick={() => handleStatusTransition("AT_SCENE")}
                    disabled={isUpdatingStatus}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    At Scene / Triage
                  </button>

                  <button
                    onClick={() => handleStatusTransition("TRANSPORTING")}
                    disabled={isUpdatingStatus}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    Transporting to ER
                  </button>

                  <button
                    onClick={() => handleStatusTransition("HOSPITAL_REACHED")}
                    disabled={isUpdatingStatus}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <Building2 className="w-4 h-4" />
                    Arrived at ER
                  </button>
                </div>

                <button
                  onClick={() => handleStatusTransition("COMPLETED")}
                  disabled={isUpdatingStatus}
                  className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Emergency Case Completed
                </button>
              </div>

              {/* Simulation Step Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Live GPS Step Simulation:</span>
                <button
                  onClick={handleStepSimulation}
                  disabled={isStepping}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400 border border-slate-700 flex items-center gap-1.5"
                >
                  {isStepping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Advance GPS Along Route
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Radio className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Standing By in Sector</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active emergencies assigned to this unit. You will receive an instant audio/visual alert when Central Dispatch triggers an SOS.
              </p>
              <div className="pt-2">
                <Badge variant="success">UNIT AVAILABLE & ON PATROL</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Navigation Map & Alternative Routes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Live Navigation HUD & Road Corridors
                </h4>
                <p className="text-xs text-slate-400">
                  OpenStreetMap real-time GPS tracking with turn-by-turn routing polyline.
                </p>
              </div>

              {/* Route Alternative Toggle */}
              {assignedEmergency?.alternative_routes && assignedEmergency.alternative_routes.length > 0 && (
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedRouteType("fastest")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedRouteType === "fastest"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Fastest (Recommended)
                  </button>
                  <button
                    onClick={() => setSelectedRouteType("alternative")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedRouteType === "alternative"
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Arterial Bypass
                  </button>
                </div>
              )}
            </div>

            <LiveMap
              center={
                currentAmbulance
                  ? [currentAmbulance.current_latitude, currentAmbulance.current_longitude]
                  : [12.9716, 77.5946]
              }
              zoom={14}
              ambulances={ambulances}
              hospitals={hospitals}
              emergencyLocation={
                assignedEmergency
                  ? {
                      lat: assignedEmergency.pickup_latitude,
                      lng: assignedEmergency.pickup_longitude,
                      address: assignedEmergency.pickup_address,
                    }
                  : null
              }
              activeRoute={
                selectedRouteType === "fastest"
                  ? assignedEmergency?.route_geometry
                  : assignedEmergency?.alternative_routes?.[0]
              }
              alternativeRoutes={
                selectedRouteType === "fastest"
                  ? assignedEmergency?.alternative_routes || []
                  : assignedEmergency?.route_geometry
                  ? [assignedEmergency.route_geometry]
                  : []
              }
              height="500px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
