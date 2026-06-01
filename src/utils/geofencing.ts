import { point, distance } from "@turf/turf";

/**
 * Checks if a current coordinate is within a specified radius (in meters) of a target coordinate.
 * Uses @turf/turf distance calculation (geodesic/great-circle distance).
 */
export function isWithinRadius(
  current: { lat: number; lng: number },
  target: { lat: number; lng: number },
  radiusInMeters: number
): boolean {
  // Turf expects coordinates in [longitude, latitude] format.
  const fromPoint = point([current.lng, current.lat]);
  const toPoint = point([target.lng, target.lat]);

  // Calculate distance between the two points (default unit is kilometers)
  const distanceInKm = distance(fromPoint, toPoint);

  // Convert kilometers to meters
  const distanceInMeters = distanceInKm * 1000;

  return distanceInMeters <= radiusInMeters;
}
