/**
 * @file admin-actions.ts
 * @description Executive Dashboard Data Fetcher
 * @author Abhiraj Roy
 * @stream CSE
 */

"use server";

import { createClient } from "@/src/utils/supabase/server";
import * as turf from "@turf/turf";

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

export async function autoDispatchRoutes(maxCapacityKg: number, availableDriverIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const { data: pickups, error } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("status", "pending");

  if (error) {
    console.error("Failed to fetch pending pickups", error);
    return { success: false, message: "Failed to fetch pending pickups" };
  }

  if (!pickups || pickups.length === 0) {
    return { success: false, message: "No pending pickups" };
  }

  const startPoint = turf.point([pickups[0].longitude, pickups[0].latitude]);

  const sortedPickups = [...pickups].sort((a, b) => {
    const ptA = turf.point([a.longitude, a.latitude]);
    const ptB = turf.point([b.longitude, b.latitude]);
    return turf.distance(startPoint, ptA) - turf.distance(startPoint, ptB);
  });

  const routes: any[][] = [];
  let currentRoute: any[] = [];
  let currentWeight = 0;

  for (const pickup of sortedPickups) {
    const pWeight = pickup.weight_kg || pickup.weight || 0;

    if (currentWeight + pWeight > maxCapacityKg && currentRoute.length > 0) {
      routes.push(currentRoute);
      currentRoute = [pickup];
      currentWeight = pWeight;
    } else {
      currentRoute.push(pickup);
      currentWeight += pWeight;
    }
  }

  if (currentRoute.length > 0) {
    routes.push(currentRoute);
  }

  if (availableDriverIds.length === 0) {
    return { success: false, message: "No available drivers" };
  }

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const driverId = availableDriverIds[i % availableDriverIds.length];
    const pickupIds = route.map(p => p.id);

    const { error: updateError } = await supabase
      .from("pickup_requests")
      .update({
        assigned_driver_id: driverId,
        route_group_id: `route_${i + 1}_${Date.now()}`,
        status: "assigned"
      })
      .in("id", pickupIds);

    if (updateError) {
      console.error("Failed to update route assignments", updateError);
    }
  }

  return { success: true, routesGenerated: routes.length, message: "Routes successfully dispatched!" };
}
