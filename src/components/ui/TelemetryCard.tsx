"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Clock, MapPin } from "lucide-react";

interface TelemetryCardProps {
  distanceMeters: number;
  durationSeconds: number;
  nodeCount: number;
}

export function TelemetryCard({
  distanceMeters,
  durationSeconds,
  nodeCount,
}: TelemetryCardProps) {
  const distanceKm = (distanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(durationSeconds / 60);

  return (
    <Card className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur shadow-lg min-w-[200px]">
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

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Stops</p>
            <p className="text-lg font-bold">{nodeCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
