"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SHGS, RECYCLERS } from '@/src/lib/demoData';

import L from 'leaflet';

// ── Fix default Leaflet icon ──────────────────────────────────────────────────
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── SHG red dot icon (same as ResidentMap) ────────────────────────────────────
const SHGIcon = L.divIcon({
  html: `<div style="background-color:#f43f5e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
  className: 'bg-transparent border-0',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// ── Recycler green-circle icon (same as ResidentMap) ─────────────────────────
const recyclerSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="36" height="36">
  <circle cx="24" cy="24" r="22" fill="#16a34a" stroke="white" stroke-width="2"/>
  <text x="24" y="30" font-size="22" text-anchor="middle" fill="white">♻</text>
</svg>
`);
const RecyclerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${recyclerSvg}`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// ── SHG Zone Polygons (computed from actual SHGS cluster bounding boxes) ──────
// Zone 1 – Central Raipur: Tatibandh + Gudhiyari + Shankar Nagar + Pandri + Telibandha
//   lat [21.237, 21.275]  lng [81.580, 81.673]
// Zone 2 – North Mowa: Mowa cluster
//   lat [21.271, 21.286]  lng [81.655, 81.672]
// Zone 3 – South Raipur: DDU Nagar + Tikrapara + Bhatagaon
//   lat [21.211, 21.247]  lng [81.590, 81.647]
// Zone 4 – East (Naya Raipur): both Naya Raipur clusters
//   lat [21.153, 21.172]  lng [81.777, 81.796]
const raipurRegions = [
  {
    id: "Central Raipur",
    color: "#22c55e", // green (Excellent)
    positions: [
      [21.275, 81.580],
      [21.275, 81.673],
      [21.237, 81.673],
      [21.237, 81.580],
    ] as [number, number][],
    stats: { collected: "12.4 MT", overdue: "None", shgs: 22 }
  },
  {
    id: "North Raipur (Mowa)",
    color: "#eab308", // yellow (Warning)
    positions: [
      [21.286, 81.655],
      [21.286, 81.672],
      [21.271, 81.672],
      [21.271, 81.655],
    ] as [number, number][],
    stats: { collected: "8.1 MT", overdue: "24h Pending", shgs: 4 }
  },
  {
    id: "South Raipur (DDU / Tikrapara / Bhatagaon)",
    color: "#ef4444", // red (Critical)
    positions: [
      [21.247, 81.590],
      [21.247, 81.647],
      [21.211, 81.647],
      [21.211, 81.590],
    ] as [number, number][],
    stats: { collected: "4.2 MT", overdue: "72h Critical!", shgs: 13 }
  },
  {
    id: "Naya Raipur (East Zone)",
    color: "#f97316", // orange (At risk)
    positions: [
      [21.172, 81.777],
      [21.172, 81.796],
      [21.153, 81.796],
      [21.153, 81.777],
    ] as [number, number][],
    stats: { collected: "5.6 MT", overdue: "48h Review", shgs: 9 }
  },
];

export default function AdminMap() {
  const mapCenter: [number, number] = [21.2514, 81.6296];
  const mapZoom = 12;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-purple-50 animate-pulse rounded-b-2xl flex items-center justify-center">
        <div className="text-purple-300 text-sm font-medium tracking-wide">Loading map…</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">

      {/* Floating Region Details overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-zinc-200/50 min-w-[220px]">
        <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">Critical Zone</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-zinc-50 px-2 py-1.5 rounded-md">
            <span className="text-zinc-600">Zone:</span>
            <span className="font-semibold text-zinc-900">South Raipur</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-50 px-2 py-1.5 rounded-md">
            <span className="text-zinc-600">Active SHGs:</span>
            <span className="font-semibold text-zinc-900">13 / 15</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-50 px-2 py-1.5 rounded-md">
            <span className="text-zinc-600">Pending Weight:</span>
            <span className="font-semibold text-red-600">4.2 MT</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-50 px-2 py-1.5 rounded-md">
            <span className="text-zinc-600">Overdue:</span>
            <span className="font-semibold text-red-600">72h Critical!</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Legend</p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <div className="w-3 h-3 rounded-full bg-[#f43f5e] border-2 border-white shadow-sm shrink-0" />
            SHG Collection Point
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center text-white text-[9px] shrink-0">♻</div>
            Waste Recycler Station
          </div>
        </div>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full z-0 font-sans" style={{ minHeight: '400px' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Zone polygons */}
        {raipurRegions.map((region) => (
          <Polygon
            key={region.id}
            positions={region.positions}
            pathOptions={{
              color: region.color,
              fillColor: region.color,
              fillOpacity: 0.15,
              weight: 2,
            }}
          >
            <Popup className="font-sans">
              <div className="min-w-[150px]">
                <h3 className="font-bold text-zinc-900 text-sm mb-2 pb-2 border-b">{region.id}</h3>
                <div className="space-y-1 text-xs">
                  <p><span className="text-zinc-500">Collected:</span> <span className="font-semibold">{region.stats.collected}</span></p>
                  <p><span className="text-zinc-500">Status:</span> <span className="font-semibold" style={{ color: region.color }}>{region.stats.overdue}</span></p>
                  <p><span className="text-zinc-500">Active SHGs:</span> <span className="font-semibold">{region.stats.shgs}</span></p>
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* SHG red-dot markers */}
        {SHGS.map((shg) => (
          <Marker key={shg.id} position={[shg.lat, shg.lng]} icon={SHGIcon}>
            <Popup className="font-sans">
              <div className="text-sm">
                <p className="font-bold text-zinc-900 mb-1">📍 SHG Collection Point</p>
                <p className="text-zinc-500 text-xs font-mono">{shg.id}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Recycler station markers */}
        {RECYCLERS.map((recycler) => (
          <Marker key={recycler.id} position={[recycler.lat, recycler.lng]} icon={RecyclerIcon}>
            <Popup className="font-sans">
              <div className="text-sm">
                <p className="font-bold text-green-800 mb-1">♻️ Waste Recycler Station</p>
                <p className="text-zinc-500 text-xs font-mono">{recycler.id}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
