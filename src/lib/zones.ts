import * as turf from "@turf/turf";

export type LatLng = [number, number]; // [lat, lng]

export interface ZoneConfig {
  id: string;
  label: string;
  color: string;
  fillColor: string;
  polygon: LatLng[];
  center: LatLng;
}

// ─── 1️⃣ Regular Hexagon Coordinates (Adjusted) ──────────────────────────────
export const BIG_HEX_COORDS: LatLng[] = [
  [21.305000, 81.620000], // top
  [21.285000, 81.690000], // top-right
  [21.230000, 81.690000], // bottom-right
  [21.205000, 81.620000], // bottom
  [21.230000, 81.550000], // bottom-left
  [21.285000, 81.550000], // top-left
  [21.305000, 81.620000]  // close ring
];

// Single Large Hexagon Zone
export const BIG_HEX_ZONE: ZoneConfig = {
  id: "big_hex",
  label: "Big Hex",
  color: "#a855f7", // purple
  fillColor: "#a855f7",
  center: [21.255000, 81.620000], // rough center
  polygon: BIG_HEX_COORDS
};

// ─── Check If Point is Inside the Big Hex ────────────────────────────────────
// Create a Turf polygon (Turf expects [lng, lat])
const hexPoly = turf.polygon([[...BIG_HEX_COORDS.map(p => [p[1], p[0]])]]);

export function insideHex(lat: number, lng: number): boolean {
  const pt = turf.point([lng, lat]);
  return turf.booleanPointInPolygon(pt, hexPoly);
}

// ─── Shim for old 7-zone functions so existing code won't break ──────────────
// Now there is only ONE zone
export const ZONES: ZoneConfig[] = [BIG_HEX_ZONE];

export function generateZones(): ZoneConfig[] {
  return ZONES;
}

export function getZoneForPoint(
  lat: number,
  lng: number,
  zones: ZoneConfig[] = ZONES
): ZoneConfig | null {
  if (insideHex(lat, lng)) {
    return BIG_HEX_ZONE;
  }
  return null;
}
