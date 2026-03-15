"use client";

import { useMemo, useState } from "react";
import { Polygon, Polyline, CircleMarker, Tooltip, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { generateZones, getZoneForPoint, ZoneConfig, LatLng } from "@/src/lib/zones";
import { SHGS, RECYCLERS, GeoPoint } from "@/src/lib/demoData";

// ─── Pre-compute hexagonal zones ─────────────────────────────────────────────
const ZONES = generateZones();

// ─── Assign demo SHGs to zones via point-in-polygon ──────────────────────────
type AssignedPoint = GeoPoint & { zone: ZoneConfig };

const DEMO_ASSIGNED: AssignedPoint[] = SHGS.flatMap(shg => {
  const z = getZoneForPoint(shg.lat, shg.lng, ZONES);
  return z ? [{ ...shg, zone: z }] : [];
});

// ─── Nearest recycler depot per hexagon ───────────────────────────────────────
function nearestRecycler(center: LatLng): GeoPoint {
  return RECYCLERS.reduce((best, r) => {
    const d = Math.hypot(r.lat - center[0], r.lng - center[1]);
    const bd = Math.hypot(best.lat - center[0], best.lng - center[1]);
    return d < bd ? r : best;
  }, RECYCLERS[0]);
}

const ZONE_DEPOTS: Record<string, GeoPoint> = Object.fromEntries(
  ZONES.map(z => [z.id, nearestRecycler(z.center)])
);

// ─── Depot icon ────────────────────────────────────────────────────────────────
function makeDepotIcon(color: string) {
  return L.divIcon({
    html: `<div style="
      background:${color};border:3px solid white;border-radius:50%;
      width:26px;height:26px;display:flex;align-items:center;
      justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);
      font-size:14px;color:white;font-weight:700;line-height:1;
      cursor:pointer;">♻</div>`,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
}

// ─── ORS road route fetcher — circular loop: Depot → SHGs → Depot ─────────────
// Automatically removes unroutable waypoints (ORS error 2010) and retries.
async function fetchZoneRoute(
  depot: GeoPoint,
  shgs: AssignedPoint[]
): Promise<{ path: LatLng[]; skipped: number }> {
  if (shgs.length === 0) return { path: [], skipped: 0 };

  // Circular route: depot → all SHGs → back to depot
  // ORS expects [lng, lat] pairs.
  let coords: [number, number][] = [
    [depot.lng, depot.lat],
    ...shgs.map(s => [s.lng, s.lat] as [number, number]),
    [depot.lng, depot.lat], // return to depot
  ];

  let skipped = 0;

  // Retry loop: each pass removes one bad waypoint if ORS error 2010 fires.
  for (let attempt = 0; attempt <= shgs.length; attempt++) {
    const res = await fetch("/api/ors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: coords }),
    }).catch(() => null);

    if (!res) return { path: [], skipped };

    if (res.ok) {
      const data = await res.json();
      const raw: [number, number][] = data?.features?.[0]?.geometry?.coordinates;
      if (!raw) return { path: [], skipped };
      // ORS gives [lng, lat] → swap to [lat, lng] for Leaflet
      return { path: raw.map(([lng, lat]) => [lat, lng]), skipped };
    }

    // Parse ORS error body
    const errData = await res.json().catch(() => null);
    const code: number | undefined = errData?.error?.code;
    const msg: string = errData?.error?.message ?? "";

    if (code === 2010) {
      // Message like: "…coordinate 8: 81.660800 21.28300…"
      const match = msg.match(/coordinate\s+(\d+)/i);
      if (match) {
        const badIdx = parseInt(match[1], 10);
        // Guard: never remove depot endpoints (index 0 or last)
        if (badIdx > 0 && badIdx < coords.length - 1) {
          console.warn(`ORS: skipping unroutable waypoint [${coords[badIdx]}] at index ${badIdx}`);
          coords = [...coords.slice(0, badIdx), ...coords.slice(badIdx + 1)];
          skipped++;
          continue; // retry with one fewer waypoint
        }
      }
    }

    // Non-retryable ORS error
    console.warn("ORS non-retryable error:", errData ?? res.status);
    return { path: [], skipped };
  }

  return { path: [], skipped };
}


// ─── Props ────────────────────────────────────────────────────────────────────
interface ZoneRoutingLayerProps {
  livePickups?: GeoPoint[];
  showRoutes?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ZoneRoutingLayer({
  livePickups = [],
}: ZoneRoutingLayerProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // routePaths: fetched road paths, keyed by zone id
  const [routePaths, setRoutePaths] = useState<Record<string, LatLng[]>>({});

  // loading state per zone
  const [loadingZoneId, setLoadingZoneId] = useState<string | null>(null);
  const [errorZoneId, setErrorZoneId] = useState<string | null>(null);

  // Merge live Supabase pickups into zone assignments
  const liveAssigned: AssignedPoint[] = useMemo(() => {
    return livePickups.flatMap(p => {
      const z = getZoneForPoint(p.lat, p.lng, ZONES);
      return z ? [{ ...p, zone: z }] : [];
    });
  }, [livePickups]);

  const allAssigned = useMemo(
    () => [...DEMO_ASSIGNED, ...liveAssigned],
    [liveAssigned]
  );

  // ── Called when user clicks "Route Zone" button in a depot popup ────────────
  const handleRouteZone = async (zoneId: string) => {
    const zone = ZONES.find(z => z.id === zoneId);
    const depot = ZONE_DEPOTS[zoneId];
    if (!zone || !depot) return;

    const shgsInZone = allAssigned.filter(s => s.zone.id === zoneId);
    if (shgsInZone.length === 0) {
      setErrorZoneId(zoneId);
      setTimeout(() => setErrorZoneId(null), 3000);
      return;
    }

    setLoadingZoneId(zoneId);
    setErrorZoneId(null);

    const { path, skipped } = await fetchZoneRoute(depot, shgsInZone);

    setLoadingZoneId(null);

    if (path.length < 2) {
      setErrorZoneId(zoneId);
      setTimeout(() => setErrorZoneId(null), 4000);
      return;
    }

    if (skipped > 0) {
      console.info(`Zone ${zoneId}: routed successfully, skipped ${skipped} unroutable SHG(s).`);
    }

    setRoutePaths(prev => ({ ...prev, [zoneId]: path }));
    setActiveZone(zoneId);
  };

  // ── Clear a zone's route ────────────────────────────────────────────────────
  const clearRoute = (zoneId: string) => {
    setRoutePaths(prev => {
      const copy = { ...prev };
      delete copy[zoneId];
      return copy;
    });
    if (activeZone === zoneId) setActiveZone(null);
  };

  return (
    <>
      {/* ── Hexagonal zone polygons ─────────────────────────────────────── */}
      {ZONES.map(zone => {
        const isActive = activeZone === zone.id;
        const shgsInZone = allAssigned.filter(s => s.zone.id === zone.id);

        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              fillColor: zone.fillColor,
              fillOpacity: isActive ? 0.28 : 0.1,
              weight: isActive ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () =>
                setActiveZone(prev => (prev === zone.id ? null : zone.id)),
            }}
          >
            <Tooltip direction="center" sticky>
              <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.7 }}>
                <span style={{ color: zone.color, fontSize: 13 }}>⬡ {zone.label}</span>
                <br />
                👥 SHGs: {shgsInZone.length}
                <br />
                ♻️ Click recycler to route
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {/* ── Zone center label (permanent) ───────────────────────────────── */}
      {ZONES.map(zone => (
        <CircleMarker
          key={`lbl-${zone.id}`}
          center={zone.center}
          radius={0}
          pathOptions={{ opacity: 0, fillOpacity: 0 }}
        >
          <Tooltip permanent direction="center">
            <span style={{
              color: zone.color,
              fontWeight: 700,
              fontSize: 11,
              background: "rgba(255,255,255,0.92)",
              padding: "2px 7px",
              borderRadius: 5,
              border: `1.5px solid ${zone.color}`,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              {zone.label}
            </span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* ── Road-following route polylines (one per zone, on demand) ────── */}
      {ZONES.map(zone => {
        const path = routePaths[zone.id];
        if (!path || path.length < 2) return null;
        return (
          <Polyline
            key={`route-${zone.id}`}
            positions={path}
            pathOptions={{ color: zone.color, weight: 4, opacity: 0.92 }}
          />
        );
      })}

      {/* ── SHG pickup dots ─────────────────────────────────────────────── */}
      {allAssigned.map(shg => (
        <CircleMarker
          key={`shg-${shg.id}`}
          center={[shg.lat, shg.lng]}
          radius={6}
          pathOptions={{
            color: shg.zone.color,
            fillColor: "#ffffff",
            fillOpacity: 1,
            weight: 2.5,
          }}
        >
          <Tooltip direction="top" sticky>
            <div style={{ fontSize: 11 }}>
              <strong>👥 {shg.id}</strong>
              <br />
              <span style={{ color: shg.zone.color }}>{shg.zone.label}</span>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* ── Depot ♻ markers — CLICK to get "Route Zone" popup ─────────── */}
      {ZONES.map(zone => {
        const depot = ZONE_DEPOTS[zone.id];
        if (!depot) return null;

        const isLoading   = loadingZoneId === zone.id;
        const hasError    = errorZoneId   === zone.id;
        const hasRoute    = !!routePaths[zone.id];
        const shgsInZone  = allAssigned.filter(s => s.zone.id === zone.id);

        return (
          <Marker
            key={`depot-${zone.id}`}
            position={[depot.lat, depot.lng]}
            icon={makeDepotIcon(zone.color)}
          >
            {/* popup opens on marker click */}
            <Popup minWidth={210} maxWidth={260}>
              <div style={{ fontFamily: "sans-serif", lineHeight: 1.6, padding: "2px 0" }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginBottom: 8, borderBottom: `2px solid ${zone.color}`,
                  paddingBottom: 6,
                }}>
                  <span style={{
                    background: zone.color, color: "#fff", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 15, flexShrink: 0,
                  }}>♻</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Recycler Depot</div>
                    <div style={{ color: zone.color, fontSize: 11, fontWeight: 600 }}>
                      {zone.label}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ fontSize: 12, color: "#444", marginBottom: 10 }}>
                  <div>📍 {depot.id}</div>
                  <div>👥 SHGs in zone: <strong>{shgsInZone.length}</strong></div>
                </div>

                {/* Error message */}
                {hasError && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fca5a5",
                    borderRadius: 6, padding: "6px 8px", fontSize: 11,
                    color: "#dc2626", marginBottom: 8,
                  }}>
                    ❌ Route failed. Check ORS quota or SHG count.
                  </div>
                )}

                {/* Route / Clear buttons */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleRouteZone(zone.id)}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: isLoading ? "#94a3b8" : zone.color,
                      color: "#fff",
                      border: "none",
                      borderRadius: 7,
                      padding: "8px 10px",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      transition: "opacity 0.2s",
                    }}
                  >
                    {isLoading
                      ? "🔄 Loading route…"
                      : hasRoute
                      ? "🔄 Re-Route Zone"
                      : "🚀 Route Zone"}
                  </button>

                  {hasRoute && (
                    <button
                      onClick={() => clearRoute(zone.id)}
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1",
                        borderRadius: 7,
                        padding: "8px 10px",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>

                {hasRoute && (
                  <div style={{
                    marginTop: 8, fontSize: 11, color: "#16a34a",
                    background: "#f0fdf4", borderRadius: 6,
                    padding: "5px 8px", border: "1px solid #bbf7d0",
                  }}>
                    ✅ Route shown on map — {shgsInZone.length} stops
                  </div>
                )}
              </div>
            </Popup>

            {/* Tooltip on hover */}
            <Tooltip direction="top">
              <span style={{ fontSize: 11 }}>
                ♻️ <strong>{depot.id}</strong> — click to route
              </span>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
