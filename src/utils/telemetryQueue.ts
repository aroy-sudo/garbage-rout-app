import { TelemetryPoint } from "@/src/types/telemetry";

const GARBAGE_ROUT_TELEMETRY_QUEUE = "GARBAGE_ROUT_TELEMETRY_QUEUE";

/**
 * Retrieves the current queue of telemetry points from localStorage.
 * Safeguarded for SSR environments.
 */
export function getQueue(): TelemetryPoint[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const data = localStorage.getItem(GARBAGE_ROUT_TELEMETRY_QUEUE);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse telemetry queue from localStorage:", error);
    return [];
  }
}

/**
 * Appends a new telemetry point to the localStorage queue.
 * Safeguarded for SSR environments.
 */
export function enqueuePoint(point: TelemetryPoint): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const queue = getQueue();
    queue.push(point);
    localStorage.setItem(GARBAGE_ROUT_TELEMETRY_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to enqueue telemetry point to localStorage:", error);
  }
}

/**
 * Clears the telemetry queue from localStorage.
 * Safeguarded for SSR environments.
 */
export function clearQueue(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(GARBAGE_ROUT_TELEMETRY_QUEUE);
  } catch (error) {
    console.error("Failed to clear telemetry queue from localStorage:", error);
  }
}
