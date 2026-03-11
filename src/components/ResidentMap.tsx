'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

function MapClickHandler({ onPositionChange }: { onPositionChange: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
}

export default function ResidentMap() {
  const [selectedPosition, setSelectedPosition] = useState<L.LatLng | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const handleRequestPickup = async () => {
    if (!selectedPosition) {
      toast.error('Please select a location on the map first.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('You must be logged in to request a pickup.');
      return;
    }

    const { error } = await supabase.from('pickup_requests').insert([
      {
        user_id: user.id,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        status: 'pending',
      },
    ]);

    if (error) {
      toast.error('Failed to request pickup. Please try again.');
      console.error('Error inserting pickup request:', error);
    } else {
      toast.success('Pickup requested successfully!');
      setSelectedPosition(null); // Optionally reset marker
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <MapContainer
        center={[21.1938, 81.3509]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onPositionChange={setSelectedPosition} />
        {selectedPosition && <Marker position={selectedPosition}></Marker>}
      </MapContainer>
      <Button onClick={handleRequestPickup} disabled={!selectedPosition}>
        Request Pickup Here
      </Button>
    </div>
  );
}
