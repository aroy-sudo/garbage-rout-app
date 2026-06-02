"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PhotoProofCapture from "@/src/components/ui/PhotoProofCapture";
import { completePickupTransaction } from "@/app/actions/collector-actions";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface PickupTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: any;
  onComplete: (id: string) => void;
}

export function PickupTransactionSheet({
  isOpen,
  onClose,
  pickup,
  onComplete,
}: PickupTransactionSheetProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!pickup || !proofUrl) return;

    setIsSubmitting(true);
    try {
      const result = await completePickupTransaction(
        pickup.id,
        pickup.weight || pickup.weight_kg || 0,
        proofUrl
      );

      if (result.success) {
        toast.success(result.message || "Pickup completed!");
        onComplete(pickup.id);
        setProofUrl(null);
        onClose();
      } else {
        toast.error(result.error || "Failed to complete pickup.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl h-[85vh] flex flex-col gap-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-emerald-900">
            {pickup?.location_name || pickup?.id || "Unknown Location"}
          </SheetTitle>
          <p className="text-muted-foreground text-lg">
            Expected Weight: <span className="font-semibold text-zinc-900">{pickup?.weight || pickup?.weight_kg || 0} kg</span>
          </p>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 justify-center">
          <PhotoProofCapture onUploadComplete={(url) => setProofUrl(url)} />

          {proofUrl && (
            <div className="flex items-center justify-center p-4 bg-emerald-50 rounded-lg border border-emerald-100 gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <span className="font-medium text-emerald-800">Photo Proof Attached</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-100">
          <Button
            size="lg"
            className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-900/20"
            disabled={!proofUrl || isSubmitting}
            onClick={handleComplete}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Transaction...
              </>
            ) : (
              "Complete Pickup"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
