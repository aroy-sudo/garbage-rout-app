/**
 * @file ExecutiveHeatmap.tsx
 * @description State Executive Density Map
 * @author Abhiraj Roy
 * @stream CSE
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import OfflineTileLayer from "./OfflineTileLayer";
import { getAdminHeatmapData, HeatmapPoint } from "@/app/actions/admin-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Layers, MapPin, Scale, RefreshCw, BarChart2 } from "lucide-react";
import { toast } from "sonner";

export default function ExecutiveHeatmap() {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "collected" | "pending" | "high">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map Default Position centered in Chhattisgarh region
  const mapCenter: [number, number] = [21.2787, 81.6048];
  const mapZoom = 10;

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const res = await getAdminHeatmapData();
      if (res.error) {
        setError(res.error);
        toast.error(`Admin Fetch Error: ${res.error}`);
      } else if (res.data) {
        setPoints(res.data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to load admin density data:", err);
      setError("Failed to execute data fetch action.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered density points based on dashboard selections
  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (filter === "collected") return p.status === "collected";
      if (filter === "pending") return p.status === "pending";
      if (filter === "high") return p.totalWeight >= 50;
      return true;
    });
  }, [points, filter]);

  // Aggregated Analytics Indicators
  const stats = useMemo(() => {
    const totalWeight = points.reduce((sum, p) => sum + p.totalWeight, 0);
    const avgWeight = points.length > 0 ? totalWeight / points.length : 0;
    const hotzonesCount = points.filter((p) => p.totalWeight >= 50).length;
    const collectedCount = points.filter((p) => p.status === "collected").length;
    const pendingCount = points.filter((p) => p.status === "pending").length;

    return {
      totalWeight,
      avgWeight,
      hotzonesCount,
      collectedCount,
      pendingCount,
    };
  }, [points]);

  // Dynamic color coding based on waste density/load
  const getMarkerColor = (weight: number) => {
    if (weight >= 100) return "#ef4444"; // Red for Critical Accumulation
    if (weight >= 50) return "#f97316";  // Orange for High Density
    if (weight >= 20) return "#eab308";  // Yellow for Moderate
    return "#10b981";                    // Green for Low/Safe
  };

  // Dynamic radius sizing based on waste density
  const getMarkerRadius = (weight: number) => {
    return Math.min(8 + weight / 10, 30);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <span className="text-sm font-medium text-zinc-500">
          Resolving state collection density points...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50/20 max-w-lg mx-auto mt-10">
        <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">Verification Failed</h3>
            <p className="text-sm text-zinc-500 mt-1">{error}</p>
          </div>
          <Button variant="outline" className="border-zinc-200" onClick={loadData}>
            Retry Authorization
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Dynamic Summary Cards Overlay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Total Waste Logged
              </p>
              <h4 className="text-2xl font-black mt-1 text-zinc-800 dark:text-zinc-50">
                {stats.totalWeight.toFixed(1)} kg
              </h4>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Scale className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Average Load
              </p>
              <h4 className="text-2xl font-black mt-1 text-zinc-800 dark:text-zinc-50">
                {stats.avgWeight.toFixed(1)} kg
              </h4>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <BarChart2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Active Hotspots (&gt;=50kg)
              </p>
              <h4 className="text-2xl font-black mt-1 text-zinc-800 dark:text-zinc-50">
                {stats.hotzonesCount} zones
              </h4>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 dark:border-zinc-800 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Completion Rate
              </p>
              <h4 className="text-2xl font-black mt-1 text-zinc-800 dark:text-zinc-50">
                {points.length > 0
                  ? `${Math.round((stats.collectedCount / points.length) * 100)}%`
                  : "0%"}
              </h4>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-2xl">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Map Visual Panel */}
      <Card className="border-[#e8fccf] dark:border-zinc-800 shadow-md overflow-hidden relative">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-500" />
              State Executive Waste Accumulation Map
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Live geographic visualization of compliance, collection rates, and density hot spots.
            </p>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="icon"
              disabled={isRefreshing}
              onClick={loadData}
              className="h-9 w-9 shrink-0 border-zinc-200"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            
            <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="h-7 text-xs font-semibold px-2.5 rounded-md"
              >
                All
              </Button>
              <Button
                variant={filter === "collected" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("collected")}
                className="h-7 text-xs font-semibold px-2.5 rounded-md text-emerald-600"
              >
                Collected
              </Button>
              <Button
                variant={filter === "pending" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("pending")}
                className="h-7 text-xs font-semibold px-2.5 rounded-md text-amber-600"
              >
                Pending
              </Button>
              <Button
                variant={filter === "high" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilter("high")}
                className="h-7 text-xs font-semibold px-2.5 rounded-md text-red-600"
              >
                Hotspots
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative">
          <div className="w-full h-[550px] relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
              style={{ background: "#f8fafc" }}
            >
              <OfflineTileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {/* Render circular density markers */}
              {filteredPoints.map((pt) => {
                const color = getMarkerColor(pt.totalWeight);
                const radius = getMarkerRadius(pt.totalWeight);

                return (
                  <CircleMarker
                    key={pt.id}
                    center={[pt.latitude, pt.longitude]}
                    radius={radius}
                    fillColor={color}
                    color="#ffffff"
                    weight={1.5}
                    fillOpacity={0.7}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-1 flex flex-col gap-2 min-w-[200px]">
                        <div className="flex justify-between items-center border-b pb-1.5 border-zinc-100">
                          <span className="text-xs font-black text-zinc-800">
                            Collection Proof Info
                          </span>
                          <Badge
                            className={
                              pt.status === "collected"
                                ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-none"
                                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-none"
                            }
                          >
                            {pt.status === "collected" ? "Collected" : "Pending"}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <Scale className="h-3.5 w-3.5 text-zinc-400" />
                            <span>
                              Total Weight: <strong>{pt.totalWeight.toFixed(1)} kg</strong>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                            <span>
                              Coords: {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                            </span>
                          </div>

                          <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">
                            Logged: {new Date(pt.created_at).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Density Scale Legend overlay inside the map container */}
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/80 z-[1000] flex flex-col gap-2 text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-100">Density Scale</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white" />
                  <span className="text-zinc-600 dark:text-zinc-300">Critical (&gt;= 100 kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white" />
                  <span className="text-zinc-600 dark:text-zinc-300">High (50 - 99 kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-white" />
                  <span className="text-zinc-600 dark:text-zinc-300">Moderate (20 - 49 kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white" />
                  <span className="text-zinc-600 dark:text-zinc-300">Safe/Low (&lt; 20 kg)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
