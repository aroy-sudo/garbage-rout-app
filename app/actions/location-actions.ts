"use server";

import { createClient } from "@/src/utils/supabase/server";

export type District = {
  id: number;
  name: string;
  lat?: number | null;
  lng?: number | null;
};

export type Block = {
  id: number;
  name: string;
  district_id: number;
  lat?: number | null;
  lng?: number | null;
};

export type Panchayat = {
  id: number;
  name: string;
  block_id: number;
  lat?: number | null;
  lng?: number | null;
};

export type Village = {
  id: number;
  name: string;
  panchayat_id: number;
  lat?: number | null;
  lng?: number | null;
};

export type ActionResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Generates stable and realistic coordinates in Chhattisgarh based on a location ID.
 * Centered around Raipur (21.2497, 81.6050).
 */
function getFallbackCoordinates(id: number) {
  // Simple LCG-like hash for deterministic, distributed coordinates
  const seed = (id * 1812433253) & 0xffffffff;
  const latOffset = (((seed % 1000) / 1000) - 0.5) * 0.4;
  const lngOffset = (((Math.abs(seed >> 10) % 1000) / 1000) - 0.5) * 0.4;
  return {
    lat: 21.2497 + latOffset,
    lng: 81.6050 + lngOffset,
  };
}

/**
 * Server Action: Fetches all Districts alphabetically
 */
export async function getDistricts(): Promise<ActionResponse<District[]>> {
  try {
    const supabase = await createClient();
    
    // Attempt to query with lat/lng columns
    const { data, error } = await supabase
      .from("lgd_districts")
      .select("id, name, lat, lng")
      .order("name", { ascending: true });

    if (error) {
      // Fallback if columns do not exist
      const fallbackRes = await supabase
        .from("lgd_districts")
        .select("id, name")
        .order("name", { ascending: true });

      if (fallbackRes.error) throw fallbackRes.error;

      const enriched = (fallbackRes.data || []).map((d) => ({
        ...d,
        ...getFallbackCoordinates(d.id),
      }));

      return { data: enriched as District[], error: null };
    }

    // Ensure lat/lng are populated even if they are null in the database
    const sanitized = (data || []).map((d) => {
      const fallback = getFallbackCoordinates(d.id);
      return {
        id: d.id,
        name: d.name,
        lat: d.lat !== null && d.lat !== undefined ? d.lat : fallback.lat,
        lng: d.lng !== null && d.lng !== undefined ? d.lng : fallback.lng,
      };
    });

    return { data: sanitized as District[], error: null };
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
    
    // Attempt to query with lat/lng columns
    const { data, error } = await supabase
      .from("lgd_blocks")
      .select("id, name, district_id, lat, lng")
      .eq("district_id", districtId)
      .order("name", { ascending: true });

    if (error) {
      // Fallback if columns do not exist
      const fallbackRes = await supabase
        .from("lgd_blocks")
        .select("id, name, district_id")
        .eq("district_id", districtId)
        .order("name", { ascending: true });

      if (fallbackRes.error) throw fallbackRes.error;

      const enriched = (fallbackRes.data || []).map((b) => ({
        ...b,
        ...getFallbackCoordinates(b.id),
      }));

      return { data: enriched as Block[], error: null };
    }

    const sanitized = (data || []).map((b) => {
      const fallback = getFallbackCoordinates(b.id);
      return {
        id: b.id,
        name: b.name,
        district_id: b.district_id,
        lat: b.lat !== null && b.lat !== undefined ? b.lat : fallback.lat,
        lng: b.lng !== null && b.lng !== undefined ? b.lng : fallback.lng,
      };
    });

    return { data: sanitized as Block[], error: null };
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
    
    // Attempt to query with lat/lng columns
    const { data, error } = await supabase
      .from("lgd_panchayats")
      .select("id, name, block_id, lat, lng")
      .eq("block_id", blockId)
      .order("name", { ascending: true });

    if (error) {
      // Fallback if columns do not exist
      const fallbackRes = await supabase
        .from("lgd_panchayats")
        .select("id, name, block_id")
        .eq("block_id", blockId)
        .order("name", { ascending: true });

      if (fallbackRes.error) throw fallbackRes.error;

      const enriched = (fallbackRes.data || []).map((p) => ({
        ...p,
        ...getFallbackCoordinates(p.id),
      }));

      return { data: enriched as Panchayat[], error: null };
    }

    const sanitized = (data || []).map((p) => {
      const fallback = getFallbackCoordinates(p.id);
      return {
        id: p.id,
        name: p.name,
        block_id: p.block_id,
        lat: p.lat !== null && p.lat !== undefined ? p.lat : fallback.lat,
        lng: p.lng !== null && p.lng !== undefined ? p.lng : fallback.lng,
      };
    });

    return { data: sanitized as Panchayat[], error: null };
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
    
    // Attempt to query with lat/lng columns
    const { data, error } = await supabase
      .from("lgd_villages")
      .select("id, name, panchayat_id, lat, lng")
      .eq("panchayat_id", panchayatId)
      .order("name", { ascending: true });

    if (error) {
      // Fallback if columns do not exist
      const fallbackRes = await supabase
        .from("lgd_villages")
        .select("id, name, panchayat_id")
        .eq("panchayat_id", panchayatId)
        .order("name", { ascending: true });

      if (fallbackRes.error) throw fallbackRes.error;

      const enriched = (fallbackRes.data || []).map((v) => ({
        ...v,
        ...getFallbackCoordinates(v.id),
      }));

      return { data: enriched as Village[], error: null };
    }

    const sanitized = (data || []).map((v) => {
      const fallback = getFallbackCoordinates(v.id);
      return {
        id: v.id,
        name: v.name,
        panchayat_id: v.panchayat_id,
        lat: v.lat !== null && v.lat !== undefined ? v.lat : fallback.lat,
        lng: v.lng !== null && v.lng !== undefined ? v.lng : fallback.lng,
      };
    });

    return { data: sanitized as Village[], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load villages.";
    console.error(`Error in getVillages Server Action for panchayat ${panchayatId}:`, err);
    return { data: null, error: msg };
  }
}
