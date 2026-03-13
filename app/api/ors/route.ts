import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coordinates } = body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return NextResponse.json(
        { error: "Invalid or missing coordinates" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.ORS_API_KEY ||
      "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZlOWI2NWI3MTgxZTRiNGY5YTkzMWY2YThlMDlkMzk1IiwiaCI6Im11cm11cjY0In0=";

    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Accept:
            "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
          Authorization: apiKey,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ coordinates }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ORS API Error Response:", response.status, errorText);
      return NextResponse.json(
        { error: `ORS API error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("ORS Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
