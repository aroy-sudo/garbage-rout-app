"use client";

import { logOut } from "../actions"; 
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import PickupStatusTable from "@/src/components/PickupStatusTable";

// Safely import the map for the client side only
const CollectorMap = dynamic(() => import("@/src/components/CollectorMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500 flex items-center justify-center h-full">Loading routes...</p>,
});

export default function CollectorDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Collector Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            View pending pickups and optimize your route.
          </p>
        </div>
        
        <form action={logOut}>
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </div>
      
      <div className="h-[500px] w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-100 flex items-center justify-center dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden relative z-0 shadow-lg">
         <CollectorMap />
      </div>

      <PickupStatusTable />
    </div>
  );
}