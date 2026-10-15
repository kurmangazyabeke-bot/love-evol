"use client";

import React, { useState } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { NoAnimationMode } from "@/types/invite";
import {
  MousePointerClick,
  Minimize2,
  Copy,
  TrendingUp,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FUNNY_PHRASE_PRESETS = [
  "А если я подарю цветы? 💐",
  "Я куплю твой любимый десерт! 🍰",
  "Пожалуйста, не разбивай сердечко 💔",
  "Ты шутишь, да? 🥺",
  "Я буду самым лучшим спутником! 🌟",
  "Выбора нет: жми ДА! ✨",
];

export function Step2NoButton() {
  const { noButton, updateNoButton } = useInviteStore();
  const [newPhrase, setNewPhrase] = useState("");

  const handleAddPhrase = () => {
    if (!newPhrase.trim()) return;
    updateNoButton({ phrases: [...noButton.phrases, newPhrase.trim()] });
    setNewPhrase("");
  };

  const handleRemovePhrase = (index: number) => {
    const updated = noButton.phrases.filter((_, i) => i !== index);
    updateNoButton({ phrases: updated });
  };

  const handleAddPresetPhrase = (phrase: string) => {
    if (noButton.phrases.includes(phrase)) return;
    updateNoButton({ phrases: [...noButton.phrases, phrase] });
  };

  const MODES = [
    {
      id: "runaway" as NoAnimationMode,
      title: "Убегает",
      tag: "Хит TikTok 🔥",
      icon: Zap,
      desc: "Кнопка отпрыгивает в случайные координаты контейнера при onMouseEnter или попытке тапа.",
    },
    {
      id: "shrink" as NoAnimationMode,
      title: "Уменьшается",
      tag: "Мило 🥺",
      icon: Minimize2,
      desc: "С каждой попыткой клика кнопка становится меньше, пока не превратится в микро-точку.",
    },
    {
      id: "multiply" as NoAnimationMode,
      title: "Размножается",
      tag: "Троллинг 🎭",
      icon: Copy,
      desc: "При попытке нажать создает вокруг кнопки-клоны с разными смешными фразами.",
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ================= 1. ВЫБОР РЕЖИМА АНИМАЦИИ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Режим поведения кнопки «Нет»</h3>
            <p className="text-xs text-slate-500">
              Выберите магию Framer Motion, которая не позволит отказать в свидании
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = noButton.mode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => updateNoButton({ mode: mode.id })}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-36",
                  isSelected
                    ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/20 shadow-sm"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {mode.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{mode.title}</h4>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {mode.desc}
                </p>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= 2. ЭФФЕКТ РОСТА КНОПКИ «ДА» ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Рост кнопки «Да»</h3>
              <p className="text-xs text-slate-500">
                С каждым уклонением кнопка «Да» увеличивается, привлекая внимание
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={noButton.yesButtonGrowth}
              onChange={(e) => updateNoButton({ yesButtonGrowth: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {noButton.yesButtonGrowth && (
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">Шаг увеличения за попытку:</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: "+15% (Плавный)", val: 0.15 },
                { label: "+20% (Стандарт)", val: 0.20 },
                { label: "+30% (Агрессивный)", val: 0.30 },
              ].map((step) => (
                <button
                  key={step.val}
                  onClick={() => updateNoButton({ growthStep: step.val })}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-colors border",
                    noButton.growthStep === step.val
                      ? "bg-rose-500 text-white border-rose-500 font-medium shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= 3. СПИСОК СМЕНЯЮЩИХСЯ ФРАЗ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Цепочка фраз кнопки «Нет»</h3>
              <p className="text-xs text-slate-500">
                При каждом наведении или попытке отказа текст кнопки переключается на следующий
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {noButton.phrases.length} фраз
          </span>
        </div>

        {/* Quick presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Быстрое добавление смешных отговорок:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FUNNY_PHRASE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAddPresetPhrase(p)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                <span>{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPhrase()}
            placeholder="Введите свою фразу и нажмите Enter..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <button
            onClick={handleAddPhrase}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить</span>
          </button>
        </div>

        {/* Phrases List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {noButton.phrases.map((phrase, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs group hover:bg-white hover:shadow-2xs transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[11px] text-slate-400 font-mono w-5 shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-slate-800 font-medium truncate">{phrase}</span>
              </div>
              <button
                onClick={() => handleRemovePhrase(idx)}
                title="Удалить фразу"
                className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
