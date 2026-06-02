"use client";

import { logOut } from "../actions"; 
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import PickupStatusTable from "@/src/components/PickupStatusTable";
import { Leaf, CheckCircle2, CheckCircle } from "lucide-react";
import Link from "next/link";
import CollectorAnalytics from "@/src/components/CollectorAnalytics";
import FAQSection from "@/src/components/FAQSection";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PickupTransactionSheet } from "@/src/components/PickupTransactionSheet";
import { createClient } from "@/src/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Safely import the map for the client side only
const CollectorMap = dynamic(() => import("@/src/components/CollectorMap"), {
  ssr: false,
  loading: () => <p className="text-zinc-500 flex items-center justify-center h-full">Loading routes...</p>,
});

export default function CollectorDashboard() {
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingPickups, setPendingPickups] = useState<any[]>([]);
  const [completedPickups, setCompletedPickups] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchPickups = async () => {
      const { data: pending } = await supabase.from("pickup_requests").select("*").eq("status", "pending");
      const { data: completed } = await supabase.from("pickup_requests").select("*").eq("status", "completed");
      if (pending) setPendingPickups(pending);
      if (completed) setCompletedPickups(completed);
    };
    fetchPickups();
  }, [supabase]);

  const handleCompletion = (id: string) => {
    const completed = pendingPickups.find(p => p.id === id);
    if (completed) {
      setPendingPickups(prev => prev.filter(p => p.id !== id));
      setCompletedPickups(prev => [completed, ...prev]);
    }
  };

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

      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400 mb-2">
            Collector Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage pending pickups, analyze your stats, and optimize collection routes in real-time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-3 rounded-2xl bg-white shadow-xl shadow-emerald-900/10 dark:bg-zinc-900 overflow-hidden border border-emerald-100 dark:border-emerald-900/30">
            <div className="p-6 h-full flex flex-col justify-center">
              <CollectorAnalytics />
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Collector Analytics moved to top row */}
          <div className="h-[600px] w-full rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 overflow-hidden dark:border-emerald-900/30 dark:bg-zinc-900">
             <CollectorMap 
               pickupNodes={pendingPickups} 
               onMarkerClick={(pickup) => { 
                 setSelectedPickup(pickup); 
                 setIsSheetOpen(true); 
               }} 
             />
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/10 dark:border-emerald-900/30 dark:bg-zinc-900">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending Pickups ({pendingPickups.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedPickups.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                {pendingPickups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 min-h-[180px]">
                    <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3 animate-bounce" />
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">All blocks are clear.</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">No pending waste collections.</p>
                  </div>
                ) : (
                  pendingPickups.map(pickup => (
                    <Card key={pickup.id} className="cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => { setSelectedPickup(pickup); setIsSheetOpen(true); }}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-emerald-900 dark:text-emerald-400">{pickup.location_name || `Pickup #${pickup.id}`}</p>
                          <p className="text-sm text-zinc-500">
                            {(
                              (pickup.pet_weight || 0) +
                              (pickup.hdpe_weight || 0) +
                              (pickup.ldpe_weight || 0) +
                              (pickup.pp_weight || 0)
                            ).toFixed(1)} kg
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Process</Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedPickups.map(pickup => (
                  <Card key={pickup.id} className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-400">{pickup.location_name || `Pickup #${pickup.id}`}</p>
                        <p className="text-sm text-emerald-700">
                          {(
                            (pickup.pet_weight || 0) +
                            (pickup.hdpe_weight || 0) +
                            (pickup.ldpe_weight || 0) +
                            (pickup.pp_weight || 0)
                          ).toFixed(1)} kg Final Weight
                        </p>
                      </div>
                      <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                    </CardContent>
                  </Card>
                ))}
                {completedPickups.length === 0 && <p className="text-zinc-500">No completed pickups yet.</p>}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <FAQSection />

        <PickupTransactionSheet 
          isOpen={isSheetOpen} 
          onClose={() => setIsSheetOpen(false)} 
          pickup={selectedPickup} 
          onComplete={handleCompletion} 
        />
      </main>
    </div>
  );
}