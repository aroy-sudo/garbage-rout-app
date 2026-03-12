"use client";

import { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet'; // Added Popup import
import L from 'leaflet';

const route = [
  [21.1938, 81.3509],
  [21.1950, 81.3550],
  [21.1980, 81.3600],
  [21.2000, 81.3650],
  [21.1980, 81.3700],
  [21.1950, 81.3650],
  [21.1938, 81.3600],
];

const MovingTruck = () => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

  // BUG FIX: Moved inside the component to prevent Next.js SSR crashes
  // UI FIX: Added a white circle and shadow to the HTML string so it pops on the map
  const truckIcon = new L.DivIcon({
    html: '<div style="font-size: 24px; background: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🚛</div>',
    className: 'bg-transparent border-0',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPositionIndex((prevIndex) => (prevIndex + 1) % route.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentPosition = route[currentPositionIndex] as [number, number];

  return (
    <Marker position={currentPosition} icon={truckIcon}>
      {/* Added a popup for extra hackathon polish */}
      <Popup>
        <strong>Active Collector</strong><br/>En Route
      </Popup>
    </Marker>
  );
};

export default MovingTruck;