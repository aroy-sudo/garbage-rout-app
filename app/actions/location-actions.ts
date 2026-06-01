"use server";

import { createClient } from "@/src/utils/supabase/server";

export type District = {
  id: number;
  name: string;
};

export type Block = {
  id: number;
  name: string;
  district_id: number;
};

export type Panchayat = {
  id: number;
  name: string;
  block_id: number;
};

export type Village = {
  id: number;
  name: string;
  panchayat_id: number;
};

export type ActionResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Server Action: Fetches all Districts alphabetically
 */
export async function getDistricts(): Promise<ActionResponse<District[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lgd_districts")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return { data: data as District[], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load districts.";
    console.error("Error in getDistricts Server Action:", err);
    return { data: null, error: msg };
  }
}

/**
 * Server Action: Fetches all Blocks inside a District alphabetically
 */
export async function getBlocks(
  districtId: number
): Promise<ActionResponse<Block[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lgd_blocks")
      .select("*")
      .eq("district_id", districtId)
      .order("name", { ascending: true });

    if (error) throw error;
    return { data: data as Block[], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load blocks.";
    console.error(`Error in getBlocks Server Action for district ${districtId}:`, err);
    return { data: null, error: msg };
  }
}

/**
 * Server Action: Fetches all Panchayats inside a Block alphabetically
 */
export async function getPanchayats(
  blockId: number
): Promise<ActionResponse<Panchayat[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lgd_panchayats")
      .select("*")
      .eq("block_id", blockId)
      .order("name", { ascending: true });

    if (error) throw error;
    return { data: data as Panchayat[], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load panchayats.";
    console.error(`Error in getPanchayats Server Action for block ${blockId}:`, err);
    return { data: null, error: msg };
  }
}

/**
 * Server Action: Fetches all Villages inside a Panchayat alphabetically
 */
export async function getVillages(
  panchayatId: number
): Promise<ActionResponse<Village[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lgd_villages")
      .select("*")
      .eq("panchayat_id", panchayatId)
      .order("name", { ascending: true });

    if (error) throw error;
    return { data: data as Village[], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load villages.";
    console.error(`Error in getVillages Server Action for panchayat ${panchayatId}:`, err);
    return { data: null, error: msg };
  }
}
