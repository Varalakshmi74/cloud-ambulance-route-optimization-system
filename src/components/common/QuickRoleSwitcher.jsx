import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, Truck, Hospital, UserCog, Check, ChevronDown } from "lucide-react";

export const QuickRoleSwitcher = () => {
  const { currentRole, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const rolesConfig = [
    {
      id: "PATIENT",
      name: "Patient / Caller",
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "hover:bg-red-500/10",
      desc: "Emergency SOS & Live Tracker",
      badge: "SOS Portal"
    },
    {
      id: "DRIVER",
      name: "Ambulance Driver",
      icon: Truck,
      color: "text-amber-400",
      bg: "hover:bg-amber-500/10",
      desc: "Turn-by-turn HUD & Dispatch",
      badge: "Driver HUD"
    },
    {
      id: "HOSPITAL_ADMIN",
      name: "Hospital ER Dept",
      icon: Hospital,
      color: "text-emerald-400",
      bg: "hover:bg-emerald-500/10",
      desc: "Inbound Triage & Bed Manager",
      badge: "ER Trauma Bay"
    },
    {
      id: "DISPATCH_ADMIN",
      name: "Central Cloud HQ",
      icon: UserCog,
      color: "text-blue-400",
      bg: "hover:bg-blue-500/10",
      desc: "Fleet Telemetry & Cloud SLA",
      badge: "Command Center"
    }
  ];

  const activeConfig = rolesConfig.find((r) => r.id === currentRole) || rolesConfig[0];
  const IconComponent = activeConfig.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border border-slate-700/60 hover:border-slate-500 transition-all text-sm font-medium"
      >
        <span className={`p-1 rounded-lg bg-slate-800 ${activeConfig.color}`}>
          <IconComponent className="w-4 h-4" />
        </span>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] text-slate-400 leading-none">Simulate Role</p>
          <p className="text-xs font-bold text-white leading-tight">{activeConfig.name}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Switch Evaluator Perspective
            </div>
            <div className="py-1 space-y-1">
              {rolesConfig.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = currentRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      switchRole(role.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected ? "bg-slate-800 border border-slate-700 text-white" : `text-slate-300 ${role.bg}`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg bg-slate-900 ${role.color}`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{role.name}</p>
                        <p className="text-[10px] text-slate-400">{role.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
