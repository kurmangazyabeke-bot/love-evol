"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import { PhoneFrame } from "../preview/PhoneFrame";
import { useInviteStore } from "@/store/useInviteStore";
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Eye,
  Sparkles,
  Check,
  X,
  Smartphone,
} from "lucide-react";

interface BuilderLayoutProps {
  children?: React.ReactNode;
  previewNode?: React.ReactNode;
}

const STEP_LABELS = [
  { step: 1, title: "Приглашение", icon: "💌" },
  { step: 2, title: "Подтверждение", icon: "✨" },
  { step: 3, title: "Активности", icon: "🍕" },
  { step: 4, title: "Календарь", icon: "📅" },
  { step: 5, title: "Финал", icon: "🎉" },
  { step: 6, title: "Готово!", icon: "🚀" },
];

export function BuilderLayout({ children, previewNode }: BuilderLayoutProps) {
  // On mobile screens, bottom sheet drawer state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const { currentStep, setCurrentStep } = useInviteStore();

  const currentStepInfo =
    STEP_LABELS.find((s) => s.step === currentStep) || STEP_LABELS[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeMobileTab={isBottomSheetOpen ? "editor" : "preview"}
        onTabChange={(tab) => setIsBottomSheetOpen(tab === "editor")}
      />

      {/* ========================================================================= */}
      {/* 1. DESKTOP LAYOUT (>= lg): 60/40 Split Screen                             */}
      {/* ========================================================================= */}
      <main className="flex-1 hidden lg:flex flex-row w-full max-w-[1920px] mx-auto">
        {/* Left Column: 60% width, independently scrollable settings */}
        <div className="w-[60%] h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border-r border-slate-200/60 p-6 xl:p-8">
          {children}
        </div>

        {/* Right Column: 40% width, fixed/sticky container for iPhone preview */}
        <div className="w-[40%] h-[calc(100vh-4rem)] sticky top-16 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/50 flex flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
          {/* Subtle Studio Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* iPhone Mockup Container */}
          <div className="relative z-10 w-full flex items-center justify-center">
            <PhoneFrame>{previewNode}</PhoneFrame>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 2. MOBILE LAYOUT (< lg): Full Screen Preview + Bottom Sheet Settings     */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:hidden relative flex flex-col items-center justify-start min-h-[calc(100dvh-4rem)] p-2 sm:p-4 bg-slate-900">
        {/* Full-width interactive mobile preview container */}
        <div className="relative w-full max-w-sm h-[calc(100dvh-5.5rem)] rounded-[32px] overflow-hidden shadow-2xl border-2 border-white/20 flex flex-col">
          {previewNode}
        </div>

        {/* Floating Docked Bar at Bottom (when sheet is closed) */}
        {!isBottomSheetOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-3 inset-x-3 max-w-sm mx-auto z-40"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200/90 flex items-center justify-between gap-2">
              {/* Step info pill */}
              <div
                onClick={() => setIsBottomSheetOpen(true)}
                className="flex items-center gap-2 cursor-pointer flex-1 pl-1"
              >
                <span className="text-base">{currentStepInfo.icon}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Шаг {currentStep} из 6
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentStepInfo.title}
                  </span>
                </div>
              </div>

              {/* Action Button: Open Settings */}
              <button
                onClick={() => setIsBottomSheetOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Настройки</span>
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Sheet Drawer Modal (when open) */}
        <AnimatePresence>
          {isBottomSheetOpen && (
            <>
              {/* Darkened Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBottomSheetOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              />

              {/* Sliding Bottom Sheet Drawer */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] h-[85dvh] bg-slate-50 rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden border-t border-slate-200"
              >
                {/* Drawer Header & Grab Bar */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-200/80 px-4 pt-2.5 pb-3">
                  {/* Drag Handle Indicator */}
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2.5 cursor-grab" />

                  {/* Top Bar with Step Switcher & Close */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentStepInfo.icon}</span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {currentStepInfo.title}
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Настройки конструктора (Шаг {currentStep}/6)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsBottomSheetOpen(false)}
                      className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Свернуть к превью"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Horizontal Mini Step Selector */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    {STEP_LABELS.map((item) => (
                      <button
                        key={item.step}
                        onClick={() => setCurrentStep(item.step)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                          currentStep === item.step
                            ? "bg-rose-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  {children}
                </div>

                {/* Drawer Sticky Bottom Action */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between gap-3 z-20">
                  <button
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Смотреть в полном превью</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
