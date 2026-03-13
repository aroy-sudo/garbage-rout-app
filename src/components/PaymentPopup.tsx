"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PickupRequest } from "@/src/types/database";

export default function PaymentPopup() {
  const supabase = createClient();
  const [pendingPayment, setPendingPayment] = useState<PickupRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Initial fetch to see if there are any pending payments
    const fetchPendingPayments = async () => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pickup_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'collected')
        .eq('payment_status', 'pending');

      if (!error && data && data.length > 0) {
        // Just show the first one
        setPendingPayment(data[0] as PickupRequest);
        setIsOpen(true);
      }
    };

    fetchPendingPayments();

    // 2. Set up realtime subscription to listen for new 'collected' + 'pending' payment updates
    const subscription = supabase
      .channel('pickup_requests_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pickup_requests' },
        (payload) => {
          const updatedRequest = payload.new as PickupRequest;
          if (
            updatedRequest.status === 'collected' && 
            updatedRequest.payment_status === 'pending'
          ) {
            setPendingPayment(updatedRequest);
            setIsOpen(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleResponse = async (status: 'accepted' | 'declined') => {
    if (!pendingPayment) return;

    const { error } = await supabase
      .from('pickup_requests')
      .update({ payment_status: status })
      .eq('id', pendingPayment.id);

    if (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status.");
    } else {
      setIsOpen(false);
      setPendingPayment(null);
      if (status === 'accepted') {
        toast.success(`BADHAI HOO! Rs ${pendingPayment.payment_amount} earned! 🎉`, {
          duration: 5000,
          className: "bg-emerald-600 text-white border-none text-lg font-bold"
        });
      } else {
        toast.info("Payment declined.");
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment Offer from Collector</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-base text-zinc-900 dark:text-zinc-100 mt-4 space-y-4">
              <p>The collector has completed your pickup and recorded the following items:</p>
              
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-sm font-mono">
                {pendingPayment && pendingPayment.pet_weight > 0 && (
                  <div className="flex justify-between">
                    <span>PET (#1) - {pendingPayment.pet_weight}kg × ₹32</span>
                    <span>₹{(pendingPayment.pet_weight * 32).toFixed(2)}</span>
                  </div>
                )}
                {pendingPayment && pendingPayment.hdpe_weight > 0 && (
                  <div className="flex justify-between">
                    <span>HDPE (#2) - {pendingPayment.hdpe_weight}kg × ₹45</span>
                    <span>₹{(pendingPayment.hdpe_weight * 45).toFixed(2)}</span>
                  </div>
                )}
                {pendingPayment && pendingPayment.ldpe_weight > 0 && (
                  <div className="flex justify-between">
                    <span>LDPE (#4) - {pendingPayment.ldpe_weight}kg × ₹55</span>
                    <span>₹{(pendingPayment.ldpe_weight * 55).toFixed(2)}</span>
                  </div>
                )}
                {pendingPayment && pendingPayment.pp_weight > 0 && (
                  <div className="flex justify-between">
                    <span>PP (#5) - {pendingPayment.pp_weight}kg × ₹35</span>
                    <span>₹{(pendingPayment.pp_weight * 35).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-zinc-300 dark:border-zinc-700 pt-2 mt-2 flex justify-between font-bold text-base text-emerald-600 dark:text-emerald-400">
                  <span>Total Offer</span>
                  <span>₹{pendingPayment?.payment_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <p className="font-medium">Do you accept this offer?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel onClick={() => handleResponse('declined')}>
            Decline
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => handleResponse('accepted')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Accept Payment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
