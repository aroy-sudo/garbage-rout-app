/**
 * @file AdminHeatmap.tsx
 * @description Density map for waste accumulation
 * @author Abhiraj Roy
 * @stream CSE
 */

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getHeatmapData, SimpleHeatmapPoint } from "@/app/actions/admin-actions";

export default function AdminHeatmap() {
  const [heatmapData, setHeatmapData] = useState<SimpleHeatmapPoint[]>([]);

  useEffect(() => {
    getHeatmapData().then((data) => {
      setHeatmapData(data);
    });
  }, []);

  /**
   * Helper function: Maps accumulation weights to standard regional density styling.
   */
  const getMarkerStyle = (weight: number) => {
    if (weight < 10) {
      return { color: "#22c55e", radius: 8 };
    }
    if (weight >= 10 && weight < 30) {
      return { color: "#eab308", radius: 15 };
    }
    return { color: "#ef4444", radius: 25 };
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-0">
      <div className="h-[500px] w-full">
        <MapContainer
          center={[21.2514, 81.6296]}
          zoom={7}
          className="w-full h-full"
          style={{ background: "#f8fafc" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {heatmapData.map((point) => {
            const style = getMarkerStyle(point.weight_kg);

            return (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={style.radius}
                fillColor={style.color}
                color="#ffffff"
                weight={1.5}
                fillOpacity={0.7}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
                  <div className="text-xs p-1 font-sans">
                    <div className="font-bold text-zinc-950">Accumulated Weight</div>
                    <div className="text-zinc-600 mt-0.5">
                      Weight: <span className="font-extrabold text-zinc-900">{point.weight_kg.toFixed(1)} kg</span>
                    </div>
                    <div className="text-zinc-600">
                      Status: <span className="font-bold uppercase text-emerald-600">{point.status}</span>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
