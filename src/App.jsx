import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EmergencyProvider } from "./context/EmergencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer } from "./components/common/ToastContainer";

// Pages
import { PatientSOSPage } from "./pages/PatientSOSPage";
import { DriverDashboard } from "./pages/DriverDashboard";
import { HospitalDashboard } from "./pages/HospitalDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { FleetTrackerPage } from "./pages/FleetTrackerPage";

const MainContent = () => {
  const { currentRole } = useAuth();
  const [currentTab, setCurrentTab] = useState("patient");

  // Sync tab with role selection
  useEffect(() => {
    switch (currentRole) {
      case "PATIENT":
        setCurrentTab("patient");
        break;
      case "DRIVER":
        setCurrentTab("driver");
        break;
      case "HOSPITAL_ADMIN":
        setCurrentTab("hospital");
        break;
      case "DISPATCH_ADMIN":
        setCurrentTab("admin");
        break;
      default:
        setCurrentTab("patient");
    }
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {currentTab === "patient" && <PatientSOSPage />}
        {currentTab === "driver" && <DriverDashboard />}
        {currentTab === "hospital" && <HospitalDashboard />}
        {currentTab === "admin" && <AdminDashboard />}
        {currentTab === "fleet" && <FleetTrackerPage />}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-bold text-white">Cloud Ambulance Route Optimization & Emergency Response System</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Powered by OpenStreetMap • OSRM Routing Engine • AWS Cloud Computing Architecture
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EmergencyProvider>
          <MainContent />
        </EmergencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
