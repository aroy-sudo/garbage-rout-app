"use client";

import dynamic from "next/dynamic";
import { logOut } from "../actions"; // Import your new server action
import { Button } from "@/components/ui/button";
import AnalyticsDashboard from "@/src/components/AnalyticsDashboard";
import PickupStatusTable from "@/src/components/PickupStatusTable";
import { WasteChatbot } from "@/src/components/WasteChatbot";
import { Leaf } from "lucide-react";
import Link from "next/link";
import PaymentPopup from "@/src/components/PaymentPopup";

// Safely import the Leaflet map for the client side only
const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading map...</p>,
});

export default function ResidentDashboard() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
              <Leaf className="h-6 w-6 text-emerald-600" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400">EcoRoute</Link>
          </div>
          <form action={logOut}>
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-900/10">Sign Out</Button>
          </form>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400 mb-2">
            Gram Panchayat Admin Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Monitor village plastic availability and route analytics in real-time.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Analytics Dashboard */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/10 dark:border-emerald-900/30 dark:bg-zinc-900">
            <AnalyticsDashboard />
          </div>
          
          {/* Map Container */}
          <div className="h-[600px] w-full rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 overflow-hidden dark:border-emerald-900/30 dark:bg-zinc-900">
            <ResidentMap />
          </div>

          {/* Pickup Status Table */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/10 dark:border-emerald-900/30 dark:bg-zinc-900">
            <PickupStatusTable />
          </div>
        </div>

        <WasteChatbot />
        <PaymentPopup />
      </main>
    </div>
  );
}