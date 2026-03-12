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

const bhilaiLocations = [
  { name: "Kurud Village", lat: 21.2050, lng: 81.3350 },
  { name: "Kohka Block", lat: 21.2150, lng: 81.3400 },
  { name: "Supela Market", lat: 21.1980, lng: 81.3500 },
  { name: "Nehru Nagar Hub", lat: 21.1900, lng: 81.3200 },
  { name: "Smriti Nagar Camp", lat: 21.2000, lng: 81.3100 },
  { name: "Sector 6 Depot", lat: 21.1850, lng: 81.3300 },
  { name: "Junwani Outskirts", lat: 21.2200, lng: 81.3000 },
];

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

  const simulateMissedCall = async () => {
    // Pick a random location from our real Bhilai data
    const randomLocation = bhilaiLocations[Math.floor(Math.random() * bhilaiLocations.length)];

    const { error } = await supabase.from('pickup_requests').insert([
      {
        latitude: randomLocation.lat,
        longitude: randomLocation.lng,
        user_id: 'c90a5962-4385-4762-aa15-327e5bb6f1e8', // Keep your real Supabase UID here
        status: 'pending'
      },
    ]);

    if (error) {
      toast.error(`Failed to simulate: ${error.message}`);
    } else {
      toast.success(`Missed Call Received: Plastic reported at ${randomLocation.name}!`);
      fetchPickupRequests(); 
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
        {pickupRequests.map((request) => (
          <Marker key={request.id} position={[request.latitude, request.longitude]} />
        ))}
        <MovingTruck />
      </MapContainer>
    </div>
  );
};

export default ResidentMap;