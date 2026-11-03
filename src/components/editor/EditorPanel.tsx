"use client";

import React, { useRef, useEffect, useState } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { fetchInvitation } from "@/lib/api";
import { Step1Invitation } from "./steps/Step1Invitation";
import { Step2Confirmation } from "./steps/Step2Confirmation";
import { Step2NoButton } from "./steps/Step2NoButton";
import { Step3Activities } from "./steps/Step3Activities";
import { Step4DateTime } from "./steps/Step4DateTime";
import { Step5FinalScreen } from "./steps/Step5FinalScreen";
import { Step6Paywall } from "./steps/Step6Paywall";
import {
  Sparkles,
  PartyPopper,
  RotateCcw,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Heart,
  HeartHandshake,
  UtensilsCrossed,
  Gift,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function EditorPanel() {
  const { draftId, currentStep, setCurrentStep, resetToDefaults, loadFromConfig, startNewInvitation } =
    useInviteStore();
  const topRef = useRef<HTMLDivElement>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    const dupId = params.get("duplicate");
    const targetId = editId || dupId;
    if (!targetId) return;

    setLoadingRemote(true);
    fetchInvitation(targetId)
      .then((res) => {
        if (res?.invitation?.config) {
          loadFromConfig(
            res.invitation.config as Record<string, unknown>,
            editId ? res.invitation.id : null
          );
          window.history.replaceState({}, "", "/");
        }
      })
      .catch((err) => console.warn("Failed loading invitation into editor:", err))
      .finally(() => setLoadingRemote(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STEPS = [
    {
      num: 1,
      label: "Приглашение",
      icon: Heart,
      desc: "Вайб, обложка, кнопка «Нет»",
    },
    {
      num: 2,
      label: "Подтверждение",
      icon: HeartHandshake,
      desc: "Экран после согласия",
    },
    {
      num: 3,
      label: "Активности",
      icon: UtensilsCrossed,
      desc: "Чем займемся (2x2)",
    },
    {
      num: 4,
      label: "Календарь",
      icon: Calendar,
      desc: "Выбор даты и времени",
    },
    {
      num: 5,
      label: "Финал",
      icon: PartyPopper,
      desc: "Экран триумфа & фото",
    },
    {
      num: 6,
      label: "Готово!",
      icon: Gift,
      desc: "Получить готовую ссылку",
    },
  ];

  const goToStep = (stepNum: number) => {
    setCurrentStep(stepNum);
    // Smooth scroll up to top of editor
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progressPercent = Math.round((currentStep / 6) * 100);
  const currentStepData = STEPS[currentStep - 1] || STEPS[0];

  return (
    <div ref={topRef} className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto scroll-mt-20">
      {/* ================= 1. ШАПКА МАСТЕРА & СБРОС ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Пошаговый мастер создания • Шаг {currentStep} из 6</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {currentStepData.num}. {currentStepData.label}
          </h2>
          <p className="text-xs text-slate-500">
            Заполняйте настройки по шагам. Изменения моментально отображаются в мобильном превью справа.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {draftId && (
            <button
              type="button"
              onClick={startNewInvitation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span>+ Создать новую</span>
            </button>
          )}
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>
        </div>
      </div>

      {loadingRemote && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-pulse">
          Загружаем выбранное приглашение из базы данных Vercel для редактирования...
        </div>
      )}

      {/* ================= 2. ПРОГРЕСС-БАР ЗАПОЛНЕНИЯ (1..6) ================= */}
      <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span>Прогресс создания:</span>
            <span className="text-rose-600">{progressPercent}%</span>
          </span>
          <span className="text-slate-400 font-medium text-[11px]">
            Шаг {currentStep} из 6: {currentStepData.label}
          </span>
        </div>

        {/* Dynamic Glowing Progress Line */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/60">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-300 shadow-xs"
          />
        </div>
      </div>

      {/* ================= 3. ИНТЕРАКТИВНЫЕ ШАГИ-ТАБЫ ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isCompleted = s.num < currentStep;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => goToStep(s.num)}
              className={cn(
                "p-2.5 rounded-xl text-left transition-all flex flex-col justify-between relative cursor-pointer",
                isActive
                  ? "bg-white text-slate-900 shadow-xs ring-2 ring-rose-400/30 border border-rose-200"
                  : isCompleted
                  ? "bg-white/80 text-slate-800 hover:bg-white"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors",
                    isActive
                      ? "bg-rose-500 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                </span>
                <Icon
                  className={cn(
                    "w-3.5 h-3.5",
                    isActive
                      ? "text-rose-500"
                      : isCompleted
                      ? "text-emerald-500"
                      : "text-slate-400"
                  )}
                />
              </div>
              <span className="text-xs font-semibold leading-tight truncate">
                {s.label}
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:block truncate mt-0.5">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= ШАГ 1: ПРИГЛАШЕНИЕ ================= */}
      {currentStep === 1 && (
        <div className="space-y-7">
          <Step1Invitation />

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 px-1">
              Механика кнопки «Нет» (Убегание / Клоны)
            </h3>
            <Step2NoButton />
          </div>

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-end pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(2)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Далее: Шаг 2 (Экран «Да»)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ШАГ 2: ПОДТВЕРЖДЕНИЕ ================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Step2Confirmation />

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Шаг 1 (Приглашение)</span>
            </button>

            <button
              onClick={() => goToStep(3)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Далее: Шаг 3 (Активности)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ШАГ 3: АКТИВНОСТИ ================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Step3Activities />

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Шаг 2 (Подтверждение)</span>
            </button>

            <button
              onClick={() => goToStep(4)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Далее: Шаг 4 (Календарь)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ШАГ 4: КАЛЕНДАРЬ И ДАТА ================= */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Step4DateTime />

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Шаг 3 (Активности)</span>
            </button>

            <button
              onClick={() => goToStep(5)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Далее: Шаг 5 (Финал)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ШАГ 5: ФИНАЛЬНЫЙ ЭКРАН ================= */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <Step5FinalScreen />

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(4)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Шаг 4 (Календарь)</span>
            </button>

            <button
              onClick={() => goToStep(6)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>Далее: Шаг 6 (Получить ссылку!)</span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>
      )}

      {/* ================= ШАГ 6: ГОТОВО! (ССЫЛКА & QR) ================= */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <Step6Paywall />

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-start pt-6 border-t border-slate-200/80">
            <button
              onClick={() => goToStep(5)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад: Шаг 5 (Финал)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
