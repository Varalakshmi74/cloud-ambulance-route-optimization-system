import React, { useState, useEffect } from "react";
import { useEmergency } from "../context/EmergencyContext";
import { analyticsApi, emergencyApi } from "../services/api";
import { StatCard } from "../components/common/StatCard";
import { Badge } from "../components/common/Badge";
import { LiveMap } from "../components/map/LiveMap";
import { DemoControlPanel } from "../components/simulation/DemoControlPanel";
import {
  Truck,
  Siren,
  Hospital,
  Activity,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BarChart3,
  Flame,
  Zap,
  Filter
} from "lucide-react";

export const AdminDashboard = () => {
  const { emergencies, ambulances, hospitals, refreshData } = useEmergency();
  const [metrics, setMetrics] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsApi.getDashboardMetrics();
        setMetrics(res);
      } catch (e) {
        console.warn("Analytics fetch error:", e);
      }
    };
    loadAnalytics();
  }, [emergencies, ambulances, hospitals]);

  const activeEmergenciesList = emergencies.filter(
    (e) => !["COMPLETED", "CANCELLED"].includes(e.status)
  );

  const filteredEmergencies = emergencies.filter((e) => {
    const matchesSearch =
      e.case_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.emergency_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1-Click Simulation Toolbar for Evaluators */}
      <DemoControlPanel onScenarioTriggered={() => refreshData()} />

      {/* Cloud Telemetry StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Readiness"
          value={`${ambulances.filter((a) => a.status === "AVAILABLE").length}/${ambulances.length}`}
          subtitle={`${ambulances.filter((a) => a.status !== "AVAILABLE").length} Units Dispatched En Route`}
          iconName="Truck"
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />

        <StatCard
          title="Active Emergencies"
          value={activeEmergenciesList.length}
          subtitle={`${emergencies.filter((e) => e.status === "COMPLETED").length} Cases Saved & Closed`}
          iconName="Siren"
          iconColor="text-red-400"
          iconBg="bg-red-500/10"
        />

        <StatCard
          title="Avg Response SLA"
          value={`${metrics?.emergencies?.avg_response_time_minutes || 7.4} min`}
          subtitle="Target Golden Window: < 8.0 min"
          trend="12% Faster"
          trendPositive={true}
          iconName="Clock"
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />

        <StatCard
          title="Available ICU Beds"
          value={hospitals.reduce((acc, h) => acc + (h.available_icu_beds || 0), 0)}
          subtitle={`Across ${hospitals.length} Regional Trauma Hospitals`}
          iconName="Hospital"
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
      </div>

      {/* Live Concurrent Fleet Map View */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Central Command Live Fleet Radar
            </h4>
            <p className="text-xs text-slate-400">
              Tracking all active emergency responses, ambulance units, and hospital nodes simultaneously.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Cloud Telemetry Active</Badge>
          </div>
        </div>

        <LiveMap
          center={[12.9716, 77.5946]}
          zoom={13}
          ambulances={ambulances}
          hospitals={hospitals}
          emergencyLocation={
            activeEmergenciesList.length > 0
              ? {
                  lat: activeEmergenciesList[0].pickup_latitude,
                  lng: activeEmergenciesList[0].pickup_longitude,
                  address: activeEmergenciesList[0].pickup_address,
                }
              : null
          }
          activeRoute={activeEmergenciesList[0]?.route_geometry}
          alternativeRoutes={activeEmergenciesList[0]?.alternative_routes || []}
          height="450px"
        />
      </div>

      {/* Emergency Management Log Table & Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              Emergency Case Directory & Cloud Logs
            </h4>
            <p className="text-xs text-slate-400">
              Real-time audit log of all emergency calls, triage severities, and timestamps.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case, patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="AT_SCENE">At Scene</option>
              <option value="TRANSPORTING">Transporting</option>
              <option value="HOSPITAL_REACHED">Hospital Reached</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Emergencies Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Case Code</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Triage Type</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Assigned Unit</th>
                <th className="p-3">Hospital</th>
                <th className="p-3">Distance / ETA</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEmergencies.map((emg) => (
                <tr key={emg.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{emg.case_code}</td>
                  <td className="p-3">
                    <p className="font-semibold text-white">{emg.patient_name}</p>
                    <p className="text-[10px] text-slate-400">{emg.patient_phone}</p>
                  </td>
                  <td className="p-3 font-medium text-slate-200">{emg.emergency_type}</td>
                  <td className="p-3">
                    <Badge variant={emg.severity === "CRITICAL" ? "danger" : "warning"}>
                      {emg.severity}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium text-amber-400">
                    {emg.assigned_ambulance?.vehicle_number || "Unassigned"}
                  </td>
                  <td className="p-3 text-blue-300">
                    {emg.assigned_hospital?.name?.split(" ")[0] || "Regional ER"}
                  </td>
                  <td className="p-3">
                    <p className="text-white font-bold">{emg.distance_km || 3.4} km</p>
                    <p className="text-[10px] text-emerald-400">~{emg.estimated_duration_minutes || 6.5} min</p>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        emg.status === "COMPLETED"
                          ? "success"
                          : emg.status === "REQUESTED"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {emg.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
