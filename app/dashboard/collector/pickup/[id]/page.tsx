"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PickupRequest } from "@/src/types/database";

const RATES = {
  PET: 32,
  HDPE: 45,
  LDPE: 55,
  PP: 35
};

export default function CollectorPickupInvoice() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PickupRequest | null>(null);
  
  const [pet, setPet] = useState<string>('');
  const [hdpe, setHdpe] = useState<string>('');
  const [ldpe, setLdpe] = useState<string>('');
  const [pp, setPp] = useState<string>('');

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error("Pickup request not found.");
        router.push("/dashboard/collector");
      } else {
        setRequest(data as PickupRequest);
      }
      setLoading(false);
    };

    fetchRequest();
  }, [id, router, supabase]);

  const calculateTotal = () => {
    return (
      (parseFloat(pet) || 0) * RATES.PET +
      (parseFloat(hdpe) || 0) * RATES.HDPE +
      (parseFloat(ldpe) || 0) * RATES.LDPE +
      (parseFloat(pp) || 0) * RATES.PP
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    
    if (total <= 0) {
      toast.error('Please enter at least some weight to process.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('pickup_requests')
      .update({ 
        status: 'collected', 
        payment_amount: total, 
        payment_status: 'pending',
        pet_weight: parseFloat(pet) || 0,
        hdpe_weight: parseFloat(hdpe) || 0,
        ldpe_weight: parseFloat(ldpe) || 0,
        pp_weight: parseFloat(pp) || 0,
        collector_id: user?.id || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error submitting invoice:', error);
      toast.error('Failed to submit invoice.');
    } else {
      toast.success(`Invoice Submitted! Offer of ₹${total.toFixed(2)} sent to resident.`);
      router.push('/dashboard/collector');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500">Loading invoice details...</div>;
  }

  if (!request) return null;

  const totalAmount = calculateTotal();

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black font-mono">
      <div className="w-full max-w-4xl flex items-center mb-8 gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-1">
            Process Pickup Invoice
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Pickup ID: <span className="font-semibold">{request.id}</span>
          </p>
        </div>
      </div>

      <Card className="w-full max-w-4xl shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 pb-6 rounded-t-xl">
          <CardTitle className="text-xl text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> 
            Record Collected Plastics
          </CardTitle>
          <CardDescription className="text-zinc-600 dark:text-zinc-400">
            Enter the exact weight (in kg) for each plastic type collected from the resident. Rates are fixed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold w-1/3">Material Type</th>
                    <th className="p-4 font-semibold text-center w-1/4">Rate (₹/kg)</th>
                    <th className="p-4 font-semibold text-center w-1/4">Weight (kg)</th>
                    <th className="p-4 font-semibold text-right w-1/4">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-900 dark:text-zinc-100">
                  {/* PET Row */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">PET (#1)</p>
                      <p className="text-xs text-zinc-500">Beverage bottles, food jars</p>
                    </td>
                    <td className="p-4 text-center font-medium">₹{RATES.PET.toFixed(2)}</td>
                    <td className="p-4">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        placeholder="0.0"
                        value={pet} 
                        onChange={(e) => setPet(e.target.value)} 
                        className="text-center font-bold font-mono max-w-[120px] mx-auto focus-visible:ring-emerald-500" 
                      />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {((parseFloat(pet) || 0) * RATES.PET).toFixed(2)}
                    </td>
                  </tr>

                  {/* HDPE Row */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">HDPE (#2)</p>
                      <p className="text-xs text-zinc-500">Milk jugs, shampoo bottles</p>
                    </td>
                    <td className="p-4 text-center font-medium">₹{RATES.HDPE.toFixed(2)}</td>
                    <td className="p-4">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        placeholder="0.0"
                        value={hdpe} 
                        onChange={(e) => setHdpe(e.target.value)} 
                        className="text-center font-bold font-mono max-w-[120px] mx-auto focus-visible:ring-emerald-500" 
                      />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {((parseFloat(hdpe) || 0) * RATES.HDPE).toFixed(2)}
                    </td>
                  </tr>

                  {/* LDPE Row */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">LDPE (#4)</p>
                      <p className="text-xs text-zinc-500">Grocery bags, plastic wraps</p>
                    </td>
                    <td className="p-4 text-center font-medium">₹{RATES.LDPE.toFixed(2)}</td>
                    <td className="p-4">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        placeholder="0.0"
                        value={ldpe} 
                        onChange={(e) => setLdpe(e.target.value)} 
                        className="text-center font-bold font-mono max-w-[120px] mx-auto focus-visible:ring-emerald-500" 
                      />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {((parseFloat(ldpe) || 0) * RATES.LDPE).toFixed(2)}
                    </td>
                  </tr>

                  {/* PP Row */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">PP (#5)</p>
                      <p className="text-xs text-zinc-500">Yogurt containers, bottle caps</p>
                    </td>
                    <td className="p-4 text-center font-medium">₹{RATES.PP.toFixed(2)}</td>
                    <td className="p-4">
                      <Input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        placeholder="0.0"
                        value={pp} 
                        onChange={(e) => setPp(e.target.value)} 
                        className="text-center font-bold font-mono max-w-[120px] mx-auto focus-visible:ring-emerald-500" 
                      />
                    </td>
                    <td className="p-4 text-right font-medium">
                      {((parseFloat(pp) || 0) * RATES.PP).toFixed(2)}
                    </td>
                  </tr>

                  {/* Grand Total Row */}
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td colSpan={3} className="p-6 text-right font-bold text-lg text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                      Total Offer Amount
                    </td>
                    <td className="p-6 text-right font-bold text-2xl text-emerald-700 dark:text-emerald-500">
                      ₹{totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-b-xl flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-md">
                Submit Invoice & Complete Pickup
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
