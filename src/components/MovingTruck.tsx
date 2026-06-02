"use client";

import { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet'; // Added Popup import
import L from 'leaflet';

// Dynamic route not used - uses prop position


interface MovingTruckProps {
  position: [number, number];
}

const MovingTruck = ({ position }: MovingTruckProps) => {


  // BUG FIX: Moved inside the component to prevent Next.js SSR crashes
  // UI FIX: Added a white circle and shadow to the HTML string so it pops on the map
  const truckIcon = new L.DivIcon({
    html: '<div style="font-size: 24px; background: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">🚛</div>',
    className: 'bg-transparent border-0',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });

// No animation for live GPS


  const currentPosition = position;
  if (!currentPosition || !currentPosition[0] || !currentPosition[1] || isNaN(currentPosition[0]) || isNaN(currentPosition[1])) {
    return null;
  }

  return (
    <Marker position={currentPosition} icon={truckIcon}>
      <Popup>
        <strong>🚛 Active Collector Live GPS</strong>
      </Popup>
    </Marker>
  );
};

export default MovingTruck;