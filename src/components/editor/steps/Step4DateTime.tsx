"use client";

import React from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { DateSelectionMode } from "@/types/invite";
import {
  Calendar,
  Clock,
  Type,
  CalendarCheck2,
  CalendarOff,
  Sparkles,
  UserCheck,
  CalendarHeart,
  Check,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Step4DateTime() {
  const { dateTime, updateDateTime } = useInviteStore();

  const handleModeChange = (mode: DateSelectionMode) => {
    if (mode === "guest_chooses") {
      updateDateTime({
        selectionMode: "guest_chooses",
        title: dateTime.title || "Когда тебе удобно встретиться? 🗓️",
        subtitle:
          dateTime.subtitle || "Выбери день и время, а я подстроюсь под тебя 🥰",
        continueButtonText: dateTime.continueButtonText || "Подтвердить дату и время ✨",
      });
    } else {
      updateDateTime({
        selectionMode: "sender_sets",
        title: dateTime.title || "Встретимся в этот день? 🗓️",
        subtitle: dateTime.subtitle || "Я уже всё спланировал для нас!",
        continueButtonText: dateTime.continueButtonText || "Да, мне отлично подходит! 🥰",
      });
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ================= 1. ТУМБЛЕР ВКЛЮЧЕНИЯ / ВЫКЛЮЧЕНИЯ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                dateTime.enabled
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              {dateTime.enabled ? (
                <CalendarCheck2 className="w-5 h-5" />
              ) : (
                <CalendarOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Выбор даты и времени
              </h3>
              <p className="text-xs text-slate-500">
                {dateTime.enabled
                  ? "Включен — свидание с фиксацией дня и времени"
                  : "Выключен — свободное свидание («В любой день!»)"}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dateTime.enabled}
              onChange={(e) => updateDateTime({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {!dateTime.enabled && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <CalendarOff className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">
                Шаг календаря отключен
              </span>
              <span>
                После активностей гость сразу перейдет к финальному экрану!
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ================= 2. КТО ВЫБИРАЕТ ДАТУ: 2 ВАРИАНТА ================= */}
      {dateTime.enabled && (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Кто выбирает дату встречи?
              </h3>
              <p className="text-xs text-slate-500">
                Выберите, как будет определяться время свидания
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* ВАРИАНТ 1: ГОСТЬ ВЫБИРАЕТ ДАТУ САМ */}
            <button
              type="button"
              onClick={() => handleModeChange("guest_chooses")}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 cursor-pointer",
                dateTime.selectionMode === "guest_chooses"
                  ? "border-rose-500 bg-rose-50/40 ring-2 ring-rose-400/20 shadow-xs"
                  : "border-slate-200/80 hover:border-slate-300 bg-slate-50/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                    dateTime.selectionMode === "guest_chooses"
                      ? "bg-rose-500 text-white"
                      : "border border-slate-300"
                  )}
                >
                  {dateTime.selectionMode === "guest_chooses" && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Дату выбирает гость
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                    Популярно ✨
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Твоя половинка сама выберет день недели и удобное время в интерактивном календаре. Ты увидишь её выбор в личном кабинете!
                </p>
              </div>
            </button>

            {/* ВАРИАНТ 2: ОТПРАВИТЕЛЬ НАЗНАЧАЕТ ТОЧНУЮ ДАТУ */}
            <button
              type="button"
              onClick={() => handleModeChange("sender_sets")}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 cursor-pointer",
                dateTime.selectionMode === "sender_sets"
                  ? "border-purple-500 bg-purple-50/40 ring-2 ring-purple-400/20 shadow-xs"
                  : "border-slate-200/80 hover:border-slate-300 bg-slate-50/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                    dateTime.selectionMode === "sender_sets"
                      ? "bg-purple-600 text-white"
                      : "border border-slate-300"
                  )}
                >
                  {dateTime.selectionMode === "sender_sets" && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-bold text-slate-900">
                    Я назначаю точную дату
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Задай конкретный день и время встречи (например, в пятницу в 19:00). Гость увидит назначенную дату и подтвердит её!
                </p>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ================= 3. ПАРАМЕТРЫ И ИНПУТЫ (ЕСЛИ ВКЛЮЧЕНО) ================= */}
      {dateTime.enabled && (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          {/* Если отправитель назначает точную дату — показываем выбор даты и времени */}
          {dateTime.selectionMode === "sender_sets" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Точная дата и время свидания
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Дата свидания</span>
                  </label>
                  <input
                    type="date"
                    value={dateTime.date}
                    onChange={(e) => updateDateTime({ date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Время встречи</span>
                  </label>
                  <input
                    type="time"
                    value={dateTime.time}
                    onChange={(e) => updateDateTime({ time: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Если гость выбирает сам — ориентировочная дата по умолчанию */
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-rose-950 block">
                  Гость сам выберет удобную дату в календаре
                </span>
                <p className="text-slate-600">
                  В приглашении гостю откроются кнопки быстрого выбора («В эту пятницу», «Суббота», слоты времени) или свободный выбор любой даты.
                </p>
              </div>
            </div>
          )}

          {/* Texts Configuration */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Заголовок экрана календаря
              </label>
              <input
                type="text"
                value={dateTime.title}
                onChange={(e) => updateDateTime({ title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="Когда встретимся? 🗓️"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Подзаголовок
              </label>
              <input
                type="text"
                value={dateTime.subtitle}
                onChange={(e) => updateDateTime({ subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="Выбери день и время, когда тебе удобно"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Текст кнопки продолжения
              </label>
              <input
                type="text"
                value={dateTime.continueButtonText}
                onChange={(e) =>
                  updateDateTime({ continueButtonText: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="Подтвердить дату и время ✨"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
