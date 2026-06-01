import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { TelemetryPoint } from "@/src/types/telemetry";

export async function POST(req: Request) {
  try {
    const points = await req.json();

    if (!Array.isArray(points)) {
      return NextResponse.json(
        { error: "Bad Request: Expected an array of telemetry points." },
        { status: 400 }
      );
    }

    if (points.length === 0) {
      return NextResponse.json({ success: true, insertedCount: 0 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: Driver session is invalid or missing." },
        { status: 401 }
      );
    }

    // Map each TelemetryPoint and inject the secure driver_id
    const telemetryRows = points.map((point: TelemetryPoint) => ({
      driver_id: user.id,
      route_id: point.route_id,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: point.speed,
      heading: point.heading,
      recorded_at: point.recorded_at,
    }));

    const { error: insertError } = await supabase
      .from("driver_telemetry")
      .insert(telemetryRows);

    if (insertError) {
      console.error("Failed to insert telemetry points:", insertError);
      return NextResponse.json(
        { error: `Database Error: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: telemetryRows.length,
    });
  } catch (error) {
    console.error("Telemetry Batch Ingestion Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
