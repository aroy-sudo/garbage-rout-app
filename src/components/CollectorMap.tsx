"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/src/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MovingTruck from "./MovingTruck";
import L from "leaflet";
import { useRouter } from 'next/navigation';
import { RECYCLERS } from "@/src/lib/demoData";
import ZoneRoutingLayer from "./ZoneRoutingLayer";

type PickupRequest = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
};

// Fix Leaflet icon issue in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Waste Recycler SVG icon (green recycling symbol)
const recyclerSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="40">
  <circle cx="24" cy="24" r="22" fill="#16a34a" stroke="white" stroke-width="2"/>
  <text x="24" y="30" font-size="22" text-anchor="middle" fill="white">♻</text>
</svg>
`);

const RecyclerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${recyclerSvg}`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

const FALLBACK_LOCATION: [number, number] = [21.2497, 81.6050];
const MAP_CENTER: [number, number] = [21.2497, 81.6050];

// ORS ROUTE FETCHER (ONLY ROUTING LOGIC)
const fetchORSRoute = async (
  pickupRequests: PickupRequest[],
  depotLocation: [number, number]
): Promise<[number, number][]> => {
  if (pickupRequests.length === 0) return [];

  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZlOWI2NWI3MTgxZTRiNGY5YTkzMWY2YThlMDlkMzk1IiwiaCI6Im11cm11cjY0In0=";
  if (!apiKey) {
    throw new Error("ORS API key missing");
  }

  const coordinates: [number, number][] = [
    [depotLocation[1], depotLocation[0]],
    ...pickupRequests.map(
      (req) => [req.longitude, req.latitude] as [number, number]
    ),
  ];

  try {
    const response = await fetch("/api/ors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Proxy error ${response.status}`);
    }

    const data = await response.json();
    const geometry = data.features?.[0]?.geometry?.coordinates;

    if (!geometry) {
      throw new Error("ORS returned empty route");
    }

    return geometry.map(([lng, lat]: [number, number]) => [lat, lng]);
  } catch (error) {
    console.error("Fetch to ORS proxy failed.", error);
    throw error;
  }
};

const CollectorMap = () => {

  const supabase = createClient();

  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  const depotLocation: [number, number] = driverPosition || FALLBACK_LOCATION;

  const mapCenter: [number, number] = MAP_CENTER;
  const mapZoom = 12;

  // FETCH PICKUP REQUESTS
  const fetchPickupRequests = async () => {

    const { data, error } = await supabase
      .from("pickup_requests")
      .select("*")
      .eq("status", "pending");

    if (!error && data) {
      setPickupRequests(data as PickupRequest[]);
    }

  };

  useEffect(() => {

    fetchPickupRequests();

    const interval = setInterval(fetchPickupRequests, 5000);

    return () => clearInterval(interval);

  }, []);

  const router = useRouter();

  // ORS ROUTE LOGIC
  const getOptimizedRoute = useCallback(async () => {

    if (pickupRequests.length === 0 || quotaExceeded) return [];

    try {

      const route = await fetchORSRoute(pickupRequests, depotLocation);

      toast.success("Route generated using OpenRouteService");

      return route;

    } catch (error: any) {

      console.error("Route fetch failed", error);

      if (error?.message?.includes("Quota exceeded") || error?.message?.includes("403")) {
        setQuotaExceeded(true);
        toast.error("ORS Quota Exceeded. Routing disabled for now.");
      } else {
        toast.error("Failed to fetch route from ORS");
      }

      return [];

    }

  }, [pickupRequests, depotLocation, quotaExceeded]);

  // UPDATE ROUTE
  const updateRoute = useCallback(async () => {

    if (pickupRequests.length === 0) {

      setRoutePath([]);
      return;

    }

    setLoadingRoute(true);

    const path = await getOptimizedRoute();

    setRoutePath(path);

    setLoadingRoute(false);

  }, [pickupRequests, getOptimizedRoute]);

  const prevRequestsStr = useRef<string>("");
  const prevDepotStr = useRef<string>("");

  // AUTO ROUTE UPDATE
  useEffect(() => {

    const requestsStr = JSON.stringify(pickupRequests);
    const depotStr = JSON.stringify(depotLocation);

    if (requestsStr !== prevRequestsStr.current || depotStr !== prevDepotStr.current) {
      prevRequestsStr.current = requestsStr;
      prevDepotStr.current = depotStr;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      updateRoute();
    }

  }, [pickupRequests, depotLocation, updateRoute]);

  // GPS WATCHER
  useEffect(() => {

    if (!isTrackingLocation) return;

    if (!navigator.geolocation) {

      toast.error("Geolocation not supported");
      return;

    }

    const watchId = navigator.geolocation.watchPosition(

      (position) => {

        setDriverPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);

      },

      (error) => {
        console.warn("GPS error", error);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, [isTrackingLocation]);

  // TOGGLE GPS
  const toggleLocationTracking = () => {

    if (isTrackingLocation) {

      setIsTrackingLocation(false);
      setDriverPosition(null);
      toast.success("Location tracking stopped");

    } else {

      setIsTrackingLocation(true);
      toast.success("Location tracking started");

    }

  };

  const startRoute = async () => {

    if (!driverPosition) {

      toast.error("Enable location first");
      return;

    }

    toast.info("Starting route from current GPS");

    await updateRoute();

  };

  return (

    <div className="w-full h-full">

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full min-h-[500px] z-0"
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* ─── 4-Zone routing grid ─────────────────────────────────── */}
        <ZoneRoutingLayer livePickups={pickupRequests.map(r => ({ id: r.id, lat: r.latitude, lng: r.longitude }))} showRoutes={true} />

        {/* GPS CONTROLS */}

        <div className="absolute top-4 left-4 z-[1000] flex gap-2">

          <Button
            onClick={toggleLocationTracking}
            variant={isTrackingLocation ? "destructive" : "default"}
            size="sm"
          >
            📍 {isTrackingLocation ? "Stop GPS" : "Enable GPS"}
          </Button>

          <Button
            onClick={startRoute}
            size="sm"
            variant="outline"
          >
            🚀 Start Route
          </Button>

        </div>

        {/* ROUTE */}

        {routePath.length > 0 && (

          <Polyline
            positions={routePath}
            pathOptions={{
              color: "#059669",
              weight: 6,
              opacity: 0.9,
            }}
          />

        )}
        {/* LOADING MARKER */}

        {loadingRoute && !routePath.length && (

          <Marker position={mapCenter}>
            <Popup>Computing optimal route...</Popup>
          </Marker>

        )}

        {/* DRIVER MARKER */}

        {driverPosition && (

          <Marker position={driverPosition}>

            <Popup>
              <strong>🚛 Driver Live GPS</strong>
            </Popup>

          </Marker>

        )}

        <MovingTruck position={driverPosition || FALLBACK_LOCATION} />

        {/* RECYCLER STATION MARKERS */}
        {RECYCLERS.map((recycler) => (
          <Marker
            key={recycler.id}
            position={[recycler.lat, recycler.lng]}
            icon={RecyclerIcon}
          >
            <Popup>
              <strong>♻️ Waste Recycler Station</strong><br/>
              <span className="font-mono text-xs text-green-700">{recycler.id}</span>
            </Popup>
          </Marker>
        ))}

        {/* PICKUP MARKERS */}

        {pickupRequests.map((request) => (

          <Marker
            key={request.id}
            position={[request.latitude, request.longitude]}
          >

            <Popup className="collector-popup">

              <div className="text-center p-2 min-w-[150px]">

                <p className="font-semibold text-zinc-900 mb-3">
                  Plastic Reported
                </p>

                <Button 
                  size="sm" 
                  onClick={() => router.push(`/dashboard/collector/pickup/${request.id}`)} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  📝 Process Pickup
                </Button>

              </div>

            </Popup>

          </Marker>

        ))}

      </MapContainer>

    </div>

  );

};

export default CollectorMap;