export const EMERGENCY_TYPES = [
  {
    id: "CARDIAC",
    label: "Cardiac Emergency / Heart Attack",
    icon: "HeartPulse",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/30",
    severity: "CRITICAL",
    description: "Severe chest pain, cardiac arrest, arrhythmia, irregular pulse"
  },
  {
    id: "TRAUMA",
    label: "Severe Trauma / Accident",
    icon: "Car",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    severity: "CRITICAL",
    description: "High-speed collision, heavy hemorrhage, multiple fractures, head injury"
  },
  {
    id: "STROKE",
    label: "Acute Stroke / Neurological",
    icon: "Brain",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/30",
    severity: "CRITICAL",
    description: "Facial droop, arm weakness, speech slurring, sudden loss of balance"
  },
  {
    id: "RESPIRATORY",
    label: "Respiratory Distress / Hypoxia",
    icon: "Wind",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    severity: "HIGH",
    description: "Acute asthma attack, severe hypoxia (SpO2 < 85%), choking, COPD flare"
  },
  {
    id: "PREGNANCY",
    label: "Obstetric / Labor Emergency",
    icon: "Baby",
    color: "text-pink-500",
    bg: "bg-pink-500/10 border-pink-500/30",
    severity: "HIGH",
    description: "Active high-risk labor, postpartum hemorrhage, eclampsia symptoms"
  },
  {
    id: "BURN",
    label: "Severe Burn / Chemical Hazard",
    icon: "Flame",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    severity: "HIGH",
    description: "2nd/3rd degree thermal burns, chemical inhalation, electrical trauma"
  },
  {
    id: "GENERAL",
    label: "General Medical Emergency",
    icon: "Stethoscope",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    severity: "MEDIUM",
    description: "High grade acute fever, acute abdominal pain, dehydration, disorientation"
  }
];

export const STATUS_STEPS = [
  { key: "REQUESTED", label: "SOS Received", icon: "Radio", desc: "Emergency logged in Cloud HQ" },
  { key: "ASSIGNED", label: "Ambulance Dispatched", icon: "Siren", desc: "Closest ALS unit assigned" },
  { key: "ON_THE_WAY", label: "En Route to Scene", icon: "Navigation", desc: "Siren priority navigation" },
  { key: "AT_SCENE", label: "At Scene / Triage", icon: "UserCheck", desc: "Paramedics administering care" },
  { key: "TRANSPORTING", label: "Transporting to Hospital", icon: "Truck", desc: "High-speed hospital transit" },
  { key: "HOSPITAL_REACHED", label: "Arrived at ER", icon: "Building2", desc: "Transferred to Trauma Bay" },
  { key: "COMPLETED", label: "Case Completed", icon: "CheckCircle2", desc: "Archived to cloud records" }
];

export const SEVERITY_BADGES = {
  CRITICAL: { label: "CRITICAL (Immediate ALS)", bg: "bg-red-500/20 text-red-400 border-red-500/40" },
  HIGH: { label: "HIGH PRIORITY", bg: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  MEDIUM: { label: "MEDIUM PRIORITY", bg: "bg-blue-500/20 text-blue-400 border-blue-500/40" }
};
