import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmergency } from "../context/EmergencyContext";
import { hospitalApi } from "../services/api";
import { Badge } from "../components/common/Badge";
import { StatCard } from "../components/common/StatCard";
import {
  Hospital,
  Bed,
  HeartPulse,
  Wind,
  Plus,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Siren,
  Phone,
  ShieldCheck,
  User,
  Loader2
} from "lucide-react";

export const HospitalDashboard = () => {
  const { activeHospitalId, setActiveHospitalId } = useAuth();
  const { hospitals, emergencies, addToast, refreshData } = useEmergency();

  const [isUpdating, setIsUpdating] = useState(false);
  const [traumaBayReady, setTraumaBayReady] = useState(true);
  const [cathLabReady, setCathLabReady] = useState(true);
  const [bloodBankPrimed, setBloodBankPrimed] = useState(true);

  // Selected Hospital
  const currentHospital =
    hospitals.find((h) => h.id === activeHospitalId) || hospitals[0] || null;

  // Inbound emergencies assigned to this hospital
  const inboundEmergencies = emergencies.filter(
    (e) =>
      e.assigned_hospital_id === currentHospital?.id &&
      !["COMPLETED", "CANCELLED"].includes(e.status)
  );

  const handleUpdateBeds = async (field, delta) => {
    if (!currentHospital) return;
    try {
      setIsUpdating(true);
      const currentVal = currentHospital[field] || 0;
      const newVal = Math.max(0, currentVal + delta);

      await hospitalApi.updateCapacity(currentHospital.id, {
        [field]: newVal,
      });
      await refreshData();
      addToast({
        type: "info",
        title: "Capacity Updated",
        message: `${field.replace(/_/g, " ")}: ${newVal}`,
      });
    } catch (err) {
      addToast({
        type: "danger",
        title: "Update Failed",
        message: err.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAcceptance = async () => {
    if (!currentHospital) return;
    try {
      setIsUpdating(true);
      const nextStatus = currentHospital.is_accepting_emergencies === "YES" ? "FULL" : "YES";
      await hospitalApi.updateCapacity(currentHospital.id, {
        is_accepting_emergencies: nextStatus,
      });
      await refreshData();
      addToast({
        type: nextStatus === "YES" ? "success" : "warning",
        title: "Intake Status Changed",
        message: `Hospital is now: ${nextStatus === "YES" ? "ACCEPTING EMERGENCIES" : "ON DIVERSION / FULL"}`,
      });
    } catch (err) {
      addToast({
        type: "danger",
        title: "Toggle Failed",
        message: err.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hospital Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">
                {currentHospital?.name || "Apex Central Trauma Center"}
              </h3>
              <Badge variant={currentHospital?.is_accepting_emergencies === "YES" ? "success" : "danger"}>
                {currentHospital?.is_accepting_emergencies === "YES" ? "ACCEPTING EMERGENCIES" : "ON DIVERSION"}
              </Badge>
              <Badge variant="purple">{currentHospital?.trauma_level || "Level 1 Trauma"}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentHospital?.address}</p>
          </div>
        </div>

        {/* Switch Hospital selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Select Hospital:</span>
            <select
              value={currentHospital?.id || 1}
              onChange={(e) => setActiveHospitalId(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.available_icu_beds} ICU Beds)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleToggleAcceptance}
            disabled={isUpdating}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              currentHospital?.is_accepting_emergencies === "YES"
                ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
            }`}
          >
            {currentHospital?.is_accepting_emergencies === "YES" ? "Set On Diversion" : "Resume Acceptance"}
          </button>
        </div>
      </div>

      {/* Bed & ICU Capacity Stat Cards with Live Increment / Decrement Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* General Beds */}
        <div className="glass-card p-5 rounded-2xl border border-slate-700/60 relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available General Beds
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {currentHospital?.available_general_beds}
                <span className="text-sm font-normal text-slate-400">/{currentHospital?.total_general_beds}</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => handleUpdateBeds("available_general_beds", -1)}
              disabled={isUpdating || (currentHospital?.available_general_beds || 0) <= 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-400">Adjust Beds</span>
            <button
              onClick={() => handleUpdateBeds("available_general_beds", 1)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ICU Beds */}
        <div className="glass-card p-5 rounded-2xl border border-red-500/30 bg-red-950/10 relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                Available ICU Beds
              </span>
              <h3 className="text-3xl font-extrabold text-red-400 mt-1">
                {currentHospital?.available_icu_beds}
                <span className="text-sm font-normal text-slate-400">/{currentHospital?.total_icu_beds}</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => handleUpdateBeds("available_icu_beds", -1)}
              disabled={isUpdating || (currentHospital?.available_icu_beds || 0) <= 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-400">Adjust ICU</span>
            <button
              onClick={() => handleUpdateBeds("available_icu_beds", 1)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ventilators */}
        <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/10 relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Available Ventilators
              </span>
              <h3 className="text-3xl font-extrabold text-cyan-400 mt-1">
                {currentHospital?.available_ventilators}
                <span className="text-sm font-normal text-slate-400">/{currentHospital?.total_ventilators}</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => handleUpdateBeds("available_ventilators", -1)}
              disabled={isUpdating || (currentHospital?.available_ventilators || 0) <= 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-400">Adjust Vents</span>
            <button
              onClick={() => handleUpdateBeds("available_ventilators", 1)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Inbound Emergencies Kanban + Trauma Bay Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Inbound Emergencies Kanban */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Siren className="w-4 h-4 text-red-500 animate-pulse" />
                  Inbound Ambulances & Emergency Triage Queue
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time countdown ETAs and severity indicators for inbound paramedics.
                </p>
              </div>
              <Badge variant="danger">{inboundEmergencies.length} Inbound Units</Badge>
            </div>

            {inboundEmergencies.length > 0 ? (
              <div className="space-y-3">
                {inboundEmergencies.map((emg) => (
                  <div
                    key={emg.id}
                    className="p-4 rounded-xl glass-card border border-red-500/30 hover:border-red-500/60 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-white">{emg.case_code}</span>
                            <Badge variant="danger">{emg.emergency_type}</Badge>
                            <Badge variant="warning">{emg.severity}</Badge>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 font-medium">
                            Patient: <strong>{emg.patient_name}</strong> • Unit: <strong>{emg.assigned_ambulance?.vehicle_number || "MED-ALS-01"}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400">ETA</span>
                        <p className="text-base font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                          <Clock className="w-4 h-4" />
                          ~{emg.estimated_duration_minutes || 6.5} min
                        </p>
                      </div>
                    </div>

                    {/* Medical details & triage note */}
                    {emg.caller_notes && (
                      <p className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <strong>Paramedic Notes:</strong> {emg.caller_notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-400">
                        Status: <strong className="text-amber-400">{emg.status.replace(/_/g, " ")}</strong>
                      </span>
                      <span className="text-slate-400">
                        Distance: <strong>{emg.distance_km || 3.8} km</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-sm text-white">No Inbound Ambulances Currently</h5>
                <p className="text-xs text-slate-400">
                  Trauma bays and emergency staff on ready standby for incoming dispatches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right (4 Cols): Emergency Dept Readiness Checklist */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ER Response Team Readiness
            </h4>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-200 font-semibold">Trauma Bay 1 Sterilized & Prepped</span>
                <input
                  type="checkbox"
                  checked={traumaBayReady}
                  onChange={(e) => setTraumaBayReady(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-200 font-semibold">Cardiac Cath Lab on Standby</span>
                <input
                  type="checkbox"
                  checked={cathLabReady}
                  onChange={(e) => setCathLabReady(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-200 font-semibold">Blood Bank O-Negative Primed</span>
                <input
                  type="checkbox"
                  checked={bloodBankPrimed}
                  onChange={(e) => setBloodBankPrimed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Specialties: {currentHospital?.specialties}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
