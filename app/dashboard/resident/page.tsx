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
import FAQSection from "@/src/components/FAQSection";

// Safely import the Leaflet map for the client side only
const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading map...</p>,
});

export default function ResidentDashboard() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b border-[#e8fccf] bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-[#e8fccf]/60 p-2 dark:bg-[#134611]/30">
              <Leaf className="h-6 w-6 text-[#3da35d]" />
            </div>
            <Link href="/" className="text-2xl font-bold tracking-tight text-[#134611] dark:text-[#96e072]">EcoRoute</Link>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="#faq" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-semibold text-[#134611] hover:text-[#3e8914] transition-colors cursor-pointer"
            >
              FAQ
            </a>
            <form action={logOut}>
              <Button size="sm" className="bg-[#3e8914] hover:bg-[#134611] text-white rounded-full shadow-md shadow-[#134611]/10">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#134611] dark:text-[#96e072] mb-2">
            SHG Dashboard
          </h1>
          <p className="text-lg text-[#3e8914]/80 dark:text-zinc-400">
            Monitor SHG plastic collection requests and real-time routing analytics.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Analytics Dashboard */}
          <div className="rounded-2xl border border-[#e8fccf] bg-white p-6 shadow-xl shadow-[#134611]/10 dark:border-[#134611]/30 dark:bg-zinc-900">
            <AnalyticsDashboard />
          </div>
          
          {/* Map Container */}
          <div className="h-[600px] w-full rounded-2xl border border-[#e8fccf] bg-white shadow-xl shadow-[#134611]/10 overflow-hidden dark:border-[#134611]/30 dark:bg-zinc-900">
            <ResidentMap />
          </div>

          {/* Pickup Status Table */}
          <div className="rounded-2xl border border-[#e8fccf] bg-white p-6 shadow-xl shadow-[#134611]/10 dark:border-[#134611]/30 dark:bg-zinc-900">
            <PickupStatusTable />
          </div>
        </div>

        <WasteChatbot />
        <PaymentPopup />
        <FAQSection />
      </main>
    </div>
  );
}