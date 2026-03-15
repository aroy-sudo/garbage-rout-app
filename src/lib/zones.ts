// ─── Raipur service area bounding box ────────────────────────────────────────
export type LatLng = [number, number]; // [lat, lng]

const TOP_LAT    = 21.290336;
const BOTTOM_LAT = 21.214429;
const LEFT_LNG   = 81.552268;
const RIGHT_LNG  = 81.698910;

export const CENTER_LAT = (TOP_LAT + BOTTOM_LAT) / 2;   // ~21.2524
export const CENTER_LNG = (LEFT_LNG + RIGHT_LNG) / 2;   // ~81.6256

/**
 * Longitude correction — 1° lng ≠ 1° lat in distance.
 * At lat ~21°, cos(21°) ≈ 0.933.  We divide lng offsets by this so hexagons
 * appear circular on screen.
 */
const LNG_SCALE = Math.cos(CENTER_LAT * (Math.PI / 180));

/**
 * Hexagon "radius" in latitude degrees.
 * Tune this so the 7-hex rosette fits the city area.
 * At 0.022: total N-S span ≈ 0.076° ≈ 8.5 km — matches the bounding box.
 */
const RADIUS = 0.022;

/** Center-to-center distance between adjacent hexagons (flat-top tiling). */
const D = RADIUS * Math.sqrt(3); // ≈ 0.0381°

export const ZONE_COLORS = [
  '#6366f1', // H0 center   – indigo
  '#ef4444', // H1 N        – red
  '#f97316', // H2 NE       – orange
  '#f59e0b', // H3 SE       – amber
  '#10b981', // H4 S        – emerald
  '#06b6d4', // H5 SW       – cyan
  '#8b5cf6', // H6 NW       – violet
];

export interface ZoneConfig {
  id: string;
  label: string;
  color: string;
  fillColor: string;
  /** Closed polygon ring [lat, lng][] for Leaflet. */
  polygon: LatLng[];
  center: LatLng;
}

/**
 * Build a **flat-top** regular hexagon polygon (6 vertices, closed ring)
 * centred at (cLat, cLng).
 *
 * Flat-top vertices are at angles: 0°, 60°, 120°, 180°, 240°, 300°
 * lng is scaled by 1/LNG_SCALE so the hex looks round on screen.
 */
function makeHexPoly(cLat: number, cLng: number): LatLng[] {
  const pts: LatLng[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 0, 60, 120 …
    pts.push([
      cLat + RADIUS * Math.cos(angle),
      cLng + (RADIUS / LNG_SCALE) * Math.sin(angle),
    ]);
  }
  return [...pts, pts[0]]; // close the ring
}

/**
 * For a flat-top hex rosette, the 6 surrounding hex centres are at angles:
 *   30°, 90°, 150°, 210°, 270°, 330°  (offset from vertex angles by 30°)
 * at distance D = sqrt(3) * RADIUS.
 */
function surroundingCenters(cLat: number, cLng: number): LatLng[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i + Math.PI / 6; // 30°, 90°, …
    return [
      cLat + D * Math.cos(angle),
      cLng + (D / LNG_SCALE) * Math.sin(angle),
    ] as LatLng;
  });
}

/**
 * Generate 7 hexagonal zones: 1 centre + 6 surrounding.
 *
 * Layout (flat-top):
 *        H6   H1
 *      H5   H0   H2
 *        H4   H3
 */
export function generateZones(): ZoneConfig[] {
  const surrounding = surroundingCenters(CENTER_LAT, CENTER_LNG);

  const centers: LatLng[] = [
    [CENTER_LAT, CENTER_LNG], // H0
    ...surrounding,           // H1-H6
  ];

  const labels = ['Center', 'N', 'NE', 'SE', 'S', 'SW', 'NW'];

  return centers.map((c, i) => ({
    id: `zone${i}`,
    label: `Zone ${i} – ${labels[i]}`,
    color: ZONE_COLORS[i],
    fillColor: ZONE_COLORS[i],
    polygon: makeHexPoly(c[0], c[1]),
    center: c,
  }));
}

// ─── Point-in-polygon (ray casting, no extra library) ────────────────────────
export function pointInPolygon(lat: number, lng: number, polygon: LatLng[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getZoneForPoint(
  lat: number,
  lng: number,
  zones: ZoneConfig[]
): ZoneConfig | null {
  return zones.find(z => pointInPolygon(lat, lng, z.polygon)) ?? null;
}
