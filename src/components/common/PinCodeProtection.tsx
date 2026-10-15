"use client";

import React, { useState } from "react";
import { Lock, Heart, KeyRound, ArrowRight } from "lucide-react";

interface PinCodeProtectionProps {
  correctPin: string;
  onUnlocked: () => void;
}

export function PinCodeProtection({ correctPin, onUnlocked }: PinCodeProtectionProps) {
  const [inputVal, setInputVal] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() === correctPin.trim()) {
      onUnlocked();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white backdrop-blur-md">
      <div className="max-w-xs w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-400/30 shadow-lg">
          <Lock className="w-7 h-7 stroke-rose-400" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Секретное послание 💌</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Это приглашение защищено секретным кодом. Введите 4 цифры, известные только вам двоим!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              maxLength={8}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="••••"
              className={`w-full py-3 px-4 rounded-xl text-center text-xl font-bold tracking-widest text-white bg-white/15 border focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 ring-2 ring-red-400/40 animate-shake"
                  : "border-white/25 focus:ring-rose-400"
              }`}
            />
          </div>

          {error && (
            <p className="text-[11px] font-semibold text-rose-300 animate-in fade-in">
              Неверный код! Попробуйте еще раз 🥺
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Открыть открытку</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
