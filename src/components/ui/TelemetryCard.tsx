"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Clock, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TelemetryCardProps {
  distanceMeters: number;
  durationSeconds: number;
  nodeCount: number;
  pickupNodes?: Array<{lat: number, lng: number}>;
}

export function TelemetryCard({
  distanceMeters,
  durationSeconds,
  nodeCount,
  pickupNodes,
}: TelemetryCardProps) {
  const distanceKm = (distanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(durationSeconds / 60);

  const exportToGoogleMaps = () => {
    if (!pickupNodes || pickupNodes.length === 0) return;

    if (pickupNodes.length === 1) {
      // Single point search
      const url = `https://www.google.com/maps/search/?api=1&query=${pickupNodes[0].lat},${pickupNodes[0].lng}`;
      window.open(url, '_blank');
      return;
    }

    // Routing for multiple points
    const origin = pickupNodes[0];
    const destination = pickupNodes[pickupNodes.length - 1];
    const middleNodes = pickupNodes.slice(1, -1).slice(0, 9); // Google limits to 9 waypoints
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
    
    if (middleNodes.length > 0) {
      const waypointsStr = middleNodes.map(n => `${n.lat},${n.lng}`).join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="absolute top-4 right-4 z-[1000] bg-white/85 backdrop-blur-md border border-white/20 shadow-xl min-w-[200px]">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Ruler className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Route Distance</p>
            <p className="text-lg font-bold">{distanceKm} km</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Est. Time</p>
            <p className="text-lg font-bold">{durationMin} min</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Collection Stops</span>
            <span className="font-bold">{pickupNodes?.length || 0} locations</span>
          </div>
        </div>

        <Button 
          type="button"
          onClick={exportToGoogleMaps}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in Google Maps
        </Button>
      </CardContent>
    </Card>
  );
}
