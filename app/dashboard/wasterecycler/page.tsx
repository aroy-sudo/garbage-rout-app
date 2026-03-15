"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import { PickupRequest } from "@/src/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendUp,
  Package,
  Recycle,
  ChartLineUp,
  Bank,
  CheckCircle,
  Clock,
  MapTrifold,
  ArrowRight,
  Drop,
  Tree
} from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import FAQSection from "@/src/components/FAQSection";
import Link from "next/link";

const WasteRecyclerMap = dynamic(() => import("@/src/components/WasteRecyclerMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-[#caf0f8] text-[#90e0ef] rounded-2xl animate-pulse">Loading map...</div>,
});

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
  const [collectorStats, setCollectorStats] = useState<CollectorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndAggregateData = async () => {
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

        setCollectorStats(Array.from(map.values()));
      }
      setLoading(false);
    };

    fetchAndAggregateData();
  }, [supabase]);

  // Aggregate grand totals
  const totalPickups = collectorStats.reduce((acc, curr) => acc + curr.total_pickups, 0);
  const totalDisbursed = collectorStats.reduce((acc, curr) => acc + curr.total_payment_disbursed, 0);
  const totalPlastic = collectorStats.reduce((acc, curr) => acc + curr.total_plastic, 0);
  
  // Inventory Breakdown
  const totalPET = collectorStats.reduce((acc, curr) => acc + curr.pet, 0);
  const totalHDPE = collectorStats.reduce((acc, curr) => acc + curr.hdpe, 0);
  const totalLDPE = collectorStats.reduce((acc, curr) => acc + curr.ldpe, 0);
  const totalPP = collectorStats.reduce((acc, curr) => acc + curr.pp, 0);

  const getPercent = (val: number) => totalPlastic > 0 ? (val / totalPlastic) * 100 : 0;
  
  // Eco impact estimates (Rough approximations: 1kg plastic = ~0.2 trees, ~100L water)
  const treesSaved = Math.round(totalPlastic * 0.2);
  const waterSaved = Math.round(totalPlastic * 100);

  // Setup dynamic stats array matching the admin style
  const stats = [
    {
      label: "Raw Intake",
      value: totalPlastic.toFixed(1),
      unit: "kg",
      change: "+12%",
      positive: true,
      icon: Package,
      lightBg: "from-[#caf0f8] to-[#caf0f8]/60",
      iconBg: "bg-[#0077b6]",
      ringPct: 92,
    },
    {
      label: "Processed",
      value: (totalPlastic * 0.85).toFixed(1),
      unit: "kg",
      change: "+5.4%",
      positive: true,
      icon: Recycle,
      lightBg: "from-emerald-50 to-emerald-100/60",
      iconBg: "bg-emerald-600",
      ringPct: 85,
    },
    {
      label: "Efficiency",
      value: "94.2",
      unit: "%",
      change: "+2.1%",
      positive: true,
      icon: ChartLineUp,
      lightBg: "from-indigo-50 to-indigo-100/60",
      iconBg: "bg-indigo-600",
      ringPct: 94,
    },
    {
      label: "Payouts Made",
      value: `₹${totalDisbursed.toFixed(0)}`,
      unit: "",
      change: "+15.8%",
      positive: true,
      icon: Bank,
      lightBg: "from-amber-50 to-amber-100/60",
      iconBg: "bg-amber-600",
      ringPct: 100,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* ── Page Heading ── */}
      <div className="mb-2 pb-4 border-b border-[#caf0f8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#03045e] dark:text-[#00b4d8] mb-2">
            Center Operations & Ingestion
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Overview of intake workflows, sorting processing, and outbound capacity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="#faq" 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-semibold text-[#03045e] hover:text-[#0077b6] transition-colors cursor-pointer"
          >
            FAQ
          </a>
          <span className="flex items-center gap-2 text-sm font-medium bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Operational
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex animate-pulse gap-6 h-40 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          
          {/* Main Content Area (Colspan 2) */}
          <div className="xl:col-span-2 space-y-5">
            
            {/* Top KPI Cards (Grid cols 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {stats.map((s) => {
                const Icon = s.icon;
                const circumference = 2 * Math.PI * 20;
                const offset = circumference - (s.ringPct / 100) * circumference;
                return (
                  <Card
                    key={s.label}
                    className={`rounded-2xl border-0 shadow-md shadow-[#caf0f8]/60 overflow-hidden bg-gradient-to-br ${s.lightBg} relative group cursor-default transition-transform hover:-translate-y-0.5`}
                  >
                    <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${s.iconBg} shadow-lg`}>
                          <Icon size={18} weight="bold" className="text-white" />
                        </div>
                        <svg width="48" height="48" viewBox="0 0 48 48" className="opacity-80">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                          <circle
                            cx="24" cy="24" r="20"
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 24 24)"
                          />
                          <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">
                            {s.ringPct}%
                          </text>
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 mb-1 tracking-wide uppercase">{s.label}</p>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-3xl font-black tracking-tight text-zinc-900">{s.value}</span>
                        <span className="text-xs font-semibold text-zinc-400">{s.unit}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 text-[#0077b6]">
                        <TrendUp size={12} weight="bold" />
                        {s.change} vs last month
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* District Heatmap & Setup matching Map Card styling */}
            <Card className="rounded-2xl border border-[#caf0f8]/80 shadow-md shadow-[#caf0f8]/40 bg-white overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="border-b border-[#caf0f8] p-4 shrink-0 flex flex-row items-center justify-between bg-gradient-to-r from-white to-[#caf0f8]/50">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#0077b6] shadow-md shadow-[#0077b6]/30">
                    <MapTrifold size={16} weight="bold" className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-900">Live Intake Heatmap</CardTitle>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">District Area Tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase bg-[#caf0f8] border border-[#caf0f8] text-[#0077b6] px-2 py-0.5 rounded-md">
                    <div className="w-1 h-1 rounded-full bg-[#00b4d8] animate-pulse" /> Active Areas
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative overflow-hidden">
                <WasteRecyclerMap />
              </CardContent>
            </Card>

            {/* Collector Operations Leaderboard matching Admin tables */}
            <Card className="rounded-2xl border border-[#caf0f8]/80 shadow-md shadow-[#caf0f8]/40 bg-white overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-[#caf0f8] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900">Collector Operations Leaderboard</CardTitle>
                </div>
                <span className="text-[10px] font-bold text-[#0077b6] flex items-center gap-0.5 hover:underline cursor-pointer whitespace-nowrap">
                  All fleets <ArrowRight size={10} />
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#caf0f8]/70 to-[#caf0f8]/30 border-b border-[#caf0f8]/60">
                        <th className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Rank & Collector ID</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-center">Pickups</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">PET/HDPE/LDPE/PP (kg)</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Net Weight</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Payout Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectorStats.slice(0, 5).map((stat, idx) => (
                        <tr key={idx} className="border-b border-zinc-50 hover:bg-[#caf0f8]/40 transition-colors cursor-default group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-md bg-[#caf0f8] flex items-center justify-center text-[#0077b6] text-[10px] font-bold shadow-sm group-hover:bg-[#0077b6] group-hover:text-white transition-colors">
                                {idx + 1}
                              </div>
                              <p className="font-semibold text-zinc-900 text-[12px] group-hover:text-[#03045e] transition-colors whitespace-nowrap truncate max-w-[120px]">{stat.collector_id}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-bold text-zinc-900 whitespace-nowrap text-center text-[12px]">{stat.total_pickups}</td>
                          <td className="px-3 py-3 text-zinc-500 font-medium whitespace-nowrap text-right text-[10px]">
                            <span className="text-[#00b4d8] font-bold">{stat.pet.toFixed(0)}</span> / 
                            <span className="text-amber-500 font-bold ml-1">{stat.hdpe.toFixed(0)}</span> / 
                            <span className="text-emerald-500 font-bold ml-1">{stat.ldpe.toFixed(0)}</span> / 
                            <span className="text-indigo-500 font-bold ml-1">{stat.pp.toFixed(0)}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                             <span className="text-[10px] font-bold text-[#0077b6] bg-[#caf0f8] px-2 py-1 rounded w-full inline-block">
                               {stat.total_plastic.toFixed(1)} kg
                             </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded inline-block w-full">
                               ₹{stat.total_payment_disbursed.toFixed(0)}
                             </span>
                          </td>
                        </tr>
                      ))}
                      {collectorStats.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500 text-xs">No operations recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Column (Colspan 1) */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            
            {/* Quick stats matched "District Overview" panel */}
            <Card className="rounded-xl border border-[#caf0f8]/80 shadow-sm shadow-[#caf0f8]/40 bg-white">
              <CardHeader className="p-4 pb-2 border-b border-[#caf0f8]">
                <CardTitle className="text-[13px] font-bold text-zinc-900 flex items-center gap-1.5">
                  <CheckCircle size={14} weight="bold" className="text-[#0077b6]" />
                  Inventory Levels
                </CardTitle>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-medium leading-tight">Baled & Ready vs Raw Intake</p>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {[
                  { label: "PET", desc: "Polyethylene", val: totalPET, status: "bg-[#0077b6]" },
                  { label: "HDPE", desc: "High-Density", val: totalHDPE, status: "bg-amber-500" },
                  { label: "LDPE", desc: "Low-Density", val: totalLDPE, status: "bg-indigo-600" },
                  { label: "PP", desc: "Polypropylene", val: totalPP, status: "bg-emerald-500" },
                ].map((z, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${z.status} shadow-sm`} />
                        <div className="flex gap-1 items-baseline">
                          <span className="text-[12px] font-bold text-zinc-800 leading-none">{z.label}</span>
                          <span className="text-[9px] text-zinc-400 font-medium tracking-wide">({z.desc})</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-extrabold text-zinc-900">{z.val.toFixed(1)} <span className="font-medium text-[9px] text-zinc-500">kg</span></span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${z.status}`}
                        style={{ width: `${getPercent(z.val)}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Capacity Used</span>
                    <span className="text-[12px] font-black text-[#0077b6]">68%</span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    <div className="flex-1 bg-[#0077b6] rounded-full shadow-sm"></div>
                    <div className="flex-1 bg-[#0077b6] rounded-full shadow-sm"></div>
                    <div className="flex-1 bg-[#0077b6] rounded-full shadow-sm"></div>
                    <div className="flex-1 bg-zinc-100 rounded-full border border-zinc-200"></div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Live Processing Queue matching Admin Alerts style */}
            <Card className="rounded-2xl border border-[#caf0f8]/80 shadow-md shadow-[#caf0f8]/60 bg-white">
              <CardHeader className="p-4 pb-3 border-b border-[#caf0f8]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <Clock size={16} weight="fill" className="text-[#00b4d8]" />
                    Live Processing Queue
                  </CardTitle>
                  <span className="text-[10px] font-bold text-[#0077b6] flex items-center gap-0.5 hover:underline cursor-pointer">
                    View queue <ArrowRight size={10} />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {/* Processing Item 1 */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl" />
                  <div className="pl-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Recycle size={14} weight="fill" className="text-emerald-500 animate-spin-slow" />
                        <span className="font-bold text-zinc-900 text-[12px]">Batch #8821 - PET Flakes</span>
                      </div>
                      <span className="text-[8px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600">
                        WASHING
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-medium mb-1.5">Started 2h 15m ago • Goal: 2.5 Tons</p>
                    <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Processing Item 2 */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-xl" />
                  <div className="pl-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Recycle size={14} weight="fill" className="text-amber-500 animate-spin-slow" />
                        <span className="font-bold text-zinc-900 text-[12px]">Batch #8824 - HDPE Crushed</span>
                      </div>
                      <span className="text-[8px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">
                        SHREDDING
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-medium mb-1.5">Started 45m ago • Goal: 1.2 Tons</p>
                    <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                 </div>
              </CardContent>
            </Card>

            {/* Eco Impact matched Admin green badge/dark card aesthetic */}
            <Card className="rounded-2xl border-0 shadow-lg shadow-emerald-100 bg-gradient-to-br from-emerald-800 to-emerald-950 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700"></div>
              <CardHeader className="p-5 pb-2 relative z-10">
                 <CardTitle className="text-sm font-bold text-emerald-50 flex items-center gap-2">
                    <Tree size={16} weight="fill" className="text-emerald-400" />
                    Eco Impact Generation
                  </CardTitle>
                  <p className="text-[11px] text-emerald-200/60 font-medium">Estimated global equivalence</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4 relative z-10">
                <div className="flex items-center gap-4 border-b border-emerald-700/50 pb-4">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl shadow-inner shadow-emerald-200">
                    <Tree size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{treesSaved}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Trees Saved Equiv.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl shadow-inner shadow-cyan-200">
                    <Drop size={20} weight="fill" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{waterSaved.toLocaleString()}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Liters Water Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
      
      {/* Universal FAQ Section */}
      <FAQSection />
    </div>
  );
}
