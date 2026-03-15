"use client";

import * as React from "react";
import { PaperPlaneRight, Robot, X, ChatTeardropText } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "bot";
  text: string;
}

export function WasteChatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "bot",
      text: "Hello! I'm EcoBot. How can I assist you with waste sorting or disposal today?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      const botMessage: Message = { role: "bot", text: result.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to fetch chat reply:", error);
      const errorMessage: Message = {
        role: "bot",
        text: "I'm currently unable to connect to the server. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:shadow-emerald-600/20 transition-all flex items-center justify-center p-0 border-2 border-white/10"
              aria-label="Open support chat"
            >
              <ChatTeardropText size={28} weight="fill" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 sm:right-6 lg:right-8 z-50"
          >
            <Card className="w-[calc(100vw-32px)] sm:w-[400px] shadow-2xl border-0 overflow-hidden flex flex-col max-h-[calc(100vh-[120px])] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 rounded-2xl mx-auto sm:mx-0">
              <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm border-b border-white/10 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                      <Robot size={20} weight="duotone" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px] leading-none tracking-tight">EcoBot Support</h3>
                      <p className="text-xs text-emerald-100 mt-1 font-medium">Virtual Assistant</p>
                    </div>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => setIsOpen(false)}
                   className="text-white/80 hover:bg-white/20 hover:text-white rounded-full h-8 w-8 transition-colors shrink-0"
                 >
                   <X size={18} weight="bold" />
                   <span className="sr-only">Close</span>
                 </Button>
              </CardHeader>

              <CardContent className="p-0 flex-1 overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10">
                <ScrollArea className="h-[380px] w-full p-4" ref={scrollAreaRef}>
                  <div className="space-y-4 pr-3">
                    {messages.map((message, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index}
                        className={cn(
                          "flex w-fit max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-2.5 text-[14px] shadow-sm tracking-tight overflow-wrap-anywhere whitespace-normal",
                          message.role === "user"
                            ? "ml-auto bg-emerald-600 text-white rounded-tr-sm font-medium"
                            : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-sm border border-zinc-200/60 dark:border-zinc-800 font-normal leading-relaxed"
                        )}
                      >
                        {message.text}
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <div className="bg-white dark:bg-zinc-900 text-zinc-500 rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800 shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center gap-2 relative"
                >
                  <Input
                    id="message"
                    placeholder="Ask EcoBot..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800 focus-visible:ring-emerald-500 h-10 px-4 rounded-full text-sm placeholder:text-zinc-400"
                    autoComplete="off"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm rounded-full h-10 w-10 transition-all disabled:opacity-50"
                  >
                    <PaperPlaneRight size={18} weight="fill" className={cn(input.trim() ? "translate-x-0.5" : "")} />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
