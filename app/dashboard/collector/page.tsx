"use client";

import { logOut } from "../actions"; 
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import PickupStatusTable from "@/src/components/PickupStatusTable";
import { Leaf } from "lucide-react";
import Link from "next/link";
import CollectorAnalytics from "@/src/components/CollectorAnalytics";
import FAQSection from "@/src/components/FAQSection";
import { useState } from "react";
import PhotoProofCapture from "@/src/components/ui/PhotoProofCapture";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Safely import the map for the client side only
const CollectorMap = dynamic(() => import("@/src/components/CollectorMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500 flex items-center justify-center h-full">Loading routes...</p>,
});

export default function CollectorDashboard() {
  const [proofUrl, setProofUrl] = useState<string | null>(null);

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
          <div className="flex items-center space-x-4">
            <a 
              href="#faq" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              FAQ
            </a>
            <form action={logOut}>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md shadow-emerald-900/10">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400 mb-2">
            Collector Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage pending pickups, analyze your stats, and optimize collection routes in real-time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-xl shadow-emerald-900/10 dark:bg-zinc-900 overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
            <div className="p-6 h-full flex flex-col justify-center">
              <CollectorAnalytics />
            </div>
          </div>
          
          <Card className="rounded-2xl shadow-xl shadow-emerald-900/10 dark:bg-zinc-900 overflow-hidden border border-emerald-100 dark:border-emerald-900/30 bg-white">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 dark:bg-emerald-900/10 dark:border-emerald-900/30">
              <CardTitle className="text-emerald-900 dark:text-emerald-400 font-bold">Current Pickup</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Capture photo proof for EPR compliance at the current pickup location.</p>
              <PhotoProofCapture onUploadComplete={(url) => setProofUrl(url)} />
              
              {proofUrl && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/40 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                      ✅ EPR Proof Captured
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 truncate">Verified & uploaded to chain</p>
                  </div>
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-200 shrink-0">
                    <img src={proofUrl} alt="EPR Proof Thumbnail" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8">
          {/* Collector Analytics moved to top row */}
          <div className="h-[600px] w-full rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 overflow-hidden dark:border-emerald-900/30 dark:bg-zinc-900">
             <CollectorMap />
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/10 dark:border-emerald-900/30 dark:bg-zinc-900">
            <PickupStatusTable />
          </div>
        </div>

        <FAQSection />
      </main>
    </div>
  );
}