/**
 * Checks if a current coordinate is within a specified radius (in meters) of a target coordinate.
 * Uses Google Maps native spherical geometry calculation.
 */
export function isWithinRadius(
  current: { lat: number; lng: number },
  target: { lat: number; lng: number },
  radiusInMeters: number
): boolean {
  if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.geometry) {
    const driverLatLng = new window.google.maps.LatLng(current.lat, current.lng);
    const targetLatLng = new window.google.maps.LatLng(target.lat, target.lng);

    // Distance returned is in meters
    const distanceMeters = window.google.maps.geometry.spherical.computeDistanceBetween(driverLatLng, targetLatLng);

    return distanceMeters <= radiusInMeters;
  }

  return false; // Fail-safe if script isn't loaded
}
