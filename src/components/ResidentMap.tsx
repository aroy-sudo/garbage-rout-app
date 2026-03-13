"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/src/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MovingTruck from './MovingTruck';

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

// Fixed id type to string (uuid) to match Supabase
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
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const mapCenter: [number, number] = [21.1938, 81.3509]; 
  const mapZoom = 13;

  const fetchPickupRequests = async () => {
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pickup requests:', error);
      toast.error('Failed to fetch pickup requests.');
    } else {
      setPickupRequests(data as PickupRequest[]);
    }
  };

  useEffect(() => {
    fetchPickupRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

<<<<<<< HEAD
  const simulateMissedCall = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
=======
  const simulateMissedCall = async () => {
    // Pick a random location from our real Bhilai data
    const randomLocation = bhilaiLocations[Math.floor(Math.random() * bhilaiLocations.length)];

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        toast.error("You must be logged in to simulate a missed call.");
        return;
    }

    const { error } = await supabase.from('pickup_requests').insert([
      {
        latitude: randomLocation.lat,
        longitude: randomLocation.lng,
        user_id: user.id, // Use the dynamic user ID
        status: 'pending'
      },
    ]);

    if (error) {
      toast.error(`Failed to simulate: ${error.message}`);
    } else {
      toast.success(`Missed Call Received: Plastic reported at ${randomLocation.name}!`);
      fetchPickupRequests(); 
>>>>>>> 89e6fa6 (Add Collector Analytics and Dedicated Invoice flow)
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const { error } = await supabase.from('pickup_requests').insert([
          {
            latitude: lat,
            longitude: lng,
            address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            user_id: 'c90a5962-4385-4762-aa15-327e5bb6f1e8',
            status: 'pending'
          },
        ]);

        if (error) {
          toast.error(`Failed: ${error.message}`);
        } else {
          toast.success(`✅ Missed Call Logged: Plastic at your GPS [${lat.toFixed(4)}, ${lng.toFixed(4)}]!`);
          fetchPickupRequests(); 
        }
      },
      (error) => {
        toast.error('GPS access denied - using fallback');
        const fallbackLat = 21.1938;
        const fallbackLng = 81.3509;
        supabase.from('pickup_requests').insert([{
          latitude: fallbackLat,
          longitude: fallbackLng,
          user_id: 'c90a5962-4385-4762-aa15-327e5bb6f1e8',
          status: 'pending'
        }]).then(() => fetchPickupRequests());
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
        {pickupRequests.map((request) => (
          <Marker key={request.id} position={[request.latitude, request.longitude]} />
        ))}
        <MovingTruck position={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default ResidentMap;