"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapUpdaterProps {
  center?: [number, number] | null;
}

export default function MapUpdater({ center }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (
      center &&
      Array.isArray(center) &&
      center.length === 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number" &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      map.flyTo(center, 13, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);

  return null;
}
