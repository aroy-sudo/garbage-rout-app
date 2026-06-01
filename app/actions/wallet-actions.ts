"use server";

import { createClient } from "@/src/utils/supabase/server";

export interface Transaction {
  id: string;
  created_at: string;
  weight: number;
  earnings: number;
}

export interface WalletStats {
  totalWeightKg: number;
  totalEarnings: number;
  rate: number;
  recentTransactions: Transaction[];
  error?: string;
}

/**
 * Fetches waste pickup requests for the authenticated user and calculates real-time earnings.
 * Uses strict row-level security (RLS) via the Next.js cookie-based Supabase Server Client.
 */
export async function getWalletStats(): Promise<WalletStats | { error: string }> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // 2. Fetch completed ('collected') pickups for the authenticated resident
    const { data: pickups, error } = await supabase
      .from("pickup_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "collected")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to query user wallet pickups:", error);
      return { error: error.message };
    }

    const RATE_PER_KG = 15; // Rate: ₹15 per kilogram

    if (!pickups || pickups.length === 0) {
      return {
        totalWeightKg: 0,
        totalEarnings: 0,
        rate: RATE_PER_KG,
        recentTransactions: [],
      };
    }

    // 3. Compute total weight of collected plastic (PET, HDPE, LDPE, PP)
    const totalWeightKg = pickups.reduce((acc, req) => {
      const weight =
        (req.pet_weight || 0) +
        (req.hdpe_weight || 0) +
        (req.ldpe_weight || 0) +
        (req.pp_weight || 0);
      return acc + weight;
    }, 0);

    // 4. Calculate total earnings
    const totalEarnings = totalWeightKg * RATE_PER_KG;

    // 5. Gather top 3 completed collections for our mini-ledger display
    const recentTransactions: Transaction[] = pickups.slice(0, 3).map((req) => {
      const weight =
        (req.pet_weight || 0) +
        (req.hdpe_weight || 0) +
        (req.ldpe_weight || 0) +
        (req.pp_weight || 0);
      return {
        id: req.id,
        created_at: req.created_at,
        weight,
        earnings: weight * RATE_PER_KG,
      };
    });

    return {
      totalWeightKg,
      totalEarnings,
      rate: RATE_PER_KG,
      recentTransactions,
    };
  } catch (err) {
    console.error("Unexpected error in getWalletStats server action:", err);
    return { error: "Internal Server Error" };
  }
}
