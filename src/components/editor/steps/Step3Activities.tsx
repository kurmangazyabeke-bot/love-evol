"use client";

import React, { useState } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import {
  Plus,
  Trash2,
  Type,
  UtensilsCrossed,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_PRESETS = [
  { icon: "🍕", title: "Пицца и сериал" },
  { icon: "🎬", title: "Поход в кинотеатр" },
  { icon: "☕", title: "Прогулка и кофе" },
  { icon: "🍷", title: "Романтический ужин" },
  { icon: "🎨", title: "Мастер-класс / керамика" },
  { icon: "🎳", title: "Боулинг или бильярд" },
  { icon: "🏎️", title: "Картинг на скорость" },
  { icon: "🌅", title: "Пикник на закате" },
  { icon: "🎤", title: "Караоке или стендап" },
  { icon: "🎲", title: "Настольные игры" },
  { icon: "🎡", title: "Парк аттракционов" },
  { icon: "⛸️", title: "Каток и какао" },
  { icon: "🧖‍♀️", title: "СПА на двоих" },
  { icon: "🍣", title: "Суши и роллы" },
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
    if (activities.length >= 8) return;
    addActivity({
      title: newTitle.trim(),
      icon: newIcon.trim() || "✨",
      selected: false,
    });
    setNewTitle("");
  };

  const handleAddPreset = (preset: { icon: string; title: string }) => {
    if (activities.length >= 8) return;
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
            Настройте до 8 карточек активностей и разрешите половинке предложить собственную идею для свидания!
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
            <h3 className="text-base font-semibold text-slate-900">Заголовки и опции выбора</h3>
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

        {/* Allow guest custom idea toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Разрешить гостю вписать свой вариант</span>
            </span>
            <p className="text-[11px] text-slate-500">
              Под карточками появится поле «Предложить свою идею», которая сохранится в БД
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateActivitiesConfig({
                allowCustomIdea: activitiesConfig.allowCustomIdea === false ? true : false,
              })
            }
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
              activitiesConfig.allowCustomIdea !== false ? "bg-rose-500" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                activitiesConfig.allowCustomIdea !== false
                  ? "translate-x-6 left-0"
                  : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>
      </section>

      {/* ================= 2. ДИНАМИЧЕСКИЙ СПИСОК ВАРИАНТОВ (1 - 8) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Варианты активностей</h3>
            <p className="text-xs text-slate-500">Динамический список карточек (от 1 до 8 вариантов)</p>
          </div>
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border",
              activities.length >= 8
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            {activities.length} из 8
          </span>
        </div>

        {/* Quick Presets */}
        {activities.length < 8 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              14 готовых идей (кликните для добавления):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  disabled={activities.length >= 8}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-50 hover:bg-rose-50 hover:border-rose-200 text-slate-700 border border-slate-200/80 transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add custom input */}
        {activities.length < 8 ? (
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
              type="button"
              onClick={handleAdd}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Достигнут максимум (8 вариантов). Удалите один из существующих для добавления нового.</span>
          </div>
        )}

        {/* List of inputs */}
        <div className="space-y-2.5">
          {activities.map((act, idx) => (
            <div
              key={act.id}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-2xs transition-all"
            >
              <span className="text-[11px] font-mono text-slate-400 w-5 text-center shrink-0">
                #{idx + 1}
              </span>

              <input
                type="text"
                value={act.icon}
                onChange={(e) => updateActivity(act.id, { icon: e.target.value })}
                className="w-10 py-1 text-center text-base rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-400 shrink-0"
                title="Эмодзи"
              />

              <input
                type="text"
                value={act.title}
                onChange={(e) => updateActivity(act.id, { title: e.target.value })}
                placeholder="Название активности"
                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-800 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-400"
              />

              <button
                type="button"
                onClick={() => removeActivity(act.id)}
                disabled={activities.length <= 1}
                title={activities.length <= 1 ? "Должен остаться минимум 1 вариант" : "Удалить вариант"}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
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
      </section>
    </div>
  );
}
