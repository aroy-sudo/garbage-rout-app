/**
 * @file routingIntelligence.ts
 * @description Routing Optimization, Seasonal Weight Adjustment, and Spatial Clustering Layer
 */

import { point, featureCollection, centroid, distance } from "@turf/turf";

export interface CollectionNode {
  latitude: number;
  longitude: number;
  weight: number;
  pickup_ids: string[];
}

/**
 * Returns the seasonal weight multiplier based on the month of the date.
 * June (5), July (6), August (7), and September (8) are rainy season months
 * in Chhattisgarh causing plastic waterlogging, representing 25% extra weight.
 * 
 * Note: JavaScript's Date.getMonth() is 0-indexed (Jan=0, ..., Dec=11).
 */
export function getSeasonalWeightMultiplier(date: Date): number {
  const month = date.getMonth();
  if (month === 5 || month === 6 || month === 7 || month === 8) {
    return 1.25;
  }
  return 1.0;
}

/**
 * Filters out unprofitable pickups (under 10kg true weight) and optimizes
 * the list against an optional maximum cumulative weight limit.
 * 
 * Non-destructively processes the pickups to avoid mutating original objects.
 */
export function optimizePickupList<T extends { weight_kg: number }>(
  pickups: T[],
  currentWeightLimit?: number
): T[] {
  const multiplier = getSeasonalWeightMultiplier(new Date());
  const optimized: T[] = [];
  let cumulativeWeight = 0;

  for (const pickup of pickups) {
    const trueWeight = pickup.weight_kg * multiplier;
    
    // Pickups with trueWeight under 10kg are unprofitable and excluded
    if (trueWeight >= 10) {
      if (currentWeightLimit !== undefined) {
        if (cumulativeWeight + trueWeight > currentWeightLimit) {
          // Exceeds vehicle weight limit, stop adding more pickups
          break;
        }
      }
      cumulativeWeight += trueWeight;
      optimized.push(pickup);
    }
  }

  return optimized;
}

/**
 * Spatial Clustering Engine: Groups nearby pickup locations within radiusKm
 * into single waypoints. Calculates centroids using Turf.js.
 */
export function clusterPickups<
  T extends { id: string; latitude: number; longitude: number; weight_kg?: number }
>(pickups: T[], radiusKm: number = 2.0): CollectionNode[] {
  const clusters: { points: T[]; weight: number }[] = [];

  for (const pickup of pickups) {
    let assigned = false;

    // Check if the pickup falls within radiusKm of the centroid of any existing cluster
    for (const cluster of clusters) {
      // Find the centroid of this cluster's points
      const clusterPointsGeoJSON = featureCollection(
        cluster.points.map((p) => point([p.longitude, p.latitude]))
      );
      const center = centroid(clusterPointsGeoJSON);
      const [centerLng, centerLat] = center.geometry.coordinates;

      const pPoint = point([pickup.longitude, pickup.latitude]);
      const cPoint = point([centerLng, centerLat]);

      const dist = distance(pPoint, cPoint);
      if (dist <= radiusKm) {
        cluster.points.push(pickup);
        cluster.weight += pickup.weight_kg ?? 0;
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      clusters.push({
        points: [pickup],
        weight: pickup.weight_kg ?? 0,
      });
    }
  }

  // Map each cluster to a CollectionNode by computing its final centroid
  return clusters.map((cluster) => {
    const clusterPointsGeoJSON = featureCollection(
      cluster.points.map((p) => point([p.longitude, p.latitude]))
    );
    const center = centroid(clusterPointsGeoJSON);
    const [centerLng, centerLat] = center.geometry.coordinates;

    return {
      latitude: centerLat,
      longitude: centerLng,
      weight: cluster.weight,
      pickup_ids: cluster.points.map((p) => p.id),
    };
  });
}
