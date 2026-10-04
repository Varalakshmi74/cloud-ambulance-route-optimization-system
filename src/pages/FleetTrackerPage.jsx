import React from "react";
import { useEmergency } from "../context/EmergencyContext";
import { LiveMap } from "../components/map/LiveMap";
import { Badge } from "../components/common/Badge";
import { Truck, Fuel, Gauge, Compass, Radio, Building2, MapPin } from "lucide-react";

export const FleetTrackerPage = () => {
  const { ambulances, hospitals, emergencies } = useEmergency();

  const activeEmergencies = emergencies.filter(
    (e) => !["COMPLETED", "CANCELLED"].includes(e.status)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            Live Metropolitan Fleet Telemetry & Hospital Network
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial tracking of all Advanced Life Support (ALS) & Mobile ICU (MICU) ambulances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">{ambulances.filter((a) => a.status === "AVAILABLE").length} Units Available</Badge>
          <Badge variant="danger">{ambulances.filter((a) => a.status !== "AVAILABLE").length} Units Dispatched</Badge>
        </div>
      </div>

      {/* Main Full-Width Live Radar Map */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-2xl">
        <LiveMap
          center={[12.9716, 77.5946]}
          zoom={13}
          ambulances={ambulances}
          hospitals={hospitals}
          emergencyLocation={
            activeEmergencies.length > 0
              ? {
                  lat: activeEmergencies[0].pickup_latitude,
                  lng: activeEmergencies[0].pickup_longitude,
                  address: activeEmergencies[0].pickup_address,
                }
              : null
          }
          activeRoute={activeEmergencies[0]?.route_geometry}
          alternativeRoutes={activeEmergencies[0]?.alternative_routes || []}
          height="540px"
        />
      </div>

      {/* Fleet Telemetry Cards Grid */}
      <div className="space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400" />
          Active Ambulance Fleet Status
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ambulances.map((amb) => (
            <div
              key={amb.id}
              className="p-4 rounded-xl glass-card border border-slate-700/60 hover:border-slate-500 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">{amb.vehicle_number}</h5>
                  <p className="text-[11px] text-slate-400">{amb.model_name}</p>
                </div>
                <Badge variant={amb.status === "AVAILABLE" ? "success" : "danger"}>
                  {amb.status}
                </Badge>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <strong>Type:</strong> <span className="text-cyan-400">{amb.ambulance_type}</span>
                </p>
                <p>
                  <strong>Driver:</strong> {amb.driver_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{amb.current_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>{amb.fuel_level_percent}% Fuel</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
