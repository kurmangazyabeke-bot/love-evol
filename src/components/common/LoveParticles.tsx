"use client";

import React, { useMemo } from "react";
import { ParticlesType } from "@/types/invite";

interface LoveParticlesProps {
  type?: ParticlesType;
  count?: number;
}

const PARTICLE_SETS: Record<Exclude<ParticlesType, "none">, string[]> = {
  hearts: ["💖", "💕", "💗", "💓", "❤️", "🥰"],
  roses: ["🌹", "🥀", "🌷", "🌸", "💐", "🌹"],
  stars: ["✨", "⭐", "🌟", "💫", "✨", "🌙"],
  sakura: ["🌸", "🌺", "💮", "🍃", "🌸", "💐"],
  cats: ["🐾", "🐱", "😻", "🐾", "😽", "🐾"],
  butterflies: ["🦋", "✨", "🌸", "🦋", "💫", "🌺"],
  champagne: ["🥂", "✨", "🍾", "💫", "🎉", "🥂"],
};

// Deterministic pseudo-random helper so SSR and Client match 100% without hydration warnings
function seededFraction(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function LoveParticles({ type = "hearts", count = 15 }: LoveParticlesProps) {
  const particles = useMemo(() => {
    if (!type || type === "none") return [];
    const symbols = PARTICLE_SETS[type] || PARTICLE_SETS.hearts;
    return Array.from({ length: count }, (_, i) => {
      const r1 = seededFraction(i + 1);
      const r2 = seededFraction(i + 101);
      const r3 = seededFraction(i + 202);
      const r4 = seededFraction(i + 303);
      const r5 = seededFraction(i + 404);
      return {
        id: i,
        symbol: symbols[i % symbols.length],
        left: `${(r1 * 92 + 2).toFixed(2)}%`,
        animationDuration: `${(5.5 + r2 * 6.5).toFixed(2)}s`,
        animationDelay: `${(r3 * 5).toFixed(2)}s`,
        fontSize: `${Math.round(14 + r4 * 12)}px`,
        opacity: Number((0.18 + r5 * 0.42).toFixed(2)),
      };
    });
  }, [type, count]);

  if (!type || type === "none" || particles.length === 0) return null;

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
            opacity: 0.45;
          }
          85% {
            opacity: 0.45;
          }
          100% {
            transform: translateY(-820px) rotate(360deg) scale(1.2);
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
