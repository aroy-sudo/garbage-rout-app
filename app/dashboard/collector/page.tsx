"use client";

import { logOut } from "../actions"; 
import { Button } from "@/components/ui/button";

export default function CollectorDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Collector Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            View pending pickups and optimized routes.
          </p>
        </div>
        
        {/* The Sign Out Button */}
        <form action={logOut}>
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </div>
      
      {/* Placeholder for the Collector's Route Map/Table */}
      <div className="h-[500px] w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-100 flex items-center justify-center dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden relative z-0">
         <p className="text-zinc-500">Collector Map & Routes Loading...</p>
      </div>
    </div>
  );
}