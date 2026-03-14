export interface GeoPoint {
    id: string;
    lat: number;
    lng: number;
}

// 1. Raipur Village / Area Coordinates
export const VILLAGES: GeoPoint[] = [
    { id: "Tatibandh", lat: 21.2560, lng: 81.5830 },
    { id: "Shankar Nagar", lat: 21.2510, lng: 81.6520 },
    { id: "Pandri", lat: 21.2650, lng: 81.6450 },
    { id: "Telibandha", lat: 21.2420, lng: 81.6620 },
    { id: "Bhatagaon", lat: 21.2150, lng: 81.6250 },
    { id: "Gudhiyari", lat: 21.2620, lng: 81.6150 },
    { id: "Naya Raipur", lat: 21.1610, lng: 81.7850 },
    { id: "Mowa", lat: 21.2750, lng: 81.6600 },
    { id: "DDU Nagar", lat: 21.2350, lng: 81.5950 },
    { id: "Tikrapara", lat: 21.2280, lng: 81.6350 }
];

// 2. Waste Recyclers (Hexagon Centers)
export const RECYCLERS: GeoPoint[] = [
    { id: "WR-Tatibandh-1", lat: 21.2580, lng: 81.5850 },
    { id: "WR-ShankarNagar-1", lat: 21.2530, lng: 81.6540 },
    { id: "WR-Pandri-1", lat: 21.2670, lng: 81.6470 },
    { id: "WR-Telibandha-1", lat: 21.2440, lng: 81.6640 },
    { id: "WR-Telibandha-2", lat: 21.2400, lng: 81.6600 },
    { id: "WR-Bhatagaon-1", lat: 21.2170, lng: 81.6270 },
    { id: "WR-Gudhiyari-1", lat: 21.2640, lng: 81.6170 },
    { id: "WR-NayaRaipur-1", lat: 21.1630, lng: 81.7870 },
    { id: "WR-NayaRaipur-2", lat: 21.1590, lng: 81.7830 },
    { id: "WR-Mowa-1", lat: 21.2770, lng: 81.6620 },
    { id: "WR-DDUNagar-1", lat: 21.2370, lng: 81.5970 },
    { id: "WR-Tikrapara-1", lat: 21.2300, lng: 81.6370 }
];

// 3. SHGs Clustered Around Hexagons (Spaced wider to allow routing)
export const SHGS: GeoPoint[] = [
    // Hexagon 1 (Tatibandh)
    { id: "Res-Tatibandh-A", lat: 21.2610, lng: 81.5880 },
    { id: "Res-Tatibandh-B", lat: 21.2550, lng: 81.5820 },
    { id: "Res-Tatibandh-C", lat: 21.2592, lng: 81.5910 },
    { id: "Res-Tatibandh-D", lat: 21.2640, lng: 81.5838 },

    // Hexagon 2 (Shankar Nagar)
    { id: "Res-ShankarNagar-A", lat: 21.2560, lng: 81.6570 },
    { id: "Res-ShankarNagar-B", lat: 21.2500, lng: 81.6510 },
    { id: "Res-ShankarNagar-C", lat: 21.2542, lng: 81.6600 },
    { id: "Res-ShankarNagar-D", lat: 21.2590, lng: 81.6528 },
    { id: "Res-ShankarNagar-E", lat: 21.2518, lng: 81.6552 },

    // Hexagon 3 (Pandri)
    { id: "Res-Pandri-A", lat: 21.2700, lng: 81.6500 },
    { id: "Res-Pandri-B", lat: 21.2640, lng: 81.6440 },
    { id: "Res-Pandri-C", lat: 21.2682, lng: 81.6530 },
    { id: "Res-Pandri-D", lat: 21.2730, lng: 81.6458 },

    // Hexagon 4 (Telibandha - Zone 1)
    { id: "Res-Telibandha1-A", lat: 21.2470, lng: 81.6670 },
    { id: "Res-Telibandha1-B", lat: 21.2410, lng: 81.6610 },
    { id: "Res-Telibandha1-C", lat: 21.2452, lng: 81.6700 },
    { id: "Res-Telibandha1-D", lat: 21.2500, lng: 81.6628 },
    { id: "Res-Telibandha1-E", lat: 21.2428, lng: 81.6652 },

    // Hexagon 5 (Telibandha - Zone 2)
    { id: "Res-Telibandha2-A", lat: 21.2430, lng: 81.6630 },
    { id: "Res-Telibandha2-B", lat: 21.2370, lng: 81.6570 },
    { id: "Res-Telibandha2-C", lat: 21.2412, lng: 81.6660 },
    { id: "Res-Telibandha2-D", lat: 21.2460, lng: 81.6588 },

    // Hexagon 6 (Bhatagaon)
    { id: "Res-Bhatagaon-A", lat: 21.2200, lng: 81.6300 },
    { id: "Res-Bhatagaon-B", lat: 21.2140, lng: 81.6240 },
    { id: "Res-Bhatagaon-C", lat: 21.2182, lng: 81.6330 },
    { id: "Res-Bhatagaon-D", lat: 21.2230, lng: 81.6258 },

    // Hexagon 7 (Gudhiyari)
    { id: "Res-Gudhiyari-A", lat: 21.2670, lng: 81.6200 },
    { id: "Res-Gudhiyari-B", lat: 21.2610, lng: 81.6140 },
    { id: "Res-Gudhiyari-C", lat: 21.2652, lng: 81.6230 },
    { id: "Res-Gudhiyari-D", lat: 21.2700, lng: 81.6158 },
    { id: "Res-Gudhiyari-E", lat: 21.2628, lng: 81.6182 },

    // Hexagon 8 (Naya Raipur - Zone 1)
    { id: "Res-NayaRaipur1-A", lat: 21.1660, lng: 81.7900 },
    { id: "Res-NayaRaipur1-B", lat: 21.1600, lng: 81.7840 },
    { id: "Res-NayaRaipur1-C", lat: 21.1642, lng: 81.7930 },
    { id: "Res-NayaRaipur1-D", lat: 21.1690, lng: 81.7858 },

    // Hexagon 9 (Naya Raipur - Zone 2)
    { id: "Res-NayaRaipur2-A", lat: 21.1620, lng: 81.7860 },
    { id: "Res-NayaRaipur2-B", lat: 21.1560, lng: 81.7800 },
    { id: "Res-NayaRaipur2-C", lat: 21.1602, lng: 81.7890 },
    { id: "Res-NayaRaipur2-D", lat: 21.1650, lng: 81.7818 },
    { id: "Res-NayaRaipur2-E", lat: 21.1578, lng: 81.7842 },

    // Hexagon 10 (Mowa)
    { id: "Res-Mowa-A", lat: 21.2800, lng: 81.6650 },
    { id: "Res-Mowa-B", lat: 21.2740, lng: 81.6590 },
    { id: "Res-Mowa-C", lat: 21.2782, lng: 81.6680 },
    { id: "Res-Mowa-D", lat: 21.2830, lng: 81.6608 },

    // Hexagon 11 (DDU Nagar)
    { id: "Res-DDUNagar-A", lat: 21.2400, lng: 81.6000 },
    { id: "Res-DDUNagar-B", lat: 21.2340, lng: 81.5940 },
    { id: "Res-DDUNagar-C", lat: 21.2382, lng: 81.6030 },
    { id: "Res-DDUNagar-D", lat: 21.2430, lng: 81.5958 },
    { id: "Res-DDUNagar-E", lat: 21.2358, lng: 81.5982 },

    // Hexagon 12 (Tikrapara)
    { id: "Res-Tikrapara-A", lat: 21.2330, lng: 81.6400 },
    { id: "Res-Tikrapara-B", lat: 21.2270, lng: 81.6340 },
    { id: "Res-Tikrapara-C", lat: 21.2312, lng: 81.6430 },
    { id: "Res-Tikrapara-D", lat: 21.2360, lng: 81.6358 }
];