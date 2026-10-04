const BASE_URL = "/api";

export async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Emergencies API
export const emergencyApi = {
  createSOS: (data) => fetchApi("/emergencies", { method: "POST", body: JSON.stringify(data) }),
  getAll: (status) => fetchApi(`/emergencies${status ? `?status=${status}` : ""}`),
  getActive: () => fetchApi("/emergencies/active"),
  getById: (id) => fetchApi(`/emergencies/${id}`),
  updateStatus: (id, status, extra = {}) =>
    fetchApi(`/emergencies/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, ...extra }),
    }),
};

// Fleet Ambulances API
export const ambulanceApi = {
  getAll: (status, type) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (type) params.append("ambulance_type", type);
    const qs = params.toString();
    return fetchApi(`/ambulances${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => fetchApi(`/ambulances/${id}`),
  updateLocation: (id, locationData) =>
    fetchApi(`/ambulances/${id}/location`, {
      method: "PATCH",
      body: JSON.stringify(locationData),
    }),
  updateStatus: (id, status, current_emergency_id = null) =>
    fetchApi(`/ambulances/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, current_emergency_id }),
    }),
};

// Hospitals API
export const hospitalApi = {
  getAll: (lat, lng, acceptingOnly = false) => {
    const params = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
      params.append("lat", lat);
      params.append("lng", lng);
    }
    if (acceptingOnly) params.append("accepting_only", "true");
    const qs = params.toString();
    return fetchApi(`/hospitals${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => fetchApi(`/hospitals/${id}`),
  updateCapacity: (id, capacityData) =>
    fetchApi(`/hospitals/${id}/capacity`, {
      method: "PATCH",
      body: JSON.stringify(capacityData),
    }),
};

// Routing API
export const routingApi = {
  calculateRoute: (origin, destination, waypoints = null, priority = "HIGH") =>
    fetchApi("/routing/calculate", {
      method: "POST",
      body: JSON.stringify({ origin, destination, waypoints, emergency_priority: priority }),
    }),
};

// Analytics API
export const analyticsApi = {
  getDashboardMetrics: () => fetchApi("/analytics/dashboard"),
};

// Demo Simulation API
export const simulationApi = {
  triggerScenario: (scenarioType, options = {}) =>
    fetchApi("/simulation/trigger", {
      method: "POST",
      body: JSON.stringify({ scenario_type: scenarioType, ...options }),
    }),
  stepMovement: (emergencyId, stepIndex) =>
    fetchApi(`/simulation/step/${emergencyId}?step_index=${stepIndex}`, { method: "POST" }),
  resetDemo: () => fetchApi("/simulation/reset", { method: "POST" }),
};

// Auth / Roles API
export const authApi = {
  getRoles: () => fetchApi("/auth/roles"),
};
