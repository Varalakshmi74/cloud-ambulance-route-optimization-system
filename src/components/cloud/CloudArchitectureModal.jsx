import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Cloud, Database, Server, Cpu, ShieldCheck, Activity, Radio, Layers, HardDrive, ArrowRight } from "lucide-react";

export const CloudArchitectureModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("architecture");

  const awsComponents = [
    {
      title: "Amazon Route 53 & CloudFront",
      category: "Edge Routing & CDN",
      icon: Radio,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      description: "Geo-DNS routing directs callers to the closest AWS edge location with low latency and SSL termination."
    },
    {
      title: "AWS Application Load Balancer (ALB)",
      category: "Traffic Distribution",
      icon: Layers,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      description: "Distributes incoming REST API traffic and manages persistent WebSocket connections across backend instances."
    },
    {
      title: "AWS ECS (Fargate) / EC2 Cluster",
      category: "Compute & Routing Engine",
      icon: Server,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description: "Scalable Python FastAPI microservices running Dijkstra/OSRM route optimization and Nearest Neighbor dispatch algorithms."
    },
    {
      title: "Amazon RDS (PostgreSQL Multi-AZ)",
      category: "Cloud Database",
      icon: Database,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description: "High-availability relational database storing GPS coordinates, patient triage data, ambulance statuses, and hospital bed counts."
    },
    {
      title: "Amazon S3 & CloudWatch",
      category: "Telemetry & Storage",
      icon: HardDrive,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      description: "Stores historical emergency black-box logs, route traces, and provides real-time SLA metrics dashboards."
    },
    {
      title: "Amazon SNS & Push Gateway",
      category: "Emergency Alerts",
      icon: ShieldCheck,
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      description: "Publishes instant high-priority emergency notifications to ambulance mobile terminals and hospital trauma bays."
    }
  ];

  const vivaQA = [
    {
      q: "1. Why is a Cloud-Based architecture crucial for Emergency Response?",
      a: "Cloud infrastructure provides 99.999% high availability, low-latency Geo-DNS routing, auto-scaling during mass casualty incidents, and real-time state synchronization across distributed emergency units."
    },
    {
      q: "2. How does the Route Optimization Algorithm work?",
      a: "The system utilizes the OpenStreetMap OSRM routing engine (leveraging Contraction Hierarchies and Dijkstra/A* algorithms on road graph networks) to compute the fastest emergency corridor, factoring in traffic congestion multipliers and road classifications."
    },
    {
      q: "3. How does Intelligent Nearest Ambulance Dispatching work?",
      a: "The Dispatch Engine calculates the spatial Haversine matrix between the emergency location and all AVAILABLE fleet units, prioritizing Advanced Life Support (ALS) for CRITICAL triage cases and matching destination hospitals based on real-time ICU bed availability."
    },
    {
      q: "4. How is real-time bidirectional communication achieved?",
      a: "Using persistent WebSockets managed through a Pub/Sub WebSocket Connection Manager, enabling sub-100ms GPS telemetry updates, status transitions, and emergency alerts without polling overhead."
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AWS Cloud Architecture & System Engineering"
      subtitle="Cloud Computing College Project Architecture & Viva Defense Reference"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 pb-2 gap-4">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "architecture"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ☁️ AWS Cloud Architecture
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "pipeline"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚡ Data Flow Pipeline
          </button>
          <button
            onClick={() => setActiveTab("viva")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "viva"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🎓 College Viva Q&A Guide
          </button>
        </div>

        {/* Tab 1: Architecture Cards */}
        {activeTab === "architecture" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 flex items-center gap-3">
              <Cloud className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Enterprise Cloud Deployment Tier</h4>
                <p className="text-xs text-slate-300">
                  Built to deploy on AWS utilizing containerized microservices, high-availability database replication, and geo-replicated endpoints.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {awsComponents.map((comp, idx) => {
                const Icon = comp.icon;
                return (
                  <div key={idx} className="glass-card p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${comp.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {comp.category}
                        </span>
                        <h5 className="text-sm font-bold text-white">{comp.title}</h5>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{comp.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Flow Pipeline */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="p-5 glass-card rounded-2xl border border-slate-700 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                End-to-End Cloud Emergency Execution Flow
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-white">Patient Triggers 1-Click SOS:</strong>
                    <p className="text-slate-400 mt-0.5">GPS location is detected via HTML5 Geolocation. Emergency classification (Cardiac, Trauma, etc.) is sent over HTTPS to FastAPI REST API.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-white">Cloud Dispatch Engine Optimization:</strong>
                    <p className="text-slate-400 mt-0.5">Calculates spatial distance matrix to find closest available ambulance with ALS capability, and finds nearest hospital with available ICU beds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-white">OSRM Route Calculation & Alternative Generation:</strong>
                    <p className="text-slate-400 mt-0.5">Generates fastest road route geometry and secondary arterial bypasses with turn-by-turn navigation instructions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-white">Real-Time WebSocket Sync:</strong>
                    <p className="text-slate-400 mt-0.5">Sub-second broadcast alerts the Driver terminal with navigation HUD, the Hospital ER with incoming countdown, and Central Admin telemetry.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Viva Q&A */}
        {activeTab === "viva" && (
          <div className="space-y-3">
            {vivaQA.map((item, idx) => (
              <div key={idx} className="glass-card p-4 rounded-xl border border-slate-700/60">
                <h5 className="text-sm font-bold text-blue-300">{item.q}</h5>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
