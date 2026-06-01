"use client";

import { useEffect, useState } from 'react';
import { MapContainer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import OfflineTileLayer from './OfflineTileLayer';
import { createClient } from '@/src/utils/supabase/client';
import { PickupRequest } from '@/src/types/database';
import L from 'leaflet';
import { toast } from 'sonner';

type ResidentHeatmapPoint = {
  user_id: string;
  latitude: number;
  longitude: number;
  total_plastic_kg: number;
};

// Generates an SVG string for our beautiful Green Home icon
const getHouseSVG = () => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-emerald-700">
    <path d="M11.47 3.841a.75.75 0 011.06 0l8.99 8.99a.75.75 0 11-1.06 1.06L20 13.435V20.25A1.75 1.75 0 0118.25 22h-3.5A1.75 1.75 0 0113 20.25v-4.5h-2v4.5A1.75 1.75 0 019.25 22h-3.5A1.75 1.75 0 014 20.25v-6.815l-.46.46A.75.75 0 012.48 12.83l8.99-8.989z" />
  </svg>
`;

const WasteRecyclerMap = () => {
  const supabase = createClient();
  const [heatmapData, setHeatmapData] = useState<ResidentHeatmapPoint[]>([]);
  const mapCenter: [number, number] = [21.1938, 81.3509]; 
  const mapZoom = 13;

  useEffect(() => {
    const fetchAndAggregateResidentData = async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*');

      if (error) {
        console.error('Error fetching data for heatmap:', error);
        toast.error('Failed to load resident heatmap data.');
        return;
      }

      const requests = data as PickupRequest[];
      const residentMap = new Map<string, ResidentHeatmapPoint>();

      requests.forEach((req) => {
        const uid = req.user_id;
        const totalPlastic = (req.pet_weight || 0) + (req.hdpe_weight || 0) + (req.ldpe_weight || 0) + (req.pp_weight || 0);

        if (!residentMap.has(uid)) {
          residentMap.set(uid, {
            user_id: uid,
            latitude: req.latitude,
            longitude: req.longitude,
            total_plastic_kg: 0,
          });
        }

        const point = residentMap.get(uid)!;
        point.total_plastic_kg += totalPlastic;
      });

      setHeatmapData(Array.from(residentMap.values()));
    };

    fetchAndAggregateResidentData();
  }, [supabase]);

  // Function to create a custom DivIcon with the SVG and absolute positioned ID floating above
  const createResidentMarkerIcon = (point: ResidentHeatmapPoint) => {
    const displayId = point.user_id.split('-')[0]; // Shorten UUID for ui cleanliness
    
    // Scale the 'aura' effect based on weight
    const isHeavy = point.total_plastic_kg > 40;
    const isMed = point.total_plastic_kg > 10;
    const weightBgColor = isHeavy ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500';

    const htmlString = `
      <div class="relative flex flex-col items-center justify-center">
        <!-- Floating Resident ID Badge -->
        <div class="absolute -top-6 whitespace-nowrap px-2 py-0.5 ${weightBgColor} text-white text-[10px] font-bold rounded-md shadow-md border border-white/20">
          ${displayId}
        </div>
        
        <!-- House SVG -->
        <div class="drop-shadow-lg z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full border-2 border-emerald-600 shadow-xl">
           ${getHouseSVG()}
        </div>
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: 'bg-transparent', // Remove leaflet's default white square background
      iconSize: [32, 32],
      iconAnchor: [16, 16], // Center the anchor on the SVG icon
    });
  };

  // Determines the dynamic properties for the Leaflet Circle heatmap representation
  const getCircleProps = (kg: number) => {
    // Base radius + scale by weight (max capped approx)
    const radius = 200 + Math.min(kg * 10, 800);
    
    // Dynamic color gradient from Green (light production) -> Yellow -> Red (heavy production)
    if (kg > 40) return { color: '#ef4444', fillColor: '#ef4444', radius }; // Red 500
    if (kg > 10) return { color: '#f59e0b', fillColor: '#f59e0b', radius }; // Amber 500
    return { color: '#10b981', fillColor: '#10b981', radius }; // Emerald 500
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        className="h-full w-full bg-zinc-100 dark:bg-zinc-900"
      >
        <OfflineTileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {heatmapData.map((point) => {
          const cProps = getCircleProps(point.total_plastic_kg);

          return (
            <div key={point.user_id}>
              {/* The "Heatmap" Aura Circle */}
              <Circle
                center={[point.latitude, point.longitude]}
                radius={cProps.radius}
                pathOptions={{
                  color: cProps.color,
                  fillColor: cProps.fillColor,
                  fillOpacity: 0.25,
                  weight: 1, // Subtle border
                }}
              />
              
              {/* The Marker Icon mapped exactly on top showing ID and House */}
              <Marker
                position={[point.latitude, point.longitude]}
                icon={createResidentMarkerIcon(point)}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default WasteRecyclerMap;
