"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { PickupRequest } from "@/src/types/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Truck, Banknote, PackageOpen } from "lucide-react";

type CollectorStat = {
  collector_id: string;
  total_pickups: number;
  total_payment_disbursed: number;
  pet: number;
  hdpe: number;
  ldpe: number;
  pp: number;
  total_plastic: number;
};

export default function RecyclerDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<CollectorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAggregateData = async () => {
      // Fetch all completed pickups
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('status', 'collected');

      if (error) {
        console.error("Error fetching recycler data:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const requests = data as PickupRequest[];
        const map = new Map<string, CollectorStat>();

        requests.forEach(req => {
          const cid = req.collector_id || "Unknown Collector";
          
          if (!map.has(cid)) {
            map.set(cid, {
              collector_id: cid,
              total_pickups: 0,
              total_payment_disbursed: 0,
              pet: 0,
              hdpe: 0,
              ldpe: 0,
              pp: 0,
              total_plastic: 0
            });
          }

          const stat = map.get(cid)!;
          stat.total_pickups += 1;
          stat.total_payment_disbursed += req.payment_amount || 0;
          stat.pet += req.pet_weight || 0;
          stat.hdpe += req.hdpe_weight || 0;
          stat.ldpe += req.ldpe_weight || 0;
          stat.pp += req.pp_weight || 0;
          stat.total_plastic += (req.pet_weight || 0) + (req.hdpe_weight || 0) + (req.ldpe_weight || 0) + (req.pp_weight || 0);
        });

        setStats(Array.from(map.values()));
      }
      setLoading(false);
    };

    fetchAndAggregateData();
  }, [supabase]);

  // Aggregate grand totals
  const totalPickups = stats.reduce((acc, curr) => acc + curr.total_pickups, 0);
  const totalDisbursed = stats.reduce((acc, curr) => acc + curr.total_payment_disbursed, 0);
  const totalPlastic = stats.reduce((acc, curr) => acc + curr.total_plastic, 0);

  return (
    <div>
      <div className="mb-10 pb-5">
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-400 mb-2">
          Recycling Center Hub
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Monitor massive scrap intake and track volume acquired by each fleet collector.
        </p>
      </div>

      {loading ? (
        <div className="flex animate-pulse gap-6 mb-8">
          <div className="h-32 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-32 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-32 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <Card className="border-blue-100 bg-white shadow-md shadow-blue-900/5 dark:border-blue-900/40 dark:bg-zinc-900 pt-6">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-4 dark:bg-blue-900/30">
                  <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Serviced</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalPickups}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-white shadow-md shadow-emerald-900/5 dark:border-emerald-900/40 dark:bg-zinc-900 pt-6">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-100 p-4 dark:bg-emerald-900/30">
                  <PackageOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Plastic Ingested</p>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-500">{totalPlastic.toFixed(1)} kg</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-white shadow-md shadow-amber-900/5 dark:border-amber-900/40 dark:bg-zinc-900 pt-6">
              <CardContent className="flex items-center gap-4">
                <div className="rounded-xl bg-amber-100 p-4 dark:bg-amber-900/30">
                  <Banknote className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Payouts Made</p>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-500">₹{totalDisbursed.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collectors Table */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <CardTitle className="flex items-center gap-2 text-xl text-zinc-800 dark:text-zinc-100">
                <Users className="h-5 w-5 text-blue-600" />
                Collector Operations Ledger
              </CardTitle>
              <CardDescription>Consolidated statistics grouped by active field collectors.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-black text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-4 font-semibold whitespace-nowrap">Collector ID</th>
                      <th className="p-4 font-semibold text-center whitespace-nowrap">Total Pickups</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap">PET / HDPE / LDPE / PP (kg)</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-400">Total Weight</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-400">Total Money Disbursed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm">
                    {stats.length > 0 ? (
                      stats.map((stat, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-zinc-500 dark:text-zinc-400 max-w-[150px] truncate" title={stat.collector_id}>
                            {stat.collector_id}
                          </td>
                          <td className="p-4 text-center font-bold">
                            {stat.total_pickups}
                          </td>
                          <td className="p-4 text-right text-zinc-600 dark:text-zinc-400">
                            {stat.pet.toFixed(1)} / {stat.hdpe.toFixed(1)} / {stat.ldpe.toFixed(1)} / {stat.pp.toFixed(1)}
                          </td>
                          <td className="p-4 text-right font-bold bg-blue-50/30 dark:bg-blue-950/10 text-blue-800 dark:text-blue-300">
                            {stat.total_plastic.toFixed(1)} kg
                          </td>
                          <td className="p-4 text-right font-bold bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400">
                            ₹{stat.total_payment_disbursed.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No completed pickups found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
