"use client";

import { logOut } from "../actions"; 
import { Button } from "@/components/ui/button";

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

import CollectorGoogleMap from "@/src/components/CollectorGoogleMap";
import { TelemetryCard } from "@/src/components/ui/TelemetryCard";
import { useDriverTracking } from "@/src/hooks/useDriverTracking";
import { isWithinRadius } from "@/src/utils/geofencing";
import { toast } from "sonner";

export default function CollectorDashboard() {
  const [selectedPickup, setSelectedPickup] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingPickups, setPendingPickups] = useState<any[]>([]);
  const [completedPickups, setCompletedPickups] = useState<any[]>([]);
  const [routeSummary, setRouteSummary] = useState<{ distanceMeters: number, durationSeconds: number } | null>(null);

  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [routeId, setRouteId] = useState<string | null>(null);
  const { location, error: trackingError } = useDriverTracking(routeId, isTrackingLocation);
  const [hasArrived, setHasArrived] = useState(false);

  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      setIsTrackingLocation(false);
      setRouteId(null);
      toast.success("Location tracking stopped");
    } else {
      setRouteId("route-raipur-01");
      setIsTrackingLocation(true);
      toast.success("Location tracking started");
    }
  };

  const startRoute = () => {
    if (!location) {
      toast.error("Enable location first");
      return;
    }
    toast.info("Starting route from current GPS");
  };

  const nextPickupTarget = pendingPickups.length > 0 ? pendingPickups[0] : null;

  useEffect(() => {
    setHasArrived(false);
  }, [nextPickupTarget?.id]);

  useEffect(() => {
    if (!location || !nextPickupTarget || hasArrived) return;
    const withinRadius = isWithinRadius(location, { lat: nextPickupTarget.latitude, lng: nextPickupTarget.longitude }, 50);
    if (withinRadius) {
      setHasArrived(true);
      toast.success("Automatically arrived at destination (within 50m)!");
      handleCompletion(nextPickupTarget.id);
    }
  }, [location, nextPickupTarget, hasArrived]);

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
          <div className="relative h-[600px] w-full rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10 overflow-hidden dark:border-emerald-900/30 dark:bg-zinc-900">
             <div className="absolute top-4 left-4 z-[1000] flex gap-2">
               <Button
                 onClick={toggleLocationTracking}
                 variant={isTrackingLocation ? "destructive" : "default"}
                 size="sm"
               >
                 📍 {isTrackingLocation ? "Stop GPS" : "Enable GPS"}
               </Button>
               <Button
                 onClick={startRoute}
                 size="sm"
                 variant="outline"
                 className="bg-white/80 backdrop-blur"
               >
                 🚀 Start Route
               </Button>
             </div>
             {routeSummary && (
               <TelemetryCard 
                 distanceMeters={routeSummary.distanceMeters}
                 durationSeconds={routeSummary.durationSeconds}
                 nodeCount={pendingPickups.length}
                 pickupNodes={pendingPickups.map(p => ({ lat: p.latitude || p.lat, lng: p.longitude || p.lng }))}
               />
             )}
             <CollectorGoogleMap 
               pickupNodes={pendingPickups} 
               driverLocation={location}
               onMarkerClick={(pickup) => { 
                 setSelectedPickup(pickup); 
                 setIsSheetOpen(true); 
               }} 
               onRouteCalculated={(metrics) => setRouteSummary(metrics)}
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