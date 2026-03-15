"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Recycle, TrendingUp, Leaf, IndianRupee, Wallet } from "lucide-react";

// Fake data to prove concept to the judges
const chartData = [
  { month: "Jan", plastic: 400, earnings: 4500 },
  { month: "Feb", plastic: 300, earnings: 3800 },
  { month: "Mar", plastic: 550, earnings: 6200 },
  { month: "Apr", plastic: 450, earnings: 5100 },
  { month: "May", plastic: 700, earnings: 8500 },
  { month: "Jun", plastic: 850, earnings: 10200 },
];

// Shadcn's strict configuration object for chart styling
const chartConfig = {
  plastic: {
    label: "Plastic Collected (kg)",
    color: "#3da35d", // Emerald/Jade from custom palette
  },
  earnings: {
    label: "Earnings (Rs)",
    color: "#96e072", // Light Lime Green from custom palette
  }
} satisfies ChartConfig;

export default function AnalyticsDashboard() {
  return (
    <div className="w-full space-y-6 mb-8">
      {/* Top Row: KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-0 shadow-md shadow-[#134611]/10 overflow-hidden bg-gradient-to-br from-[#e8fccf] to-[#e8fccf]/60 relative group cursor-default transition-transform hover:-translate-y-0.5">
          <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#134611]">Total Plastic Recovered</CardTitle>
            <div className="p-2 rounded-xl bg-[#3da35d] shadow-lg">
              <Recycle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-[#134611]">3,250 kg</div>
            <p className="text-xs text-[#3e8914]">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-md shadow-[#134611]/10 overflow-hidden bg-gradient-to-br from-[#96e072]/30 to-[#96e072]/10 relative group cursor-default transition-transform hover:-translate-y-0.5">
          <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#134611]">CO2 Emissions Avoided</CardTitle>
            <div className="p-2 rounded-xl bg-[#3e8914] shadow-lg">
              <Leaf className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-[#134611]">4,875 kg</div>
            <p className="text-xs text-[#3e8914]">+12% vs open burning</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-md shadow-[#134611]/10 overflow-hidden bg-gradient-to-br from-[#e8fccf] to-[#e8fccf]/60 relative group cursor-default transition-transform hover:-translate-y-0.5">
          <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#134611]">SHG Earnings Distributed</CardTitle>
            <div className="p-2 rounded-xl bg-[#3da35d] shadow-lg">
              <IndianRupee className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-[#134611]">₹ 65,000</div>
            <p className="text-xs text-[#3e8914]">Across 12 villages</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-0 shadow-md shadow-[#134611]/10 overflow-hidden bg-gradient-to-br from-[#96e072]/30 to-[#96e072]/10 relative group cursor-default transition-transform hover:-translate-y-0.5">
          <div className="absolute -bottom-5 -right-5 w-28 h-28 rounded-full bg-white/30 blur-sm" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-[#134611]">Active Collection Routes</CardTitle>
            <div className="p-2 rounded-xl bg-[#3e8914] shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-[#134611]">8</div>
            <p className="text-xs text-[#3e8914]">Optimized daily by AI</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: The Modern Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#e8fccf] shadow-sm">
          <CardHeader>
            <CardTitle>Collection Volume (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-h-[300px]">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}kg`}
                  fontSize={12}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="plastic" fill="var(--color-plastic)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-[#e8fccf] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Money Earned Through Recycling</CardTitle>
            <Wallet className="h-4 w-4 text-[#3e8914]" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-h-[300px]">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tickMargin={10} 
                  axisLine={false} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value}`}
                  fontSize={12}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}