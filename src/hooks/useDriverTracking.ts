import { useEffect, useState } from "react";
import { TelemetryPoint } from "@/src/types/telemetry";
import { enqueuePoint, getQueue, clearQueue } from "@/src/utils/telemetryQueue";

export function useDriverTracking(
  routeId: string | null,
  isTracking: boolean
) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Geolocation and batch sending only when tracking is active and routeId is set
    if (!isTracking || !routeId) {
      const timer = setTimeout(() => {
        setLocation(null);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const timer = setTimeout(() => {
        setError("Geolocation is not supported by this browser.");
      }, 0);
      return () => clearTimeout(timer);
    }

    let watchId: number | null = null;

    const successCallback = async (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading } = position.coords;
      const latLng = { lat: latitude, lng: longitude };

      // 1. Update the local hook state with the new lat/lng (so the UI can move the truck marker)
      setLocation(latLng);

      // 2. Construct a TelemetryPoint
      const newPoint: TelemetryPoint = {
        route_id: routeId,
        latitude,
        longitude,
        speed: typeof speed === "number" ? speed : null,
        heading: typeof heading === "number" ? heading : null,
        recorded_at: new Date(position.timestamp).toISOString(),
      };

      // 3. Check navigator.onLine
      if (!navigator.onLine) {
        // If false: Call enqueuePoint from telemetryQueue.ts
        enqueuePoint(newPoint);
      } else {
        // If true:
        // Grab any existing points from getQueue()
        const existingQueue = getQueue();
        // Append the new current point to this array
        const batch = [...existingQueue, newPoint];

        try {
          // fetch POST the entire batch to /api/telemetry
          const response = await fetch("/api/telemetry", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(batch),
          });

          if (response.ok) {
            // If the fetch is successful (res.ok), call clearQueue()
            clearQueue();
          } else {
            console.warn("Telemetry batch submission failed. Enqueuing points.");
            // If the fetch fails, push everything back to enqueuePoint
            clearQueue();
            batch.forEach((point) => enqueuePoint(point));
          }
        } catch (fetchErr) {
          console.error("Network error during telemetry upload. Enqueuing points:", fetchErr);
          // If the fetch fails, push everything back to enqueuePoint
          clearQueue();
          batch.forEach((point) => enqueuePoint(point));
        }
      }
    };

    const errorCallback = (err: GeolocationPositionError) => {
      console.error("Geolocation watchPosition error:", err);
      setError(err.message);
    };

    // Start watching position with high accuracy
    watchId = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Cleanup function calls clearWatch when component unmounts or tracking stops
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [routeId, isTracking]);

  return { location, error };
}
export default useDriverTracking;
