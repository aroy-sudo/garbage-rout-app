"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/src/hooks/useVoiceRecorder";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceWeightInputProps {
  onWeightExtracted: (weight: number) => void;
  className?: string;
}

/**
 * Robust multilingual weight parser matching English digits, Devanagari numerals,
 * and phonetic Hinglish translations used in rural communities.
 */
export function parseWeightText(text: string): number | null {
  const cleaned = text.toLowerCase().trim();

  // 1. Regex match for standard numeric sequences (e.g. "25", "10 kg", "15.5")
  const digitMatch = cleaned.match(/\d+(\.\d+)?/);
  if (digitMatch) {
    return Math.round(parseFloat(digitMatch[0]));
  }

  // 2. Multilingual number map (English, Hinglish phonetic, Devanagari Script)
  const wordToNumMap: { [key: string]: number } = {
    // Single units
    ek: 1, one: 1, एक: 1,
    do: 2, two: 2, दो: 2,
    teen: 3, three: 3, तीन: 3,
    chaar: 4, four: 4, चार: 4,
    paanch: 5, five: 5, पाँच: 5, पांच: 5,
    chhah: 6, six: 6, छह: 6, छः: 6,
    saat: 7, seven: 7, सात: 7,
    aath: 8, eight: 8, आठ: 8,
    nau: 9, nine: 9, नौ: 9,
    
    // Tens & commonly spoken weights
    das: 10, ten: 10, दस: 10,
    gyarah: 11, eleven: 11, ग्यारह: 11,
    baarah: 12, twelve: 12, बारह: 12,
    teerah: 13, thirteen: 13, तेरह: 13,
    chaudah: 14, fourteen: 14, चौदह: 14,
    pandraah: 15, fifteen: 15, पंद्रह: 15,
    solah: 16, sixteen: 16, सोलह: 16,
    satrah: 17, seventeen: 17, सत्रह: 17,
    atharah: 18, eighteen: 18, अठारह: 18,
    unnees: 19, nineteen: 19, उन्नीस: 19,
    bees: 20, twenty: 20, बीस: 20,
    pachis: 25, "twenty five": 25, पच्चीस: 25,
    tees: 30, thirty: 30, तीस: 30,
    chalis: 40, forty: 40, चालीस: 40,
    pachas: 50, fifty: 50, पचास: 50,
  };

  const words = cleaned.split(/[\s,.\-।]+/);
  for (const word of words) {
    if (wordToNumMap[word] !== undefined) {
      return wordToNumMap[word];
    }
  }

  return null;
}

export default function VoiceWeightInput({
  onWeightExtracted,
  className,
}: VoiceWeightInputProps) {
  const {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

  const [isProcessing, setIsProcessing] = useState(false);

  const processAudio = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      // Query standard Groq / Whisper API endpoint
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server transcribed with status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.text;

      if (!text || text.trim() === "") {
        toast.error("Could not capture any speech. Try speaking louder or closer.");
        return;
      }

      const weight = parseWeightText(text);
      if (weight !== null) {
        onWeightExtracted(weight);
        toast.success(`Speech Captured: "${text}" ➔ Logged ${weight} kg!`);
      } else {
        toast.error(`Detected text "${text}" but could not extract a numeric weight.`);
      }
    } catch (err) {
      console.error("Voice weight parser exception:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Transcription service offline: " + msg);
    } finally {
      setIsProcessing(false);
    }
  }, [onWeightExtracted]);

  // Trigger error toast if hook captures hardware or permission error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Automatically submit recorded audio for translation once recording is finished
  useEffect(() => {
    if (audioBlob) {
      processAudio(audioBlob);
    }
  }, [audioBlob, processAudio]);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className || ""}`}>
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        disabled={isProcessing}
        onClick={handleToggle}
        className={`w-full min-h-[50px] relative transition-all duration-300 font-medium ${
          isRecording
            ? "animate-pulse shadow-red-500/20 border-red-500 bg-red-600 hover:bg-red-700 text-white"
            : "hover:bg-zinc-50 hover:text-emerald-600 border-zinc-200 dark:border-zinc-800"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />
            <span>Processing Translation...</span>
          </>
        ) : isRecording ? (
          <>
            <Square className="mr-2 h-4 w-4 fill-white" />
            <span>Recording... Tap to Stop</span>
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Tap & Speak Weight</span>
          </>
        )}
      </Button>
      {isRecording && (
        <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider animate-pulse">
          Live Recording Active
        </span>
      )}
    </div>
  );
}
