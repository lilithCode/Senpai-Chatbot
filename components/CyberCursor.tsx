"use client";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

export default function CyberCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // High stiffness + Low damping = Zero lag
  const sx = useSpring(mouseX, { damping: 40, stiffness: 1200, mass: 0.1 });
  const sy = useSpring(mouseY, { damping: 40, stiffness: 1200, mass: 0.1 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!active) setActive(true);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      style={{ x: sx, y: sy, translateX: "-10%", translateY: "-10%" }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
    >
      {/* Cyberpunk Arrow SVG */}
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 5px #00f3ff)" }}
      >
        <path
          d="M3 3L21 12L12 14L9 21L3 3Z"
          fill="#00f3ff"
          stroke="white"
          strokeWidth="1"
        />
        <path d="M12 14L18 17" stroke="white" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
