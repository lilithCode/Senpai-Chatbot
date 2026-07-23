"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Terminal,
  Cpu,
  Ghost,
  Sparkles,
  Coffee,
  Heart,
  Zap,
} from "lucide-react";

export default function AboutModal({ isOpen, onClose, playSfx }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="absolute inset-0 pointer-events-none bg-cyber-grid bg-[length:30px_30px] opacity-10" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-full max-w-xl bg-black/60 border border-cyber-cyan/30 clip-cyber shadow-[0_0_80px_rgba(0,243,255,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent " />

            <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Terminal size={18} className="text-cyber-cyan" />
                </div>
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white/80">
                  About Senpai
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  playSfx("receive");
                }}
                className="group p-2 hover:bg-cyber-magenta/20 rounded-full transition-all duration-300"
              >
                <X
                  size={20}
                  className="text-white/40 group-hover:text-cyber-magenta group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-cyber-cyan to-cyber-magenta opacity-20 blur-xl animate-pulse" />
                  <div className="relative w-24 h-24 clip-cyber border-2 border-white/10 bg-zinc-900 overflow-hidden">
                    <img
                      src="/profile.jpg"
                      alt="Origin"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 tracking-tighter">
                    LILITH
                  </h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group bg-white/[0.03] p-4 border-l-2 border-cyber-cyan hover:bg-white/[0.06] transition-colors">
                  <p className="text-[13px] text-white/70 leading-relaxed font-medium">
                    I named this project{" "}
                    <span className="text-cyber-cyan">Senpai</span> because of
                    Steins;Gate. In the anime, Senpai is the AI that carries
                    Kurisu Makise’s memories and personality, which I always
                    thought was such a cool and fascinating idea. It made AI
                    feel less like just code and more like something meaningful.
                    So this project is kind of my own tribute to that concept. I
                    tried to recreate a small piece of that world and build
                    something that feels a bit more human than a typical
                    program, like a presence living inside the system.
                  </p>
                </div>

                <div className="group bg-white/[0.03] p-4 border-l-2 border-cyber-magenta hover:bg-white/[0.06] transition-colors">
                  <p className="text-[11px] text-white/80 leading-relaxed italic">
                    " If the grid starts feeling more real than the world
                    outside, then you’ve stayed too long. If my world ever feels{" "}
                    <span className="text-white font-black underline decoration-cyber-magenta/50">
                      'off'
                    </span>{" "}
                    to you, then maybe you’re
                    just choosing to hear what you want to hear. "
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4 text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-1.5">
                    <Heart size={10} className="text-cyber-magenta" />
                    Stay hydrated, Stay Connected
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
