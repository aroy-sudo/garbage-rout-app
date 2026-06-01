const CACHE_NAME = "garbage-rout-map-tiles";
const TRANSPARENT_FALLBACK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * Resolves a tile URL from the standard browser caches API.
 * Downloads and caches the tile if missing. Falls back to transparent pixel if offline.
 */
export async function getCachedTile(url: string): Promise<string> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return TRANSPARENT_FALLBACK;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }

    // Cache miss: download from network and save to cache
    try {
      const response = await fetch(url, {
        referrerPolicy: "no-referrer",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Tile fetch returned status: ${response.status}`);
      }

      // Store clone in the cache
      await cache.put(url, response.clone());

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (fetchErr) {
      console.warn(`Offline or network issue while fetching map tile: ${url}`, fetchErr);
      return TRANSPARENT_FALLBACK;
    }
  } catch (err) {
    console.error(`Cache error during map tile check: ${url}`, err);
    return TRANSPARENT_FALLBACK;
  }
}
export default getCachedTile;
