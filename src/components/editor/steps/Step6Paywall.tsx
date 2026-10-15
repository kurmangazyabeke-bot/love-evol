"use client";

import React, { useState, useEffect } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { saveDraft } from "@/lib/api";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Heart,
  QrCode,
  Loader2,
  Gift,
  ShieldCheck,
  Zap,
  PartyPopper,
  Music,
  Camera,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Step6Paywall() {
  const {
    general,
    confirmation,
    noButton,
    activitiesConfig,
    activities,
    dateTime,
    audio,
    finalScreen,
    quiz,
    telegramNotification,
  } = useInviteStore();
  const [invitationId, setInvitationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Automatically save draft and generate link on mount
  useEffect(() => {
    const initAndSave = async () => {
      setIsLoading(true);
      try {
        const savedId = localStorage.getItem("love_evol_draft_id") || undefined;
        const configSnapshot = {
          general,
          confirmation,
          noButton,
          activitiesConfig,
          activities,
          dateTime,
          audio,
          finalScreen,
          quiz,
          telegramNotification,
        };

        const res = await saveDraft(configSnapshot, savedId);
        if (res.invitation?.id) {
          setInvitationId(res.invitation.id);
          localStorage.setItem("love_evol_draft_id", res.invitation.id);
          // Save to user invitations list
          try {
            const list = JSON.parse(localStorage.getItem("love_evol_invitation_ids") || "[]");
            if (!list.includes(res.invitation.id)) {
              list.unshift(res.invitation.id);
              localStorage.setItem("love_evol_invitation_ids", JSON.stringify(list));
            }
          } catch {}
        }
      } catch (err) {
        console.error("Auto-save error on Step 6:", err);
      } finally {
        setIsLoading(false);
        triggerSuccessConfetti();
      }
    };

    initAndSave();
  }, []);

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#fb7185", "#f43f5e", "#fef08a", "#60a5fa", "#a855f7"],
    });
  };

  const currentId = invitationId || "my-date";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${currentId}`
      : `/invite/${currentId}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const shareText = encodeURIComponent(
    `Привет! Для тебя есть особенное интерактивное послание... 💖 Открой ссылку: ${shareUrl}`
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ================= HERO CARD: ПРИГЛАШЕНИЕ ГОТОВО ================= */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 p-[2px] rounded-3xl shadow-xl shadow-rose-500/10 overflow-hidden">
        <div className="bg-white rounded-[22px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Decorative ambient highlights */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-rose-100/60 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

          {/* Header Tag & Title */}
          <div className="relative z-10 space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
              <PartyPopper className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% БЕСПЛАТНО • ГОТОВО К ОТПРАВКЕ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Твое приглашение создано! 🎉💖
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Платформа полностью бесплатна. Скопируй персональную ссылку и отправь ее своей половинке в мессенджер!
            </p>
          </div>

          {/* Loading Indicator while creating */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>Синхронизируем черновик и генерируем постоянную ссылку...</span>
            </div>
          )}

          {/* Link Box */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Личная ссылка на приглашение:</span>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Бессрочная и без рекламы</span>
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono text-slate-700 truncate select-all">
                {shareUrl}
              </div>

              <button
                onClick={handleCopyLink}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer shrink-0",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 relative z-10">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all"
            >
              <span>Открыть страницу гостя</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setShowQr(!showQr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>{showQr ? "Скрыть QR-код" : "Показать QR-код"}</span>
            </button>
          </div>

          {/* QR Code Container */}
          {showQr && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center space-y-2 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    shareUrl
                  )}`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Наведите камеру смартфона, чтобы открыть открытку
              </p>
            </div>
          )}

          {/* Messenger Share Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 relative z-10">
            <span className="text-xs font-bold text-slate-700 block">
              Поделиться в мессенджерах:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  shareUrl
                )}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-xs font-semibold transition-all active:scale-95"
              >
                <span>✈️ Telegram</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold transition-all active:scale-95"
              >
                <span>💬 WhatsApp</span>
              </a>

              <a
                href={`https://vk.com/share.php?url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(general.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 text-xs font-semibold transition-all active:scale-95"
              >
                <span>🔵 ВКонтакте</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES INCLUDED FREE ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-500/20" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Всё включено бесплатно навсегда 🎁
            </h3>
            <p className="text-xs text-slate-500">
              Полный романтический арсенал для идеального свидания
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Анимации открытия</span>
              <span className="text-slate-500 text-[11px]">
                Разрыв атласной ленты или стирание запотевшего стекла
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Магическая кнопка «Нет»</span>
              <span className="text-slate-500 text-[11px]">
                Убегает, уменьшается или размножается клонами
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Camera className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Фотоальбом и секрет</span>
              <span className="text-slate-500 text-[11px]">
                До 12 фото ваших моментов и тайное послание по клику
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Фиксация ответов в БД</span>
              <span className="text-slate-500 text-[11px]">
                Вся статистика согласия и записка в Личном кабинете
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
