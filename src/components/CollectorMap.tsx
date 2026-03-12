"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createClient } from '@/src/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import L from 'leaflet';

// The Next.js-safe way to fix Leaflet icons using unpkg CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type PickupRequest = {
  id: string; 
  latitude: number;
  longitude: number;
  status: string;
};

const CollectorMap = () => {
  const supabase = createClient();
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const mapCenter: [number, number] = [21.1938, 81.3509]; 
  const mapZoom = 13;

  const fetchPickupRequests = async () => {
    const { data, error } = await supabase
      .from('pickup_requests')
      .select('*')
      .eq('status', 'pending');

    if (!error && data) {
      setPickupRequests(data as PickupRequest[]);
    }
  };

  useEffect(() => {
    fetchPickupRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsCollected = async (id: string) => {
    // 1. Update the database
    const { error } = await supabase
      .from('pickup_requests')
      .update({ status: 'collected' })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status.');
    } else {
      toast.success('Waste marked as collected! Route updated.');
      // 2. Remove the pin from the map immediately for a snappy UI
      setPickupRequests((prev) => prev.filter((req) => req.id !== id));
    }
  };

  return (
    <div className="w-full h-full">
      <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full min-h-[500px] z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {pickupRequests.map((request) => (
          <Marker key={request.id} position={[request.latitude, request.longitude]}>
            <Popup>
              <div className="text-center p-2 min-w-[150px]">
                <p className="font-semibold text-zinc-900 mb-3">Plastic Reported</p>
                <Button 
                  size="sm" 
                  onClick={() => markAsCollected(request.id)} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  ✅ Mark Collected
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default CollectorMap;