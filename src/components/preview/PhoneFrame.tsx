"use client";

import React from "react";
import { StatusBar } from "./StatusBar";
import { DynamicIsland } from "./DynamicIsland";
import { Heart, Sparkles, MapPin, Calendar } from "lucide-react";

interface PhoneFrameProps {
  children?: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative flex items-center justify-center p-4">
      {/* Outer Titanium Chassis / Shadow wrapper */}
      <div className="relative group">
        {/* Subtle Outer Glow & Shadow */}
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-rose-200/40 via-amber-100/30 to-purple-200/40 rounded-[58px] blur-xl opacity-75" />

        {/* Physical Side Buttons */}
        {/* Left: Action Button */}
        <div className="absolute -left-[3px] top-[108px] w-[3px] h-[26px] bg-neutral-700 rounded-l-sm" />
        {/* Left: Volume Up */}
        <div className="absolute -left-[3px] top-[148px] w-[3px] h-[48px] bg-neutral-700 rounded-l-sm" />
        {/* Left: Volume Down */}
        <div className="absolute -left-[3px] top-[208px] w-[3px] h-[48px] bg-neutral-700 rounded-l-sm" />
        {/* Right: Power / Lock Button */}
        <div className="absolute -right-[3px] top-[168px] w-[3px] h-[72px] bg-neutral-700 rounded-r-sm" />

        {/* iPhone Frame Body */}
        <div className="relative w-[340px] sm:w-[370px] h-[700px] sm:h-[750px] max-h-[calc(100vh-140px)] rounded-[52px] p-[10px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-neutral-700/60 transition-transform duration-300">
          
          {/* Inner Titanium Bezel Highlight */}
          <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-black ring-1 ring-white/10 flex flex-col">
            
            {/* Screen Content Wrapper */}
            <div className="relative w-full h-full bg-[#fdfbf7] flex flex-col overflow-hidden select-none">
              {/* Dynamic Island */}
              <DynamicIsland />

              {/* Status Bar */}
              <StatusBar dark={true} />

              {/* Screen Scrollable Content */}
              <div className="relative flex-1 overflow-y-auto no-scrollbar pt-12 pb-7 flex flex-col">
                {children ? (
                  children
                ) : (
                  <DefaultInvitationPreview />
                )}
              </div>

              {/* Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-32 h-1 bg-neutral-800/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default preview placeholder showing a stylish invitation mock
function DefaultInvitationPreview() {
  return (
    <div className="px-5 py-4 flex flex-col items-center text-center text-neutral-800 space-y-6">
      {/* Top Header Tag */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-[11px] font-medium tracking-wide">
        <Sparkles className="w-3 h-3" />
        <span>Свадебное Приглашение</span>
      </div>

      {/* Main Couple Names */}
      <div className="space-y-1">
        <p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500 font-light">
          Мы женимся
        </p>
        <h1 className="text-3xl font-serif tracking-tight text-neutral-900 leading-tight">
          Александр
          <span className="block text-xl font-light text-rose-400 my-1 italic">&amp;</span>
          Елизавета
        </h1>
      </div>

      {/* Date & Location Card */}
      <div className="w-full bg-white/80 backdrop-blur-sm border border-neutral-200/70 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Дата торжества</p>
            <p className="text-sm font-semibold text-neutral-800">24 Июля 2026, 16:00</p>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Локация</p>
            <p className="text-sm font-semibold text-neutral-800">Ресторан «Villa Verde», Москва</p>
          </div>
        </div>
      </div>

      {/* Love Quote */}
      <div className="p-4 bg-gradient-to-r from-rose-50/60 via-amber-50/50 to-rose-50/60 rounded-2xl border border-rose-100/50">
        <p className="text-xs italic text-neutral-600 leading-relaxed font-serif">
          «Любовь — это когда два человека смотрят не друг на друга, а в одном направлении.»
        </p>
      </div>

      {/* RSVP Button */}
      <button className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
        <span>Подтвердить присутствие</span>
      </button>

      {/* Footer subtle text */}
      <p className="text-[10px] text-neutral-400 font-light">
        Создано в интерактивном конструкторе приглашений
      </p>
    </div>
  );
}
