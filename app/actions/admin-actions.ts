/**
 * @file admin-actions.ts
 * @description Executive Dashboard Data Fetcher
 * @author Abhiraj Roy
 * @stream CSE
 */

"use server";

import { createClient } from "@/src/utils/supabase/server";

export interface HeatmapPoint {
  id: string;
  latitude: number;
  longitude: number;
  totalWeight: number;
  status: string;
  created_at: string;
}

/**
 * Server Action: Fetches all regional waste collection requests for administrative density rendering.
 * Validates active admin auth session and returns latitude-longitude coordinates with calculated weights.
 */
export async function getAdminHeatmapData(): Promise<{ data?: HeatmapPoint[]; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized. Admin session required." };
    }

    // 2. Fetch state-wide collection pickups
    const { data: pickups, error } = await supabase
      .from("pickup_requests")
      .select("id, latitude, longitude, pet_weight, hdpe_weight, ldpe_weight, pp_weight, status, created_at");

    if (error) {
      console.error("Failed to query executive heatmap records:", error);
      return { error: error.message };
    }

    if (!pickups || pickups.length === 0) {
      return { data: [] };
    }

    // 3. Map pickups into standard density points
    const points: HeatmapPoint[] = pickups.map((req) => {
      const totalWeight =
        (req.pet_weight || 0) +
        (req.hdpe_weight || 0) +
        (req.ldpe_weight || 0) +
        (req.pp_weight || 0);

      return {
        id: req.id,
        latitude: req.latitude,
        longitude: req.longitude,
        totalWeight,
        status: req.status,
        created_at: req.created_at,
      };
    });

    return { data: points };
  } catch (err) {
    console.error("Unexpected error in getAdminHeatmapData server action:", err);
    return { error: "Internal Server Error" };
  }
}

export interface SimpleHeatmapPoint {
  id: string;
  lat: number;
  lng: number;
  weight_kg: number;
  status: string;
}

/**
 * Server Action: Fetches state-wide waste accumulation data for simple density mapping.
 * Returns an array of objects containing { id, lat, lng, weight_kg, status } on success,
 * and an empty array [] on error.
 */
export async function getHeatmapData(): Promise<SimpleHeatmapPoint[]> {
  try {
    const supabase = await createClient();

    // Query pickups table directly
    const { data: pickups, error } = await supabase
      .from("pickup_requests")
      .select("id, latitude, longitude, pet_weight, hdpe_weight, ldpe_weight, pp_weight, status");

    if (error) {
      console.error("Error in getHeatmapData server action:", error);
      return [];
    }

    if (!pickups) return [];

    return pickups.map((req) => {
      const weight_kg =
        (req.pet_weight || 0) +
        (req.hdpe_weight || 0) +
        (req.ldpe_weight || 0) +
        (req.pp_weight || 0);

      return {
        id: req.id,
        lat: req.latitude,
        lng: req.longitude,
        weight_kg,
        status: req.status,
      };
    });
  } catch (err) {
    console.error("Exception in getHeatmapData server action:", err);
    return [];
  }
}
