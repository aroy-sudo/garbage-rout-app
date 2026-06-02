import { NextResponse } from "next/server";
import { optimizePickupList, clusterPickups, CollectionNode } from "@/src/utils/routingIntelligence";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coordinates, pickups, depot, currentWeightLimit } = body;

    let finalCoordinates: [number, number][] = coordinates;
    let clusteredNodes: CollectionNode[] = [];

    // Inject routing intelligence if pickups array is supplied
    if (pickups && Array.isArray(pickups)) {
      // 1. Filter out unprofitable pickups (<10kg true weight) and constrain by vehicle limits
      const optimizedPickups = optimizePickupList(pickups, currentWeightLimit);

      // 2. Cluster remaining pickups within a 2.0 km radius to optimize ORS waypoint limit
      clusteredNodes = clusterPickups(optimizedPickups, 2.0);

      // 3. Map clustered centroids to coordinates expected by ORS [lng, lat]
      const optimizedCoords: [number, number][] = clusteredNodes.map((node) => [
        node.longitude,
        node.latitude,
      ]);

      // 4. Anchor route circular flow to start/end depot locations
      if (depot && Array.isArray(depot)) {
        finalCoordinates = [
          depot as [number, number],
          ...optimizedCoords,
          depot as [number, number],
        ];
      } else if (coordinates && coordinates.length > 0) {
        // Preserving legacy endpoints depot start/end markers
        const startDepot = coordinates[0];
        const endDepot = coordinates.length > 1 ? coordinates[coordinates.length - 1] : null;

        const assembled: [number, number][] = [startDepot];
        for (const coord of optimizedCoords) {
          assembled.push(coord);
        }
        if (endDepot) {
          assembled.push(endDepot);
        }
        finalCoordinates = assembled;
      } else {
        finalCoordinates = optimizedCoords;
      }

      // Short-circuit: If routing path doesn't yield enough profitable points
      if (finalCoordinates.length < 2) {
        return NextResponse.json(
          { error: "No profitable pickups available", optimizedCount: 0 },
          { status: 400 }
        );
      }
    }

    if (!finalCoordinates || !Array.isArray(finalCoordinates)) {
      return NextResponse.json(
        { error: "Invalid or missing coordinates" },
        { status: 400 }
      );
    }

    // ORS demands at least 2 points
    if (finalCoordinates.length < 2) {
      return NextResponse.json(
        { error: "At least 2 points are required to route" },
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
        body: JSON.stringify({ coordinates: finalCoordinates }),
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

    const summary = data.features?.[0]?.properties?.summary || { distance: 0, duration: 0 };
    const geometry = data.features?.[0]?.geometry?.coordinates || [];

    // Spread the ORS response GeoJSON to maintain full backward compatibility,
    // while attaching the clusteredNodes for the routing visual display.
    return NextResponse.json({
      ...data,
      geometry,
      distance: summary.distance,
      duration: summary.duration,
      clusteredNodes,
    });
  } catch (error) {
    console.error("ORS Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
