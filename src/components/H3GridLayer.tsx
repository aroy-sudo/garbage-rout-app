"use client";

import { useEffect, useState } from 'react';
import { Polygon, Polyline, Tooltip, CircleMarker } from 'react-leaflet';
import * as h3 from 'h3-js';
import { SHGS, RECYCLERS, GeoPoint } from '@/src/lib/demoData';

// ─── Config ────────────────────────────────────────────────────────────────────
// NIT Raipur center
const CENTER_LAT = 21.2497;
const CENTER_LNG = 81.6050;

// 10 km radius ≈ 0.09°. We build an octagon polygon as the polyfill boundary.
const R = 0.09;

// Resolution 7 → avg hexagon edge ~5.16 km, fits nicely inside 10 km radius (≈ 4–6 hexagons)
const RESOLUTION = 7;

// Octagon boundary polygon around NIT Raipur (lat/lng pairs)
const BOUNDARY_LATLON: [number, number][] = [
  [CENTER_LAT + R,         CENTER_LNG],             // N
  [CENTER_LAT + R * 0.707, CENTER_LNG + R * 0.707], // NE
  [CENTER_LAT,             CENTER_LNG + R],           // E
  [CENTER_LAT - R * 0.707, CENTER_LNG + R * 0.707],  // SE
  [CENTER_LAT - R,         CENTER_LNG],              // S
  [CENTER_LAT - R * 0.707, CENTER_LNG - R * 0.707],  // SW
  [CENTER_LAT,             CENTER_LNG - R],           // W
  [CENTER_LAT + R * 0.707, CENTER_LNG - R * 0.707],  // NW
];

// Colors for each hexagon
const HEX_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface HexCell {
  id: string;
  boundaries: [number, number][];
  center: [number, number];
  color: string;
  shgs: GeoPoint[];           // SHGs inside this hex
  collector: GeoPoint | null; // nearest RECYCLER to this hex center
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface H3GridLayerProps {
  showRoutes?: boolean;
}

export default function H3GridLayer({ showRoutes = true }: H3GridLayerProps) {
  const [cells, setCells] = useState<HexCell[]>([]);
  const [activeHex, setActiveHex] = useState<string | null>(null);

  useEffect(() => {
    try {
      // polygonToCells expects [lng, lat] — note the swap!
      const geoJsonRing = BOUNDARY_LATLON.map(([lat, lng]) => [lng, lat]);
      const hexIds = h3.polygonToCells(geoJsonRing, RESOLUTION);

      const result: HexCell[] = hexIds.map((hexId, idx) => {
        // Cell boundary → [lat, lng] arrays (what Leaflet expects)
        const boundaries = h3.cellToBoundary(hexId) as [number, number][];
        const [cLat, cLng] = h3.cellToLatLng(hexId);

        // Find which SHGs fall inside this hexagon
        const shgsInHex = SHGS.filter(shg => {
          const cellForShg = h3.latLngToCell(shg.lat, shg.lng, RESOLUTION);
          return cellForShg === hexId;
        });

        // Find nearest recycler to this hex center
        let nearestCollector: GeoPoint | null = null;
        let minDist = Infinity;
        RECYCLERS.forEach(r => {
          const d = Math.hypot(r.lat - cLat, r.lng - cLng);
          if (d < minDist) {
            minDist = d;
            nearestCollector = r;
          }
        });

        return {
          id: hexId,
          boundaries,
          center: [cLat, cLng],
          color: HEX_COLORS[idx % HEX_COLORS.length],
          shgs: shgsInHex,
          collector: nearestCollector,
        };
      });

      setCells(result);
    } catch (e) {
      console.error("H3 polyfill error:", e);
    }
  }, []);

  return (
    <>
      {cells.map(cell => {
        const isActive = activeHex === cell.id;

        return (
          <Polygon
            key={cell.id}
            positions={cell.boundaries}
            pathOptions={{
              color: cell.color,
              fillColor: cell.color,
              fillOpacity: isActive ? 0.35 : 0.15,
              weight: isActive ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => setActiveHex(prev => prev === cell.id ? null : cell.id),
            }}
          >
            <Tooltip direction="center" permanent={false} sticky>
              <div className="text-xs font-semibold">
                <div>⬡ Hex Zone</div>
                <div className="font-mono text-[10px] text-gray-500">{cell.id.slice(-8)}</div>
                <div>👥 SHGs: {cell.shgs.length}</div>
                {cell.collector && (
                  <div>♻️ {cell.collector.id}</div>
                )}
              </div>
            </Tooltip>
          </Polygon>
        );
      })}

      {/* Per-hex routing: draw paths from collector → each SHG */}
      {showRoutes && cells.map(cell => {
        if (!cell.collector || cell.shgs.length === 0) return null;

        const collectorPos: [number, number] = [cell.collector.lat, cell.collector.lng];

        return cell.shgs.map(shg => {
          // Route path: collector → hex boundary midpoint → SHG (hugs hexagon for visual clarity)
          const midLat = (collectorPos[0] + shg.lat) / 2;
          const midLng = (collectorPos[1] + shg.lng) / 2;
          const [hexCLat, hexCLng] = cell.center;

          // Slight deviation toward hex center to make it look like a hex-aware path
          const routePath: [number, number][] = [
            collectorPos,
            [(midLat + hexCLat) / 2, (midLng + hexCLng) / 2],
            [shg.lat, shg.lng],
          ];

          return (
            <Polyline
              key={`route-${cell.id}-${shg.id}`}
              positions={routePath}
              pathOptions={{
                color: cell.color,
                weight: 2,
                opacity: 0.7,
                dashArray: '6 4',
              }}
            />
          );
        });
      })}

      {/* SHG dots inside hexagons */}
      {cells.map(cell =>
        cell.shgs.map(shg => (
          <CircleMarker
            key={`shg-${shg.id}`}
            center={[shg.lat, shg.lng]}
            radius={5}
            pathOptions={{
              color: cell.color,
              fillColor: '#fff',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip direction="top" sticky>
              <div className="text-xs">
                <strong>👥 SHG:</strong> {shg.id}
              </div>
            </Tooltip>
          </CircleMarker>
        ))
      )}

      {/* Collector depot dots */}
      {cells
        .filter((cell, idx, arr) =>
          // Deduplicate collectors
          cell.collector && arr.findIndex(c => c.collector?.id === cell.collector?.id) === idx
        )
        .map(cell => (
          <CircleMarker
            key={`collector-${cell.collector!.id}`}
            center={[cell.collector!.lat, cell.collector!.lng]}
            radius={8}
            pathOptions={{
              color: '#fff',
              fillColor: cell.color,
              fillOpacity: 1,
              weight: 2.5,
            }}
          >
            <Tooltip direction="top" sticky>
              <div className="text-xs">
                <strong>♻️ Depot:</strong> {cell.collector!.id}
              </div>
            </Tooltip>
          </CircleMarker>
        ))
      }
    </>
  );
}
