"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client"; // Adjust to @/src/utils... if needed
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PickupRequest = {
  id: string;
  status: string;
  created_at: string;
  latitude: number;
  longitude: number;
};

export default function PickupStatusTable() {
  const supabase = createClient();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRequests = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("pickup_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as PickupRequest[]);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter the data for our tabs
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const completedRequests = requests.filter((req) => req.status === "collected");

  // Helper to format the ugly database timestamps into a clean, readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Reusable table render function
  const renderTable = (data: PickupRequest[]) => (
    <ScrollArea className="h-[300px] rounded-md border">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location (Lat, Lng)</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-zinc-500 h-24">
                No requests found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{formatDate(req.created_at)}</TableCell>
                <TableCell className="text-zinc-500">
                  {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={req.status === "collected" ? "default" : "secondary"}
                    className={
                      req.status === "collected"
                        ? "bg-[#e8fccf] text-[#134611] hover:bg-[#96e072]/50 border-none"
                        : "bg-[#96e072]/30 text-[#3e8914] hover:bg-[#96e072]/50 border-none"
                    }
                  >
                    {req.status === "collected" ? "Collected" : "Pending AI Route"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );

  return (
    <Card className="w-full shadow-sm border-[#e8fccf]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Collection Activity Log</CardTitle>
          <CardDescription>Real-time status of all village reporting.</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchRequests} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">
              Pending <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">{pendingRequests.length}</span>
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable(requests)}</TabsContent>
          <TabsContent value="pending">{renderTable(pendingRequests)}</TabsContent>
          <TabsContent value="completed">{renderTable(completedRequests)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}