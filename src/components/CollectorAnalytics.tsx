"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Truck, Recycle, TrendingUp, IndianRupee } from "lucide-react";

// Mock Data for Collection Volume (Last 7 Days)
const weeklyData = [
  { day: "Mon", kg: 45 },
  { day: "Tue", kg: 52 },
  { day: "Wed", kg: 38 },
  { day: "Thu", kg: 65 },
  { day: "Fri", kg: 48 },
  { day: "Sat", kg: 70 },
  { day: "Sun", kg: 85 },
];

// Mock Data for Plastic Breakdown
const plasticBreakdownData = [
  { name: "PET", value: 120, color: "#059669" }, // Emerald-600
  { name: "HDPE", value: 85, color: "#d97706" }, // Amber-600
  { name: "LDPE", value: 50, color: "#2563eb" }, // Blue-600
  { name: "PP", value: 65, color: "#7c3aed" }, // Violet-600
];

const barChartConfig = {
  kg: {
    label: "Collected (kg)",
    color: "#059669", 
  },
} satisfies ChartConfig;

const pieChartConfig = {
  PET: { label: "PET", color: "#059669" },
  HDPE: { label: "HDPE", color: "#d97706" },
  LDPE: { label: "LDPE", color: "#2563eb" },
  PP: { label: "PP", color: "#7c3aed" },
} satisfies ChartConfig;

export default function CollectorAnalytics() {
  return (
    <div className="w-full space-y-6 mb-8">
      {/* Top Row: KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
            <Truck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+18% vs last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plastic Collected</CardTitle>
            <Recycle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">403 kg</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments Disbursed</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹ 12,450</div>
            <p className="text-xs text-muted-foreground">To local residents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
            <p className="text-xs text-muted-foreground">Fuel saved via AI routing</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Collection Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="min-h-[250px] w-full max-h-[300px]">
              <BarChart accessibilityLayer data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
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
                <Bar dataKey="kg" fill="var(--color-kg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Material Breakdown (This Month)</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center pb-0">
              <ChartContainer config={pieChartConfig} className="min-h-[250px] w-full max-h-[300px]">
               <PieChart>
                 <Pie
                   data={plasticBreakdownData}
                   cx="50%"
                   cy="50%"
                   labelLine={false}
                   outerRadius={100}
                   fill="#8884d8"
                   dataKey="value"
                 >
                   {plasticBreakdownData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <ChartTooltip content={<ChartTooltipContent />} />
               </PieChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
