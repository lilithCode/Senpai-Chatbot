"use client";
import { motion } from "framer-motion";
import {
  History,
  Info,
  Activity,
  Github,
  Database,
  ExternalLink,
} from "lucide-react";

type Session = {
  id: string;
  name: string;
  messages: { role: "user" | "assistant"; content: string }[];
  date: string;
};

type RightPanelProps = {
  playSfx: (type: string) => void;
  history: Session[];
  loadSession: (session: Session) => void;
  activeSessionId: string | null;
  openAbout: () => void;
  isPlaying: boolean;
};

export default function RightPanel({
  playSfx,
  history,
  loadSession,
  activeSessionId,
  openAbout,
  isPlaying,
}: RightPanelProps) {
  const platformLinks = [
    {
      name: "GitHub Repository",
      icon: <Github size={16} />,
      url: "https://github.com/lilithCode/Senpai-Chatbot.git",
      accent: "white",
      borderColor: "border-white/40",
      hoverBg: "hover:bg-white/10",
      textColor: "text-white",
      hoverShadow: "hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]",
    },
    {
      name: "Kaggle Training",
      icon: <Database size={16} />,
      url: "https://www.kaggle.com/code/hamnamubarak/amadeus/edit",
      accent: "cyber-cyan",
      borderColor: "border-cyber-cyan/40",
      hoverBg: "hover:bg-cyber-cyan/10",
      textColor: "text-cyber-cyan",
      hoverShadow: "hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]",
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col gap-4 z-10">
      <div className="cyber-glass neon-border-magenta p-4 lg:p-5 clip-cyber shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-magenta/5 pointer-events-none" />
        <div className="flex items-center gap-2 text-[10px] font-black text-cyber-magenta opacity-80 uppercase mb-4 tracking-widest relative z-10">
          <Activity size={14} className={isPlaying ? "animate-pulse" : ""} />{" "}
          neural_sync
        </div>
        <div className="h-10 lg:h-12 flex items-end gap-1.5 relative z-10">
          {[40, 80, 50, 95, 70, 85, 45, 60, 30, 50].map((h, i) => (
            <motion.div
              key={i}
              animate={
                isPlaying
                  ? { height: [`${h}%`, `${Math.max(10, h - 40)}%`, `${h}%`] }
                  : { height: "10%" }
              }
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
              className="flex-1 bg-cyber-magenta/90 shadow-[0_0_10px_rgba(255,0,255,0.5)]"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 cyber-glass neon-border-cyan p-4 lg:p-5 flex flex-col overflow-hidden clip-cyber shadow-2xl">
        <div className="flex items-center gap-2 text-[10px] font-black text-cyber-cyan uppercase mb-4 border-b border-cyber-cyan/30 pb-3 tracking-widest drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
          <History size={14} /> session_logs
        </div>
        <div className="space-y-2 overflow-y-auto pr-1 scrollbar-hide lg:scrollbar-cyber">
          {history.length === 0 && (
            <div className="text-[10px] text-white/30 italic p-6 text-center border border-white/5 bg-black/40 clip-chamfer">
              NO_LOGS_DETECTED
            </div>
          )}
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                loadSession(h);
                playSfx("send");
              }}
              className={`w-full text-left text-[10px] font-bold p-3 transition-all flex flex-col gap-1.5 clip-chamfer border ${
                activeSessionId === h.id
                  ? "bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-[inset_4px_0_0_#00f3ff]"
                  : "bg-black/40 border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <span className="truncate uppercase tracking-wide">{`> ${h.name}`}</span>
              <span className="text-[8px] opacity-40 font-mono tracking-widest">
                {h.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        {platformLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx("send")}
            className={`cyber-glass p-3 flex justify-between items-center group transition-all duration-300 clip-chamfer border ${link.borderColor} ${link.hoverBg} ${link.hoverShadow}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`${link.textColor} drop-shadow-[0_0_8px_currentColor] group-hover:scale-110 transition-transform`}
              >
                {link.icon}
              </span>
              <span
                className={`text-[10px] font-black uppercase text-white/70 group-hover:${link.textColor} tracking-widest transition-colors`}
              >
                {link.name}
              </span>
            </div>
            <ExternalLink
              size={12}
              className="text-white/20 group-hover:text-white/70"
            />
          </a>
        ))}
      </div>

      <button
        onClick={() => {
          openAbout();
          playSfx("send");
        }}
        className="cyber-glass bg-white/5 border border-white/20 p-4 flex justify-between items-center group hover:bg-cyber-cyan/20 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all clip-chamfer shrink-0"
      >
        <span className="text-[11px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">
          About_Senpai
        </span>
        <Info
          size={18}
          className="text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.8)] group-hover:scale-110 transition-transform"
        />
      </button>
    </aside>
  );
}
