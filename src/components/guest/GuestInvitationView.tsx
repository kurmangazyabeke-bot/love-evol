"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  Smile,
  Check,
  Clock,
  Lock,
  Unlock,
  Camera,
  CheckCircle,
  Loader2,
  Share2,
  Send,
  MessageSquare,
  RotateCcw,
  CheckCheck,
  X,
} from "lucide-react";
import { DbInvitation, GuestAnswers, QuizAnswerEntry } from "@/types/db";
import {
  GeneralInfo,
  ConfirmationSettings,
  NoButtonSettings,
  ActivitiesConfig,
  ActivityOption,
  DateTimeSettings,
  AudioSettings,
  FinalScreenSettings,
  CouponsSettings,
} from "@/types/invite";
import {
  initialGeneral,
  initialConfirmation,
  initialNoButton,
  initialActivitiesConfig,
  initialActivities,
  initialDateTime,
  initialAudio,
  initialFinalScreen,
  initialCoupons,
} from "@/store/useInviteStore";
import { VIBES, isColorDark, VibeConfig } from "@/lib/vibes";
import { OpeningOverlay } from "@/components/preview/OpeningOverlay";
import { AudioPlayer } from "@/components/preview/AudioPlayer";
import { formatTemplate } from "@/lib/template";
import { submitGuestAnswers, recordGuestView } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/common/SafeImage";
import { LoveParticles } from "@/components/common/LoveParticles";
import { PinCodeProtection } from "@/components/common/PinCodeProtection";
import { LoveQuiz } from "@/components/common/LoveQuiz";
import { ScratchCard } from "@/components/common/ScratchCard";
import { CalendarExportButton } from "@/components/common/CalendarExportButton";
import { DateCountdown } from "@/components/common/DateCountdown";
import { LoveCouponsDeck } from "@/components/common/LoveCouponsDeck";
import { DatePassTicket } from "@/components/common/DatePassTicket";
import { playDodgeBoing, playMagicalChime, playSoftPop } from "@/lib/soundEffects";
import { QuizSettings } from "@/types/invite";

interface CloneButton {
  id: number;
  x: number;
  y: number;
  text: string;
}

type GuestScreen = "invite" | "confirmation" | "activities" | "datetime" | "final";

interface GuestInvitationViewProps {
  invitation: DbInvitation;
}

export function GuestInvitationView({ invitation }: GuestInvitationViewProps) {
  // Extract and safely fallback invitation config
  const rawConfig = (invitation.config || {}) as Record<string, unknown>;

  const general: GeneralInfo = {
    ...initialGeneral,
    ...((rawConfig.general as Partial<GeneralInfo>) || {}),
  };
  const confirmation: ConfirmationSettings = {
    ...initialConfirmation,
    ...((rawConfig.confirmation as Partial<ConfirmationSettings>) || {}),
  };
  const noButton: NoButtonSettings = {
    ...initialNoButton,
    ...((rawConfig.noButton as Partial<NoButtonSettings>) || {}),
  };
  const activitiesConfig: ActivitiesConfig = {
    ...initialActivitiesConfig,
    ...((rawConfig.activitiesConfig as Partial<ActivitiesConfig>) || {}),
  };
  const activities: ActivityOption[] = Array.isArray(rawConfig.activities) && rawConfig.activities.length > 0
    ? (rawConfig.activities as ActivityOption[])
    : initialActivities;
  const dateTime: DateTimeSettings = {
    ...initialDateTime,
    ...((rawConfig.dateTime as Partial<DateTimeSettings>) || {}),
  };
  const audio: AudioSettings = {
    ...initialAudio,
    ...((rawConfig.audio as Partial<AudioSettings>) || {}),
  };
  const finalScreen: FinalScreenSettings = {
    ...initialFinalScreen,
    ...((rawConfig.finalScreen as Partial<FinalScreenSettings>) || {}),
  };

  const quiz = (rawConfig.quiz as QuizSettings) || { enabled: false, questions: [] };
  const coupons: CouponsSettings = {
    ...initialCoupons,
    ...((rawConfig.coupons as Partial<CouponsSettings>) || {}),
  };

  const prevGuestAnswers = (invitation.guest_answers || {}) as GuestAnswers;

  // State
  const [isPinUnlocked, setIsPinUnlocked] = useState(!general.pinCode);
  const [quizPassed, setQuizPassed] = useState(!quiz.enabled || !quiz.questions || quiz.questions.length === 0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswerEntry[]>(prevGuestAnswers.quizAnswers || []);
  const [isOpened, setIsOpened] = useState(general.openingAnimation === "none");
  const [screen, setScreen] = useState<GuestScreen>("invite");
  const [direction, setDirection] = useState(1);
  const [noCount, setNoCount] = useState(0);
  const [noRotation, setNoRotation] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [clones, setClones] = useState<CloneButton[]>([]);
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Guest Answers State
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(
    activities.filter((a) => a.selected).map((a) => a.id)
  );
  const [customActivityIdea, setCustomActivityIdea] = useState<string>(
    prevGuestAnswers.customActivityIdea || ""
  );
  const [claimedCouponIds, setClaimedCouponIds] = useState<string[]>([]);
  const [chosenDate, setChosenDate] = useState(dateTime.date);
  const [chosenTime, setChosenTime] = useState(dateTime.time);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(invitation.status === "accepted");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guestNote, setGuestNote] = useState(prevGuestAnswers.guestNote || "");
  const [guestReactionEmoji, setGuestReactionEmoji] = useState(
    prevGuestAnswers.guestReactionEmoji || ""
  );
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const viewTrackedRef = useRef(false);

  // Sync opening & track open event in Vercel Postgres
  useEffect(() => {
    if (general.openingAnimation === "none") {
      setIsOpened(true);
    }
    if (!viewTrackedRef.current && invitation.id) {
      viewTrackedRef.current = true;
      recordGuestView(invitation.id);
    }
  }, [general.openingAnimation, invitation.id]);

  if (!isPinUnlocked && general.pinCode) {
    return (
      <PinCodeProtection
        correctPin={general.pinCode}
        onUnlocked={() => setIsPinUnlocked(true)}
      />
    );
  }

  // Handle "No" Button Evasion
  const handleNoInteraction = () => {
    const nextCount = noCount + 1;
    setNoCount(nextCount);
    playDodgeBoing(general.soundEffects !== false);

    if (noButton.mode === "runaway" || noButton.mode === "teleport-fade") {
      if (noButton.mode === "teleport-fade") {
        setNoRotation((r) => r + 360);
      }
      if (containerRef.current && noButtonRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const btn = noButtonRef.current.getBoundingClientRect();

        const baseLeft = btn.left - noOffset.x;
        const baseTop = btn.top - noOffset.y;

        const safePadding = 20;
        const minX = container.left + safePadding - baseLeft;
        const maxX = container.right - btn.width - safePadding - baseLeft;
        const minY = container.top + 60 - baseTop;
        const maxY = container.bottom - btn.height - 50 - baseTop;

        const nextX = minX + Math.random() * Math.max(0, maxX - minX);
        const nextY = minY + Math.random() * Math.max(0, maxY - minY);

        setNoOffset({ x: nextX, y: nextY });
      } else {
        const randomX = (Math.random() - 0.5) * 200;
        const randomY = (Math.random() - 0.5) * 280;
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
          x: 20 + Math.random() * Math.max(60, container.width - 140),
          y: 80 + Math.random() * Math.max(100, container.height - 200),
          text: availablePhrases[(nextCount + i) % availablePhrases.length],
        }));

        setClones((prev) => [...prev.slice(-10), ...newClones]);
      }
    }
  };

  // Toggle activity selection by guest
  const toggleActivitySelection = (id: string) => {
    playSoftPop(general.soundEffects !== false);
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit final answers to API via PATCH request to update guest_answers
  const saveGuestAnswers = async (
    overrides?: {
      note?: string;
      stage?: string;
      claimedCoupons?: string[];
      reactionEmoji?: string;
    }
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const selectedNames = activities
      .filter((a) => selectedActivityIds.includes(a.id))
      .map((a) => `${a.icon} ${a.title}`);

    const couponTitles =
      overrides?.claimedCoupons ||
      (coupons.items || [])
        .filter((c) => claimedCouponIds.includes(c.id))
        .map((c) => `${c.icon} ${c.title}`);

    try {
      await submitGuestAnswers(
        invitation.id,
        {
          stage: overrides?.stage || "final_plan",
          selectedActivities: selectedNames,
          customActivityIdea: customActivityIdea.trim() || undefined,
          claimedCoupons: couponTitles.length > 0 ? couponTitles : undefined,
          quizAnswers: quizAnswers.length > 0 ? quizAnswers : undefined,
          chosenDate: dateTime.enabled ? chosenDate : undefined,
          chosenTime: dateTime.enabled ? chosenTime : undefined,
          noAttemptsCount: noCount,
          acceptedAt: new Date().toISOString(),
          guestNote: overrides?.note !== undefined ? overrides.note : guestNote,
          guestReactionEmoji:
            overrides?.reactionEmoji !== undefined ? overrides.reactionEmoji : guestReactionEmoji,
        },
        "PATCH"
      );
      setIsSubmitted(true);
    } catch (err) {
      console.warn("Could not submit answers online:", err);
      setSubmitError(err instanceof Error ? err.message : "Не удалось сохранить ответы в БД");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCouponClaim = (couponId: string) => {
    const nextIds = claimedCouponIds.includes(couponId)
      ? claimedCouponIds.filter((x) => x !== couponId)
      : [...claimedCouponIds, couponId];
    setClaimedCouponIds(nextIds);

    const nextTitles = (coupons.items || [])
      .filter((c) => nextIds.includes(c.id))
      .map((c) => `${c.icon} ${c.title}`);

    saveGuestAnswers({ stage: "coupon_claim", claimedCoupons: nextTitles });
  };

  const handleSendNote = async () => {
    if (!guestNote.trim() && !guestReactionEmoji) return;
    setIsSavingNote(true);
    try {
      await saveGuestAnswers({ note: guestNote.trim(), stage: "guest_note" });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Step transitions
  const handleYesClick = () => {
    playMagicalChime(general.soundEffects !== false);
    setDirection(1);
    setScreen("confirmation");
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fda4af", "#f43f5e", "#ffedd5", "#fbbf24"],
    });

    // Мгновенное оповещение создателя открытки в Telegram о согласии!
    submitGuestAnswers(
      invitation.id,
      {
        stage: "initial_yes",
        noAttemptsCount: noCount,
        quizAnswers: quizAnswers.length > 0 ? quizAnswers : undefined,
        acceptedAt: new Date().toISOString(),
      },
      "PATCH"
    ).catch((err) => console.warn("Initial yes notification dispatch error:", err));
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
      triggerFinalConfetti();
      saveGuestAnswers();
    }
  };

  const handleContinueFromDateTime = () => {
    setDirection(1);
    setScreen("final");
    triggerFinalConfetti();
    saveGuestAnswers();
  };

  const triggerFinalConfetti = () => {
    if (finalScreen.showConfetti) {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.55 },
      });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const currentVibe: VibeConfig = VIBES.find((v) => v.id === general.vibe) || VIBES[0];
  const isCustom = general.vibe === "custom";
  const isDark = isCustom
    ? (general.customBgColor ? isColorDark(general.customBgColor) : false)
    : currentVibe.isDark;

  const currentNoPhrase =
    noButton.phrases.length > 0
      ? noButton.phrases[noCount % noButton.phrases.length]
      : general.noButtonText;

  // Safe Yes button scale: limited to 1.25 max and centered to avoid clipping outside mobile frame
  const yesScale = noButton.yesButtonGrowth
    ? Math.min(1 + noCount * 0.06, 1.25)
    : 1;

  const noScale =
    noButton.mode === "shrink"
      ? Math.max(0.12, 1 - noCount * 0.18)
      : 1;

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

  // Dynamic theme colors
  const titleColor = isDark ? "text-white drop-shadow-xs" : "text-slate-900";
  const subtitleColor = isDark ? "text-slate-200/90" : "text-slate-600";
  const cardBg = isDark
    ? "bg-slate-900/85 backdrop-blur-md border border-white/20 text-white shadow-lg"
    : "bg-white/90 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-sm";

  // Template contexts
  const chosenActs = activities.filter((a) => selectedActivityIds.includes(a.id));
  const chosenActsNames =
    chosenActs.length > 0
      ? chosenActs.map((a) => `${a.icon} ${a.title}`).join(", ")
      : "наш особенный вечер";

  const templateContext = {
    date: dateTime.enabled ? formatDisplayDate(chosenDate) : "в любой день",
    time: dateTime.enabled ? chosenTime : "в удобное время",
    activity: chosenActsNames,
    location: finalScreen.location || "уютное место",
  };

  const renderedTitle = formatTemplate(finalScreen.title, templateContext);
  const renderedMessage = formatTemplate(finalScreen.message, templateContext);

  const slideVariants: Variants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
      scale: 0.98,
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
      x: dir > 0 ? -40 : 40,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    }),
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/40 via-purple-950/30 to-amber-950/30 pointer-events-none" />

      {/* Main Container: Full screen on mobile, phone-chassis width on desktop */}
      <div
        ref={containerRef}
        style={{
          background: isCustom && general.customBgColor
            ? general.customBgColor
            : currentVibe.cssGradient,
        }}
        className={cn(
          "relative w-full max-w-md min-h-[100dvh] sm:min-h-[780px] sm:max-h-[880px] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-white/20 flex flex-col justify-between px-5 py-4 transition-colors duration-500 overflow-hidden select-none"
        )}
      >
        {/* Ambient overlay highlight */}
        <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity",
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-black/5"
        )} />

        {/* Ambient Floating Love Particles */}
        <LoveParticles type={general.particlesType || "hearts"} />

        {/* Interactive Opening Screen Overlay */}
        <OpeningOverlay
          type={general.openingAnimation}
          isOpen={isOpened}
          onOpen={() => setIsOpened(true)}
        />

        {/* Top Header / Share button */}
        <div className="flex items-center justify-between z-30 pt-1 pb-2 gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/75 backdrop-blur-xs border border-white/60 shadow-2xs text-[11px] font-semibold text-slate-700 truncate max-w-[260px]">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
            {general.recipientName ? (
              <span className="truncate">
                Для {general.recipientName}
                {general.senderName ? ` • от ${general.senderName}` : ""}
              </span>
            ) : (
              <span>LoveEvol</span>
            )}
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/70 hover:bg-white text-slate-700 border border-white/60 shadow-2xs backdrop-blur-xs transition-all active:scale-95 flex items-center gap-1 text-[11px] font-medium"
            title="Поделиться ссылкой"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700 font-semibold pr-1">Скопировано!</span>
              </>
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

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
                  "absolute z-25 px-3 py-1.5 rounded-xl text-xs font-medium border shadow-md backdrop-blur-xs whitespace-nowrap active:scale-90",
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
              key="guest-invite"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-between text-center space-y-4 pt-1 pb-2 relative z-10"
            >
              {/* Cover Image / GIF */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-slate-100 shrink-0 group">
                {general.coverImageUrl ? (
                  <SafeImage
                    src={general.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-500">
                    <Heart className="w-12 h-12 fill-rose-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Audio Voice Player if enabled */}
              {audio.enabled && audio.url && (
                <div className="w-full">
                  <AudioPlayer url={audio.url} title={audio.title} />
                </div>
              )}

              {/* Title & Subtitle with dynamic contrast */}
              <div className="space-y-2 px-1">
                <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight leading-snug", titleColor)}>
                  {general.title}
                </h2>
                <p className={cn("text-xs sm:text-sm leading-relaxed max-w-[310px] mx-auto", subtitleColor)}>
                  {general.subtitle}
                </p>
              </div>

              {/* Action Buttons Zone or Love Quiz */}
              {quiz.enabled && !quizPassed ? (
                <div className="w-full pt-1 pb-2">
                  <LoveQuiz
                    quiz={quiz}
                    soundEnabled={general.soundEffects !== false}
                    onPassed={(ans) => {
                      if (ans) setQuizAnswers(ans);
                      setQuizPassed(true);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full pt-1 pb-2 flex flex-col items-center justify-center relative min-h-[92px]">
                  <div className="relative w-full flex items-center justify-center min-h-[58px] px-2">
                    {/* YES BUTTON */}
                    <motion.button
                      animate={{ scale: yesScale }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      onClick={handleYesClick}
                      style={{ transformOrigin: "center center" }}
                      className={cn(
                        "z-20 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 max-w-[280px] select-none cursor-pointer",
                        noCount > 0 && (noButton.mode === "runaway" || noButton.mode === "teleport-fade")
                          ? "mx-auto"
                          : ""
                      )}
                    >
                      <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                      <span className="truncate max-w-[210px]">{general.yesButtonText || "Да!"}</span>
                    </motion.button>

                    {/* NO BUTTON OR TRANSFORMED YES BUTTON */}
                    {noButton.mode === "turn-into-yes" && noCount >= 2 ? (
                      <motion.button
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={handleYesClick}
                        className="ml-2.5 z-20 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Конечно, ДА! 🥰</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        ref={noButtonRef}
                        animate={{
                          x: noOffset.x,
                          y: noOffset.y,
                          scale: noScale,
                          rotate: noRotation,
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
                          noCount > 0 && (noButton.mode === "runaway" || noButton.mode === "teleport-fade")
                            ? "absolute pointer-events-auto"
                            : "ml-3"
                        )}
                      >
                        {currentNoPhrase}
                      </motion.button>
                    )}
                  </div>

                  {noCount > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "text-[11px] font-semibold mt-2.5 tracking-wide px-2.5 py-0.5 rounded-full",
                        isDark ? "bg-white/15 text-rose-300" : "bg-rose-50 text-rose-600"
                      )}
                    >
                      Попыток отказаться: {noCount} 😉
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ================= SCREEN 2: CONFIRMATION ================= */}
          {screen === "confirmation" && (
            <motion.div
              key="guest-confirmation"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col items-center justify-between text-center space-y-4 pt-1 pb-2 relative z-10"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-white/70 backdrop-blur-xs shrink-0 flex items-center justify-center p-3 group">
                {confirmation.stickerUrl ? (
                  <SafeImage
                    src={confirmation.stickerUrl}
                    alt="Sticker"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Smile className="w-16 h-16 text-rose-400" />
                )}
              </div>

              <div className="space-y-2 px-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/90 text-rose-700 text-xs font-semibold border border-rose-200">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Урааа! Согласие получено</span>
                </div>
                <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight leading-snug", titleColor)}>
                  {confirmation.title}
                </h2>
                <p className={cn("text-xs sm:text-sm leading-relaxed max-w-[300px] mx-auto", subtitleColor)}>
                  {confirmation.subtitle}
                </p>
              </div>

              <div className="w-full pt-2 pb-2">
                <button
                  onClick={handleContinueFromConfirmation}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-sm font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{confirmation.continueButtonText || "Выбрать, чем мы займемся 🥰"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 3: ACTIVITIES (GRID 2x2) ================= */}
          {screen === "activities" && (
            <motion.div
              key="guest-activities"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col justify-between space-y-3 pt-1 pb-2 relative z-10"
            >
              <div className="text-center space-y-1.5 pt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                  <span>План встречи</span>
                </div>
                <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight leading-snug", titleColor)}>
                  {activitiesConfig.title}
                </h2>
                <p className={cn("text-xs sm:text-sm leading-relaxed max-w-[280px] mx-auto", subtitleColor)}>
                  {activitiesConfig.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 my-auto py-1">
                {activities.map((act) => {
                  const isSelected = selectedActivityIds.includes(act.id);
                  return (
                    <motion.button
                      key={act.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleActivitySelection(act.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden h-32 select-none cursor-pointer",
                        isSelected
                          ? "bg-rose-50/95 border-rose-400 ring-2 ring-rose-400/30 shadow-sm"
                          : isDark
                            ? "bg-slate-900/75 border-white/20 hover:bg-slate-800/80 shadow-2xs"
                            : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-rose-500 text-white shadow-2xs"
                            : isDark
                              ? "border border-white/30 bg-white/10"
                              : "border border-slate-300 bg-white/60"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-3xl drop-shadow-2xs">{act.icon}</span>
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

              <div className="space-y-2 pt-1 pb-1">
                {activitiesConfig.allowCustomIdea !== false && (
                  <input
                    type="text"
                    value={customActivityIdea}
                    onChange={(e) => setCustomActivityIdea(e.target.value)}
                    placeholder="💡 Или предложи свой вариант вечера..."
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400",
                      isDark
                        ? "bg-slate-900/80 border-white/20 text-white placeholder:text-slate-400"
                        : "bg-white/90 border-slate-200 text-slate-800 placeholder:text-slate-400"
                    )}
                  />
                )}
                <p className={cn("text-center text-xs", isDark ? "text-slate-300" : "text-slate-500")}>
                  Выбрано вариантов:{" "}
                  <span className="font-bold text-rose-500">
                    {selectedActivityIds.length}
                  </span>
                </p>
                <button
                  onClick={handleContinueFromActivities}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{activitiesConfig.continueButtonText || "Продолжить 📅"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 4: DATE & TIME ================= */}
          {screen === "datetime" && dateTime.enabled && (
            <motion.div
              key="guest-datetime"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col justify-between space-y-4 pt-1 pb-2 relative z-10"
            >
              <div className="text-center space-y-1.5 pt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-semibold border border-purple-200">
                  <span>Выбор времени</span>
                </div>
                <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight leading-snug", titleColor)}>
                  {dateTime.title}
                </h2>
                <p className={cn("text-xs sm:text-sm leading-relaxed max-w-[280px] mx-auto", subtitleColor)}>
                  {dateTime.subtitle}
                </p>
              </div>

              <div className={cn("rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 my-auto", cardBg)}>
                {/* 1. ЕСЛИ РЕЖИМ SENDER_SETS (ДАТУ НАЗНАЧИЛ ОТПРАВИТЕЛЬ) */}
                {dateTime.selectionMode === "sender_sets" ? (
                  <div className="space-y-3.5">
                    <div className={cn("p-3.5 rounded-xl border flex items-start gap-3", isDark ? "bg-purple-950/40 border-purple-800/50" : "bg-purple-50/70 border-purple-200/70")}>
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider block", isDark ? "text-purple-300" : "text-purple-700")}>
                          Предложенная дата встречи
                        </span>
                        <p className={cn("text-base font-extrabold", isDark ? "text-white" : "text-slate-900")}>
                          {formatDisplayDate(chosenDate || dateTime.date)}
                        </p>
                        <p className={cn("text-xs font-semibold flex items-center gap-1", isDark ? "text-purple-200" : "text-purple-900")}>
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>в {chosenTime || dateTime.time || "19:00"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Хочешь немного скорректировать время?
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={chosenTime}
                          onChange={(e) => setChosenTime(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                        />
                        <span className="text-[11px] text-slate-400">
                          (или оставь как есть)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. ЕСЛИ РЕЖИМ GUEST_CHOOSES (ГОСТЬ ВЫБИРАЕТ ДАТУ САМ) */
                  <div className="space-y-4">
                    {/* Быстрые подсказки дней недели */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                        <span>🗓️ Выбери день встречи:</span>
                      </label>

                      {/* Date input */}
                      <input
                        type="date"
                        value={chosenDate}
                        onChange={(e) => setChosenDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500 font-medium pl-1">
                        Выбрано: {formatDisplayDate(chosenDate)}
                      </p>
                    </div>

                    {/* Выбор времени и быстрые слоты */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Удобное время:</span>
                      </label>

                      {/* Быстрые слоты времени */}
                      <div className="flex flex-wrap gap-1.5">
                        {["18:00", "19:00", "20:00", "21:00"].map((timeSlot) => (
                          <button
                            key={timeSlot}
                            type="button"
                            onClick={() => setChosenTime(timeSlot)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                              chosenTime === timeSlot
                                ? "bg-rose-500 text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            )}
                          >
                            {timeSlot}
                          </button>
                        ))}
                      </div>

                      {/* Точный ввод времени */}
                      <input
                        type="time"
                        value={chosenTime}
                        onChange={(e) => setChosenTime(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full pt-1 pb-1">
                <button
                  onClick={handleContinueFromDateTime}
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-sm font-semibold shadow-md shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Сохранение ответов...</span>
                    </>
                  ) : (
                    <>
                      <span>{dateTime.continueButtonText || "Завершить и подтвердить ✨"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 5: FINAL TRIUMPH ================= */}
          {screen === "final" && (
            <motion.div
              key="guest-final"
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col justify-between space-y-3 pt-1 pb-2 relative z-10 overflow-y-auto no-scrollbar"
            >
              {/* Celebration GIF / Image */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-black/5 bg-slate-100 shrink-0">
                {finalScreen.imageUrl ? (
                  <SafeImage
                    src={finalScreen.imageUrl}
                    alt="Celebration"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-500">
                    <Heart className="w-14 h-14 fill-rose-500" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="space-y-1.5 px-1 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSubmitted ? "Ответ отправлен автору! 💌" : "Приглашение принято"}</span>
                </div>
                <h2 className={cn("text-lg sm:text-xl font-bold tracking-tight leading-snug", titleColor)}>
                  {renderedTitle}
                </h2>
                <p className={cn("text-xs sm:text-sm leading-relaxed", subtitleColor)}>
                  {renderedMessage}
                </p>
              </div>

              {/* DateCountdown & Official DatePassTicket */}
              {dateTime.enabled && (
                <div className="w-full space-y-2.5">
                  {finalScreen.showCountdown !== false && (
                    <DateCountdown
                      dateStr={chosenDate || dateTime.date}
                      timeStr={chosenTime || dateTime.time}
                      isDark={isDark}
                    />
                  )}
                  {finalScreen.showDateTicket !== false && (
                    <DatePassTicket
                      inviteId={invitation.id}
                      recipientName={general.recipientName}
                      senderName={general.senderName}
                      dateDisplay={formatDisplayDate(chosenDate || dateTime.date)}
                      timeDisplay={chosenTime || dateTime.time}
                      location={finalScreen.location}
                      mapLink={finalScreen.mapLink}
                      activitiesSummary={
                        customActivityIdea.trim()
                          ? `${chosenActsNames} (${customActivityIdea.trim()})`
                          : chosenActsNames
                      }
                      isDark={isDark}
                    />
                  )}
                </div>
              )}

              {/* Interactive Love Coupons Deck */}
              {coupons.enabled && (
                <LoveCouponsDeck
                  coupons={coupons}
                  claimedIds={claimedCouponIds}
                  onToggleClaim={(id) => handleToggleCouponClaim(id)}
                  isDark={isDark}
                  soundEnabled={general.soundEffects !== false}
                />
              )}

              {/* GUEST ANSWERS CONFIRMATION & DB STATUS CARD (ШАГ 11: PATCH / PUT) */}
              <div className={cn("w-full rounded-2xl p-4 border shadow-2xs space-y-3 text-left", cardBg)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Ответы сохранены в БД
                      </span>
                      <span className={cn("text-xs font-bold", isDark ? "text-slate-100" : "text-slate-800")}>
                        {isSubmitted
                          ? "Зафиксировано и отправлено автору"
                          : isSubmitting
                          ? "Синхронизация с БД..."
                          : "Ответ сформирован"}
                      </span>
                    </div>
                  </div>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                  ) : isSubmitted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span>✓ Сохранено</span>
                    </span>
                  ) : null}
                </div>

                {/* Selected Activities Pills */}
                {chosenActs.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-medium">Выбранные активности:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {chosenActs.map((act) => (
                        <span
                          key={act.id}
                          className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1"
                        >
                          <span>{act.icon}</span>
                          <span>{act.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refusal attempts note */}
                {noCount > 0 && (
                  <p className="text-[11px] text-slate-500 italic">
                    Попыток нажать «Нет»: <span className="font-semibold text-rose-600">{noCount}</span> 🤭
                  </p>
                )}

                {/* If error, retry button */}
                {submitError && (
                  <div className="flex items-center justify-between bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs text-red-700">
                    <span>{submitError}</span>
                    <button
                      onClick={() => saveGuestAnswers()}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Повторить</span>
                    </button>
                  </div>
                )}

                {/* Warm guest reaction emojis + note input */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Твоя эмоция:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {["🥰", "😭❤️", "🔥", "🥂", "💋"].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => {
                            playSoftPop(general.soundEffects !== false);
                            setGuestReactionEmoji(emo);
                            saveGuestAnswers({ reactionEmoji: emo, stage: "guest_note" });
                          }}
                          className={cn(
                            "px-2 py-1 rounded-lg text-sm transition-all cursor-pointer",
                            guestReactionEmoji === emo
                              ? "bg-rose-500 text-white scale-110 shadow-xs"
                              : "bg-slate-100 hover:bg-rose-50"
                          )}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                    <span>Оставить теплое сообщение автору:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guestNote}
                      onChange={(e) => setGuestNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendNote()}
                      placeholder="Жду с нетерпением! 🥰"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendNote}
                      disabled={isSavingNote || (!guestNote.trim() && !guestReactionEmoji)}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors disabled:opacity-40 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {isSavingNote ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : noteSaved ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{noteSaved ? "Отправлено" : "Отправить"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Audio Voice Player in Final Screen */}
              {audio.enabled && audio.url && (
                <div className="w-full">
                  <AudioPlayer url={audio.url} title={audio.title} />
                </div>
              )}

              {/* Photo Album: Наши моменты (до 12 фото) */}
              {finalScreen.photoAlbum.length > 0 && (
                <div className="w-full bg-white/75 backdrop-blur-xs rounded-2xl p-3 border border-white/60 shadow-2xs space-y-2 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-rose-500" />
                      <span>Наши моменты</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {finalScreen.photoAlbum.length} фото
                    </span>
                  </div>
                  {/* Horizontal Scroll Carousel with Lightbox */}
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                    {finalScreen.photoAlbum.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxPhoto(photo)}
                        className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs group cursor-pointer"
                      >
                        <SafeImage
                          src={photo}
                          alt={`Moment #${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Secret Message Card (With Scratch Card or Tap Reveal) */}
              {finalScreen.secretMessage && (
                <div className="w-full pt-1">
                  {finalScreen.scratchCard ? (
                    <ScratchCard>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Личное послание для тебя:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                        {finalScreen.secretMessage}
                      </p>
                    </ScratchCard>
                  ) : !isSecretRevealed ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsSecretRevealed(true);
                        confetti({
                          particleCount: 50,
                          spread: 60,
                          origin: { y: 0.8 },
                          colors: ["#fda4af", "#fbbf24"],
                        });
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-amber-50/95 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all hover:bg-amber-100/90 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>🤫 Секретное послание (нажми, чтобы открыть)</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 text-left shadow-2xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Личное послание для тебя:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                        {finalScreen.secretMessage}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Add to Calendar Button */}
              <div className="w-full flex justify-center pt-2">
                <CalendarExportButton
                  eventData={{
                    title: formatTemplate(finalScreen.title, templateContext),
                    description: `${formatTemplate(finalScreen.message, templateContext)}${finalScreen.extraNote ? `\nЗаметка: ${finalScreen.extraNote}` : ""}`,
                    location: finalScreen.location || "Уютное место",
                    dateStr: chosenDate || dateTime.date || "2026-07-26",
                    timeStr: chosenTime || dateTime.time || "19:00",
                  }}
                />
              </div>

              {/* Success Footer Note */}
              <div className="text-center py-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Сделано с любовью в ❤️ LoveEvol
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Photo Album Lightbox */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <SafeImage
            src={lightboxPhoto}
            alt="Фото момента"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
