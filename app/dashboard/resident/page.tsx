"use client";

import dynamic from "next/dynamic";
import { logOut } from "../actions"; // Import your new server action
import { Button } from "@/components/ui/button";
import AnalyticsDashboard from "@/src/components/AnalyticsDashboard";
import PickupStatusTable from "@/src/components/PickupStatusTable";
import { WasteChatbot } from "@/src/components/WasteChatbot";


// Safely import the Leaflet map for the client side only
const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading map...</p>,
});

export default function ResidentDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Gram Panchayat Admin Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Monitor village plastic availability and route analytics in real-time.
          </p>
        </div>
        
        <form action={logOut}>
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </div>

      {/* Center the content and constrain the max width */}
      <div className="w-full max-w-6xl">
        
        {/* 1. Drop the Analytics Dashboard Here */}
        <AnalyticsDashboard />
        
        {/* 2. The Map Container */}
        <div className="h-[600px] w-full rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden relative z-0">
          <ResidentMap />
        </div>
        <WasteChatbot />
        <PickupStatusTable />
      </div>
    </div>
  );
}