"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { MapContainer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import OfflineTileLayer from "./OfflineTileLayer";
import { createClient } from "@/src/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MovingTruck from "./MovingTruck";
import L from "leaflet";
import ZoneRoutingLayer from "./ZoneRoutingLayer";
import { useDriverTracking } from "@/src/hooks/useDriverTracking";
import { isWithinRadius } from "@/src/utils/geofencing";

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

  // Driver GPS State & Telemetry Hook Integration
  const [driverPosition, setDriverPosition] = useState<[number, number] | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [routeId, setRouteId] = useState<string | null>(null);

  const { location, error: trackingError } = useDriverTracking(routeId, isTrackingLocation);

  // Prevent multiple arrival triggers due to boundary GPS drifts
  const [hasArrived, setHasArrived] = useState(false);

  // Compute live active driver coordinates prioritising hook telemetry
  const currentLatLng = useMemo<[number, number] | null>(() => {
    if (location) {
      return [location.lat, location.lng];
    }
    return driverPosition;
  }, [location, driverPosition]);

  const depotLocation: [number, number] = currentLatLng || FALLBACK_LOCATION;

  const mapCenter: [number, number] = MAP_CENTER;
  const mapZoom = 12;

  // FETCH PICKUP REQUESTS
  const fetchPickupRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from("pickup_requests")
      .select("*")
      .eq("status", "pending");

    if (!error && data) {
      setPickupRequests(data as PickupRequest[]);
    }
  }, [supabase]);

  // Periodic polling for new pending pickup requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPickupRequests();
    }, 0);
    const interval = setInterval(fetchPickupRequests, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchPickupRequests]);

  // ORS ROUTE LOGIC
  const getOptimizedRoute = useCallback(async () => {
    if (pickupRequests.length === 0 || quotaExceeded) return [];

    try {
      const route = await fetchORSRoute(pickupRequests, depotLocation);
      toast.success("Route generated using OpenRouteService");
      return route;
    } catch (error) {
      console.error("Route fetch failed", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch route from ORS";

      if (errorMessage.includes("Quota exceeded") || errorMessage.includes("403")) {
        setQuotaExceeded(true);
        toast.error("ORS Quota Exceeded. Routing disabled for now.");
      } else {
        toast.error(errorMessage);
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

  // Log tracking errors from geolocation hook
  useEffect(() => {
    if (trackingError) {
      toast.error(`GPS Error: ${trackingError}`);
    }
  }, [trackingError]);

  // AUTOMATED GEOFENCING SYSTEM
  const nextPickupTarget = useMemo(() => {
    if (pickupRequests.length === 0) return null;
    // Logically, the next destination to service is the first one in the pending queue
    const target = pickupRequests[0];
    return {
      id: target.id,
      lat: target.latitude,
      lng: target.longitude,
    };
  }, [pickupRequests]);

  // Reset arrived status when target destination changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasArrived(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [nextPickupTarget?.id]);

  // Handle successful arrival status update
  const handleArrival = useCallback(async (pickupId: string) => {
    try {
      const { error } = await supabase
        .from("pickup_requests")
        .update({ status: "collected" })
        .eq("id", pickupId);

      if (error) {
        console.error("Failed to update pickup status in database:", error);
        toast.error("Failed to update status for collection.");
      } else {
        toast.success("Collection completed successfully!");
        fetchPickupRequests();
      }
    } catch (err) {
      console.error("Arrival status update error:", err);
      toast.error("An error occurred while finishing collection.");
    }
  }, [supabase, fetchPickupRequests]);

  // Check geofence status dynamically
  useEffect(() => {
    if (!location || !nextPickupTarget || hasArrived) {
      return;
    }

    const targetCoords = { lat: nextPickupTarget.lat, lng: nextPickupTarget.lng };
    const withinRadius = isWithinRadius(location, targetCoords, 50);

    if (withinRadius) {
      const timer = setTimeout(() => {
        setHasArrived(true);
        toast.success("Automatically arrived at destination (within 50m)!");
        handleArrival(nextPickupTarget.id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location, nextPickupTarget, hasArrived, handleArrival]);

  // TOGGLE GPS
  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      setIsTrackingLocation(false);
      setRouteId(null);
      setDriverPosition(null);
      toast.success("Location tracking stopped");
    } else {
      setRouteId("route-raipur-01"); // Enable tracking with verified route identification
      setIsTrackingLocation(true);
      toast.success("Location tracking started");
    }
  };

  const startRoute = async () => {
    if (!currentLatLng) {
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
        <OfflineTileLayer
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
        {currentLatLng && (
          <Marker position={currentLatLng}>
            <Popup>
              <strong>🚛 Driver Live GPS</strong>
            </Popup>
          </Marker>
        )}

        <MovingTruck position={currentLatLng || FALLBACK_LOCATION} />
      </MapContainer>
    </div>
  );
};

export default CollectorMap;