"use client";

import dynamic from "next/dynamic";
import { logOut } from "../actions"; // Import your new server action
import { Button } from "@/components/ui/button";
import AnalyticsDashboard from "@/src/components/AnalyticsDashboard";
import PickupStatusTable from "@/src/components/PickupStatusTable";
import GarbageChatBot from "@/src/components/GarbageChatBot";
import { Leaf } from "lucide-react";
import Link from "next/link";
import PaymentPopup from "@/src/components/PaymentPopup";
import FAQSection from "@/src/components/FAQSection";
import { useState } from "react";
import LocationSelector from "@/src/components/ui/LocationSelector";
import VoiceWeightInput from "@/src/components/ui/VoiceWeightInput";
import PRWalletCard from "@/src/components/PRWalletCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Safely import the Leaflet map for the client side only
const ResidentMap = dynamic(() => import("@/src/components/ResidentMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500">Loading map...</p>,
});

export default function ResidentDashboard() {
  const [weight, setWeight] = useState<number>(0);
  const [location, setLocation] = useState<{
    districtId?: number;
    blockId?: number;
    panchayatId?: number;
    villageId?: number;
    lat?: number;
    lng?: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

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

        <div className="mb-8">
          <PRWalletCard />
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Schedule Pickup Section */}
          <Card className="rounded-2xl border border-[#e8fccf] shadow-xl shadow-[#134611]/10 dark:border-[#134611]/30 dark:bg-zinc-900 overflow-hidden bg-white">
            <CardHeader className="bg-[#e8fccf]/30 border-b border-[#e8fccf]/50 dark:bg-[#134611]/10 dark:border-[#134611]/30">
              <CardTitle className="text-[#134611] dark:text-[#96e072] font-bold">Schedule Pickup</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <LocationSelector
                onChange={(loc) => {
                  setLocation(loc);
                  if (loc.lat !== undefined && loc.lng !== undefined) {
                    setMapCenter([loc.lat, loc.lng]);
                  }
                }}
              />
              <VoiceWeightInput onWeightExtracted={(w) => setWeight(w)} />
              <div className="mt-4 p-4 rounded-xl bg-[#e8fccf]/30 border border-[#e8fccf] dark:bg-[#134611]/20 dark:border-[#134611]/40 flex items-center justify-center">
                <p className="font-semibold text-[#134611] dark:text-[#96e072] flex items-center gap-2">
                  <Leaf className="w-5 h-5" /> Current Logged Weight: {weight || 0} kg
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Analytics Dashboard */}
          <div className="rounded-2xl border border-[#e8fccf] bg-white p-6 shadow-xl shadow-[#134611]/10 dark:border-[#134611]/30 dark:bg-zinc-900 h-full flex flex-col justify-center">
            <AnalyticsDashboard />
          </div>
        </div>

        <div className="grid gap-8">
          {/* Removed old Analytics position as it's now alongside Schedule Pickup */}
          
          {/* Map Container */}
          <div className="h-[600px] w-full rounded-2xl border border-[#e8fccf] bg-white shadow-xl shadow-[#134611]/10 overflow-hidden dark:border-[#134611]/30 dark:bg-zinc-900">
            <ResidentMap center={mapCenter} />
          </div>

          {/* Pickup Status Table */}
          <div className="rounded-2xl border border-[#e8fccf] bg-white p-6 shadow-xl shadow-[#134611]/10 dark:border-[#134611]/30 dark:bg-zinc-900">
            <PickupStatusTable />
          </div>
        </div>
        <GarbageChatBot />
        <PaymentPopup />
        <FAQSection />
      </main>
    </div>
  );
}