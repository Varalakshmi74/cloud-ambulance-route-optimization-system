import React from "react";

export const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    default: "bg-slate-700/50 text-slate-200 border-slate-600/50",
    danger: "bg-red-500/20 text-red-400 border-red-500/40",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    cloud: "bg-blue-500/20 text-blue-400 border-blue-500/40"
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
};
