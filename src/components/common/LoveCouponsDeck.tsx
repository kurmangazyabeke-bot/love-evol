"use client";

import React from "react";
import { CouponsSettings } from "@/types/invite";
import { Ticket, Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { playSoftPop } from "@/lib/soundEffects";

interface LoveCouponsDeckProps {
  coupons: CouponsSettings;
  claimedIds: string[];
  onToggleClaim: (couponId: string, couponTitle: string) => void;
  isDark?: boolean;
  soundEnabled?: boolean;
}

export function LoveCouponsDeck({
  coupons,
  claimedIds,
  onToggleClaim,
  isDark = false,
  soundEnabled = true,
}: LoveCouponsDeckProps) {
  const activeItems = (coupons.items || []).filter((c) => c.enabled);
  if (!coupons.enabled || activeItems.length === 0) return null;

  const handleTap = (id: string, title: string, alreadyClaimed: boolean) => {
    playSoftPop(soundEnabled);
    if (!alreadyClaimed) {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.75 },
        colors: ["#f43f5e", "#fbbf24", "#fda4af"],
      });
    }
    onToggleClaim(id, title);
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl p-3.5 border shadow-2xs space-y-2.5 text-left",
        isDark
          ? "bg-slate-900/80 border-white/15"
          : "bg-white/90 backdrop-blur-xs border-rose-200/80"
      )}
    >
      <div className="space-y-0.5 px-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5" />
            <span>{coupons.title || "Подарочные купоны любви 🎟️"}</span>
          </span>
          {claimedIds.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
              Выбрано: {claimedIds.length}
            </span>
          )}
        </div>
        {coupons.subtitle && (
          <p className={cn("text-[11px]", isDark ? "text-slate-300" : "text-slate-500")}>
            {coupons.subtitle}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {activeItems.map((coupon) => {
          const isClaimed = claimedIds.includes(coupon.id);
          return (
            <button
              key={coupon.id}
              type="button"
              onClick={() => handleTap(coupon.id, `${coupon.icon} ${coupon.title}`, isClaimed)}
              className={cn(
                "w-full relative rounded-xl border-2 border-dashed p-3 text-left transition-all flex items-center gap-3 cursor-pointer active:scale-[0.98] overflow-hidden",
                isClaimed
                  ? "bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-rose-500/15 border-rose-400 shadow-xs"
                  : isDark
                  ? "bg-white/5 border-white/20 hover:border-rose-400/60"
                  : "bg-amber-50/40 border-amber-300/80 hover:border-rose-300 hover:bg-rose-50/40"
              )}
            >
              {/* Perforated notch circles left & right */}
              <span
                className={cn(
                  "w-3 h-3 rounded-full absolute -left-2 top-1/2 -translate-y-1/2",
                  isDark ? "bg-slate-900" : "bg-white"
                )}
              />
              <span
                className={cn(
                  "w-3 h-3 rounded-full absolute -right-2 top-1/2 -translate-y-1/2",
                  isDark ? "bg-slate-900" : "bg-white"
                )}
              />

              <div className="w-10 h-10 rounded-xl bg-white/90 border border-rose-100 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                {coupon.icon || "🎁"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {coupon.title}
                  </span>
                </div>
                {coupon.description && (
                  <p
                    className={cn(
                      "text-[10px] leading-snug line-clamp-2 mt-0.5",
                      isDark ? "text-slate-300" : "text-slate-600"
                    )}
                  >
                    {coupon.description}
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all",
                  isClaimed
                    ? "bg-rose-500 text-white shadow-2xs"
                    : "bg-slate-900 text-white hover:bg-rose-600"
                )}
              >
                {isClaimed ? (
                  <>
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Активен</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Забрать</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
