"use client";

import React, { useState } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import {
  Sparkles,
  Plus,
  Trash2,
  Type,
  UtensilsCrossed,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_PRESETS = [
  { icon: "🍕", title: "Пицца и сериал" },
  { icon: "🎬", title: "Поход в кинотеатр" },
  { icon: "☕", title: "Прогулка и кофе" },
  { icon: "🍷", title: "Романтический ужин" },
  { icon: "🎨", title: "Арт-свидание / музей" },
  { icon: "🎮", title: "Видеоигры вдвоем" },
  { icon: "🎡", title: "Парк аттракционов" },
  { icon: "⛸️", title: "Каток и глинтвейн" },
  { icon: "🧖‍♀️", title: "СПА и релакс" },
];

export function Step3Activities() {
  const {
    activities,
    activitiesConfig,
    updateActivitiesConfig,
    addActivity,
    removeActivity,
    updateActivity,
  } = useInviteStore();

  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✨");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    if (activities.length >= 6) return;
    addActivity({
      title: newTitle.trim(),
      icon: newIcon.trim() || "✨",
      selected: false,
    });
    setNewTitle("");
  };

  const handleAddPreset = (preset: { icon: string; title: string }) => {
    if (activities.length >= 6) return;
    addActivity({
      title: preset.title,
      icon: preset.icon,
      selected: false,
    });
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900">Экран «Чем займемся?»</h4>
          <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
            Здесь настраиваются варианты досуга. В мобильном превью они отображаются в виде интерактивной сетки 2x2, где гость может кликать и выбирать понравившиеся варианты!
          </p>
        </div>
      </div>

      {/* ================= 1. ЗАГОЛОВКИ ЭКРАНА ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Заголовки вопроса</h3>
            <p className="text-xs text-slate-500">Текст вопроса о планах на свидание</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Заголовок экрана</label>
          <input
            type="text"
            value={activitiesConfig.title}
            onChange={(e) => updateActivitiesConfig({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
            placeholder="Чем мы займемся? 🥰"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Подзаголовок / подсказка</label>
          <input
            type="text"
            value={activitiesConfig.subtitle}
            onChange={(e) => updateActivitiesConfig({ subtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="Выбери один или несколько вариантов"
          />
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-medium text-slate-700">Текст кнопки перехода</label>
          <input
            type="text"
            value={activitiesConfig.continueButtonText}
            onChange={(e) => updateActivitiesConfig({ continueButtonText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="Перейти к выбору даты 📅"
          />
        </div>
      </section>

      {/* ================= 2. ДИНАМИЧЕСКИЙ СПИСОК ВАРИАНТОВ (1 - 6) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Варианты активностей</h3>
            <p className="text-xs text-slate-500">Динамический список инпутов (от 1 до 6 вариантов)</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full border",
                activities.length >= 6
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {activities.length} из 6
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        {activities.length < 6 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Быстрые пресеты (кликните для добавления):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  disabled={activities.length >= 6}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add custom input */}
        {activities.length < 6 ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="Эмодзи"
              className="w-16 px-2.5 py-2 text-xs text-center rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Новый вариант (Пицца, Кино, Прогулка...)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Достигнут максимум (6 вариантов). Для добавления нового удалите один из существующих.</span>
          </div>
        )}

        {/* List of 1 to 6 inputs */}
        <div className="space-y-2.5">
          {activities.map((act, idx) => (
            <div
              key={act.id}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-2xs transition-all"
            >
              <span className="text-[11px] font-mono text-slate-400 w-5 text-center shrink-0">
                #{idx + 1}
              </span>

              {/* Emoji input */}
              <input
                type="text"
                value={act.icon}
                onChange={(e) => updateActivity(act.id, { icon: e.target.value })}
                className="w-10 py-1 text-center text-base rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-400 shrink-0"
                title="Эмодзи"
              />

              {/* Title input */}
              <input
                type="text"
                value={act.title}
                onChange={(e) => updateActivity(act.id, { title: e.target.value })}
                placeholder="Название активности"
                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-800 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-400"
              />

              {/* Delete button (disabled if only 1 item left) */}
              <button
                type="button"
                onClick={() => removeActivity(act.id)}
                disabled={activities.length <= 1}
                title={activities.length <= 1 ? "Должен остаться минимум 1 вариант" : "Удалить вариант"}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  activities.length <= 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Visual Preview Grid in form */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Визуальный вид карточек для гостя:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {activities.map((act) => (
              <div
                key={act.id}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2",
                  act.selected
                    ? "bg-rose-50/80 border-rose-300 text-rose-900 shadow-2xs"
                    : "bg-slate-50/70 border-slate-200 text-slate-700"
                )}
              >
                <span className="text-xl shrink-0">{act.icon}</span>
                <span className="text-xs font-medium truncate">{act.title || "Без названия"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
