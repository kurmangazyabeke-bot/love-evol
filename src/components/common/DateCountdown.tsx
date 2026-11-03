"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateCountdownProps {
  dateStr?: string; // YYYY-MM-DD
  timeStr?: string; // HH:MM
  isDark?: boolean;
}

interface TimeLeft {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(dateStr?: string, timeStr?: string): TimeLeft | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "19:00").split(":").map((v) => Number(v) || 0);
  const target = new Date(y, (m || 1) - 1, d || 1, hh, mm, 0).getTime();
  const diff = target - Date.now();
  if (diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { totalMs: diff, days, hours, minutes, seconds };
}

export function DateCountdown({ dateStr, timeStr = "19:00", isDark = false }: DateCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(computeTimeLeft(dateStr, timeStr));
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(dateStr, timeStr));
    }, 1000);
    return () => clearInterval(timer);
  }, [dateStr, timeStr]);

  if (!mounted || !timeLeft) return null;

  if (timeLeft.totalMs <= 0) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl p-3.5 border text-center shadow-2xs",
          isDark
            ? "bg-rose-950/60 border-rose-500/40 text-rose-100"
            : "bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-rose-200 text-rose-900"
        )}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Долгожданный момент нашей встречи уже наступил! 💖✨</span>
        </div>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "дней" },
    { value: timeLeft.hours, label: "часов" },
    { value: timeLeft.minutes, label: "минут" },
    { value: timeLeft.seconds, label: "секунд" },
  ];

  return (
    <div
      className={cn(
        "w-full rounded-2xl p-3.5 border shadow-2xs space-y-2.5",
        isDark
          ? "bg-slate-900/80 border-white/15 text-white"
          : "bg-gradient-to-br from-white/95 via-rose-50/50 to-amber-50/40 border-rose-200/80 text-slate-900"
      )}
    >
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500">
        <Clock className="w-3.5 h-3.5" />
        <span>До нашей встречи осталось:</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className={cn(
              "rounded-xl py-2 px-1 flex flex-col items-center justify-center border",
              isDark
                ? "bg-white/10 border-white/15"
                : "bg-white border-rose-100 shadow-2xs"
            )}
          >
            <span
              className={cn(
                "text-base sm:text-lg font-black font-mono leading-none",
                isDark ? "text-rose-300" : "text-rose-600"
              )}
            >
              {String(u.value).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold uppercase tracking-wide mt-1",
                isDark ? "text-slate-300" : "text-slate-500"
              )}
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
