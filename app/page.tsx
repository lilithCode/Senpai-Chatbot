"use client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CyberCursor from "@/components/CyberCursor";
import LoadingScreen from "@/components/LoadingScreen";
import LeftPanel from "@/components/LeftPanel";
import ChatPanel from "@/components/ChatPanel";
import RightPanel from "@/components/RightPanel";
import AboutModal from "@/components/AboutModal";

export default function Home() {
  const[bootProgress, setBootProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const[isLoading, setIsLoading] = useState(false);

  const [activeMobilePanel, setActiveMobilePanel] = useState<
    "chat" | "left" | "right"
  >("chat");

  const[messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const savedHistory = localStorage.getItem("Senpai_sessions");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  },[]);

  useEffect(() => {
    if (history.length > 0)
      localStorage.setItem("Senpai_sessions", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (bootProgress < 100) {
      const timer = setTimeout(() => setBootProgress((p) => p + 4), 30);
      return () => clearTimeout(timer);
    }
  }, [bootProgress]);

  const initializeSystem = () => {
    setIsInitialized(true);
    setIsPlaying(true);
    playSfx("receive");
  };

  const playSfx = (type: string) => {
    const audio = new Audio(`/sfx/${type}.mp3`);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const loadSession = (session: any) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    playSfx("receive");
    setActiveMobilePanel("chat");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    const userMsg = { role: "user", content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    playSfx("send");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages:[...messages, userMsg] }),
      });
      const data = await response.json();
      const assistantMsg = {
        role: "assistant",
        content: data.reply || "SYSTEM_OFFLINE",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      playSfx("receive");

      if (!activeSessionId) {
        const newId = Date.now().toString();
        setActiveSessionId(newId);
        setHistory((prev) =>[
          {
            id: newId,
            name: userText.substring(0, 20),
            messages:[...messages, userMsg, assistantMsg],
            date: new Date().toLocaleTimeString(),
          },
          ...prev,
        ]);
      } else {
        setHistory((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...messages, userMsg, assistantMsg] }
              : s,
          ),
        );
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "[SYSTEM_ERROR]" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative h-screen w-screen bg-[#020203] overflow-hidden font-mono">
      <div className="hidden md:block">
        <CyberCursor />
      </div>


      <div
        className={`absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ${
          activeMobilePanel !== "chat" ? " brightness-[0.3]" : "opacity-40"
        }`}
        style={{
          backgroundImage: "url('/background.png')",
          backgroundPosition: "center 20%",
          filter: "brightness(0.5)",
        }}
      />
      <AnimatePresence mode="wait">
        {!isInitialized ? (
          <LoadingScreen
            key="loader"
            progress={bootProgress}
            onInitialize={initializeSystem}
          />
        ) : (
          <div
            key="app"
            className="relative z-10 flex h-full w-full gap-2 lg:gap-5 p-2 lg:p-6 max-w-[1920px] mx-auto overflow-hidden"
          >
            <div
              className={`
              fixed inset-0 z-[110] transition-transform duration-500
              xl:relative xl:inset-auto xl:translate-x-0 xl:flex xl:w-80
              ${activeMobilePanel === "left" ? "translate-x-0" : "-translate-x-full"}
            `}
            >
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md xl:hidden"
                onClick={() => setActiveMobilePanel("chat")}
              />
              <div className="relative w-72 md:w-80 h-full">
                <LeftPanel
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  currentTrack={currentTrack}
                  setCurrentTrack={setCurrentTrack}
                  playSfx={playSfx}
                />
              </div>
            </div>

            <div
              className={`
                flex-1 flex gap-2 lg:gap-5 transition-all duration-500
                ${activeMobilePanel === "left" ? "blur-xl opacity-20 pointer-events-none xl:blur-0 xl:opacity-100" : ""}
            `}
            >
              <div
                className={`flex-1 min-w-0 h-full transition-all duration-500 ${activeMobilePanel === "right" ? "blur-xl opacity-20 pointer-events-none lg:blur-0 lg:opacity-100" : ""}`}
              >
                <ChatPanel
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  startNewChat={() => {
                    setMessages([]);
                    setActiveSessionId(null);
                  }}
                  isLoading={isLoading}
                  onToggleLeft={() => setActiveMobilePanel("left")}
                  onToggleRight={() => setActiveMobilePanel("right")}
                />
              </div>

              <div
                className={`
                fixed inset-0 z-[110] transition-transform duration-500
                lg:relative lg:inset-auto lg:translate-x-0 lg:flex lg:w-72 xl:w-80
                ${activeMobilePanel === "right" ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
              `}
              >
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-md lg:hidden"
                  onClick={() => setActiveMobilePanel("chat")}
                />
                <div className="relative w-72 md:w-80 h-full ml-auto">
                  <RightPanel
                    isPlaying={isPlaying}
                    history={history}
                    activeSessionId={activeSessionId}
                    loadSession={loadSession}
                    openAbout={() => setShowAbout(true)}
                    playSfx={playSfx}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        playSfx={playSfx}
      />
    </main>
  );
}