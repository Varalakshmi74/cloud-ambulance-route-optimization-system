import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useEmergency } from "../../context/EmergencyContext";
import { QuickRoleSwitcher } from "./QuickRoleSwitcher";
import { CloudArchitectureModal } from "../cloud/CloudArchitectureModal";
import { Siren, Radio, Volume2, VolumeX, Cloud, Activity, Sparkles } from "lucide-react";

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { currentRole, currentUser } = useAuth();
  const { wsConnected, soundEnabled, toggleSound } = useEmergency();
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  const navItems = [
    { id: "patient", label: "Patient SOS", icon: Siren, roles: ["PATIENT", "DISPATCH_ADMIN"] },
    { id: "driver", label: "Driver Navigator", icon: Activity, roles: ["DRIVER", "DISPATCH_ADMIN"] },
    { id: "hospital", label: "Hospital ER Board", icon: Radio, roles: ["HOSPITAL_ADMIN", "DISPATCH_ADMIN"] },
    { id: "admin", label: "Central Command", icon: Cloud, roles: ["DISPATCH_ADMIN", "HOSPITAL_ADMIN", "DRIVER", "PATIENT"] },
    { id: "fleet", label: "Live Fleet Map", icon: Sparkles, roles: ["DISPATCH_ADMIN", "DRIVER", "HOSPITAL_ADMIN", "PATIENT"] },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab("patient")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 border border-red-400/40 animate-sos-pulse">
                <Siren className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    AeroMed Cloud
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    EMERGENCY OS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                  Route Optimization & Smart Dispatch
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              {/* WebSocket Live Status */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className={wsConnected ? "text-emerald-400" : "text-amber-400"}>
                  {wsConnected ? "Cloud Sync Active" : "Connecting..."}
                </span>
              </div>

              {/* Sound siren toggle */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? "Mute Siren Chimes" : "Enable Siren Chimes"}
                className={`p-2 rounded-xl border transition-all ${
                  soundEnabled
                    ? "bg-slate-900 text-amber-400 border-amber-500/30"
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Cloud Architecture Button */}
              <button
                onClick={() => setIsCloudModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-all"
              >
                <Cloud className="w-4 h-4" />
                AWS Architecture
              </button>

              {/* Quick Role Switcher */}
              <QuickRoleSwitcher />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-1.5 bg-slate-950 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold shrink-0 ${
                  isActive ? "text-red-400" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Cloud Architecture Modal */}
      <CloudArchitectureModal isOpen={isCloudModalOpen} onClose={() => setIsCloudModalOpen(false)} />
    </>
  );
};
