"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Terminal,
  Send,
  Music,
  History as HistoryIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";

// --- Moving Dots Animation Component ---
const TypingDots = () => {
  return (
    <div className="flex gap-1.5 px-2 py-1 items-center">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-cyber-cyan rounded-full shadow-[0_0_5px_#00f3ff]"
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function ChatPanel({
  messages,
  input,
  setInput,
  handleSend,
  startNewChat,
  isLoading,
  onToggleLeft,
  onToggleRight,
}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section className="flex-1 flex flex-col h-full cyber-panel neon-border-cyan z-20 overflow-hidden md:clip-chamfer bg-black/20">
      {/* Header */}
      <div className="bg-black/40 p-3 md:p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3 ">
          <button
            onClick={onToggleLeft}
            className="xl:hidden p-2 text-cyber-cyan border border-cyber-cyan/30 hover:bg-cyber-cyan/10 transition-all clip-chamfer"
          >
            <Music size={18} />
          </button>

          <div className="flex items-center gap-2 md:gap-3 ">
            <div className="w-8 h-8 md:w-10 md:h-10 border border-cyber-cyan rounded-full p-0.5 shrink-0">
              <img
                src="/profile.jpg"
                className="w-full h-full rounded-full object-cover opacity-80"
                alt="profile"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black italic text-[10px] md:text-sm tracking-tighter text-cyber-cyan uppercase truncate max-w-[120px] xs:max-w-none">
                Senpai
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`w-1 h-1 rounded-full ${isLoading ? "bg-cyber-cyan animate-ping" : "bg-cyber-cyan animate-pulse"}`}
                />
                <span className="text-[6px] md:text-[8px] text-cyber-cyan/50 tracking-[0.2em]">
                  ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            disabled={isLoading}
            className={`p-2 border border-cyber-cyan text-cyber-cyan transition-all clip-chamfer ${isLoading ? "opacity-20 cursor-not-allowed" : "hover:bg-cyber-cyan hover:text-black"}`}
          >
            <Plus size={20} />
          </button>

          <button
            onClick={onToggleRight}
            className="lg:hidden p-2 text-cyber-magenta border border-cyber-magenta/30 hover:bg-cyber-magenta/10 transition-all clip-chamfer"
          >
            <HistoryIcon size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-cyber">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Terminal size={32} className="mb-2" />
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em]">
              Awaiting Link...
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 md:px-6 md:py-4 max-w-[85%] md:max-w-[75%] text-xs md:text-sm font-medium ${
                  msg.role === "user"
                    ? "bg-cyber-magenta/20 text-white clip-msg-user border-r-2 border-cyber-magenta shadow-[0_0_20px_rgba(255,0,255,0.05)]"
                    : "bg-cyber-cyan/15 text-white clip-msg-bot border-l-2 border-cyber-cyan shadow-[0_0_20px_rgba(0,243,255,0.05)]"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* --- MOVING DOTS INDICATOR --- */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start"
            >
              <div className="bg-cyber-cyan/10 border-l-2 border-cyber-cyan px-4 py-3 clip-msg-bot">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Input / Button Footer */}
      <div className="p-3 md:p-6 bg-black/60 border-t border-white/10 flex gap-2 md:gap-3 flex-shrink-0">
        <div
          className={`flex-1 relative flex items-center bg-white/5 border border-white/10 clip-chamfer px-3 md:px-4 transition-all duration-300 ${isLoading ? "opacity-30" : "opacity-100"}`}
        >
          <Terminal className="text-cyber-yellow hidden xs:block" size={14} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
            placeholder={isLoading ? "NEURAL_LINK_BUSY..." : "TYPE_MSG..."}
            className="w-full p-2 md:p-3 bg-transparent text-white outline-none font-mono text-[10px] md:text-xs italic disabled:cursor-wait"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`px-4 md:px-8 font-black uppercase text-[10px] clip-chamfer flex items-center gap-2 transition-all duration-300
            ${
              isLoading || !input.trim()
                ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                : "bg-cyber-cyan text-black hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)]"
            }`}
        >
          <span className="hidden xs:inline">
            {isLoading ? "WAIT" : "SEND"}
          </span>
          <Send size={12} className={isLoading ? "animate-pulse" : ""} />
        </button>
      </div>
    </section>
  );
}
