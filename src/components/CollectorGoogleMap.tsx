"use client";

import React, { useState, useEffect } from "react";
import { useJsApiLoader, GoogleMap, MarkerF, MarkerClustererF, DirectionsRenderer, Libraries } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  borderRadius: "0.75rem",
};

// Default to a central coordinate in Chhattisgarh (e.g., Bhilai/Durg region)
const defaultCenter = { lat: 21.1938, lng: 81.3509 };

const GOOGLE_MAPS_LIBRARIES: Libraries = ["geometry"];
const TRUCK_SVG = `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text y="32" font-size="32">🚛</text></svg>`;

interface CollectorGoogleMapProps {
  pickupNodes?: Array<{
    id: string | number;
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    weight_kg?: number;
    [key: string]: any;
  }>;
  driverLocation?: { lat: number; lng: number } | null;
  onMarkerClick?: (node: any) => void;
  onRouteCalculated?: (summary: { distanceMeters: number; durationSeconds: number }) => void;
}

export default function CollectorGoogleMap({
  pickupNodes = [],
  driverLocation,
  onMarkerClick,
  onRouteCalculated,
}: CollectorGoogleMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!isLoaded || pickupNodes.length < 2) {
      setDirectionsResponse(null);
      return;
    }

    // Safely extract coordinates ensuring they exist
    const safeNodes = pickupNodes
      .map((node) => {
        const lat = node.lat !== undefined ? node.lat : node.latitude;
        const lng = node.lng !== undefined ? node.lng : node.longitude;
        return { lat, lng };
      })
      .filter((node) => node.lat !== undefined && node.lng !== undefined && !isNaN(node.lat) && !isNaN(node.lng));

    if (safeNodes.length < 2) {
      setDirectionsResponse(null);
      return;
    }

    const origin = safeNodes[0];
    const destination = safeNodes[safeNodes.length - 1];
    const middleNodes = safeNodes.slice(1, -1);

    const waypoints = middleNodes.slice(0, 23).map((node) => ({
      location: { lat: node.lat as number, lng: node.lng as number },
      stopover: true,
    }));

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.lat as number, lng: origin.lng as number },
        destination: { lat: destination.lat as number, lng: destination.lng as number },
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);

          let totalDistance = 0;
          let totalDuration = 0;
          result.routes[0].legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });

          if (onRouteCalculated) {
            onRouteCalculated({ distanceMeters: totalDistance, durationSeconds: totalDuration });
          }
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [isLoaded, pickupNodes, onRouteCalculated]);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full min-h-[400px] items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {pickupNodes.length > 0 && (
        <MarkerClustererF>
          {(clusterer) => (
            <>
              {pickupNodes.map((node, index) => {
                // Safety check for valid coordinates (supports both lat/lng and latitude/longitude)
                const lat = node.lat !== undefined ? node.lat : node.latitude;
                const lng = node.lng !== undefined ? node.lng : node.longitude;

                if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
                  return null;
                }

                return (
                  <MarkerF
                    key={node.id || index}
                    position={{ lat, lng }}
                    clusterer={clusterer}
                    onClick={() => onMarkerClick && onMarkerClick(node)}
                  />
                );
              })}
            </>
          )}
        </MarkerClustererF>
      )}

      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#8b5cf6",
              strokeWeight: 6,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {driverLocation && (
        <MarkerF
          position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
          icon={{ url: TRUCK_SVG }}
          zIndex={9999}
        />
      )}
    </GoogleMap>
  );
}
