"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Heart } from "lucide-react";

interface ScratchCardProps {
  children: React.ReactNode;
  onReveal?: () => void;
  brushSize?: number;
  revealThreshold?: number; // 0 to 1, default 0.4 (40%)
  coverColor?: string;
  overlayText?: string;
}

export function ScratchCard({
  children,
  onReveal,
  brushSize = 28,
  revealThreshold = 0.4,
  overlayText = "✨ Сотри слой монеткой или пальцем ✨",
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  // Initialize Canvas with beautiful luxury scratch-off texture
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 240);
    const height = Math.max(rect.height, 100);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Draw luxury rose-gold gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#f43f5e");
    grad.addColorStop(0.3, "#fb7185");
    grad.addColorStop(0.5, "#fda4af");
    grad.addColorStop(0.7, "#fb7185");
    grad.addColorStop(1, "#e11d48");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Add shimmer speckles
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Overlay text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 4;
    ctx.fillText(overlayText, width / 2, height / 2 - 2);

    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("Там спрятан секретный сюрприз 💌", width / 2, height / 2 + 18);
    ctx.shadowBlur = 0;
  }, [overlayText]);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      if (!isRevealed) {
        initCanvas();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas, isRevealed]);

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      // Sample 16x16 grid of pixels for high performance
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let transparentCount = 0;
      const totalSamples = 400;
      const step = Math.floor(data.length / (totalSamples * 4));

      for (let i = 3; i < data.length; i += step * 4) {
        if (data[i] === 0) {
          transparentCount++;
        }
      }

      const percent = transparentCount / totalSamples;
      setScratchPercent(Math.round(percent * 100));

      if (percent >= revealThreshold && !isRevealed) {
        setIsRevealed(true);
        if (onReveal) onReveal();
        // Fire mini love confetti
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#f43f5e", "#fb7185", "#fda4af", "#ffd700"],
        });
      }
    } catch {
      // In case of any cross-origin error, graceful fallback
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize * dpr, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden select-none border border-rose-200/60 shadow-sm"
    >
      {/* Underlying Content (The Secret Love Message) */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-rose-50 via-white to-pink-50 min-h-[90px] flex flex-col justify-center">
        {children}
      </div>

      {/* Scratch Canvas Overlay */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none transition-opacity duration-500 z-20"
        />
      )}

      {/* Progress & Badge */}
      {!isRevealed && scratchPercent > 5 && (
        <div className="absolute top-2 right-2 z-30 pointer-events-none px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          <span>Стерто {scratchPercent}%</span>
        </div>
      )}

      {isRevealed && (
        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 text-[10px] font-bold flex items-center gap-1 animate-in fade-in zoom-in-75">
          <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
          <span>Секрет открыт!</span>
        </div>
      )}
    </div>
  );
}
