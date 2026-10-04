import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { AlertCircle, CheckCircle2, Info, X, Siren } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useEmergency();

  if (toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case "danger":
        return <Siren className="w-5 h-5 text-red-400 animate-pulse" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getToastStyle = (type) => {
    switch (type) {
      case "danger":
        return "border-red-500/60 bg-gradient-to-r from-red-950/90 to-slate-900/90 text-red-100 shadow-red-900/40";
      case "success":
        return "border-emerald-500/60 bg-gradient-to-r from-emerald-950/90 to-slate-900/90 text-emerald-100 shadow-emerald-900/40";
      case "warning":
        return "border-amber-500/60 bg-gradient-to-r from-amber-950/90 to-slate-900/90 text-amber-100 shadow-amber-900/40";
      default:
        return "border-cyan-500/60 bg-gradient-to-r from-cyan-950/90 to-slate-900/90 text-cyan-100 shadow-cyan-900/40";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right ${getToastStyle(
            toast.type
          )}`}
        >
          <div className="mt-0.5">{getToastIcon(toast.type)}</div>
          <div className="flex-1">
            <h4 className="font-bold text-sm leading-tight text-white">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
