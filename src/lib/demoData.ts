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

// 3. Residents Clustered Around Hexagons
export const RESIDENTS: GeoPoint[] = [
    // Hexagon 1 (Tatibandh)
    { id: "Res-Tatibandh-A", lat: 21.2585, lng: 81.5855 },
    { id: "Res-Tatibandh-B", lat: 21.2575, lng: 81.5845 },
    { id: "Res-Tatibandh-C", lat: 21.2582, lng: 81.5860 },
    { id: "Res-Tatibandh-D", lat: 21.2590, lng: 81.5848 },
    
    // Hexagon 2 (Shankar Nagar)
    { id: "Res-ShankarNagar-A", lat: 21.2535, lng: 81.6545 },
    { id: "Res-ShankarNagar-B", lat: 21.2525, lng: 81.6535 },
    { id: "Res-ShankarNagar-C", lat: 21.2532, lng: 81.6550 },
    { id: "Res-ShankarNagar-D", lat: 21.2540, lng: 81.6538 },
    { id: "Res-ShankarNagar-E", lat: 21.2528, lng: 81.6542 },
    
    // Hexagon 3 (Pandri)
    { id: "Res-Pandri-A", lat: 21.2675, lng: 81.6475 },
    { id: "Res-Pandri-B", lat: 21.2665, lng: 81.6465 },
    { id: "Res-Pandri-C", lat: 21.2672, lng: 81.6480 },
    { id: "Res-Pandri-D", lat: 21.2680, lng: 81.6468 },
    
    // Hexagon 4 (Telibandha - Zone 1)
    { id: "Res-Telibandha1-A", lat: 21.2445, lng: 81.6645 },
    { id: "Res-Telibandha1-B", lat: 21.2435, lng: 81.6635 },
    { id: "Res-Telibandha1-C", lat: 21.2442, lng: 81.6650 },
    { id: "Res-Telibandha1-D", lat: 21.2450, lng: 81.6638 },
    { id: "Res-Telibandha1-E", lat: 21.2438, lng: 81.6642 },
    
    // Hexagon 5 (Telibandha - Zone 2)
    { id: "Res-Telibandha2-A", lat: 21.2405, lng: 81.6605 },
    { id: "Res-Telibandha2-B", lat: 21.2395, lng: 81.6595 },
    { id: "Res-Telibandha2-C", lat: 21.2402, lng: 81.6610 },
    { id: "Res-Telibandha2-D", lat: 21.2410, lng: 81.6598 },
    
    // Hexagon 6 (Bhatagaon)
    { id: "Res-Bhatagaon-A", lat: 21.2175, lng: 81.6275 },
    { id: "Res-Bhatagaon-B", lat: 21.2165, lng: 81.6265 },
    { id: "Res-Bhatagaon-C", lat: 21.2172, lng: 81.6280 },
    { id: "Res-Bhatagaon-D", lat: 21.2180, lng: 81.6268 },
    
    // Hexagon 7 (Gudhiyari)
    { id: "Res-Gudhiyari-A", lat: 21.2645, lng: 81.6175 },
    { id: "Res-Gudhiyari-B", lat: 21.2635, lng: 81.6165 },
    { id: "Res-Gudhiyari-C", lat: 21.2642, lng: 81.6180 },
    { id: "Res-Gudhiyari-D", lat: 21.2650, lng: 81.6168 },
    { id: "Res-Gudhiyari-E", lat: 21.2638, lng: 81.6172 },
    
    // Hexagon 8 (Naya Raipur - Zone 1)
    { id: "Res-NayaRaipur1-A", lat: 21.1635, lng: 81.7875 },
    { id: "Res-NayaRaipur1-B", lat: 21.1625, lng: 81.7865 },
    { id: "Res-NayaRaipur1-C", lat: 21.1632, lng: 81.7880 },
    { id: "Res-NayaRaipur1-D", lat: 21.1640, lng: 81.7868 },
    
    // Hexagon 9 (Naya Raipur - Zone 2)
    { id: "Res-NayaRaipur2-A", lat: 21.1595, lng: 81.7835 },
    { id: "Res-NayaRaipur2-B", lat: 21.1585, lng: 81.7825 },
    { id: "Res-NayaRaipur2-C", lat: 21.1592, lng: 81.7840 },
    { id: "Res-NayaRaipur2-D", lat: 21.1600, lng: 81.7828 },
    { id: "Res-NayaRaipur2-E", lat: 21.1588, lng: 81.7832 },
    
    // Hexagon 10 (Mowa)
    { id: "Res-Mowa-A", lat: 21.2775, lng: 81.6625 },
    { id: "Res-Mowa-B", lat: 21.2765, lng: 81.6615 },
    { id: "Res-Mowa-C", lat: 21.2772, lng: 81.6630 },
    { id: "Res-Mowa-D", lat: 21.2780, lng: 81.6618 },
    
    // Hexagon 11 (DDU Nagar)
    { id: "Res-DDUNagar-A", lat: 21.2375, lng: 81.5975 },
    { id: "Res-DDUNagar-B", lat: 21.2365, lng: 81.5965 },
    { id: "Res-DDUNagar-C", lat: 21.2372, lng: 81.5980 },
    { id: "Res-DDUNagar-D", lat: 21.2380, lng: 81.5968 },
    { id: "Res-DDUNagar-E", lat: 21.2368, lng: 81.5972 },
    
    // Hexagon 12 (Tikrapara)
    { id: "Res-Tikrapara-A", lat: 21.2305, lng: 81.6375 },
    { id: "Res-Tikrapara-B", lat: 21.2295, lng: 81.6365 },
    { id: "Res-Tikrapara-C", lat: 21.2302, lng: 81.6380 },
    { id: "Res-Tikrapara-D", lat: 21.2310, lng: 81.6368 }
];
