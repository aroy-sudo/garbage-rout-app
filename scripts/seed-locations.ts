/**
 * @file seed-locations.ts
 * @description State Integration API Data Seeder
 * @author Abhiraj Roy
 * @stream CSE
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load env vars from .env.local for the standalone script
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS, otherwise fallback to anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
type ParsedNode = { name: string; id: number };
type LGDHierarchy = Record<string, Record<string, Record<string, string[]>>>;

function parseNode(str: string): ParsedNode {
  const match = str.match(/(.+?)\s*\((\d+)\)/);
  if (!match) {
    console.warn(`⚠️ Warning: Could not parse LGD code from "${str}". Generating fallback ID.`);
    return { name: str.trim(), id: Math.floor(Math.random() * 900000) + 100000 };
  }
  return { name: match[1].trim(), id: parseInt(match[2], 10) };
}

// Utility to remove any duplicate IDs from the JSON before sending to Supabase
function deduplicate<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map();
  for (const item of arr) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

async function seed() {
  console.log("📖 Reading locationData.json...");
  const filePath = join(process.cwd(), 'locationData.json');
  const fileData = readFileSync(filePath, 'utf-8');

  const data: LGDHierarchy = JSON.parse(fileData);

  const rawDistricts: { id: number; name: string }[] = [];
  const rawBlocks: { id: number; name: string; district_id: number }[] = [];
  const rawPanchayats: { id: number; name: string; block_id: number }[] = [];
  const rawVillages: { id: number; name: string; panchayat_id: number }[] = [];

  console.log("🧠 Parsing data hierarchy...");

  for (const [distKey, distValue] of Object.entries(data)) {
    const district = parseNode(distKey);
    rawDistricts.push(district);

    for (const [blockKey, blockValue] of Object.entries(distValue)) {
      const block = parseNode(blockKey);
      rawBlocks.push({ ...block, district_id: district.id });

      for (const [panchayatKey, panchayatValue] of Object.entries(blockValue)) {
        const panchayat = parseNode(panchayatKey);
        rawPanchayats.push({ ...panchayat, block_id: block.id });

        for (const villageStr of panchayatValue) {
          const village = parseNode(villageStr);
          rawVillages.push({ ...village, panchayat_id: panchayat.id });
        }
      }
    }
  }

  // Deduplicate arrays
  const districts = deduplicate(rawDistricts);
  const blocks = deduplicate(rawBlocks);
  const panchayats = deduplicate(rawPanchayats);
  const villages = deduplicate(rawVillages);

  console.log(`📊 Unique Data Found: ${districts.length} Districts, ${blocks.length} Blocks, ${panchayats.length} Panchayats, ${villages.length} Villages.`);

  // --- UPSERT TO SUPABASE WITH EXPLICIT CONFLICT TARGET ---

  console.log("⬆️ Inserting Districts...");
  const { error: dErr } = await supabase.from('lgd_districts').upsert(districts, { onConflict: 'id' });
  if (dErr) console.error("District Error:", dErr.message);

  console.log("⬆️ Inserting Blocks...");
  const { error: bErr } = await supabase.from('lgd_blocks').upsert(blocks, { onConflict: 'id' });
  if (bErr) console.error("Block Error:", bErr.message);

  console.log("⬆️ Inserting Panchayats...");
  const { error: pErr } = await supabase.from('lgd_panchayats').upsert(panchayats, { onConflict: 'id' });
  if (pErr) console.error("Panchayat Error:", pErr.message);

  console.log("⬆️ Inserting Villages (Chunked to avoid payload limits)...");
  const chunkSize = 1000;
  for (let i = 0; i < villages.length; i += chunkSize) {
    const chunk = villages.slice(i, i + chunkSize);
    const { error: vErr } = await supabase.from('lgd_villages').upsert(chunk, { onConflict: 'id' });
    if (vErr) {
      console.error(`Village Chunk Error (${i} to ${i + chunk.length}):`, vErr.message);
    } else {
      console.log(`✅ Inserted villages ${i} to ${i + chunk.length}`);
    }
  }

  console.log("🎉 Seeding Complete!");
}

seed().catch(console.error);