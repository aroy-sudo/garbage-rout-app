/**
 * Author: Abhiraj Roy (IT)
 */
"use server";

import { createClient } from "@/src/utils/supabase/server";

export async function completePickupTransaction(pickupId: string | number, finalWeight: number, proofUrl: string) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("pickup_requests")
    .update({
      status: 'completed',
      pet_weight: finalWeight,
      hdpe_weight: 0,
      ldpe_weight: 0,
      pp_weight: 0,
      proof_url: proofUrl,
      collected_at: new Date().toISOString()
    })
    .eq("id", pickupId);

  if (error) {
    console.error("Failed to complete pickup transaction:", error);
    return { success: false, error: "Failed to update pickup status" };
  }

  return { success: true, message: "Pickup completed!" };
}
