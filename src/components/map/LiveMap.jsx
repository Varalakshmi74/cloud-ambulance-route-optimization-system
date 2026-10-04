import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Custom SVG Icons for Leaflet
const createAmbulanceIcon = (heading = 0, isAssigned = false) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease;" class="relative flex items-center justify-center">
        <div class="w-10 h-10 rounded-full ${isAssigned ? 'bg-amber-500 shadow-lg shadow-amber-500/50' : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'} flex items-center justify-center border-2 border-white text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17h4V5H2v12h3"></path>
            <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h2"></path>
            <circle cx="7.5" cy="17.5" r="2.5"></circle>
            <circle cx="17.5" cy="17.5" r="2.5"></circle>
          </svg>
        </div>
        ${isAssigned ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createHospitalIcon = (beds = 0) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <div class="w-9 h-9 rounded-xl bg-blue-600 border-2 border-white shadow-lg shadow-blue-500/40 flex items-center justify-center text-white font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12m-6-6h12"/>
          </svg>
        </div>
        <div class="absolute -bottom-2 bg-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-400 text-blue-300">
          ${beds} beds
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const createSOSIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-12 h-12 rounded-full bg-red-600/30 animate-ping-slow absolute"></div>
        <div class="w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-xl shadow-red-600/80 flex items-center justify-center text-white font-black z-10 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

export const LiveMap = ({
  center = [12.9716, 77.5946],
  zoom = 13,
  ambulances = [],
  hospitals = [],
  emergencyLocation = null,
  activeRoute = null,
  alternativeRoutes = [],
  onSelectLocation = null,
  selectedHospitalId = null,
  onHospitalClick = null,
  height = "550px",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ ambulances: {}, hospitals: {}, sos: null });
  const polylinesRef = useRef({ primary: null, alternatives: [] });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Dark-themed high contrast CartoDB Tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Click handler for manual location selection
    map.on("click", (e) => {
      if (onSelectLocation) {
        onSelectLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Center / Zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Update Ambulances
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentIds = new Set(ambulances.map((a) => a.id));

    // Remove deleted
    Object.keys(markersRef.current.ambulances).forEach((id) => {
      if (!currentIds.has(Number(id))) {
        map.removeLayer(markersRef.current.ambulances[id]);
        delete markersRef.current.ambulances[id];
      }
    });

    ambulances.forEach((amb) => {
      const isAssigned = amb.status !== "AVAILABLE";
      const icon = createAmbulanceIcon(amb.heading_degrees || 0, isAssigned);

      if (markersRef.current.ambulances[amb.id]) {
        // Update position and icon
        markersRef.current.ambulances[amb.id].setLatLng([amb.current_latitude, amb.current_longitude]);
        markersRef.current.ambulances[amb.id].setIcon(icon);
      } else {
        const marker = L.marker([amb.current_latitude, amb.current_longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2 text-slate-800">
            <h4 class="font-bold text-sm text-slate-900">${amb.vehicle_number}</h4>
            <p class="text-xs text-slate-600">${amb.model_name} (${amb.ambulance_type})</p>
            <p class="text-xs font-semibold mt-1">Status: <span class="text-red-600">${amb.status}</span></p>
            <p class="text-[11px] text-slate-500">Driver: ${amb.driver_name}</p>
            <p class="text-[11px] text-slate-500">Speed: ${amb.current_speed_kmh} km/h | Fuel: ${amb.fuel_level_percent}%</p>
          </div>
        `);
        markersRef.current.ambulances[amb.id] = marker;
      }
    });
  }, [ambulances]);

  // Update Hospitals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous
    Object.values(markersRef.current.hospitals).forEach((m) => map.removeLayer(m));
    markersRef.current.hospitals = {};

    hospitals.forEach((hosp) => {
      const icon = createHospitalIcon(hosp.available_icu_beds + hosp.available_general_beds);
      const marker = L.marker([hosp.latitude, hosp.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <div class="p-2 text-slate-800">
          <h4 class="font-bold text-sm text-blue-900">${hosp.name}</h4>
          <p class="text-xs text-slate-600">${hosp.address}</p>
          <div class="grid grid-cols-2 gap-1 mt-2 text-xs">
            <div class="bg-blue-50 p-1 rounded font-medium">Gen Beds: <strong>${hosp.available_general_beds}/${hosp.total_general_beds}</strong></div>
            <div class="bg-red-50 p-1 rounded font-medium">ICU Beds: <strong>${hosp.available_icu_beds}/${hosp.total_icu_beds}</strong></div>
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Trauma: ${hosp.trauma_level}</p>
        </div>
      `);
      if (onHospitalClick) {
        marker.on("click", () => onHospitalClick(hosp));
      }
      markersRef.current.hospitals[hosp.id] = marker;
    });
  }, [hospitals, onHospitalClick]);

  // Update Emergency SOS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersRef.current.sos) {
      map.removeLayer(markersRef.current.sos);
      markersRef.current.sos = null;
    }

    if (emergencyLocation && emergencyLocation.lat && emergencyLocation.lng) {
      const icon = createSOSIcon();
      const marker = L.marker([emergencyLocation.lat, emergencyLocation.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div class="p-2 text-slate-800">
          <h4 class="font-bold text-sm text-red-600">🚨 EMERGENCY PICKUP POINT</h4>
          <p class="text-xs text-slate-600">${emergencyLocation.address || "Patient Location"}</p>
          <p class="text-[11px] text-slate-500 mt-1">Coordinates: ${emergencyLocation.lat.toFixed(4)}, ${emergencyLocation.lng.toFixed(4)}</p>
        </div>
      `).openPopup();
      markersRef.current.sos = marker;
    }
  }, [emergencyLocation]);

  // Render Route Polylines (Primary + Alternatives)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear primary
    if (polylinesRef.current.primary) {
      map.removeLayer(polylinesRef.current.primary);
      polylinesRef.current.primary = null;
    }

    // Clear alternatives
    polylinesRef.current.alternatives.forEach((p) => map.removeLayer(p));
    polylinesRef.current.alternatives = [];

    // Render Alternative Routes
    if (alternativeRoutes && alternativeRoutes.length > 0) {
      alternativeRoutes.forEach((alt) => {
        if (alt.coordinates && alt.coordinates.length > 0) {
          const poly = L.polyline(alt.coordinates, {
            color: "#8b5cf6", // Violet alternative
            weight: 4,
            opacity: 0.7,
            dashArray: "6, 8",
          }).addTo(map);
          poly.bindTooltip(
            `<strong>${alt.name}</strong><br/>${alt.distance_km} km • ${alt.duration_minutes} min`,
            { sticky: true }
          );
          polylinesRef.current.alternatives.push(poly);
        }
      });
    }

    // Render Primary Recommended Route
    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const primaryPoly = L.polyline(activeRoute.coordinates, {
        color: "#0284c7", // Bright Cyan/Cloud Blue
        weight: 6,
        opacity: 0.9,
      }).addTo(map);

      primaryPoly.bindTooltip(
        `<strong>🚀 Fastest Emergency Route</strong><br/>${activeRoute.distance_km || activeRoute.total_distance_km} km • ${activeRoute.duration_minutes || activeRoute.total_estimated_minutes} min`,
        { sticky: true }
      );

      polylinesRef.current.primary = primaryPoly;

      // Fit map bounds to encompass the route
      try {
        const bounds = primaryPoly.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.warn("Could not fit route bounds:", e);
      }
    }
  }, [activeRoute, alternativeRoutes]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900">
      <div ref={mapContainerRef} style={{ height: height, width: "100%" }} />
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] glass-panel px-3 py-2 rounded-xl text-xs flex items-center gap-3 border border-slate-700/80 shadow-lg pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white"></span>
          <span className="text-slate-300 font-medium">Ambulance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-blue-600 inline-block border border-white"></span>
          <span className="text-slate-300 font-medium">Hospital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-white animate-pulse"></span>
          <span className="text-slate-300 font-medium">SOS Patient</span>
        </div>
      </div>
    </div>
  );
};
