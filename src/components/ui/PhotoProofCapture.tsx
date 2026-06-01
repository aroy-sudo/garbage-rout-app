"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, CheckCircle } from "lucide-react";
import { uploadEprProof } from "@/app/actions/verification-actions";
import { toast } from "sonner";

interface PhotoProofCaptureProps {
  onUploadComplete: (imageUrl: string) => void;
  className?: string;
}

export default function PhotoProofCapture({
  onUploadComplete,
  className,
}: PhotoProofCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleTriggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Generate instantaneous object URL for fast worker visual feedback
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadEprProof(formData);
      if (result.error) {
        toast.error(`Compliance Upload Failed: ${result.error}`);
        setPreviewUrl(null);
      } else if (result.url) {
        toast.success("EPR Compliance Photo Verified & Logged!");
        onUploadComplete(result.url);
      }
    } catch (err) {
      console.error("Camera snap upload failed:", err);
      toast.error("Network error during compliance upload.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clean up input buffer so matching files trigger change correctly
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className || ""}`}>
      {/* Hidden input configured specifically for Android & iOS rear environment cameras */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="camera-upload"
      />

      {previewUrl && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Compliance Proof Snap Preview"
            className="object-cover w-full h-full"
          />
          {!isUploading && (
            <div className="absolute top-2 right-2 bg-emerald-500/95 text-white rounded-full p-1.5 shadow-md flex items-center justify-center animate-bounce">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant={previewUrl && !isUploading ? "secondary" : "default"}
        size="lg"
        disabled={isUploading}
        onClick={handleTriggerCamera}
        className={`w-full min-h-[50px] relative transition-all duration-300 font-medium ${
          isUploading
            ? "border-zinc-200 dark:border-zinc-800"
            : "hover:bg-emerald-600 bg-emerald-500 hover:text-white text-white border-none"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
            <span>Uploading Compliance Proof...</span>
          </>
        ) : previewUrl ? (
          <>
            <Camera className="mr-2 h-4 w-4 text-white" />
            <span>Retake Compliance Photo</span>
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4 text-white" />
            <span>Capture EPR Photo Proof</span>
          </>
        )}
      </Button>
    </div>
  );
}
