"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendUp,
  TrendDown,
  WarningDiamond,
  MapTrifold,
  Users,
  Cloud,
  Recycle,
  ChartBar,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FAQSection from "@/src/components/FAQSection";

const AdminMap = dynamic(() => import("@/src/components/AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-purple-50 animate-pulse rounded-b-2xl flex items-center justify-center">
      <div className="text-purple-300 text-sm font-medium tracking-wide">Loading map…</div>
    </div>
  ),
});

const AdminHeatmap = dynamic(() => import("@/src/components/AdminHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-muted rounded-xl animate-pulse">
      Loading Heatmap...
    </div>
  ),
});

const stats = [
  {
    label: "Total Plastic Collected",
    value: "1,240.5",
    unit: "MT",
    change: "+12.4%",
    positive: true,
    icon: Recycle,
    lightBg: "from-purple-50 to-purple-100/60",
    iconBg: "bg-purple-900",
    ringPct: 82,
  },
  {
    label: "CO₂ Offset Avoided",
    value: "850.2",
    unit: "MT",
    change: "+8.1%",
    positive: true,
    icon: Cloud,
    lightBg: "from-purple-50 to-purple-100/60",
    iconBg: "bg-purple-700",
    ringPct: 64,
  },
  {
    label: "Reporting Villages",
    value: "94%",
    unit: "452 / 480",
    change: "+2.3%",
    positive: true,
    icon: MapTrifold,
    lightBg: "from-purple-50 to-purple-100/60",
    iconBg: "bg-purple-900",
    ringPct: 94,
  },
  {
    label: "Active Workers",
    value: "1,842",
    unit: "On-field",
    change: "-0.5%",
    positive: false,
    icon: Users,
    lightBg: "from-purple-50 to-purple-100/60",
    iconBg: "bg-purple-700",
    ringPct: 76,
  },
];

const weeklyData = [
  { day: "M", value: 30, label: "120 MT" },
  { day: "T", value: 48, label: "192 MT" },
  { day: "W", value: 42, label: "168 MT" },
  { day: "T", value: 68, label: "272 MT" },
  { day: "F", value: 82, label: "328 MT" },
  { day: "S", value: 58, label: "232 MT" },
  { day: "S", value: 100, label: "400 MT" },
];

const villages = [
  { name: "Greenwood Tanda", district: "Raipur Central", mt: 12.4, pts: 4200, pct: 95, status: "Excellent", statusColor: "text-purple-900 bg-purple-100" },
  { name: "Bhopalganj", district: "North Raipur", mt: 11.1, pts: 3850, pct: 88, status: "Good", statusColor: "text-purple-700 bg-purple-100" },
  { name: "Nagpur West", district: "South Raipur", mt: 9.8, pts: 3120, pct: 82, status: "Good", statusColor: "text-purple-700 bg-purple-100" },
  { name: "Keshavpuram", district: "East Raipur", mt: 6.2, pts: 1980, pct: 54, status: "Warning", statusColor: "text-red-700 bg-red-100" },
];

const alerts = [
  {
    name: "Dhanora East",
    district: "Sector B, Raipur",
    badge: "72h Overdue",
    badgeColor: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    accentBg: "bg-red-500",
    cardBg: "bg-red-50/70",
    desc: "Zero data since Monday. Logistics failure suspected.",
    icon: XCircle,
    iconColor: "text-red-500",
    actions: [
      { label: "Assign Team", cls: "bg-red-600 hover:bg-red-700 text-white" },
      { label: "Details", cls: "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 shadow-none" },
    ],
  },
  {
    name: "Pipal Village",
    district: "West Raipur",
    badge: "54h Overdue",
    badgeColor: "bg-zinc-200 text-zinc-700",
    borderColor: "border-zinc-200",
    accentBg: "bg-zinc-400",
    cardBg: "bg-zinc-50/70",
    desc: "Intermittent network. No weight uploaded.",
    icon: Clock,
    iconColor: "text-zinc-500",
    actions: [{ label: "Check Status", cls: "bg-purple-700 hover:bg-purple-800 text-white" }],
  },
  {
    name: "Keshavpuram",
    district: "East Raipur",
    badge: "49h Overdue",
    badgeColor: "bg-amber-100 text-amber-700",
    borderColor: "border-amber-200",
    accentBg: "bg-amber-400",
    cardBg: "bg-amber-50/50",
    desc: "Partial collection 0.2 MT. Threshold not met.",
    icon: WarningDiamond,
    iconColor: "text-amber-500",
    actions: [{ label: "Review", cls: "bg-amber-600 hover:bg-amber-700 text-white" }],
  },
];

export default function AdminDashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-6">

      {/* ── Page Heading ── */}
        <div className="mb-2 pb-4 border-b border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-purple-900 dark:text-purple-400 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Oversee district-wide waste operations, monitor SHG performance, and manage field teams in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="#faq" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-semibold text-purple-900 hover:text-purple-700 transition-colors cursor-pointer bg-purple-50 px-4 py-2 rounded-xl"
            >
              FAQ
            </a>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            const circumference = 2 * Math.PI * 20;
            const offset = circumference - (s.ringPct / 100) * circumference;
            return (
              <Card
                key={s.label}
                className={`rounded-2xl border-0 shadow-md shadow-purple-100/60 overflow-hidden bg-gradient-to-br ${s.lightBg} relative group cursor-default transition-transform hover:-translate-y-0.5`}
              >
                {/* Decorative circle */}
                <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${s.iconBg} shadow-lg`}>
                      <Icon size={18} weight="bold" className="text-white" />
                    </div>
                    {/* Mini SVG ring */}
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
                  <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${s.positive ? 'bg-white/70 text-purple-700' : 'bg-white/70 text-red-600'}`}>
                    {s.positive ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                    {s.change} vs last month
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statewide Waste Accumulation Card */}
        <Card className="rounded-2xl border border-purple-100/80 shadow-md shadow-purple-100/40 overflow-hidden bg-white">
          <CardHeader className="border-b border-purple-50 p-5 shrink-0 bg-gradient-to-r from-white to-purple-50/50">
            <CardTitle className="text-base font-bold text-zinc-900">Statewide Waste Accumulation</CardTitle>
            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
              Live regional density mapping of accumulated plastic waste across Chhattisgarh
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <AdminHeatmap />
          </CardContent>
        </Card>

        {/* ── Main 3-col grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: Map + Chart + Table */}
          <div className="xl:col-span-2 space-y-5">

            {/* Map Card */}
            <Card className="rounded-2xl border border-purple-100/80 shadow-md shadow-purple-100/40 overflow-hidden flex flex-col h-[480px] bg-white">
              <CardHeader className="border-b border-purple-50 p-5 shrink-0 flex flex-row items-center justify-between bg-gradient-to-r from-white to-purple-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-700">
                    <MapTrifold size={16} weight="bold" className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-900">Regional Collection Heatmap</CardTitle>
                    <p className="text-[11px] font-medium text-zinc-400 mt-0.5">Live · Raipur district · SHG zones</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-1 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> On-track
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 border border-red-100 text-red-600 px-2.5 py-1 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Overdue
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative overflow-hidden">
                <AdminMap />
              </CardContent>
            </Card>

            {/* Chart + Table row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Bar chart */}
              <Card className="lg:col-span-2 rounded-2xl border border-purple-100/80 shadow-md shadow-purple-100/40 bg-white">
                <CardHeader className="p-5 pb-3 border-b border-purple-50">
                  <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <ChartBar size={16} weight="bold" className="text-purple-600" />
                    Weekly Collection
                  </CardTitle>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Metric Tons · current week</p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-4">
                  <div className="flex items-end justify-between h-[160px] gap-1.5">
                    {weeklyData.map((b, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 flex-1 group cursor-default"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        {hovered === i && (
                          <div className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1 py-0.5 rounded whitespace-nowrap">
                            {b.label}
                          </div>
                        )}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            b.value === 100
                              ? 'bg-gradient-to-b from-purple-600 to-purple-800 shadow-md shadow-purple-300'
                              : hovered === i
                              ? 'bg-purple-400'
                              : 'bg-purple-200 group-hover:bg-purple-300'
                          }`}
                          style={{ height: `${b.value * 1.4}px` }}
                        />
                        <span className="text-[10px] font-bold text-zinc-400">{b.day}</span>
                      </div>
                    ))}
                  </div>
                  {/* X-axis label */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">This week peak: <span className="text-purple-700 font-bold">400 MT</span></span>
                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5 hover:underline cursor-pointer">View all <ArrowRight size={10} /></span>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="lg:col-span-3 rounded-2xl border border-purple-100/80 shadow-md shadow-purple-100/40 bg-white overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-purple-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-900">Top Performing Villages</CardTitle>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Last 30 days</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5 hover:underline cursor-pointer whitespace-nowrap">
                    All villages <ArrowRight size={10} />
                  </span>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50/70 to-purple-50/30 border-b border-purple-100/60">
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 min-w-[130px]">Village</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">MT</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">Points</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 min-w-[120px]">Compliance</th>
                        <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {villages.map((v, i) => (
                        <tr key={i} className="border-b border-zinc-50 hover:bg-purple-50/40 transition-colors cursor-default group">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-zinc-900 text-[13px] group-hover:text-purple-800 transition-colors whitespace-nowrap">{v.name}</p>
                            <p className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">{v.district}</p>
                          </td>
                          <td className="px-3 py-3.5 font-bold text-zinc-900 whitespace-nowrap">{v.mt}</td>
                          <td className="px-3 py-3.5 text-zinc-600 font-medium whitespace-nowrap">{v.pts.toLocaleString()}</td>
                          <td className="px-3 py-3.5 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-700"
                                  style={{ width: `${v.pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">{v.pct}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide whitespace-nowrap ${v.statusColor}`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Right: Alerts */}
          <div className="xl:col-span-1 flex flex-col gap-5">

            {/* Alerts header card */}
            <Card className="rounded-2xl border border-red-100/80 shadow-md shadow-red-50/60 bg-white">
              <CardHeader className="p-5 pb-3 border-b border-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <WarningDiamond size={17} weight="fill" className="text-red-500" />
                    Critical Alerts
                  </CardTitle>
                  <span className="bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow shadow-red-200">12</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">3 require immediate action</p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {alerts.map((a, i) => {
                  const AIcon = a.icon;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border ${a.borderColor} ${a.cardBg} p-4 relative overflow-hidden group`}
                    >
                      {/* Left accent bar */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${a.accentBg} rounded-l-xl`} />
                      <div className="pl-2">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <AIcon size={14} weight="fill" className={a.iconColor} />
                            <span className="font-bold text-zinc-900 text-[13px]">{a.name}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md ${a.badgeColor}`}>
                            {a.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium mb-0.5">{a.district}</p>
                        <p className="text-xs text-zinc-600 mb-3 leading-relaxed">{a.desc}</p>
                        <div className="flex gap-1.5">
                          {a.actions.map((act, j) => (
                            <Button key={j} size="sm" className={`text-[11px] font-bold px-3 h-7 rounded-lg ${act.cls}`}>
                              {act.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="w-full text-center text-[11px] font-bold text-purple-700 hover:text-purple-900 py-2 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
                  View all 12 alerts <ArrowRight size={12} weight="bold" />
                </button>
              </CardContent>
            </Card>

            {/* Quick stats sidebar card */}
            <Card className="rounded-2xl border border-purple-100/80 shadow-md shadow-purple-100/40 bg-white flex-1">
              <CardHeader className="p-5 pb-3 border-b border-purple-50">
                <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="text-purple-600" />
                  District Overview
                </CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">Zone performance breakdown</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {[
                  { zone: "Central Raipur", pct: 96, collected: "12.4 MT", status: "bg-purple-900" },
                  { zone: "North Raipur", pct: 72, collected: "8.1 MT", status: "bg-purple-600" },
                  { zone: "South Raipur", pct: 38, collected: "4.2 MT", status: "bg-red-500" },
                  { zone: "East Raipur", pct: 85, collected: "9.6 MT", status: "bg-purple-800" },
                ].map((z, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${z.status}`} />
                        <span className="text-xs font-semibold text-zinc-700">{z.zone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-zinc-400">{z.collected}</span>
                        <span className="text-[10px] font-extrabold text-zinc-700">{z.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-700 ${z.status}`}
                        style={{ width: `${z.pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Avg. collection rate</span>
                    <span className="font-extrabold text-purple-700">72.75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
        
        {/* Universal FAQ Section */}
        <FAQSection />
    </div>
  );
}
