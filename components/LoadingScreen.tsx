"use client";
import { motion } from "framer-motion";

interface LoadingProps {
  progress: number;
  onInitialize: () => void;
}

export default function LoadingScreen({
  progress,
  onInitialize,
}: LoadingProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050508] font-mono p-6">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

      <div className="w-full max-w-xs space-y-6 relative">
        <div className="flex justify-between items-end border-b border-cyber-cyan/30 pb-2">
          <div className="text-cyber-cyan text-[10px] font-black tracking-[0.3em] uppercase">
            System_Boot
          </div>
          <div className="text-cyber-cyan text-xs font-bold tabular-nums">
            {progress}%
          </div>
        </div>

        <div className="h-1 w-full bg-white/5 border border-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-cyber-cyan shadow-[0_0_15px_#00f3ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        <div className="h-12 flex items-center justify-center">
          {progress >= 100 ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onInitialize}
              className="w-full py-3 border-2 border-cyber-cyan text-cyber-cyan text-xs font-black uppercase tracking-widest hover:bg-cyber-cyan hover:text-black transition-all clip-chamfer animate-pulse"
            >
              Connect with Senpai
            </motion.button>
          ) : (
            <span className="text-cyber-cyan/40 text-[10px] uppercase tracking-[0.5em] animate-pulse">
              Loading Core...
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 text-[8px] text-white/20 uppercase tracking-widest">
        Senpai
      </div>
    </div>
  );
}
