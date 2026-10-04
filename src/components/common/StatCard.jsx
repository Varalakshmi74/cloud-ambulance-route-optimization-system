import React from "react";
import * as Icons from "lucide-react";

export const StatCard = ({
  title,
  value,
  subtitle,
  iconName = "Activity",
  iconColor = "text-red-500",
  iconBg = "bg-red-500/10",
  trend,
  trendPositive = true,
  onClick,
  className = ""
}) => {
  const IconComponent = Icons[iconName] || Icons.Activity;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-500/40 hover:shadow-lg hover:shadow-black/20 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium">
              <span className={trendPositive ? "text-emerald-400" : "text-red-400"}>
                {trendPositive ? "↑" : "↓"} {trend}
              </span>
              <span className="text-slate-500">vs target SLA</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border border-white/5 ${iconBg}`}>
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      {/* Subtle glow orb */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
