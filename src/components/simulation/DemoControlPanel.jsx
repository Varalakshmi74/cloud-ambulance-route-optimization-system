import React, { useState } from "react";
import { simulationApi } from "../../services/api";
import { useEmergency } from "../../context/EmergencyContext";
import { Play, RotateCcw, Zap, Sparkles, HeartPulse, Car, Wind, Brain, Loader2 } from "lucide-react";

export const DemoControlPanel = ({ onScenarioTriggered }) => {
  const { refreshData, addToast } = useEmergency();
  const [loadingScenario, setLoadingScenario] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const scenarios = [
    {
      id: "CARDIAC",
      title: "Cardiac Arrest (City Center)",
      icon: HeartPulse,
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      desc: "Simulates sudden collapse requiring urgent ALS dispatch"
    },
    {
      id: "HIGHWAY_CRASH",
      title: "Highway Multi-Car Crash",
      icon: Car,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      desc: "High-impact trauma requiring Level 1 Trauma ICU"
    },
    {
      id: "RESPIRATORY",
      title: "Acute Hypoxia Emergency",
      icon: Wind,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      desc: "Oxygen desaturation requiring rapid nebulization unit"
    },
    {
      id: "STROKE",
      title: "Acute Ischemic Stroke",
      icon: Brain,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      desc: "FAST-positive stroke within the golden window"
    }
  ];

  const handleLaunchScenario = async (scenarioId) => {
    try {
      setLoadingScenario(scenarioId);
      const res = await simulationApi.triggerScenario(scenarioId, {
        auto_run_movement: true,
      });
      await refreshData();
      if (onScenarioTriggered) {
        onScenarioTriggered(res.emergency);
      }
    } catch (err) {
      addToast({
        type: "danger",
        title: "Simulation Failed",
        message: err.message,
      });
    } finally {
      setLoadingScenario(null);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await simulationApi.resetDemo();
      await refreshData();
      addToast({
        type: "success",
        title: "Demo Reset Complete",
        message: "All ambulances returned to AVAILABLE, initial hospitals restored.",
      });
    } catch (err) {
      addToast({
        type: "danger",
        title: "Reset Failed",
        message: err.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              1-Click Live Demo Simulation Engine
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                EVALUATOR READY
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Launch pre-configured emergency scenarios with automated nearest ambulance dispatch & OSRM route tracking.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
        >
          {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
          Reset Fleet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isLoading = loadingScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleLaunchScenario(sc.id)}
              disabled={isLoading || loadingScenario !== null}
              className="p-3.5 rounded-xl glass-card border border-slate-700/50 hover:border-slate-500 text-left transition-all hover:-translate-y-0.5 flex flex-col justify-between group disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg border ${sc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 flex items-center gap-1 transition-colors">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin text-red-400" /> : <Play className="w-3 h-3 fill-current" />}
                    Launch
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white group-hover:text-red-300 transition-colors">
                  {sc.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sc.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
