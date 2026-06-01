export interface TelemetryPoint {
  route_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  recorded_at: string; // ISO format string
}
