"use client";

import React, { useMemo } from "react";
import { ParticlesType } from "@/types/invite";

interface LoveParticlesProps {
  type?: ParticlesType;
  count?: number;
}

const PARTICLE_SETS: Record<ParticlesType, string[]> = {
  hearts: ["💖", "💕", "💗", "💓", "❤️", "🥰"],
  roses: ["🌹", "🥀", "🌷", "🌸", "💐", "🌹"],
  stars: ["✨", "⭐", "🌟", "💫", "✨", "🌌"],
  sakura: ["🌸", "🌺", "💮", "🍃", "🌸", "💐"],
  cats: ["🐾", "🐱", "😻", "🐾", "😽", "🐾"],
};

export function LoveParticles({ type = "hearts", count = 15 }: LoveParticlesProps) {
  const particles = useMemo(() => {
    const symbols = PARTICLE_SETS[type] || PARTICLE_SETS.hearts;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: `${Math.random() * 95}%`,
      animationDuration: `${5 + Math.random() * 7}s`,
      animationDelay: `${Math.random() * 5}s`,
      fontSize: `${14 + Math.random() * 12}px`,
      opacity: 0.15 + Math.random() * 0.45,
    }));
  }, [type, count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 select-none animate-float-particle"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            fontSize: p.fontSize,
            opacity: p.opacity,
          }}
        >
          {p.symbol}
        </span>
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(10%) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: var(--p-opacity, 0.4);
          }
          85% {
            opacity: var(--p-opacity, 0.4);
          }
          100% {
            transform: translateY(-800px) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
        .animate-float-particle {
          animation-name: floatParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
