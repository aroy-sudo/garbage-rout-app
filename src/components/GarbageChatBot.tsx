"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type BotStatus = "idle" | "listening" | "processing" | "speaking";

// ── Waveform bars shown while listening ──────────────────────────────────────
function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="gr-waveform">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="gr-bar"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}

// ── Pulsing ring around the FAB while speaking ───────────────────────────────
function PulseRing() {
  return (
    <>
      <span className="gr-pulse gr-pulse-1" />
      <span className="gr-pulse gr-pulse-2" />
    </>
  );
}

// ── Single chat bubble ───────────────────────────────────────────────────────
function Bubble({
  msg,
  onSpeak,
}: {
  msg: Message;
  onSpeak: (text: string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`gr-bubble-row ${isUser ? "gr-bubble-row--user" : "gr-bubble-row--bot"}`}
    >
      {!isUser && (
        <div className="gr-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      )}
      <div className={`gr-bubble ${isUser ? "gr-bubble--user" : "gr-bubble--bot"}`}>
        <p>{msg.content}</p>
        {!isUser && (
          <button className="gr-replay-btn" onClick={() => onSpeak(msg.content)} title="Replay audio">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="gr-bubble-row gr-bubble-row--bot">
      <div className="gr-avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <div className="gr-bubble gr-bubble--bot gr-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ── Browser TTS — only used if /api/speak fails ───────────────────────────────
function speakWithBrowser(text: string, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.0;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith("en") &&
      (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen"))
  );
  if (preferred) utt.voice = preferred;
  utt.onend = onEnd;
  utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

// ── Main component ───────────────────────────────────────────────────────────
export default function GarbageChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm EcoBot, your waste management assistant. Ask me about collection schedules, missed pickups, or disposal guidelines — or tap the mic to speak!",
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<BotStatus>("idle");
  const [isTyping, setIsTyping] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Pre-load browser voices on mount (Chrome requires this)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Stop whatever is currently playing ───────────────────────────────────
  const stopCurrent = useCallback(() => {
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  // ── Speak via Groq PlayAI TTS → /api/speak (returns audio/wav) ───────────
  const speak = useCallback(async (text: string) => {
    stopCurrent();
    setStatus("speaking");
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`TTS error ${res.status}`);

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("audio")) {
        // ✅ Normal path — Groq returned audio/wav
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.onended = () => { setStatus("idle"); URL.revokeObjectURL(url); };
        audio.onerror = () => { setStatus("idle"); URL.revokeObjectURL(url); };
        await audio.play();
      } else {
        throw new Error("Non-audio response from /api/speak");
      }
    } catch (err) {
      console.warn("Groq TTS failed, falling back to browser speech:", err);
      speakWithBrowser(text, () => setStatus("idle"));
    }
  }, [stopCurrent]);

  // ── Send a text message ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setStatus("processing");

    try {
      const history = [...messages, userMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error(`Chat error ${res.status}`);

      const data = await res.json();
      const reply = data.reply ?? "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
      await speak(reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
      setIsTyping(false);
      setStatus("idle");
    }
  }, [messages, speak]);

  // ── Start mic recording ───────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (status !== "idle") return;
    stopCurrent();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick the best supported mime type for Groq Whisper
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setStatus("processing");

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const form = new FormData();
        // Key must be "audio" — matches your /api/transcribe FormData key
        form.append("audio", blob, "audio.webm");

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          if (!res.ok) throw new Error(`Transcribe error ${res.status}`);
          const data = await res.json();

          if (data.text?.trim()) {
            await sendMessage(data.text.trim());
          } else {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "I didn't catch that — could you speak again or type your question?" },
            ]);
            setStatus("idle");
          }
        } catch {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Voice transcription failed. Please type your question instead." },
          ]);
          setStatus("idle");
        }
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setStatus("listening");
    } catch {
      alert("Microphone access was denied. Please allow microphone permission in your browser settings.");
    }
  }, [status, stopCurrent, sendMessage]);

  // ── Stop mic recording ────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleMicClick = () => {
    if (status === "listening") stopRecording();
    else if (status === "idle") startRecording();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const statusLabel: Record<BotStatus, string> = {
    idle: "Online",
    listening: "Listening…",
    processing: "Thinking…",
    speaking: "Speaking…",
  };

  const assistantMsgCount = messages.filter((m) => m.role === "assistant").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --gr-green: #22c55e;
          --gr-green-dark: #16a34a;
          --gr-surface: #0f1a13;
          --gr-surface-2: #162019;
          --gr-surface-3: #1e2e22;
          --gr-border: rgba(34,197,94,.18);
          --gr-text: #f0faf2;
          --gr-text-muted: #86efac;
          --gr-radius: 20px;
          --gr-fab: 56px;
        }

        .gr-root *, .gr-root *::before, .gr-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* FAB */
        .gr-fab-wrap {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .gr-fab {
          width: var(--gr-fab); height: var(--gr-fab); border-radius: 50%;
          border: none; cursor: pointer;
          background: linear-gradient(135deg, var(--gr-green) 0%, var(--gr-green-dark) 100%);
          box-shadow: 0 4px 24px rgba(34,197,94,.45), 0 1px 4px rgba(0,0,0,.3);
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 2;
          transition: transform .2s, box-shadow .2s; color: #fff;
        }
        .gr-fab:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(34,197,94,.6); }
        .gr-fab:active { transform: scale(.96); }

        /* Pulse rings */
        .gr-pulse {
          position: absolute; border-radius: 50%;
          background: rgba(34,197,94,.3); z-index: 1;
          animation: gr-pulse-anim 1.8s ease-out infinite;
        }
        .gr-pulse-1 { width: 72px; height: 72px; animation-delay: 0s; }
        .gr-pulse-2 { width: 88px; height: 88px; animation-delay: .5s; }
        @keyframes gr-pulse-anim {
          0%   { transform: scale(.8); opacity: .8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Panel */
        .gr-panel {
          position: fixed; bottom: 96px; right: 28px; z-index: 9998;
          width: 370px; max-width: calc(100vw - 32px);
          background: var(--gr-surface);
          border: 1px solid var(--gr-border);
          border-radius: var(--gr-radius);
          box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(34,197,94,.08);
          display: flex; flex-direction: column;
          overflow: hidden; font-family: 'DM Sans', sans-serif;
        }

        /* Header */
        .gr-header {
          background: linear-gradient(135deg, #162e1c 0%, #0f1a13 100%);
          border-bottom: 1px solid var(--gr-border);
          padding: 16px 18px; display: flex; align-items: center; gap: 12px;
        }
        .gr-header-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, var(--gr-green) 0%, var(--gr-green-dark) 100%);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(34,197,94,.4); color: #fff;
        }
        .gr-header-text { flex: 1; min-width: 0; }
        .gr-header-title { font-size: 15px; font-weight: 700; color: var(--gr-text); letter-spacing: -.2px; }
        .gr-header-status {
          font-size: 12px; color: var(--gr-text-muted);
          display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }
        .gr-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--gr-green); box-shadow: 0 0 6px var(--gr-green);
        }
        .gr-status-dot--busy { background: #facc15; box-shadow: 0 0 6px #facc15; }
        .gr-close-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,.06); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--gr-text-muted); transition: background .15s;
        }
        .gr-close-btn:hover { background: rgba(255,255,255,.12); color: var(--gr-text); }

        /* Voice status bar */
        .gr-voice-bar {
          padding: 7px 14px;
          background: rgba(34,197,94,.07);
          border-bottom: 1px solid var(--gr-border);
          display: flex; align-items: center; gap: 8px;
          font-size: 11.5px; color: var(--gr-green); font-weight: 600;
          letter-spacing: .01em;
        }

        /* Messages */
        .gr-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 10px;
          min-height: 300px; max-height: 380px;
          scrollbar-width: thin; scrollbar-color: var(--gr-border) transparent;
        }
        .gr-bubble-row { display: flex; align-items: flex-end; gap: 8px; }
        .gr-bubble-row--user { flex-direction: row-reverse; }
        .gr-avatar {
          width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
          background: var(--gr-surface-3); border: 1px solid var(--gr-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gr-green); margin-bottom: 2px;
        }
        .gr-bubble {
          max-width: 78%; padding: 10px 13px; border-radius: 16px;
          font-size: 13.5px; line-height: 1.55; position: relative;
        }
        .gr-bubble--bot {
          background: var(--gr-surface-3); color: var(--gr-text);
          border: 1px solid var(--gr-border); border-bottom-left-radius: 5px;
        }
        .gr-bubble--user {
          background: linear-gradient(135deg, var(--gr-green) 0%, var(--gr-green-dark) 100%);
          color: #fff; border-bottom-right-radius: 5px;
          box-shadow: 0 2px 12px rgba(34,197,94,.3);
        }
        .gr-replay-btn {
          position: absolute; top: 6px; right: 8px;
          width: 18px; height: 18px; border-radius: 5px;
          background: rgba(255,255,255,.08); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--gr-text-muted); opacity: 0; transition: opacity .15s;
        }
        .gr-bubble--bot:hover .gr-replay-btn { opacity: 1; }
        .gr-replay-btn:hover { background: rgba(255,255,255,.16); color: var(--gr-green); }

        /* Typing */
        .gr-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }
        .gr-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--gr-text-muted); display: block;
          animation: gr-typing-bounce .9s ease-in-out infinite;
        }
        .gr-typing span:nth-child(2) { animation-delay: .15s; }
        .gr-typing span:nth-child(3) { animation-delay: .3s; }
        @keyframes gr-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }

        /* Waveform */
        .gr-waveform { display: flex; gap: 3px; align-items: center; height: 20px; }
        .gr-bar {
          width: 3px; border-radius: 2px; background: var(--gr-green);
          animation: gr-bar-anim .8s ease-in-out infinite alternate;
        }
        .gr-bar:nth-child(1) { height: 8px; }
        .gr-bar:nth-child(2) { height: 16px; }
        .gr-bar:nth-child(3) { height: 12px; }
        .gr-bar:nth-child(4) { height: 18px; }
        .gr-bar:nth-child(5) { height: 9px; }
        @keyframes gr-bar-anim {
          from { transform: scaleY(.4); }
          to   { transform: scaleY(1); }
        }

        /* Input area */
        .gr-input-area {
          padding: 12px 14px;
          background: var(--gr-surface-2);
          border-top: 1px solid var(--gr-border);
          display: flex; align-items: center; gap: 8px;
        }
        .gr-text-input {
          flex: 1; background: var(--gr-surface-3);
          border: 1px solid var(--gr-border); border-radius: 12px;
          padding: 9px 13px; font-size: 13.5px; color: var(--gr-text);
          outline: none; transition: border-color .15s; font-family: inherit;
        }
        .gr-text-input::placeholder { color: rgba(134,239,172,.4); }
        .gr-text-input:focus { border-color: rgba(34,197,94,.45); }
        .gr-text-input:disabled { opacity: .5; cursor: not-allowed; }

        .gr-icon-btn {
          width: 38px; height: 38px; border-radius: 11px;
          border: none; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s, transform .1s;
        }
        .gr-icon-btn:active { transform: scale(.92); }
        .gr-icon-btn:disabled { opacity: .4; cursor: not-allowed; }

        .gr-mic-btn {
          background: var(--gr-surface-3);
          border: 1px solid var(--gr-border);
          color: var(--gr-text-muted);
        }
        .gr-mic-btn:not(:disabled):hover {
          border-color: rgba(34,197,94,.4); color: var(--gr-green);
        }
        .gr-mic-btn--listening {
          background: rgba(34,197,94,.18) !important;
          border-color: var(--gr-green) !important;
          color: var(--gr-green) !important;
          animation: gr-mic-pulse 1s ease-in-out infinite;
        }
        @keyframes gr-mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .gr-send-btn {
          background: linear-gradient(135deg, var(--gr-green) 0%, var(--gr-green-dark) 100%);
          color: #fff; box-shadow: 0 2px 8px rgba(34,197,94,.35);
        }
        .gr-send-btn:not(:disabled):hover { box-shadow: 0 4px 14px rgba(34,197,94,.5); }

        /* Badge */
        .gr-badge {
          position: absolute; top: -3px; right: -3px; z-index: 3;
          min-width: 18px; height: 18px; border-radius: 9px;
          background: #ef4444; border: 2px solid #0f1a13;
          font-size: 10px; font-weight: 700; color: #fff;
          display: flex; align-items: center; justify-content: center; padding: 0 4px;
        }

        /* Quick chips */
        .gr-chips {
          padding: 0 14px 12px;
          display: flex; gap: 6px; flex-wrap: wrap;
          background: var(--gr-surface-2);
        }
        .gr-chip {
          padding: 5px 11px; border-radius: 20px; font-size: 12px;
          background: var(--gr-surface-3); border: 1px solid var(--gr-border);
          color: var(--gr-text-muted); cursor: pointer;
          transition: background .15s, color .15s, border-color .15s;
          font-family: inherit; white-space: nowrap;
        }
        .gr-chip:not(:disabled):hover {
          background: rgba(34,197,94,.12);
          border-color: rgba(34,197,94,.35); color: var(--gr-green);
        }
        .gr-chip:disabled { opacity: .4; cursor: not-allowed; }
      `}</style>

      <div className="gr-root">
        {/* FAB */}
        <div className="gr-fab-wrap">
          {status === "speaking" && <PulseRing />}
          <motion.button
            className="gr-fab"
            onClick={() => setOpen((o) => !o)}
            whileTap={{ scale: 0.93 }}
            aria-label="Toggle chat"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.svg key="close"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </motion.svg>
              ) : (
                <motion.svg key="chat"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </motion.svg>
              )}
            </AnimatePresence>
            {!open && assistantMsgCount > 1 && (
              <span className="gr-badge">{assistantMsgCount}</span>
            )}
          </motion.button>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="gr-panel"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="gr-header">
                <div className="gr-header-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="gr-header-text">
                  <div className="gr-header-title">EcoBot — Waste Management AI</div>
                  <div className="gr-header-status">
                    <span className={`gr-status-dot ${status !== "idle" ? "gr-status-dot--busy" : ""}`} />
                    {statusLabel[status]}
                  </div>
                </div>
                <button className="gr-close-btn" onClick={() => setOpen(false)} aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Live voice status bar */}
              <AnimatePresence>
                {(status === "listening" || status === "speaking") && (
                  <motion.div
                    className="gr-voice-bar"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {status === "listening" ? (
                      <>
                        <WaveformBars active />
                        <span>Recording — tap mic again to stop</span>
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>EcoBot is speaking…</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="gr-messages">
                {messages.map((m, i) => (
                  <Bubble key={i} msg={m} onSpeak={speak} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Quick chips */}
              <div className="gr-chips">
                {["Collection schedule", "Missed pickup", "What can I recycle?", "Bulk waste"].map((chip) => (
                  <button
                    key={chip}
                    className="gr-chip"
                    onClick={() => sendMessage(chip)}
                    disabled={status !== "idle"}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="gr-input-area">
                <input
                  ref={inputRef}
                  className="gr-text-input"
                  placeholder={
                    status === "listening" ? "Listening…" :
                    status === "processing" ? "Thinking…" :
                    status === "speaking" ? "Speaking…" :
                    "Type a message…"
                  }
                  value={status === "listening" ? "" : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={status !== "idle"}
                />

                {/* Mic */}
                <button
                  className={`gr-icon-btn gr-mic-btn ${status === "listening" ? "gr-mic-btn--listening" : ""}`}
                  onClick={handleMicClick}
                  disabled={status === "processing" || status === "speaking"}
                  title={status === "listening" ? "Stop recording" : "Start voice input"}
                >
                  {status === "listening" ? (
                    <WaveformBars active />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>

                {/* Send */}
                <button
                  className="gr-icon-btn gr-send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || status !== "idle"}
                  title="Send message"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
