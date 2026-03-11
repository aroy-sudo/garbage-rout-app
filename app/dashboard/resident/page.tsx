"use client";

import dynamic from "next/dynamic";
import { logOut } from "../actions"; // Import your new server action
import { Button } from "@/components/ui/button";

// Safely import the Leaflet map for the client side only
const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading map...</p>,
});

export default function ResidentDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 dark:bg-black">
      <div className="w-full flex justify-between items-center mb-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Resident Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Click on the map to request a garbage pickup.
          </p>
        </div>
        
        {/* The Sign Out Button */}
        <form action={logOut}>
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </div>
      
      <div className="w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-100 flex items-center justify-center dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden relative z-0">
        <ResidentMap />
      </div>
    </div>
  );
}