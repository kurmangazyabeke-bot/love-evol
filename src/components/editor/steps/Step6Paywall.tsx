"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Database,
  PartyPopper,
  Plus,
  Wand2,
  Send,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Step6Paywall() {
  const {
    draftId,
    setDraftId,
    general,
    confirmation,
    noButton,
    activitiesConfig,
    activities,
    dateTime,
    audio,
    finalScreen,
    quiz,
    coupons,
    telegramNotification,
    startNewInvitation,
  } = useInviteStore();

  const [invitationId, setInvitationId] = useState<string>(draftId || "");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [isApplyingSlug, setIsApplyingSlug] = useState(false);
  const [slugMessage, setSlugMessage] = useState<string | null>(null);
  const [storageProvider, setStorageProvider] = useState<string>("vercel-postgres");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const buildSnapshot = () => ({
    general,
    confirmation,
    noButton,
    activitiesConfig,
    activities,
    dateTime,
    audio,
    finalScreen,
    quiz,
    coupons,
    telegramNotification,
  });

  useEffect(() => {
    const initAndSave = async () => {
      setIsLoading(true);
      try {
        const existingId =
          draftId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("love_evol_draft_id") || undefined
            : undefined);

        const res = await saveDraft(buildSnapshot(), existingId);
        if (res.invitation?.id) {
          setInvitationId(res.invitation.id);
          setDraftId(res.invitation.id);
          if (res.storageProvider) {
            setStorageProvider(res.storageProvider);
          }
        }
      } catch (err) {
        console.error("Auto-save error on Step 6:", err);
      } finally {
        setIsLoading(false);
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#fb7185", "#f43f5e", "#fef08a", "#60a5fa", "#a855f7"],
        });
      }
    };

    initAndSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyCustomSlug = async () => {
    const cleaned = customSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleaned || cleaned.length < 3) {
      setSlugMessage("Укажите минимум 3 латинских символа или цифры (например: for-aruzhan)");
      return;
    }

    setIsApplyingSlug(true);
    setSlugMessage(null);
    try {
      const res = await saveDraft(buildSnapshot(), cleaned);
      if (res.invitation?.id) {
        setInvitationId(res.invitation.id);
        setDraftId(res.invitation.id);
        setSlugMessage(`✅ Красивая ссылка /invite/${res.invitation.id} успешно закреплена в БД Vercel!`);
        setCustomSlug("");
      }
    } catch (err) {
      setSlugMessage(err instanceof Error ? err.message : "Не удалось сохранить короткий адрес");
    } finally {
      setIsApplyingSlug(false);
    }
  };

  const currentId = invitationId;
  const shareUrl =
    typeof window !== "undefined" && currentId
      ? `${window.location.origin}/invite/${currentId}`
      : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const inviteGreeting = `Привет${general.recipientName ? `, ${general.recipientName}` : ""}! Для тебя есть особенное интерактивное послание... 💖 Открой: ${shareUrl}`;

  const handleCopyInviteMessage = () => {
    if (!shareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteGreeting).then(() => {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2500);
      });
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    const title = general.title || "Приглашение на особенный вечер 💖";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Привет${general.recipientName ? `, ${general.recipientName}` : ""}! Для тебя есть особенное романтическое послание... ✨`,
          url: shareUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ================= HERO CARD: ПРИГЛАШЕНИЕ ГОТОВО ================= */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 p-[2px] rounded-3xl shadow-xl shadow-rose-500/10 overflow-hidden">
        <div className="bg-white rounded-[22px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-rose-100/60 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

          {/* Header Tag & Title */}
          <div className="relative z-10 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
                <PartyPopper className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% БЕСПЛАТНО • ГОТОВО К ОТПРАВКЕ</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-[11px] font-semibold">
                <Database className="w-3 h-3" />
                <span>
                  {storageProvider === "vercel-postgres"
                    ? "Vercel Postgres Connected"
                    : "Cloud Storage Active"}
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Твое приглашение сохранено в БД! 🎉💖
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Поделись ссылкой на открытку с половинкой. Она откроет её напрямую — без регистрации и без попадания в конструктор!
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              <span>Сохраняем приглашение в облачную базу данных Vercel Postgres...</span>
            </div>
          )}

          {/* Direct Link Box */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Прямая ссылка для гостя:</span>
              <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Вход без регистрации • С трекингом открытий</span>
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono text-slate-700 truncate select-all flex items-center gap-2">
                {shareUrl ? (
                  shareUrl
                ) : (
                  <span className="text-slate-400 italic flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    <span>Синхронизируем с Vercel Postgres...</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!shareUrl || isLoading}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none",
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

          {/* ================= PRIMARY SHARE ACTIONS BLOCK ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50/70 to-amber-50 border border-rose-200/80 space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-rose-500" />
                  <span>Поделиться приглашением с половинкой</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Человек сразу увидит конверт и открытку — вход в систему или регистрация <strong className="text-rose-700">не требуются</strong>!
                </p>
              </div>

              {/* Native Mobile Share Button */}
              <button
                type="button"
                onClick={handleNativeShare}
                disabled={!shareUrl}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Поделиться...</span>
              </button>
            </div>

            {/* Messengers Grid */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                  `Для тебя есть особенное интерактивное послание 💖✨`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(inviteGreeting)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(
                  general.title || "Приглашение на особенный вечер 💖"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#0077FF] hover:bg-[#0066DD] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <span>ВКонтакте</span>
              </a>

              <button
                type="button"
                onClick={handleCopyInviteMessage}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Текст скопирован!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать готовый текст</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Custom Short Link Slug Builder */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2.5 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Wand2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Хочешь красивое именное окончание ссылки? (опционально)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono">
                <span className="text-slate-400 select-none">/invite/</span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="for-aruzhan"
                  maxLength={40}
                  className="flex-1 bg-transparent focus:outline-none text-slate-900 font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomSlug}
                disabled={isApplyingSlug || !customSlug.trim()}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isApplyingSlug ? "Сохраняем..." : "Применить адрес"}
              </button>
            </div>
            {slugMessage && (
              <p className="text-[11px] font-medium text-emerald-700">{slugMessage}</p>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 relative z-10">
            {shareUrl && (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>Открыть как гость (проверить)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>{showQr ? "Скрыть QR-код" : "QR-код открытки"}</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Личный кабинет ответов</span>
            </Link>

            <button
              type="button"
              onClick={startNewInvitation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать еще одно с нуля</span>
            </button>
          </div>

          {/* QR Code Container */}
          {showQr && shareUrl && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center space-y-2 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200/80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    shareUrl
                  )}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Наведите камеру смартфона, чтобы мгновенно открыть открытку
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
