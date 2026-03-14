export interface Profile {
  id: string;
  role: 'shg' | 'collector' | 'wasterecycler' | 'admin';
  created_at: string;
}

export interface PickupRequest {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;

  status: 'pending' | 'collected';
  created_at: string;
  payment_amount: number | null;
  payment_status: 'pending' | 'accepted' | 'declined' | null;
  pet_weight: number;
  hdpe_weight: number;
  ldpe_weight: number;
  pp_weight: number;
  collector_id: string | null;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
