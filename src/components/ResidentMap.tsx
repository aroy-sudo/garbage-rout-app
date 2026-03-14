"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/src/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MovingTruck from './MovingTruck';
import { GeoPoint, SHGS, RECYCLERS } from '@/src/lib/demoData';

// Custom Leaflet Recycler Icon using an inline SVG
const recyclerSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="40">
  <circle cx="24" cy="24" r="22" fill="#16a34a" stroke="white" stroke-width="2"/>
  <text x="24" y="30" font-size="22" text-anchor="middle" fill="white">♻</text>
</svg>
`);


// Leaflet's default icon doesn't work well with React, so we need to fix it.
import L from 'leaflet';

// The Next.js-safe way to fix Leaflet icons using unpkg CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom SHG icon (red dot)
const SHGIcon = L.divIcon({
  html: `<div style="background-color: #f43f5e; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
  className: 'bg-transparent border-0',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

// Waste Recycler icon - green recycling symbol
const RecyclerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${recyclerSvg}`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// Dummy truck type for animated collectors
type DummyTruck = {
   id: string;
   lat: number;
   lng: number;
   center: GeoPoint;
   angle: number;
   speedMod: number;
};

// Supabase row shape
type PickupRequest = {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  user_id: string;
  created_at: string;
};

const ResidentMap = () => {
  const supabase = createClient();
  const [activePickups, setActivePickups] = useState<GeoPoint[]>([]);
  const [dummyTrucks, setDummyTrucks] = useState<DummyTruck[]>([]);
  
  // Track all IDs ever spawned to strictly prevent duplicates
  const usedSHGIds = useRef<Set<string>>(new Set());

  // Center exactly on Raipur based on the new user provided data
  const mapCenter: [number, number] = [21.2510, 81.6350];
  const mapZoom = 12;

  // Initialize data on mount
  useEffect(() => {
    // 1. Fetch Real-time active pending requests from Supabase
    const fetchPendingPickups = async () => {
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('status', 'pending');

      if (error) {
         console.error("Failed to load map data from Supabase:", error);
         toast.error("Failed to load live map data.");
      } else if (data) {
         const serverPickups: GeoPoint[] = (data as PickupRequest[]).map((req: PickupRequest) => ({
             id: req.user_id || `Unknown-${req.id}`,
             lat: req.latitude || 0,
             lng: req.longitude || 0,
         })).filter((req: GeoPoint) => req.lat !== 0 && req.lng !== 0);
         
         // Mark all IDs from the server as used so they aren't randomly picked again
         serverPickups.forEach(p => usedSHGIds.current.add(p.id));
         setActivePickups(serverPickups);
      }
    };

    fetchPendingPickups();

    // 2. Set up realtime Supabase Subscription
    const subscription = supabase
      .channel('pickup_requests_map_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pickup_requests' },
        (payload: any) => {
          const newRequest = payload.new as PickupRequest;
          if (newRequest.status === 'pending' && newRequest.latitude && newRequest.longitude) {
            const safeId = newRequest.user_id || `User-${newRequest.id}`;
            setActivePickups(prev => [
                ...prev, 
                { id: safeId, lat: newRequest.latitude || 0, lng: newRequest.longitude || 0 }
            ]);
            usedSHGIds.current.add(safeId);
          }
        }
      )
      .subscribe();

    // 3. Pick 6 random recyclers to spawn dummy trucks around
    const trucks: DummyTruck[] = [];
    const shuffledRecyclers = [...RECYCLERS].sort(() => 0.5 - Math.random());
    for(let i=0; i < 6; i++) {
        if (!shuffledRecyclers[i]) break; // Safety check
        const center = shuffledRecyclers[i];
        trucks.push({
           id: `truck-${i}`,
           lat: center.lat,
           lng: center.lng,
           center: center,
           angle: Math.random() * Math.PI * 2, // Random start angle
           speedMod: 0.8 + Math.random() * 0.5 // Random speed multiplier
        });
    }
    setDummyTrucks(trucks);

    return () => {
        supabase.removeChannel(subscription);
    };
  }, [supabase]);

  // Animation Loop for Dummy Trucks
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      // Delta time in seconds
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setDummyTrucks(prevTrucks => 
         prevTrucks.map(truck => {
            // Radius of wandering ~500 meters in approx degrees
            const radius = 0.005; 
            const speed = 0.5 * truck.speedMod; // radians per second
            
            const newAngle = truck.angle + speed * dt;
            
            // Organic wandering using overlapping sine waves (Lissajous curve)
            const latOffset = Math.sin(newAngle * 0.8) * Math.cos(newAngle * 0.3) * radius;
            const lngOffset = Math.sin(newAngle * 1.1) * Math.cos(newAngle * 0.5) * radius;

            return {
               ...truck,
               angle: newAngle,
               lat: truck.center.lat + latOffset,
               lng: truck.center.lng + lngOffset,
            };
         })
      );
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const simulateMissedCall = async () => {
    // Pick a random untouched SHG from the Raipur Dataset!
    const availableSHGs = SHGS.filter(
        r => !usedSHGIds.current.has(r.id)
    );

    if (availableSHGs.length === 0) {
        toast.error("All SHGs in the dataset have already requested a pickup!");
        return;
    }

    // Pick a random untouched SHG
    const randomSHG = availableSHGs[Math.floor(Math.random() * availableSHGs.length)];
    
    // Execute the INSERT command into Supabase
    const { error } = await supabase.from('pickup_requests').insert([
        {
          user_id: randomSHG.id,
          latitude: randomSHG.lat,
          longitude: randomSHG.lng,
          status: 'pending',
          pet_weight: parseFloat((Math.random() * 8 + 1).toFixed(1)),
          hdpe_weight: parseFloat((Math.random() * 2 + 1).toFixed(1)),
          ldpe_weight: 0,
          pp_weight: 0,
        },
    ]);

    if (error) {
        toast.error(`Database Error: ${error.message}`);
    } else {
        toast.success(`✅ Missed Call Logged: Request from ${randomSHG.id} successfully broadcasted to platform!`);
        // We do not run setActivePickups here! It will automatically map via the Supabase Live Subscription!
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Floating button over the map for a cooler UI */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button onClick={simulateMissedCall} className="shadow-lg">
          📞 Simulate Missed Call
        </Button>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full min-h-[500px] z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render Waste Recycler Station Markers */}
        {RECYCLERS.map((recycler) => (
            <Marker
                key={recycler.id}
                position={[recycler.lat, recycler.lng]}
                icon={RecyclerIcon}
            >
               <Popup>
                  <strong>♻️ Waste Recycler</strong><br/>
                  <span className="font-mono text-xs text-green-700">{recycler.id}</span>
               </Popup>
            </Marker>
        ))}

        {/* Render Pending Pickups from Supabase */}
        {activePickups.map((shg) => (
            <Marker
                key={shg.id}
                position={[shg.lat, shg.lng]}
                icon={SHGIcon}
            >
               <Popup>
                  <strong>📍 Pending Pickup</strong><br/>
                  SHG: <span className="font-mono text-xs">{shg.id}</span>
               </Popup>
            </Marker>
        ))}

        {/* Render Animated Dummy Collector Trucks */}
        {dummyTrucks.map(truck => (
            <MovingTruck key={truck.id} position={[truck.lat, truck.lng]} />
        ))}
      </MapContainer>
    </div>
  );
};

export default ResidentMap;