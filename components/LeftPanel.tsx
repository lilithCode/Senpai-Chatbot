"use client";
import React, { useEffect, useRef } from "react";
import { Play, Pause, Disc, AudioLines } from "lucide-react";
import { TRACKS } from "./playlistData";

type LeftPanelProps = {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTrack: number;
  setCurrentTrack: (track: number | ((previous: number) => number)) => void;
  playSfx?: (type: string) => void;
};

export default function LeftPanel({
  isPlaying,
  setIsPlaying,
  currentTrack,
  setCurrentTrack,
  playSfx,
}: LeftPanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.1;
    audioRef.current.src = `/sfx/Playlist/${TRACKS[currentTrack].file}`;
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentTrack, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      void audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    if (playSfx) playSfx("send");
  };

  return (
    <aside className="w-full h-full flex flex-col gap-4 z-10">
      <div className="flex-1 cyber-glass neon-border-cyan clip-cyber p-4 lg:p-6 flex flex-col items-center overflow-hidden shadow-2xl">
        <div className="w-full flex justify-between items-center mb-6 lg:mb-10 border-b border-cyber-cyan/30 pb-3">
          <Disc
            className={`text-cyber-cyan drop-shadow-[0_0_8px_#00f3ff] ${isPlaying ? "animate-spin" : ""}`}
            size={16}
          />
          <h3 className="text-[9px] lg:text-[11px] text-cyber-cyan font-black tracking-[0.4em] uppercase text-shadow-glow">
            Audio_Space
          </h3>
        </div>

        <div
          className="relative mb-8 lg:mb-10 cursor-pointer group"
          onClick={togglePlay}
        >
          <div
            className={`w-40 h-40 lg:w-48 lg:h-48 rounded-full border-4 border-cyber-cyan/30 overflow-hidden relative shadow-[0_0_30px_rgba(0,243,255,0.1)] group-hover:border-cyber-cyan/80 transition-colors ${
              isPlaying
                ? "animate-spin-slow shadow-[0_0_40px_rgba(0,243,255,0.2)] border-cyber-cyan"
                : ""
            }`}
          >
            <img
              src={TRACKS[currentTrack].cover}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              alt="cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="absolute -bottom-2 -right-2 p-4 bg-cyber-cyan text-black rounded-full shadow-[0_0_20px_#00f3ff] group-hover:scale-110 transition-transform">
            {isPlaying ? (
              <Pause size={20} fill="black" />
            ) : (
              <Play size={20} fill="black" className="translate-x-0.5" />
            )}
          </div>
        </div>

        <div className="w-full flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide lg:scrollbar-cyber">
          {TRACKS.map((t, i) => {
            const isActive = currentTrack === i;
            return (
              <button
                key={i}
                onClick={() => {
                  if (!isActive) {
                    setCurrentTrack(i);
                    setIsPlaying(true);
                  } else {
                    togglePlay();
                  }
                  if (playSfx) playSfx("send");
                }}
                className={`w-full text-left text-[10px] lg:text-[11px] font-bold p-3 transition-all flex items-center justify-between group clip-chamfer border ${
                  isActive
                    ? "text-cyber-cyan bg-cyber-cyan/20 border-cyber-cyan shadow-[inset_4px_0_0_#00f3ff]"
                    : "text-white/40 border-white/5 bg-black/40 hover:bg-white/5 hover:text-white hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <span
                    className={`opacity-40 font-mono tracking-widest ${isActive ? "text-cyber-cyan opacity-80" : ""}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                    {t.name}
                  </span>
                </div>
                {isActive && isPlaying && (
                  <AudioLines
                    size={14}
                    className="text-cyber-cyan animate-pulse shrink-0 drop-shadow-[0_0_5px_#00f3ff]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <audio
        ref={audioRef}
        onEnded={() =>
          setCurrentTrack((prev: number) => (prev + 1) % TRACKS.length)
        }
      />
    </aside>
  );
}
