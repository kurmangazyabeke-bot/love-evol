"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpeningAnimationType } from "@/types/invite";
import {
  Scissors,
  Sparkles,
  Mail,
  ShieldAlert,
  Droplets,
  Hand,
  CheckCircle2,
  Sparkle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OpeningOverlayProps {
  type: OpeningAnimationType;
  isOpen: boolean;
  onOpen: () => void;
}

export function OpeningOverlay({ type, isOpen, onOpen }: OpeningOverlayProps) {
  const [isTearing, setIsTearing] = useState(false);
  const [wipedPercentage, setWipedPercentage] = useState(0);
  const [isGlassDissolving, setIsGlassDissolving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const wipedPixelsCountRef = useRef(0);
  const totalPixelsRef = useRef(1);

  // =========================================================================
  // 1. RIBBON CUT / TEAR INTERACTION (SVG MASKS & FRAMER MOTION)
  // =========================================================================
  const handleRibbonTear = () => {
    if (isTearing) return;
    setIsTearing(true);

    // Dynamic festive particle burst
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#fb7185", "#f43f5e", "#fef08a", "#f59e0b", "#ffffff"],
    });

    setTimeout(() => {
      onOpen();
      setIsTearing(false);
    }, 600);
  };

  // =========================================================================
  // 2. FROSTED GLASS CANVAS (STEAM / CONDENSATION WIPE)
  // =========================================================================
  const initGlassCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 380;
    const height = rect.height || 680;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    totalPixelsRef.current = (width * height) / 100; // sample density
    wipedPixelsCountRef.current = 0;
    setWipedPercentage(0);

    // 1. Base misty frosted background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "rgba(245, 240, 248, 0.92)");
    bgGrad.addColorStop(0.5, "rgba(253, 242, 248, 0.90)");
    bgGrad.addColorStop(1, "rgba(240, 249, 255, 0.94)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Realistic condensation texture & tiny shiny droplets
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    for (let i = 0; i < 90; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const radius = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();

      // Droplet highlight shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(rx - radius * 0.3, ry - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    }

    // 3. Draw a cute faint heart outline watermark on the mist
    ctx.strokeStyle = "rgba(244, 63, 94, 0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const hx = width / 2;
    const hy = height * 0.38;
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(hx - 25, hy - 25, hx - 50, hy + 10, hx, hy + 45);
    ctx.bezierCurveTo(hx + 50, hy + 10, hx + 25, hy - 25, hx, hy);
    ctx.stroke();
  }, []);

  useEffect(() => {
    if (type === "frosted-glass" && !isOpen) {
      initGlassCanvas();
    }
  }, [type, isOpen, initGlassCanvas]);

  // Wiping mechanic on Canvas using destination-out
  const eraseAtPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";

    const brushRadius = 32;

    // Soft radial wipe brush to mimic finger dragging through mist
    const grad = ctx.createRadialGradient(x, y, 4, x, y, brushRadius);
    grad.addColorStop(0, "rgba(0, 0, 0, 1)");
    grad.addColorStop(0.7, "rgba(0, 0, 0, 0.85)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    // Connect with previous point for smooth continuous stroke
    if (lastPointRef.current) {
      ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
      ctx.lineWidth = brushRadius * 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();

    lastPointRef.current = { x, y };
    wipedPixelsCountRef.current += 1;

    // Track approximate wipe progress
    const pct = Math.min(100, Math.round((wipedPixelsCountRef.current / 35) * 100));
    setWipedPercentage(pct);

    // If wiped >= 40%, trigger joyful completion dissolve!
    if (pct >= 40 && !isGlassDissolving) {
      completeGlassWipe();
    }
  };

  const completeGlassWipe = () => {
    if (isGlassDissolving) return;
    setIsGlassDissolving(true);

    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.5 },
      colors: ["#38bdf8", "#fda4af", "#f43f5e", "#ffffff"],
    });

    setTimeout(() => {
      onOpen();
      setIsGlassDissolving(false);
    }, 550);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    eraseAtPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    eraseAtPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  if (type === "none" || isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-40 flex items-center justify-center select-none overflow-hidden rounded-[36px] pointer-events-auto">
        {/* ========================================================================= */}
        {/* 1. АНИМАЦИЯ: РАЗОРВАТЬ ЛЕНТУ (FRAMER MOTION + SVG TORN MASKS)             */}
        {/* ========================================================================= */}
        {type === "ribbon" && (
          <div
            onClick={handleRibbonTear}
            className="w-full h-full relative cursor-pointer group flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all"
          >
            {/* SVG Defs for Torn-Edge Masks */}
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                {/* Horizontal Left Torn Mask */}
                <clipPath id="ribbon-torn-left" clipPathUnits="objectBoundingBox">
                  <path d="M 0,0 L 0.94,0 L 0.88,0.12 L 0.96,0.25 L 0.89,0.38 L 0.98,0.52 L 0.88,0.67 L 0.95,0.82 L 0.90,0.92 L 0.96,1 L 0,1 Z" />
                </clipPath>
                {/* Horizontal Right Torn Mask */}
                <clipPath id="ribbon-torn-right" clipPathUnits="objectBoundingBox">
                  <path d="M 1,0 L 0.06,0 L 0.12,0.12 L 0.04,0.25 L 0.11,0.38 L 0.02,0.52 L 0.12,0.67 L 0.05,0.82 L 0.10,0.92 L 0.04,1 L 1,1 Z" />
                </clipPath>
                {/* Vertical Top Torn Mask */}
                <clipPath id="ribbon-torn-top" clipPathUnits="objectBoundingBox">
                  <path d="M 0,0 L 1,0 L 1,0.94 L 0.88,0.88 L 0.75,0.96 L 0.62,0.89 L 0.48,0.98 L 0.33,0.88 L 0.18,0.95 L 0,0.90 Z" />
                </clipPath>
                {/* Vertical Bottom Torn Mask */}
                <clipPath id="ribbon-torn-bottom" clipPathUnits="objectBoundingBox">
                  <path d="M 0,1 L 1,1 L 1,0.06 L 0.88,0.12 L 0.75,0.04 L 0.62,0.11 L 0.48,0.02 L 0.33,0.12 L 0.18,0.05 L 0,0.10 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* Ambient Darkened Backdrop with Gold Shimmer */}
            <div className="absolute inset-0 bg-radial from-rose-950/20 via-black/45 to-black/60 pointer-events-none" />

            {/* --- HORIZONTAL RIBBON HALVES --- */}
            {/* Left Ribbon Half */}
            <motion.div
              animate={
                isTearing
                  ? { x: "-125%", rotate: -8, opacity: 0 }
                  : { x: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{ clipPath: "url(#ribbon-torn-left)" }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[52%] h-16 bg-gradient-to-r from-rose-800 via-rose-600 to-rose-500 shadow-2xl border-y-2 border-amber-300/80"
            >
              {/* Satin weave luster line */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              {/* Golden metallic border stitch */}
              <div className="absolute inset-x-0 top-1 border-t border-amber-200/50" />
              <div className="absolute inset-x-0 bottom-1 border-b border-amber-200/50" />
            </motion.div>

            {/* Right Ribbon Half */}
            <motion.div
              animate={
                isTearing
                  ? { x: "125%", rotate: 8, opacity: 0 }
                  : { x: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{ clipPath: "url(#ribbon-torn-right)" }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[52%] h-16 bg-gradient-to-l from-rose-800 via-rose-600 to-rose-500 shadow-2xl border-y-2 border-amber-300/80"
            >
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute inset-x-0 top-1 border-t border-amber-200/50" />
              <div className="absolute inset-x-0 bottom-1 border-b border-amber-200/50" />
            </motion.div>

            {/* --- VERTICAL RIBBON HALVES --- */}
            {/* Top Ribbon Half */}
            <motion.div
              animate={
                isTearing
                  ? { y: "-125%", rotate: -5, opacity: 0 }
                  : { y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{ clipPath: "url(#ribbon-torn-top)" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-[52%] w-16 bg-gradient-to-b from-rose-800 via-rose-600 to-rose-500 shadow-2xl border-x-2 border-amber-300/80"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
              <div className="absolute inset-y-0 left-1 border-l border-amber-200/50" />
              <div className="absolute inset-y-0 right-1 border-r border-amber-200/50" />
            </motion.div>

            {/* Bottom Ribbon Half */}
            <motion.div
              animate={
                isTearing
                  ? { y: "125%", rotate: 5, opacity: 0 }
                  : { y: 0, rotate: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{ clipPath: "url(#ribbon-torn-bottom)" }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[52%] w-16 bg-gradient-to-t from-rose-800 via-rose-600 to-rose-500 shadow-2xl border-x-2 border-amber-300/80"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
              <div className="absolute inset-y-0 left-1 border-l border-amber-200/50" />
              <div className="absolute inset-y-0 right-1 border-r border-amber-200/50" />
            </motion.div>

            {/* --- CENTER SILK ROSETTE & SCISSORS --- */}
            <motion.div
              animate={
                isTearing
                  ? { scale: [1, 1.45, 0], rotate: [0, 25, 60], opacity: 0 }
                  : { scale: [1, 1.05, 1] }
              }
              transition={
                isTearing
                  ? { duration: 0.45, ease: "easeOut" }
                  : { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
              }
              className="relative z-50 flex flex-col items-center justify-center cursor-pointer"
            >
              {/* Outer Golden Glow Circle */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-200 p-1.5 shadow-2xl flex items-center justify-center border border-white/80 group-hover:scale-110 transition-transform">
                {/* Inner Silk Rosette */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-25" />
                  <Scissors className="w-8 h-8 stroke-[2.3] text-amber-200 animate-pulse drop-shadow-md" />
                </div>
              </div>

              {/* Call to action badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 px-4 py-2 rounded-full bg-white/95 text-rose-800 font-bold text-xs tracking-tight shadow-2xl border border-rose-300 flex items-center gap-2 backdrop-blur-md group-hover:bg-rose-50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Нажмите, чтобы разрезать ленту! ✂️</span>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. АНИМАЦИЯ: ЗАПОТЕВШЕЕ СТЕКЛО (HTML5 CANVAS STEAM WIPE)                  */}
        {/* ========================================================================= */}
        {type === "frosted-glass" && (
          <motion.div
            animate={
              isGlassDissolving
                ? { opacity: 0, scale: 1.06, filter: "blur(8px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.55 }}
            className="w-full h-full relative cursor-crosshair flex flex-col items-center justify-between p-6 overflow-hidden touch-none"
          >
            {/* HTML5 Canvas overlay for realistic condensation fog & erasing */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="absolute inset-0 w-full h-full z-10 touch-none"
            />

            {/* Instruction Prompt & Hand Wipe Hint (fades out as wiped) */}
            <div
              className={`relative z-20 pointer-events-none flex flex-col items-center text-center space-y-3 mt-12 transition-opacity duration-300 ${
                wipedPercentage > 15 ? "opacity-35" : "opacity-100"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-center text-rose-500">
                <Hand className="w-7 h-7 animate-bounce stroke-[2.2]" />
              </div>
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 shadow-md">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  <span>Сотрите пар пальцем... 💖</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Протрите стекло, чтобы увидеть послание
                </p>
              </div>
            </div>

            {/* Bottom Progress Bar & Instant Clear Button */}
            <div className="relative z-20 w-full flex items-center justify-between gap-3 pointer-events-auto">
              <div className="px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/80 shadow-xs flex items-center gap-2 text-[11px] font-bold text-slate-700">
                <Sparkle className="w-3 h-3 text-amber-500" />
                <span>Очищено: {wipedPercentage}%</span>
              </div>

              <button
                onClick={completeGlassWipe}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Очистить всё ✨
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. АНИМАЦИЯ: КОНВЕРТ С ПИСЬМОМ                                            */}
        {/* ========================================================================= */}
        {type === "envelope" && (
          <div
            onClick={handleRibbonTear}
            className="w-full h-full relative cursor-pointer group flex flex-col items-center justify-center bg-amber-950/45 backdrop-blur-xs p-6"
          >
            <motion.div
              animate={
                isTearing
                  ? { y: -160, opacity: 0, scale: 0.8 }
                  : { scale: [1, 1.03, 1] }
              }
              transition={
                isTearing
                  ? { duration: 0.4 }
                  : { repeat: Infinity, duration: 2.2 }
              }
              className="w-64 bg-amber-50/95 backdrop-blur-md rounded-3xl border-2 border-amber-300/80 p-7 shadow-2xl flex flex-col items-center text-center space-y-3.5 group-hover:scale-105 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Вам личное послание! 💌
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Нажмите на конверт, чтобы открыть приглашение
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                Открыть конверт
              </div>
            </motion.div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. АНИМАЦИЯ: СУРГУЧНАЯ ПЕЧАТЬ                                             */}
        {/* ========================================================================= */}
        {type === "wax-seal" && (
          <div
            onClick={handleRibbonTear}
            className="w-full h-full relative cursor-pointer group flex flex-col items-center justify-center bg-black/55 backdrop-blur-xs p-6"
          >
            <motion.div
              animate={
                isTearing
                  ? { scale: [1, 1.4, 0], rotate: [0, -15, 45], opacity: 0 }
                  : { scale: [1, 1.06, 1] }
              }
              transition={
                isTearing
                  ? { duration: 0.4 }
                  : { repeat: Infinity, duration: 2 }
              }
              className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-900 via-rose-700 to-red-800 border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-amber-100 group-hover:scale-110 transition-transform"
            >
              <ShieldAlert className="w-9 h-9 mb-0.5 text-amber-300" />
              <span className="text-[10px] font-black tracking-widest uppercase">
                LOVE SEAL
              </span>
            </motion.div>
            <div className="mt-5 px-4 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-xl border border-amber-300/60">
              Сорвать сургучную печать 🕯️
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
