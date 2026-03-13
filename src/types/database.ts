export interface Profile {
  id: string;
  role: 'resident' | 'collector';
  created_at: string;
}

export interface PickupRequest {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  status: 'pending' | 'collected';
  created_at: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
