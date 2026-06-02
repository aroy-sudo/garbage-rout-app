/**
 * @file seed-demo-pickups.ts
 * @description Demo Waste Accumulation Data Seeder for Durg/Bhilai Region
 * @author Abhiraj Roy
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars from .env.local for standalone execution
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS, otherwise fallback to anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 14 highly realistic pickup locations clustered around Durg/Bhilai/Raipur (Chhattisgarh)
const DUMMY_PICKUPS = [
  { lat: 21.1938, lng: 81.3509, weight: 45.0 },
  { lat: 21.2052, lng: 81.3621, weight: 112.5 },
  { lat: 21.1824, lng: 81.3395, weight: 14.5 },
  { lat: 21.2185, lng: 81.3214, weight: 32.0 },
  { lat: 21.2291, lng: 81.3489, weight: 8.5 },
  { lat: 21.1712, lng: 81.3812, weight: 76.0 },
  { lat: 21.2312, lng: 81.3742, weight: 22.5 },
  { lat: 21.1601, lng: 81.3198, weight: 55.0 },
  { lat: 21.2484, lng: 81.4011, weight: 93.0 },
  { lat: 21.2012, lng: 81.3012, weight: 18.5 },
  { lat: 21.1915, lng: 81.3982, weight: 64.0 },
  { lat: 21.2582, lng: 81.3121, weight: 37.5 },
  { lat: 21.2215, lng: 81.4312, weight: 88.0 },
  { lat: 21.1412, lng: 81.3612, weight: 12.5 }
];

async function seed() {
  console.log("🚀 Starting Demo Pickups Seeder...");

  // Try to resolve a valid user ID from existing profiles, pickups, or auth lists
  let userId: string | null = null;

  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData && usersData.users && usersData.users.length > 0) {
      userId = usersData.users[0].id;
      console.log(`✅ Found user from Auth list: ${userId}`);
    }
  } catch (err) {
    console.log("ℹ️ Could not fetch users list via Auth Admin API. Trying existing records...");
  }

  if (!userId) {
    try {
      const { data: existingPickups } = await supabase
        .from("pickup_requests")
        .select("user_id")
        .limit(1);
      if (existingPickups && existingPickups.length > 0) {
        userId = existingPickups[0].user_id;
        console.log(`✅ Found user from existing pickup record: ${userId}`);
      }
    } catch (err) {
      console.log("ℹ️ Could not read from existing pickup records.");
    }
  }

  // Final fallback generated standard UUID
  if (!userId) {
    userId = "d9d9d9d9-d9d9-d9d9-d9d9-d9d9d9d9d9d9";
    console.log(`ℹ️ Falling back to default generated UUID: ${userId}`);
  }

  // 1. DELETE all current pending pickups
  console.log("🗑️ Deleting all current pending pickup requests...");
  const { error: delErr } = await supabase
    .from("pickup_requests")
    .delete()
    .eq("status", "pending");

  if (delErr) {
    console.error("❌ Failed to delete old pending pickups:", delErr.message);
    process.exit(1);
  }
  console.log("✅ Successfully cleared old pending test records.");

  // 2. Map and Insert the DUMMY_PICKUPS
  console.log("⬆️ Mapping sub-weights (PET, HDPE, LDPE, PP) for admin density rendering...");
  const pickupsToInsert = DUMMY_PICKUPS.map((pickup, index) => {
    // Highly realistic waste composition allocation
    const w = pickup.weight;
    const pet = Number((w * 0.40).toFixed(2));
    const hdpe = Number((w * 0.30).toFixed(2));
    const ldpe = Number((w * 0.20).toFixed(2));
    const pp = Number((w * 0.10).toFixed(2));

    return {
      user_id: userId,
      latitude: pickup.lat,
      longitude: pickup.lng,
      pet_weight: pet,
      hdpe_weight: hdpe,
      ldpe_weight: ldpe,
      pp_weight: pp,
      status: "pending",
      created_at: new Date(Date.now() - index * 3600000).toISOString() // Spaced out in hours
    };
  });

  console.log(`⬆️ Inserting ${pickupsToInsert.length} new Durg/Bhilai pending collections...`);
  const { data: inserted, error: insErr } = await supabase
    .from("pickup_requests")
    .insert(pickupsToInsert)
    .select();

  if (insErr) {
    console.error("❌ Failed to insert demo pickups:", insErr.message);
    process.exit(1);
  }

  console.log(`🎉 Demo Seeding Complete! Successfully inserted ${inserted?.length || 0} records.`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed with unexpected exception:", err);
});
