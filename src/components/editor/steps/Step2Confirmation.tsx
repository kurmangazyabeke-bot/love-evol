"use client";

import React, { useState, useRef } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import {
  Sparkles,
  Upload,
  Check,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  FileImage,
  Smile,
  ArrowRight,
  HeartHandshake,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";
import { CONFIRMATION_PRESET_CATEGORIES } from "@/lib/gifCatalog";

const CONFIRMATION_TITLE_SUGGESTIONS = [
  "Подожди, ты реально сказала да?! 🥹❤️",
  "Ущипните меня, это не сон?! 💫",
  "Урааа! Мое сердечко сейчас растает! 🥰",
  "Ты сделала меня самым счастливым человеком! 🌹",
];

export function Step2Confirmation() {
  const { confirmation, updateConfirmation } = useInviteStore();
  const [imageTab, setImageTab] = useState<"presets" | "upload" | "url">("presets");
  const [stickerCategory, setStickerCategory] = useState<string>("all");
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение или GIF");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadFile(file, "images");
      if (res.url) {
        updateConfirmation({ stickerUrl: res.url });
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Ошибка загрузки стикера");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-rose-900">Экран Подтверждения согласия</h4>
          <p className="text-[11px] text-rose-700/90 leading-relaxed mt-0.5">
            Этот экран с эффектом удивления и восторга появляется в превью сразу после того, как пользователь нажимает «Да»!
          </p>
        </div>
      </div>

      {/* ================= 1. ПОДЗАГОЛОВОК И ВТОРАЯ СТРОКА ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Тексты подтверждения</h3>
            <p className="text-xs text-slate-500">
              Эмоциональная реакция на долгожданный положительный ответ
            </p>
          </div>
        </div>

        {/* Quick suggestions for title */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Быстрые шаблоны подзаголовка (кликните, чтобы выбрать):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CONFIRMATION_TITLE_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => updateConfirmation({ title: sug })}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-colors border",
                  confirmation.title === sug
                    ? "bg-rose-50 border-rose-200 text-rose-700 font-medium"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Подзаголовок («Подожди, ты реально сказала да?»)</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {confirmation.title.length}/70 символов
            </span>
          </label>
          <input
            type="text"
            maxLength={70}
            value={confirmation.title}
            onChange={(e) => updateConfirmation({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium"
            placeholder="Подожди, ты реально сказала да?! 🥹"
          />
        </div>

        {/* Subtitle / Second line textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Вторая строка (Теплое продолжение / Инструкция)</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {confirmation.subtitle.length}/140 символов
            </span>
          </label>
          <textarea
            rows={2}
            maxLength={140}
            value={confirmation.subtitle}
            onChange={(e) => updateConfirmation({ subtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none leading-relaxed"
            placeholder="Я не верю своему счастью! Теперь давай решим, как мы проведем это время... ✨"
          />
        </div>

        {/* Continue Button Text */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-medium text-slate-700">
            Текст кнопки продолжения
          </label>
          <input
            type="text"
            value={confirmation.continueButtonText}
            onChange={(e) => updateConfirmation({ continueButtonText: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
            placeholder="Выбрать, чем мы займемся 🥰"
          />
        </div>
      </section>

      {/* ================= 2. ВЫБОР СТИКЕРА / КАРТИНКИ / GIF ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Стикер или GIF радости</h3>
              <p className="text-xs text-slate-500">
                Забавная анимация восторга или удивления для подтверждения
              </p>
            </div>
          </div>

          {/* Current thumbnail */}
          {confirmation.stickerUrl && (
            <div className="relative group shrink-0">
              <SafeImage
                src={confirmation.stickerUrl}
                alt="Current Sticker"
                className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 shadow-2xs p-1"
              />
              <button
                type="button"
                onClick={() => updateConfirmation({ stickerUrl: "" })}
                title="Очистить"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* PROMINENT LIVE PREVIEW OF SELECTED STICKER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 via-slate-50 to-pink-50/40 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white flex items-center justify-center p-2 shrink-0">
            {confirmation.stickerUrl ? (
              <SafeImage
                src={confirmation.stickerUrl}
                alt="Активный стикер"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-50">
                <Smile className="w-6 h-6 mb-1 text-slate-300" />
                <span className="text-[10px] font-medium">Нет стикера</span>
              </div>
            )}
            {confirmation.stickerUrl && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Выбран
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`w-2 h-2 rounded-full ${confirmation.stickerUrl ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {confirmation.stickerUrl ? "Активный стикер подтверждения" : "Стикер не выбран"}
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {confirmation.stickerUrl
                ? "Этот анимированный стикер появится на экране радости сразу после нажатия «Да»!"
                : "Выберите анимацию радости из готовых пресетов или загрузите свой стикер."}
            </p>
            {confirmation.stickerUrl && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateConfirmation({ stickerUrl: "" })}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Удалить стикер</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setImageTab("presets")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              imageTab === "presets"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Стикеры (Пресеты)</span>
          </button>
          <button
            onClick={() => setImageTab("upload")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              imageTab === "upload"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            <span>Загрузить свой</span>
          </button>
          <button
            onClick={() => setImageTab("url")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              imageTab === "url"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Ссылка</span>
          </button>
        </div>

        {/* SUBTAB 1: STICKER PRESETS */}
        {imageTab === "presets" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setStickerCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                  stickerCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span>🎉 Все стикеры</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  stickerCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {CONFIRMATION_PRESET_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)}
                </span>
              </button>
              {CONFIRMATION_PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStickerCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                    stickerCategory === cat.id
                      ? "bg-rose-500 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    stickerCategory === cat.id ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    {cat.items.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Stickers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
              {CONFIRMATION_PRESET_CATEGORIES
                .filter((cat) => stickerCategory === "all" || cat.id === stickerCategory)
                .flatMap((cat) => cat.items)
                .map((sticker) => {
                  const isSelected = confirmation.stickerUrl === sticker.url;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => updateConfirmation({ stickerUrl: sticker.url })}
                      className={cn(
                        "relative rounded-xl overflow-hidden border text-left group transition-all aspect-square flex flex-col justify-end p-2 bg-slate-50 cursor-pointer shadow-2xs",
                        isSelected
                          ? "ring-2 ring-rose-500 border-rose-500 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      )}
                    >
                      <SafeImage
                        src={sticker.url}
                        alt={sticker.title}
                        className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 pointer-events-none">
                        <span className="text-[10px] font-medium text-white truncate drop-shadow-xs block">
                          {sticker.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: UPLOAD */}
        {imageTab === "upload" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                dragActive
                  ? "border-rose-400 bg-rose-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50",
                isUploading && "pointer-events-none opacity-85"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 animate-in fade-in">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                  <h4 className="text-xs font-semibold text-slate-800">
                    Загрузка стикера на сервер...
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Сохраняем файл в Storage
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-2xs border border-slate-100 mb-2">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-0.5">
                    Загрузите стикер или GIF с устройства
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Поддерживаются любые GIF, PNG, JPG файлы
                  </p>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                    Выбрать файл
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: URL */}
        {imageTab === "url" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="text-xs font-medium text-slate-700">
              Прямая ссылка на GIF или стикер
            </label>
            <input
              type="url"
              value={confirmation.stickerUrl}
              onChange={(e) => updateConfirmation({ stickerUrl: e.target.value })}
              placeholder="https://media.tenor.com/.../gif"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        )}
      </section>
    </div>
  );
}
