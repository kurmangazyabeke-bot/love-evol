"use client";

import React, { useState, useRef } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { VIBES, OPENING_ANIMATIONS, CUSTOM_COLOR_PRESETS, VibeCategory, isColorDark } from "@/lib/vibes";
import { VibeType, OpeningAnimationType, ParticlesType } from "@/types/invite";
import {
  Sparkles,
  Upload,
  Check,
  Gift,
  Mail,
  ShieldAlert,
  Eye,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  FileImage,
  Flame,
  Mic,
  Loader2,
  Music,
  Palette,
  Pipette,
  Sun,
  Moon,
  Lock,
  KeyRound,
  Heart,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/api";
import { AudioPlayer } from "@/components/preview/AudioPlayer";
import { SafeImage } from "@/components/common/SafeImage";
import { COVER_PRESET_CATEGORIES } from "@/lib/gifCatalog";
import { SmartLoveTextAssistant } from "@/components/common/SmartLoveTextAssistant";
import { VoiceRecorder } from "@/components/common/VoiceRecorder";
import { SYNTH_MELODY_PRESETS } from "@/lib/soundEffects";

const TITLE_SUGGESTIONS = [
  "Пойдешь со мной на свидание? 💖",
  "Будешь моей Валентинкой? 🌹",
  "Приглашаю тебя на особенный вечер! ✨",
  "Ты свободна в эту пятницу? 😉",
];

const AUDIO_PRESETS = SYNTH_MELODY_PRESETS.map((m) => ({
  title: m.title,
  subtitle: m.subtitle,
  url: m.url,
}));

export function Step1Invitation() {
  const { general, updateGeneral, audio, updateAudio } = useInviteStore();
  const [vibeCategory, setVibeCategory] = useState<"all" | VibeCategory>("all");
  const [imageTab, setImageTab] = useState<"upload" | "presets" | "url">("presets");
  const [coverCategory, setCoverCategory] = useState<string>("all");
  const [audioTab, setAudioTab] = useState<"record" | "upload" | "presets" | "url">("record");
  const [dragActive, setDragActive] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload for cover image
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение (JPG, PNG, GIF, WebP)");
      return;
    }
    setIsUploadingCover(true);
    setUploadError(null);
    try {
      const res = await uploadFile(file, "images");
      if (res.url) {
        updateGeneral({ coverImageUrl: res.url });
      }
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Ошибка загрузки изображения");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Handle audio file upload
  const handleAudioFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Пожалуйста, загрузите аудиофайл (MP3, WAV, M4A, OGG)");
      return;
    }
    setIsUploadingAudio(true);
    try {
      const res = await uploadFile(file, "audio");
      if (res.url) {
        updateAudio({
          url: res.url,
          enabled: true,
          title: audio.title || file.name.replace(/\.[^/.]+$/, ""),
        });
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Ошибка загрузки аудиофайла");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getAnimationIcon = (iconName: string) => {
    switch (iconName) {
      case "Gift":
        return <Gift className="w-5 h-5 text-rose-500" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-sky-500" />;
      case "Mail":
        return <Mail className="w-5 h-5 text-amber-500" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      default:
        return <Eye className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SMART LOVE ASSISTANT HERO BANNER */}
      <div className="bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-amber-500/10 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Не знаешь, что написать? Умный помощник по текстам</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">NEW</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Выбери готовый сценарий: Первое свидание, 14 февраля, Годовщина или Примирение
            </p>
          </div>
        </div>
        <SmartLoveTextAssistant />
      </div>

      {/* ================= 1. СЕЛЕКТОР "ЗАДНИЙ ФОН & ШАБЛОНЫ ОФОРМЛЕНИЯ" ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Задний фон & Шаблоны оформления</h3>
              <p className="text-xs text-slate-500">Готовые романтические темы или выбор своего уникального цвета</p>
            </div>
          </div>

          {/* Current theme active badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {general.vibe === "custom" ? (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: general.customBgColor || "#ffe4e6" }}
                />
                <span>Свой цвет ({general.customBgColor || "#ffe4e6"})</span>
              </span>
            ) : (
              (() => {
                const cur = VIBES.find((v) => v.id === general.vibe);
                return (
                  <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1.5", cur?.tagClass)}>
                    {cur?.isDark ? <Moon className="w-3 h-3 text-purple-300" /> : <Sun className="w-3 h-3 text-amber-500" />}
                    <span>{cur?.name || "Шаблон"}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      {cur?.isDark ? "(Тёмная тема)" : "(Светлая тема)"}
                    </span>
                  </span>
                );
              })()
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "Все шаблоны" },
            { id: "pastel", label: "🌸 Пастельные" },
            { id: "light", label: "🕊️ Светлые" },
            { id: "romantic", label: "💖 Романтичные" },
            { id: "dark", label: "🌌 Ночные (Dark)" },
            { id: "custom", label: "🎨 Свой цвет" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setVibeCategory(cat.id as "all" | VibeCategory)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                vibeCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* CUSTOM COLOR PALETTE STUDIO (Shown when category is 'custom' or vibe is 'custom') */}
        {(vibeCategory === "custom" || general.vibe === "custom") && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-purple-50/60 border border-rose-200/70 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-800">Палитра готовых оттенков:</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {isColorDark(general.customBgColor || "#ffe4e6")
                  ? "🌙 Тёмный фон (белый текст)"
                  : "☀️ Светлый фон (темный текст)"}
              </span>
            </div>

            {/* Quick Palette Swatches */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {CUSTOM_COLOR_PRESETS.map((color) => {
                const isActive = general.vibe === "custom" && general.customBgColor?.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      updateGeneral({ vibe: "custom", customBgColor: color.hex });
                    }}
                    className={cn(
                      "p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group hover:scale-102",
                      isActive
                        ? "ring-2 ring-rose-500 border-rose-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isActive && (
                        <Check className={cn("w-3.5 h-3.5 stroke-[3]", color.isDark ? "text-white" : "text-slate-900")} />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700 truncate max-w-full">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manual Color Picker & Hex Input */}
            <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300">
                <input
                  type="color"
                  value={general.customBgColor || "#ffe4e6"}
                  onChange={(e) => {
                    updateGeneral({ vibe: "custom", customBgColor: e.target.value });
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs font-medium text-slate-700">Выбрать пипеткой</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">HEX:</span>
                <input
                  type="text"
                  value={general.customBgColor || "#ffe4e6"}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateGeneral({ vibe: "custom", customBgColor: val });
                  }}
                  placeholder="#ffe4e6"
                  maxLength={7}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  updateGeneral({ vibe: "sunset-blush", customBgColor: undefined });
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-auto cursor-pointer"
              >
                Сбросить к шаблонам
              </button>
            </div>
          </div>
        )}

        {/* TEMPLATE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIBES.filter((v) => vibeCategory === "all" || v.category === vibeCategory).map((vibe) => {
            const isSelected = general.vibe === vibe.id;
            return (
              <button
                key={vibe.id}
                onClick={() => updateGeneral({ vibe: vibe.id as VibeType })}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-32 cursor-pointer shadow-2xs",
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-500/40 shadow-md scale-[1.02]"
                    : "border-slate-300/80 hover:border-slate-400 hover:shadow-xs"
                )}
              >
                {/* Visual live gradient swatch background - 100% bulletproof CSS gradient */}
                <div
                  className="absolute inset-0 transition-opacity group-hover:opacity-95"
                  style={{ background: vibe.cssGradient }}
                />
                {/* Subtle sheen highlight */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none" />

                {/* Top header & badge */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-2xs flex items-center gap-1", vibe.tagClass)}>
                    {vibe.isDark ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                    <span>{vibe.name}</span>
                  </span>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Выбрать
                    </span>
                  )}
                </div>

                {/* Live mini sample representation showing text contrast */}
                <div className="relative z-10 my-auto">
                  <span
                    className={cn(
                      "text-xs font-bold block drop-shadow-2xs leading-snug",
                      vibe.isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    Приглашение 💖
                  </span>
                  <p
                    className={cn(
                      "text-[10px] font-medium leading-tight line-clamp-1 mt-0.5",
                      vibe.isDark ? "text-slate-200/90" : "text-slate-600"
                    )}
                  >
                    {vibe.subtitle}
                  </p>
                </div>

                {/* Bottom meta tag */}
                <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500">
                  <span className={cn("font-medium", vibe.isDark ? "text-slate-300" : "text-slate-600")}>
                    {vibe.category === "pastel" && "Пастель"}
                    {vibe.category === "light" && "Светлый"}
                    {vibe.category === "romantic" && "Романтика"}
                    {vibe.category === "dark" && "Ночной нуар"}
                    {vibe.category === "custom" && "Палитра"}
                  </span>
                  <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded", vibe.isDark ? "bg-white/20 text-white" : "bg-black/5 text-slate-700")}>
                    {vibe.isDark ? "Dark Text Mode" : "Light Text Mode"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= 2. ВЫБОР АНИМАЦИИ ОТКРЫТИЯ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Анимация открытия</h3>
            <p className="text-xs text-slate-500">Интерактивный сценарий первого знакомства с открыткой</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPENING_ANIMATIONS.map((anim) => {
            const isSelected = general.openingAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => updateGeneral({ openingAnimation: anim.id as OpeningAnimationType })}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 relative",
                  isSelected
                    ? "border-rose-400 bg-rose-50/30 ring-2 ring-rose-400/20"
                    : "border-slate-200/80 hover:border-slate-300 bg-white"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                  {getAnimationIcon(anim.iconName)}
                </div>
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-900">{anim.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                      {anim.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{anim.description}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= 2.5. АТМОСФЕРА & ПРИВАТНОСТЬ (ЧАСТИЦЫ И ПИН-КОД) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Атмосфера & Приватность</h3>
            <p className="text-xs text-slate-500">Летающие частицы на фоне и секретный код для входа</p>
          </div>
        </div>

        {/* Particles Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700">Летающие романтические частицы</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "hearts", label: "💖 Сердечки", desc: "Классическая любовь" },
              { id: "roses", label: "🌹 Лепестки роз", desc: "Алые розы" },
              { id: "butterflies", label: "🦋 Бабочки", desc: "Легкость и трепет" },
              { id: "champagne", label: "🥂 Шампанское", desc: "Праздничный блеск" },
              { id: "stars", label: "✨ Золотые звезды", desc: "Сияющая магия" },
              { id: "sakura", label: "🌸 Сакура", desc: "Нежная весна" },
              { id: "cats", label: "🐾 Кошачьи лапки", desc: "Милота и уют" },
              { id: "none", label: "🚫 Без частиц", desc: "Чистый минимализм" },
            ].map((p) => {
              const isSelected = (general.particlesType || "hearts") === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateGeneral({ particlesType: p.id as ParticlesType })}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                    isSelected
                      ? "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 font-semibold shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              🔔 Мягкие звуковые эффекты при кликах
            </span>
            <span className="text-[11px] text-slate-500">
              Приятные звуки при открытии ленты, убегании кнопки «Нет» и согласии
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateGeneral({ soundEffects: general.soundEffects === false ? true : false })}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
              general.soundEffects !== false ? "bg-rose-500" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                general.soundEffects !== false ? "translate-x-6 left-0" : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>

        {/* PIN Code Protection Input */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Защитный ПИН-код для входа (опционально)</span>
            </label>
            {general.pinCode && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                🔒 Защита включена
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              maxLength={8}
              value={general.pinCode || ""}
              onChange={(e) => updateGeneral({ pinCode: e.target.value.replace(/\s+/g, "") })}
              placeholder="Например: 1402 (дата знакомства)"
              className="max-w-xs w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
            />
            {general.pinCode && (
              <button
                type="button"
                onClick={() => updateGeneral({ pinCode: "" })}
                className="text-xs text-rose-600 hover:underline"
              >
                Снять защиту
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Если указан код, гость должен будет ввести его, чтобы открыть открытку. Оставьте пустым для свободного входа.
          </p>
        </div>
      </section>

      {/* ================= 3. ИНПУТЫ ДЛЯ ЗАГОЛОВКА И ПОДЗАГОЛОВКА ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Имена & Тексты приглашения</h3>
            <p className="text-xs text-slate-500">Персонализируйте открытку именами и теплым посланием</p>
          </div>
        </div>

        {/* Personalization Names: Recipient & Sender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/60">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>💌 Для кого (Имя половинки)</span>
            </label>
            <input
              type="text"
              maxLength={32}
              value={general.recipientName || ""}
              onChange={(e) => updateGeneral({ recipientName: e.target.value })}
              placeholder="Например: Аружан, Солнышко"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>✨ От кого (Ваше имя / подпись)</span>
            </label>
            <input
              type="text"
              maxLength={32}
              value={general.senderName || ""}
              onChange={(e) => updateGeneral({ senderName: e.target.value })}
              placeholder="Например: От твоего любимого"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Title suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Быстрые шаблоны заголовка (кликните, чтобы вставить):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TITLE_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => updateGeneral({ title: sug })}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-colors border",
                  general.title === sug
                    ? "bg-rose-50 border-rose-200 text-rose-700 font-medium"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Title input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Главный вопрос (Заголовок)</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {general.title.length}/60 символов
            </span>
          </label>
          <input
            type="text"
            maxLength={60}
            value={general.title}
            onChange={(e) => updateGeneral({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium"
            placeholder="Например, Пойдешь со мной на свидание? 💖"
          />
        </div>

        {/* Subtitle textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Подзаголовок / Теплое обращение</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {general.subtitle.length}/150 символов
            </span>
          </label>
          <textarea
            rows={3}
            maxLength={150}
            value={general.subtitle}
            onChange={(e) => updateGeneral({ subtitle: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none leading-relaxed"
            placeholder="Расскажите о своих чувствах или намекните на приятный сюрприз..."
          />
        </div>

        {/* Button Texts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Текст кнопки согласия («Да»)</label>
            <input
              type="text"
              value={general.yesButtonText}
              onChange={(e) => updateGeneral({ yesButtonText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Да, с радостью! 🥰"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Текст кнопки отказа («Нет»)</label>
            <input
              type="text"
              value={general.noButtonText}
              onChange={(e) => updateGeneral({ noButtonText: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Нет..."
            />
          </div>
        </div>
      </section>

      {/* ================= 4. ЗАГРУЗКА ФАЙЛА ИЛИ ВЫБОР ИЗ ПРЕСЕТОВ ДЛЯ КАРТИНКИ / GIF ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Изображение или GIF обложки</h3>
              <p className="text-xs text-slate-500">Загрузите файл с устройства или выберите из готовой коллекции</p>
            </div>
          </div>

          {/* Current cover thumbnail if exists */}
          {general.coverImageUrl && (
            <div className="relative group shrink-0">
              <SafeImage
                src={general.coverImageUrl}
                alt="Current Cover"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
              <button
                onClick={() => updateGeneral({ coverImageUrl: "" })}
                title="Очистить"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* PROMINENT LIVE PREVIEW OF SELECTED COVER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-rose-50/40 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-36 aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0">
            {general.coverImageUrl ? (
              <SafeImage
                src={general.coverImageUrl}
                alt="Активная обложка"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-50">
                <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                <span className="text-[11px] font-medium">Нет обложки</span>
              </div>
            )}
            {general.coverImageUrl && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Активно
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`w-2 h-2 rounded-full ${general.coverImageUrl ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {general.coverImageUrl ? "Выбранное изображение обложки" : "Обложка пока не выбрана"}
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {general.coverImageUrl
                ? "Это изображение или GIF гость увидит в самом центре первого экрана."
                : "Выберите анимацию из каталога ниже или загрузите свой файл."}
            </p>
            {general.coverImageUrl && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateGeneral({ coverImageUrl: "" })}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Удалить обложку</span>
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
            <span>Пресеты (GIF / Фото)</span>
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
            <span>Загрузить файл</span>
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
            <span>Вставить ссылку</span>
          </button>
        </div>

        {/* SUBTAB A: PRESETS */}
        {imageTab === "presets" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setCoverCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                  coverCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span>✨ Все варианты</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  coverCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {COVER_PRESET_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)}
                </span>
              </button>
              {COVER_PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCoverCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                    coverCategory === cat.id
                      ? "bg-rose-500 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    coverCategory === cat.id ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    {cat.items.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
              {COVER_PRESET_CATEGORIES
                .filter((cat) => coverCategory === "all" || cat.id === coverCategory)
                .flatMap((cat) => cat.items)
                .map((item) => {
                  const isSelected = general.coverImageUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateGeneral({ coverImageUrl: item.url })}
                      className={cn(
                        "relative rounded-xl overflow-hidden border text-left group transition-all aspect-[4/3] flex flex-col justify-end p-2 cursor-pointer shadow-2xs",
                        isSelected
                          ? "ring-2 ring-rose-500 border-rose-500 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      )}
                    >
                      <SafeImage
                        src={item.url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                      <span className="relative z-10 text-[11px] font-medium text-white truncate drop-shadow-sm">
                        {item.title}
                      </span>
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

        {/* SUBTAB B: UPLOAD FILE */}
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
              onClick={() => !isUploadingCover && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden",
                dragActive
                  ? "border-rose-400 bg-rose-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50",
                isUploadingCover && "pointer-events-none opacity-85"
              )}
            >
              {isUploadingCover ? (
                <div className="flex flex-col items-center justify-center py-2 animate-in fade-in">
                  <Loader2 className="w-9 h-9 text-rose-500 animate-spin mb-3" />
                  <h4 className="text-sm font-semibold text-slate-800 mb-0.5">
                    Загрузка изображения на сервер...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Оптимизируем файл и сохраняем в хранилище
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-2xs border border-slate-100 mb-3">
                    <FileImage className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">
                    Нажмите для выбора файла или перетащите сюда
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mb-3">
                    Поддерживаются анимации GIF, фото JPG, PNG, WebP (до 10MB)
                  </p>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                    Выбрать файл
                  </span>
                </>
              )}
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* SUBTAB C: DIRECT URL */}
        {imageTab === "url" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Прямая ссылка на GIF или изображение</label>
              <input
                type="url"
                value={general.coverImageUrl}
                onChange={(e) => updateGeneral({ coverImageUrl: e.target.value })}
                placeholder="https://media.tenor.com/.../gif"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Совет: вы можете скопировать прямую ссылку на любую GIF с Tenor или Giphy!
            </p>
          </div>
        )}
      </section>

      {/* ================= 5. ГОЛОСОВОЕ СООБЩЕНИЕ / АУДИО (STORAGE) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Голосовое послание / Фоновая музыка
              </h3>
              <p className="text-xs text-slate-500">
                Загрузите нежное аудиосообщение (MP3/WAV) или выберите романтическую мелодию
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => updateAudio({ enabled: !audio.enabled })}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs",
              audio.enabled ? "bg-rose-500" : "bg-slate-200"
            )}
            title={audio.enabled ? "Аудио включено" : "Аудио выключено"}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                audio.enabled ? "translate-x-6 left-0" : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>

        {audio.enabled && (
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Audio Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Название аудиозаписи</label>
              <input
                type="text"
                value={audio.title}
                onChange={(e) => updateAudio({ title: e.target.value })}
                placeholder="Голосовое признание для тебя ❤️"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Current Audio Player Preview */}
            {audio.url && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-rose-500" />
                    <span>Предпросмотр загруженного аудио:</span>
                  </span>
                  <button
                    onClick={() => updateAudio({ url: "" })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Удалить аудио</span>
                  </button>
                </div>
                <AudioPlayer url={audio.url} title={audio.title} />
              </div>
            )}

            {/* Audio Source Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => setAudioTab("record")}
                className={cn(
                  "flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer",
                  audioTab === "record"
                    ? "bg-rose-500 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>🎙️ Записать голос</span>
              </button>
              <button
                onClick={() => setAudioTab("presets")}
                className={cn(
                  "flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer",
                  audioTab === "presets"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Мелодии</span>
              </button>
              <button
                onClick={() => setAudioTab("upload")}
                className={cn(
                  "flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer",
                  audioTab === "upload"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Upload className="w-3.5 h-3.5 text-rose-500" />
                <span>Файл MP3</span>
              </button>
              <button
                onClick={() => setAudioTab("url")}
                className={cn(
                  "flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer",
                  audioTab === "url"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <LinkIcon className="w-3.5 h-3.5 text-purple-500" />
                <span>Ссылка</span>
              </button>
            </div>

            {/* TAB 0: VOICE RECORDER */}
            {audioTab === "record" && (
              <VoiceRecorder
                initialAudioUrl={audio.url}
                onAudioReady={(url) => {
                  updateAudio({
                    url,
                    enabled: true,
                    title: audio.title || "Голосовое послание для тебя 🎙️",
                  });
                }}
                onClear={() => updateAudio({ url: "" })}
              />
            )}

            {/* TAB 1: UPLOAD AUDIO */}
            {audioTab === "upload" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAudioFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onClick={() => !isUploadingAudio && audioInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                    isUploadingAudio
                      ? "border-rose-400 bg-rose-50/50 pointer-events-none"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                  )}
                >
                  {isUploadingAudio ? (
                    <div className="flex flex-col items-center justify-center py-1">
                      <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                      <h4 className="text-xs font-semibold text-slate-800">
                        Загрузка аудиофайла на сервер...
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Сохранение голосовой дорожки в Storage
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-2xs border border-slate-100 mb-2">
                        <Mic className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 mb-0.5">
                        Выберите голосовую запись или MP3
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Поддерживаются MP3, WAV, OGG, M4A (до 20MB)
                      </p>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                        Выбрать аудиофайл
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PRESETS */}
            {audioTab === "presets" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {AUDIO_PRESETS.map((p, idx) => {
                  const isSelected = audio.url === p.url;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between transition-all",
                        isSelected
                          ? "bg-rose-50/70 border-rose-400 ring-1 ring-rose-400"
                          : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white text-rose-500 flex items-center justify-center border border-slate-200 shadow-2xs">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-900 block">
                            {p.title}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          updateAudio({
                            url: p.url,
                            title: p.title,
                            enabled: true,
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          isSelected
                            ? "bg-rose-500 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {isSelected ? "Выбрано" : "Выбрать"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: URL */}
            {audioTab === "url" && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-medium text-slate-700">
                  Прямая ссылка на MP3 или аудиопоток
                </label>
                <input
                  type="url"
                  value={audio.url}
                  onChange={(e) => updateAudio({ url: e.target.value, enabled: true })}
                  placeholder="https://.../music.mp3"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
