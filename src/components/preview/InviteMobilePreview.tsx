"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart,
  Calendar,
  RotateCcw,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Smile,
  Check,
  Clock,
  Lock,
  Unlock,
  Camera,
  Palette,
} from "lucide-react";
import { VIBES, isColorDark, VibeConfig } from "@/lib/vibes";
import { OpeningOverlay } from "./OpeningOverlay";
import { AudioPlayer } from "./AudioPlayer";
import { formatTemplate } from "@/lib/template";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/common/SafeImage";
import { LoveParticles } from "@/components/common/LoveParticles";
import { VibeType } from "@/types/invite";

interface CloneButton {
  id: number;
  x: number;
  y: number;
  text: string;
}

type PreviewScreen = "invite" | "confirmation" | "activities" | "datetime" | "final";

export function InviteMobilePreview() {
  const {
    general,
    updateGeneral,
    confirmation,
    noButton,
    activitiesConfig,
    activities,
    toggleActivity,
    dateTime,
    updateDateTime,
    audio,
    finalScreen,
    currentStep,
  } = useInviteStore();

  const [isOpened, setIsOpened] = useState(general.openingAnimation === "none");
  const [screen, setScreen] = useState<PreviewScreen>("invite");
  const [direction, setDirection] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [clones, setClones] = useState<CloneButton[]>([]);
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Sync isOpened with openingAnimation
  useEffect(() => {
    if (general.openingAnimation === "none") {
      setIsOpened(true);
    } else {
      setIsOpened(false);
    }
  }, [general.openingAnimation]);

  // Synchronize mobile screen with editor active step (6 builder steps)
  useEffect(() => {
    if (currentStep === 1) {
      setScreen("invite");
    } else if (currentStep === 2) {
      setScreen("confirmation");
    } else if (currentStep === 3) {
      setScreen("activities");
    } else if (currentStep === 4) {
      setScreen(dateTime.enabled ? "datetime" : "final");
    } else if (currentStep === 5 || currentStep === 6) {
      setScreen("final");
    }
  }, [currentStep, dateTime.enabled]);

  // Handle No button evasion/hover/click
  const handleNoInteraction = () => {
    const nextCount = noCount + 1;
    setNoCount(nextCount);

    if (noButton.mode === "runaway") {
      if (containerRef.current && noButtonRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const btn = noButtonRef.current.getBoundingClientRect();

        const baseLeft = btn.left - noOffset.x;
        const baseTop = btn.top - noOffset.y;

        const safePadding = 16;
        const minX = container.left + safePadding - baseLeft;
        const maxX = container.right - btn.width - safePadding - baseLeft;
        const minY = container.top + 55 - baseTop;
        const maxY = container.bottom - btn.height - 40 - baseTop;

        const nextX = minX + Math.random() * (maxX - minX);
        const nextY = minY + Math.random() * (maxY - minY);

        setNoOffset({ x: nextX, y: nextY });
      } else {
        const randomX = (Math.random() - 0.5) * 160;
        const randomY = (Math.random() - 0.5) * 220;
        setNoOffset({ x: randomX, y: randomY });
      }
    }

    if (noButton.mode === "multiply") {
      if (containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const availablePhrases =
          noButton.phrases.length > 0 ? noButton.phrases : [general.noButtonText];

        const newClones: CloneButton[] = Array.from({ length: 2 }).map((_, i) => ({
          id: Date.now() + i + Math.random(),
          x: 16 + Math.random() * (container.width - 120),
          y: 70 + Math.random() * (container.height - 180),
          text: availablePhrases[(nextCount + i) % availablePhrases.length],
        }));

        setClones((prev) => [...prev.slice(-10), ...newClones]);
      }
    }
  };

  const handleYesClick = () => {
    setDirection(1);
    setScreen("confirmation");
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#fda4af", "#f43f5e", "#ffedd5"],
    });
  };

  const handleContinueFromConfirmation = () => {
    setDirection(1);
    setScreen("activities");
  };

  const handleContinueFromActivities = () => {
    setDirection(1);
    if (dateTime.enabled) {
      setScreen("datetime");
    } else {
      setScreen("final");
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleContinueFromDateTime = () => {
    setDirection(1);
    setScreen("final");
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.55 },
    });
  };

  const handleReset = () => {
    setDirection(-1);
    setScreen("invite");
    setIsOpened(general.openingAnimation === "none");
    setNoCount(0);
    setNoOffset({ x: 0, y: 0 });
    setClones([]);
    setIsSecretRevealed(false);
  };

  // Vibe background & dark contrast calculation
  const currentVibe: VibeConfig = VIBES.find((v) => v.id === general.vibe) || VIBES[0];
  const isCustom = general.vibe === "custom";
  const isDark = isCustom
    ? (general.customBgColor ? isColorDark(general.customBgColor) : false)
    : currentVibe.isDark;

  const currentNoPhrase =
    noButton.phrases.length > 0
      ? noButton.phrases[noCount % noButton.phrases.length]
      : general.noButtonText;

  // Safe Yes button scale: gently grows up to 1.25 max, perfectly fitting inside mobile bounds
  const yesScale = noButton.yesButtonGrowth
    ? Math.min(1 + noCount * 0.06, 1.25)
    : 1;

  const noScale =
    noButton.mode === "shrink"
      ? Math.max(0.12, 1 - noCount * 0.18)
      : 1;

  const selectedActivities = activities.filter((a) => a.selected);

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        weekday: "short",
      });
    } catch {
      return dStr;
    }
  };

  // Formatted templates for the final screen
  const selectedActsNames = selectedActivities.map((a) => `${a.icon} ${a.title}`).join(", ");
  const templateContext = {
    date: dateTime.enabled ? formatDisplayDate(dateTime.date) : "в любой день",
    time: dateTime.enabled ? dateTime.time : "в удобное время",
    activity: selectedActsNames || "наш особенный вечер",
    location: finalScreen.location || "уютное место",
  };

  const renderedTitle = formatTemplate(finalScreen.title, templateContext);
  const renderedMessage = formatTemplate(finalScreen.message, templateContext);

  const slideVariants: Variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 35 : -35,
      scale: 0.97,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 350,
        damping: 28,
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -35 : 35,
      scale: 0.97,
      transition: {
        duration: 0.18,
      },
    }),
  };

  // Dynamic contrast classes
  const titleColor = isDark ? "text-white drop-shadow-xs" : "text-slate-900";
  const subtitleColor = isDark ? "text-slate-200/90" : "text-slate-600";
  const cardBg = isDark
    ? "bg-slate-900/85 backdrop-blur-md border border-white/20 text-white shadow-lg"
    : "bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-sm";

  return (
    <div
      ref={containerRef}
      style={{
        background: isCustom && general.customBgColor
          ? general.customBgColor
          : currentVibe.cssGradient,
      }}
      className={cn(
        "relative w-full h-full min-h-full flex flex-col justify-between px-4 py-1.5 transition-colors duration-500 overflow-hidden"
      )}
    >
      {/* Live ambient blur aura */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity",
        isDark
          ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30"
          : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/5"
      )} />

      {/* Live Love Particles */}
      <LoveParticles type={general.particlesType || "hearts"} />

      {/* Opening Animation Overlay */}
      <OpeningOverlay
        type={general.openingAnimation}
        isOpen={isOpened}
        onOpen={() => setIsOpened(true)}
      />

      {/* Top Controls: Quick Theme Swatch & Reset */}
      <div className="absolute top-1.5 right-3 z-30 flex items-center gap-1.5">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          title="Быстрая смена фона"
          className={cn(
            "p-1.5 rounded-full shadow-xs border backdrop-blur-xs transition-all flex items-center gap-1 active:scale-95",
            isDark
              ? "bg-slate-800/80 text-white hover:bg-slate-700 border-white/25"
              : "bg-white/85 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/60"
          )}
        >
          <Palette className="w-3 h-3" />
        </button>

        <button
          onClick={handleReset}
          title="Сбросить превью и начать с экрана 1"
          className={cn(
            "p-1.5 rounded-full shadow-xs border backdrop-blur-xs transition-all flex items-center gap-1 active:scale-95",
            isDark
              ? "bg-slate-800/80 text-white hover:bg-slate-700 border-white/25"
              : "bg-white/85 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/60"
          )}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Theme Picker Popover */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-10 right-3 z-40 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-slate-200 w-56 text-left space-y-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[11px] font-bold text-slate-800">Шаблоны фонов:</span>
              <button
                onClick={() => setShowThemePicker(false)}
                className="text-[10px] text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto no-scrollbar py-0.5">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    updateGeneral({ vibe: v.id as VibeType });
                    setShowThemePicker(false);
                  }}
                  title={v.name}
                  style={{ background: v.cssGradient }}
                  className={cn(
                    "w-11 h-9 rounded-lg border flex flex-col items-center justify-center relative overflow-hidden transition-all text-[9px] font-medium shadow-2xs",
                    general.vibe === v.id
                      ? "ring-2 ring-rose-500 border-rose-500 scale-105 shadow-xs"
                      : "border-slate-300 hover:scale-102"
                  )}
                >
                  <span className={cn("truncate px-0.5 max-w-full text-[8px]", v.isDark ? "text-white" : "text-slate-900")}>
                    {v.name.slice(0, 4)}
                  </span>
                  {general.vibe === v.id && (
                    <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-rose-600 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MULTIPLY CLONE BUTTONS */}
      <AnimatePresence>
        {screen === "invite" &&
          noButton.mode === "multiply" &&
          clones.map((clone) => (
            <motion.button
              key={clone.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              style={{ left: `${clone.x}px`, top: `${clone.y}px` }}
              onMouseEnter={handleNoInteraction}
              onTouchStart={handleNoInteraction}
              onClick={handleNoInteraction}
              className={cn(
                "absolute z-25 px-3 py-1.5 rounded-xl text-[11px] font-medium border shadow-md backdrop-blur-xs whitespace-nowrap active:scale-90",
                isDark
                  ? "bg-slate-900/90 text-white border-white/20"
                  : "bg-white/90 text-slate-700 border-slate-300"
              )}
            >
              {clone.text}
            </motion.button>
          ))}
      </AnimatePresence>

      {/* SCREEN ROUTER */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* ================= SCREEN 1: QUESTION / INVITATION ================= */}
        {screen === "invite" && (
          <motion.div
            key="screen-invite"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-between text-center space-y-3 pt-1 relative z-10"
          >
            {/* Top Cover Image / GIF */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-slate-100 shrink-0 group">
              {general.coverImageUrl ? (
                <SafeImage
                  src={general.coverImageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Sparkles className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Audio Voice Note / Music if enabled */}
            {audio.enabled && audio.url && (
              <div className="w-full">
                <AudioPlayer url={audio.url} title={audio.title} />
              </div>
            )}

            {/* Title & Subtitle with dynamic contrast */}
            <div className="space-y-1.5 px-1">
              <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight leading-snug", titleColor)}>
                {general.title || "Заголовок приглашения"}
              </h2>
              <p className={cn("text-xs leading-relaxed max-w-[280px] mx-auto", subtitleColor)}>
                {general.subtitle || "Подзаголовок приглашения..."}
              </p>
            </div>

            {/* Action Buttons Zone - Perfectly Centered, Never Clips Borders */}
            <div className="w-full pt-1 pb-2 flex flex-col items-center justify-center relative min-h-[92px]">
              <div className="relative w-full flex items-center justify-center min-h-[58px] px-2">
                {/* YES BUTTON */}
                <motion.button
                  animate={{ scale: yesScale }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  onClick={handleYesClick}
                  style={{ transformOrigin: "center center" }}
                  className={cn(
                    "z-20 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 max-w-[270px] select-none",
                    noCount > 0 ? "mx-auto" : ""
                  )}
                >
                  <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                  <span className="truncate max-w-[200px]">{general.yesButtonText || "Да!"}</span>
                </motion.button>

                {/* NO BUTTON */}
                <motion.button
                  ref={noButtonRef}
                  animate={{
                    x: noOffset.x,
                    y: noOffset.y,
                    scale: noScale,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 480,
                    damping: 22,
                    mass: 0.6,
                  }}
                  onMouseEnter={handleNoInteraction}
                  onTouchStart={handleNoInteraction}
                  onClick={handleNoInteraction}
                  style={{ transformOrigin: "center center" }}
                  className={cn(
                    "z-10 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 text-xs font-medium border border-slate-300/80 shadow-xs cursor-pointer active:scale-90 transition-colors whitespace-nowrap",
                    noCount > 0
                      ? "absolute pointer-events-auto"
                      : "ml-3"
                  )}
                >
                  {currentNoPhrase}
                </motion.button>
              </div>

              {noCount > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "text-[10px] font-semibold mt-2.5 tracking-wide px-2.5 py-0.5 rounded-full",
                    isDark ? "bg-white/15 text-rose-300" : "bg-rose-50 text-rose-600"
                  )}
                >
                  Попыток отказаться: {noCount}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= SCREEN 2: CONFIRMATION ================= */}
        {screen === "confirmation" && (
          <motion.div
            key="screen-confirmation"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-between text-center space-y-4 pt-1 relative z-10"
          >
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-white/70 backdrop-blur-xs shrink-0 flex items-center justify-center p-2 group">
              {confirmation.stickerUrl ? (
                <SafeImage
                  src={confirmation.stickerUrl}
                  alt="Confirmation Sticker"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Smile className="w-16 h-16 text-rose-400" />
              )}
            </div>

            <div className="space-y-2 px-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/90 text-rose-700 text-[10px] font-semibold border border-rose-200">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Она сказала ДА!</span>
              </div>
              <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight leading-snug", titleColor)}>
                {confirmation.title || "Подожди, ты реально сказала да?!"}
              </h2>
              <p className={cn("text-xs leading-relaxed max-w-[280px] mx-auto", subtitleColor)}>
                {confirmation.subtitle || "Я не верю своему счастью! Теперь давай решим, куда пойдем..."}
              </p>
            </div>

            <div className="w-full pt-2 pb-2">
              <button
                onClick={handleContinueFromConfirmation}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{confirmation.continueButtonText || "Выбрать, чем мы займемся 🥰"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= SCREEN 3: ACTIVITIES (GRID 2x2) ================= */}
        {screen === "activities" && (
          <motion.div
            key="screen-activities"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col justify-between space-y-3 pt-1 relative z-10"
          >
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                <span>План свидания</span>
              </div>
              <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight leading-snug", titleColor)}>
                {activitiesConfig.title || "Чем мы займемся? 🥰"}
              </h2>
              <p className={cn("text-xs leading-relaxed max-w-[260px] mx-auto", subtitleColor)}>
                {activitiesConfig.subtitle || "Выбери один или несколько вариантов"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-auto py-1">
              {activities.map((act) => {
                const isSelected = act.selected;
                return (
                  <motion.button
                    key={act.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleActivity(act.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden h-28 select-none",
                      isSelected
                        ? "bg-rose-50/95 border-rose-400 ring-2 ring-rose-400/30 shadow-sm"
                        : isDark
                          ? "bg-slate-900/75 border-white/20 hover:bg-slate-800/80 shadow-2xs"
                          : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-rose-500 text-white shadow-2xs"
                          : isDark
                            ? "border border-white/30 bg-white/10"
                            : "border border-slate-300 bg-white/60"
                      )}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-2xl drop-shadow-2xs">{act.icon}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold leading-tight line-clamp-2 px-1",
                        isSelected
                          ? "text-rose-950 font-bold"
                          : isDark
                            ? "text-slate-100"
                            : "text-slate-800"
                      )}
                    >
                      {act.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-2 pt-1 pb-2">
              <p className={cn("text-center text-[11px]", isDark ? "text-slate-300" : "text-slate-500")}>
                Выбрано вариантов: <span className="font-bold text-rose-500">{selectedActivities.length}</span>
              </p>
              <button
                onClick={handleContinueFromActivities}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{activitiesConfig.continueButtonText || "Продолжить 📅"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= SCREEN 4: DATE & TIME ================= */}
        {screen === "datetime" && dateTime.enabled && (
          <motion.div
            key="screen-datetime"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col justify-between space-y-4 pt-1 relative z-10"
          >
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold border border-purple-200">
                <span>Время встречи</span>
              </div>
              <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight leading-snug", titleColor)}>
                {dateTime.title || "Когда встретимся? 🗓️"}
              </h2>
              <p className={cn("text-xs leading-relaxed max-w-[260px] mx-auto", subtitleColor)}>
                {dateTime.subtitle || "Выбери день и время нашей встречи"}
              </p>
            </div>

            <div className={cn("rounded-2xl p-4 space-y-3.5 my-auto", cardBg)}>
              {dateTime.selectionMode === "sender_sets" ? (
                /* Режим: Дата назначена автором */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center border border-purple-100 shrink-0 shadow-2xs">
                      <Calendar className="w-5 h-5 mb-0.5" />
                    </div>
                    <div className="flex-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider block", isDark ? "text-purple-300" : "text-purple-700")}>
                        Назначенная дата
                      </span>
                      <span className={cn("text-xs font-bold capitalize", isDark ? "text-white" : "text-slate-900")}>
                        {formatDisplayDate(dateTime.date) || dateTime.date}
                      </span>
                    </div>
                  </div>

                  <div className={cn("h-px", isDark ? "bg-white/10" : "bg-slate-100")} />

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex flex-col items-center justify-center border border-amber-100 shrink-0 shadow-2xs">
                      <Clock className="w-5 h-5 mb-0.5" />
                    </div>
                    <div className="flex-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider block", isDark ? "text-amber-300" : "text-amber-700")}>
                        Время встречи
                      </span>
                      <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-900")}>
                        {dateTime.time}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Режим: Дату выбирает гость */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", isDark ? "text-rose-300" : "text-rose-600")}>
                      <span>🗓️ Гость выберет день:</span>
                    </label>
                    <input
                      type="date"
                      value={dateTime.date}
                      onChange={(e) => updateDateTime({ date: e.target.value })}
                      className={cn(
                        "w-full px-3 py-1.5 rounded-xl border text-xs font-semibold",
                        isDark
                          ? "bg-slate-800 border-white/20 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      )}
                    />
                    <span className={cn("text-[10px] pl-1", isDark ? "text-slate-300" : "text-slate-500")}>
                      {formatDisplayDate(dateTime.date)}
                    </span>
                  </div>

                  <div className={cn("space-y-1.5 pt-1 border-t", isDark ? "border-white/10" : "border-slate-100")}>
                    <label className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>Время:</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {["18:00", "19:00", "20:30"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateDateTime({ time: slot })}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                            dateTime.time === slot
                              ? "bg-rose-500 text-white"
                              : isDark
                                ? "bg-slate-800 text-slate-300 border border-white/15"
                                : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full pt-1 pb-2">
              <button
                onClick={handleContinueFromDateTime}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{dateTime.continueButtonText || "Завершить и подтвердить ✨"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= SCREEN 5: FINAL TRIUMPH (ШАГ 5) ================= */}
        {screen === "final" && (
          <motion.div
            key="screen-final"
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col justify-between space-y-3 pt-1 pb-1 relative z-10 overflow-y-auto no-scrollbar"
          >
            {/* Top GIF / Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-slate-100 shrink-0">
              {finalScreen.imageUrl ? (
                <SafeImage
                  src={finalScreen.imageUrl}
                  alt="Success Celebration"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-500">
                  <Heart className="w-12 h-12 fill-rose-500" />
                </div>
              )}
            </div>

            {/* Rendered Title & Message with tags replaced */}
            <div className="space-y-1 px-1 text-center">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                <span>Приглашение принято</span>
              </div>
              <h2 className={cn("text-base sm:text-lg font-bold tracking-tight leading-snug", titleColor)}>
                {renderedTitle}
              </h2>
              <p className={cn("text-xs leading-relaxed", subtitleColor)}>
                {renderedMessage}
              </p>
            </div>

            {/* Date and Location Card */}
            {dateTime.enabled && (
              <div className={cn("w-full rounded-xl p-2.5 space-y-2 text-left", cardBg)}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className={cn("text-xs font-semibold", isDark ? "text-slate-100" : "text-slate-800")}>
                    {formatDisplayDate(dateTime.date)} в {dateTime.time}
                  </span>
                </div>
              </div>
            )}

            {/* Audio Message if enabled */}
            {audio.enabled && audio.url && (
              <div className="w-full">
                <AudioPlayer url={audio.url} title={audio.title} />
              </div>
            )}

            {/* PHOTO ALBUM: НАШИ МОМЕНТЫ (ДО 12 ФОТО) */}
            {finalScreen.photoAlbum.length > 0 && (
              <div className={cn("w-full rounded-2xl p-2.5 space-y-1.5 text-left", cardBg)}>
                <div className="flex items-center justify-between px-1">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", isDark ? "text-slate-300" : "text-slate-600")}>
                    <Camera className="w-3 h-3 text-rose-500" />
                    <span>Наши моменты</span>
                  </span>
                  <span className={cn("text-[10px] font-mono", isDark ? "text-slate-400" : "text-slate-400")}>
                    {finalScreen.photoAlbum.length} фото
                  </span>
                </div>
                {/* Horizontal Snap Scroll Carousel */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
                  {finalScreen.photoAlbum.map((photo, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs group"
                    >
                      <SafeImage
                        src={photo}
                        alt={`Memory #${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECRET MESSAGE INTERACTIVE CARD */}
            {finalScreen.secretMessage && (
              <div className="w-full">
                {!isSecretRevealed ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setIsSecretRevealed(true);
                      confetti({
                        particleCount: 40,
                        spread: 50,
                        origin: { y: 0.8 },
                        colors: ["#fda4af", "#fbbf24"],
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs font-medium shadow-xs flex items-center justify-center gap-2 transition-all hover:bg-amber-100/90"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>🤫 Секретное послание (нажми, чтобы открыть)</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-3 rounded-xl border text-left shadow-2xs space-y-1",
                      isDark
                        ? "bg-slate-900/90 border-rose-400/40 text-slate-100"
                        : "bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-200/80 text-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                      <Unlock className="w-3 h-3" />
                      <span>Личное послание для тебя:</span>
                    </div>
                    <p className="text-xs italic leading-relaxed">
                      {finalScreen.secretMessage}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Reset test button */}
            <button
              onClick={handleReset}
              className={cn(
                "w-full py-2.5 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-2xs shrink-0",
                isDark
                  ? "border-white/20 bg-slate-800/80 text-white hover:bg-slate-700"
                  : "border-slate-200 bg-white/80 hover:bg-white text-slate-700"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Протестировать сначала</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
