"use client";

import { useState } from "react";
import { autoDispatchRoutes } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminDispatchPanel() {
  const [capacity, setCapacity] = useState(400);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const dummyDrivers = ["driver-1", "driver-2", "driver-3"];
      const result = await autoDispatchRoutes(capacity, dummyDrivers);
      
      if (result.success) {
        toast.success(result.message || `Successfully generated ${result.routesGenerated} routes!`);
      } else {
        toast.error(result.message || "Failed to dispatch routes.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during dispatch.");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <Card className="shadow-lg border-blue-100 bg-white">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl font-bold text-blue-900">Route Dispatch Engine</CardTitle>
        </div>
        <CardDescription>
          Automatically group pending collections and assign trucks using CVRP constraints.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6 flex flex-col md:flex-row items-end gap-4">
        <div className="space-y-2 flex-1 md:flex-none">
          <Label htmlFor="capacity" className="text-sm font-semibold text-zinc-700">Max Truck Capacity (kg)</Label>
          <Input 
            id="capacity" 
            type="number" 
            value={capacity} 
            onChange={(e) => setCapacity(Number(e.target.value))} 
            className="w-full md:w-[200px]"
          />
        </div>
        
        <Button 
          onClick={handleDispatch} 
          disabled={isDispatching}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white h-10 px-8 font-semibold shadow-md"
        >
          {isDispatching ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Dispatching Routes...
            </>
          ) : (
            "Run Auto-Dispatch"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
