"use server";

import { createClient } from "@/src/utils/supabase/server";

export async function submitPickupRequest(data: { weight_kg: number, lat: number, lng: number, village_id?: number }) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return { error: "Unauthorized" };
  }

  const user_id = authData.user.id;

  const { error } = await supabase.from("pickup_requests").insert([
    {
      user_id,
      weight_kg: data.weight_kg,
      latitude: data.lat,
      longitude: data.lng,
      village_id: data.village_id,
      status: 'pending',
    }
  ]);

  if (error) {
    console.error("Failed to insert pickup request:", error);
    return { error: "Failed to save pickup request" };
  }

  return { success: true, message: "Pickup scheduled successfully!" };
}
