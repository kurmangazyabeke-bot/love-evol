"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  MessageCircleHeart,
  ShieldCheck,
  Smile,
  Database,
  Eye,
  Pencil,
  Files,
  QrCode,
  X,
  Ticket,
  HelpCircle,
  Wand2,
  Radio,
} from "lucide-react";
import { DbInvitation } from "@/types/db";
import {
  fetchInvitations,
  deleteInvitationApi,
  fetchDbHealth,
  saveDraft,
} from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";

// Helper to inflect activity for "Вы идете на ..."
function formatActivityInRussian(activityRaw?: string): string {
  if (!activityRaw) return "свидание";
  const clean = activityRaw
    .replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Symbol}\s]+/u, "")
    .trim();

  const lower = clean.toLowerCase();
  if (lower.startsWith("пицц")) return "Пиццу";
  if (lower.startsWith("прогулк")) return "Прогулку с кофе";
  if (lower.startsWith("ужин")) return "Ужин при свечах";
  if (lower.startsWith("кино")) return "Кино";
  if (lower.startsWith("выставк")) return "Выставку";
  if (lower.startsWith("концерт")) return "Концерт";
  if (lower.startsWith("пикник")) return "Пикник";

  return clean || "свидание";
}

// Helper to format date "2026-07-26" -> "26 июля"
function formatRussianDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const month = parseInt(parts[1], 10);
      const months = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
      ];
      if (month >= 1 && month <= 12 && !isNaN(day)) {
        return `${day} ${months[month - 1]}`;
      }
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Helper to format creation time
function formatCreatedDate(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export default function DashboardPage() {
  const [invitations, setInvitations] = useState<DbInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [liveSync, setLiveSync] = useState(true);
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    provider: string;
    latencyMs?: number;
  } | null>(null);

  const [filter, setFilter] = useState<"all" | "accepted" | "opened" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [qrModalInvite, setQrModalInvite] = useState<{ id: string; title: string } | null>(
    null
  );

  // Load invitations + DB health
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [res, health] = await Promise.all([
        fetchInvitations(),
        fetchDbHealth(),
      ]);
      if (res.success && Array.isArray(res.invitations)) {
        setInvitations(res.invitations);
      }
      setDbHealth({
        connected: health.connected,
        provider: health.provider,
        latencyMs: health.latencyMs,
      });
    } catch (err) {
      console.error("Failed to load dashboard invitations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live auto-refresh every 10s when tab is active
  useEffect(() => {
    if (!liveSync) return;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData(false);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [liveSync, loadData]);

  // Copy share URL
  const handleCopyLink = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/invite/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Delete invitation
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Вы уверены, что хотите удалить это приглашение из базы данных?")) return;

    setDeletingId(id);
    try {
      await deleteInvitationApi(id);
      setInvitations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Не удалось удалить приглашение");
    } finally {
      setDeletingId(null);
    }
  };

  // Create instant demo invitation in Vercel Postgres
  const handleCreateDemoInvite = async () => {
    setCreatingDemo(true);
    try {
      const upcoming = new Date();
      upcoming.setDate(upcoming.getDate() + 3);
      const dateIso = upcoming.toISOString().split("T")[0];

      await saveDraft({
        general: {
          recipientName: "Любимая",
          senderName: "Твой тайный поклонник",
          title: "Пойдешь со мной на свидание? 💖",
          subtitle: "Я приготовил для нас особенный вечер, полный тепла, смеха и магии ✨",
          coverImageUrl: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
          yesButtonText: "Конечно, ДА! 💕",
          noButtonText: "Подумаю...",
          themeVibe: "romantic-classic",
          particlesType: "hearts",
          envelopeText: "Тебе секретное послание 💌",
          soundEffects: true,
        },
        confirmation: { enabled: true },
        noButton: { animationMode: "run-away-plead" },
        activitiesConfig: { enabled: true, allowCustomIdea: true },
        activities: [
          { id: "1", emoji: "🍕", title: "Пицца и вино", selected: true },
          { id: "2", emoji: "☕", title: "Прогулка с кофе", selected: false },
          { id: "3", emoji: "🕯️", title: "Ужин при свечах", selected: false },
          { id: "4", emoji: "🎬", title: "Поход в кино", selected: false },
        ],
        dateTime: {
          enabled: true,
          mode: "fixed",
          date: dateIso,
          time: "19:30",
          location: "Уютный ресторан в центре города",
          showCountdown: true,
          showDateTicket: true,
        },
        audio: { enabled: true, url: "synth:moonlight-waltz", title: "Moonlight Waltz" },
        finalScreen: {
          message:
            "Ура! {name}, мы идем на {activity} {date} в {time}! Жду нашей встречи в «{location}» ❤️",
          photoGallery: [],
          secretCode: "",
        },
        quiz: { enabled: false, questions: [] },
        coupons: {
          enabled: true,
          title: "Любовные купоны для тебя 🎟️",
          items: [
            {
              id: "c1",
              emoji: "💆‍♀️",
              title: "Расслабляющий массаж",
              description: "Действует в любой вечер по первому требованию",
            },
            {
              id: "c2",
              emoji: "☕",
              title: "Завтрак и кофе в постель",
              description: "Твои любимые круассаны и ароматный кофе утром",
            },
          ],
        },
      });
      await loadData(true);
    } catch (err) {
      console.error("Demo create error:", err);
      alert("Не удалось создать демо-приглашение");
    } finally {
      setCreatingDemo(false);
    }
  };

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    if (filter === "accepted") {
      return invitations.filter((inv) => inv.status === "accepted");
    }
    if (filter === "opened") {
      return invitations.filter(
        (inv) =>
          inv.status === "opened" ||
          (inv.status !== "accepted" && (inv.views_count || 0) > 0)
      );
    }
    if (filter === "pending") {
      return invitations.filter(
        (inv) => inv.status === "pending" && !(inv.views_count && inv.views_count > 0)
      );
    }
    return invitations;
  }, [invitations, filter]);

  // Accepted invitations for triumphant highlight cards
  const acceptedInvitations = useMemo(() => {
    return invitations.filter((inv) => inv.status === "accepted");
  }, [invitations]);

  // Statistics
  const stats = useMemo(() => {
    const total = invitations.length;
    const accepted = invitations.filter((inv) => inv.status === "accepted").length;
    const openedCount = invitations.filter(
      (inv) =>
        inv.status === "opened" ||
        inv.status === "accepted" ||
        (inv.views_count || 0) > 0
    ).length;
    const totalViews = invitations.reduce(
      (acc, inv) => acc + (inv.views_count || (inv.status === "accepted" ? 1 : 0)),
      0
    );
    const pendingUnread = invitations.filter(
      (inv) => inv.status === "pending" && !(inv.views_count && inv.views_count > 0)
    ).length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, accepted, openedCount, totalViews, pendingUnread, successRate };
  }, [invitations]);

  const qrShareUrl =
    qrModalInvite && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${qrModalInvite.id}`
      : "";

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans pb-24">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  LoveEvol
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold">
                  Dashboard
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Личный кабинет свиданий • Vercel Cloud
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* DB Connection Pill */}
          {dbHealth && (
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border ${
                dbHealth.connected
                  ? "bg-emerald-50/80 text-emerald-800 border-emerald-200/80"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
              title={`Провайдер БД: ${dbHealth.provider}`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {dbHealth.provider === "vercel-postgres"
                  ? "Vercel Postgres"
                  : dbHealth.provider}
              </span>
              {dbHealth.latencyMs !== undefined && (
                <span className="text-[10px] text-emerald-600/80 font-mono">
                  • {dbHealth.latencyMs}мс
                </span>
              )}
            </div>
          )}

          {/* Live Sync Toggle */}
          <button
            type="button"
            onClick={() => setLiveSync((v) => !v)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              liveSync
                ? "bg-rose-50/80 text-rose-700 border-rose-200/80"
                : "bg-white text-slate-500 border-slate-200"
            }`}
            title="Автоматическое обновление статусов каждые 10 секунд"
          >
            <Radio className={`w-3.5 h-3.5 ${liveSync ? "text-rose-500 animate-pulse" : ""}`} />
            <span>Live</span>
          </button>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Обновить данные сейчас"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-500" : ""}`}
            />
            <span className="hidden sm:inline">Обновить</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Создать приглашение</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome & Stats Row */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Мои романтические приглашения</span>
                <span className="text-xl">💌</span>
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Отслеживайте просмотры, выбранные купоны, ответы на квиз и согласие в реальном времени
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Всего создано</p>
                <p className="text-xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Просмотров 👀</p>
                <p className="text-xl font-bold text-sky-600">
                  {stats.totalViews}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({stats.openedCount} откр.)
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Сказали «ДА!»</p>
                <p className="text-xl font-bold text-emerald-600">{stats.accepted}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Конверсия</p>
                <p className="text-xl font-bold text-purple-600">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SPECIAL RESULT CARDS: ЕСЛИ ГОСТЬ ПРОШЕЛ ПРИГЛАШЕНИЕ                       */}
        {/* ========================================================================= */}
        {acceptedInvitations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Результаты согласия гостя</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Сказали ДА! ❤️
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {acceptedInvitations.map((inv) => {
                const config = (inv.config || {}) as Record<string, any>;
                const general = config.general || {};
                const couponsConfig = config.coupons || {};
                const couponItems: Array<{ id: string; emoji: string; title: string }> =
                  Array.isArray(couponsConfig.items) ? couponsConfig.items : [];

                const answers = (inv.guest_answers || {}) as {
                  selectedActivities?: string[];
                  customActivityIdea?: string;
                  chosenDate?: string;
                  chosenTime?: string;
                  noAttemptsCount?: number;
                  acceptedAt?: string;
                  guestNote?: string;
                  guestReactionEmoji?: string;
                  claimedCoupons?: string[];
                  quizAnswers?: Array<{
                    questionId: string;
                    question: string;
                    selectedIndex: number;
                    selectedOption: string;
                    isCorrect: boolean;
                  }>;
                };

                const rawActivity =
                  answers.customActivityIdea ||
                  (answers.selectedActivities && answers.selectedActivities.length > 0
                    ? answers.selectedActivities[0]
                    : "Пицца");
                const activityText = formatActivityInRussian(rawActivity);

                const dateStr =
                  answers.chosenDate || config?.dateTime?.date || "2026-07-26";
                const formattedDate = formatRussianDate(dateStr);

                const timeStr =
                  answers.chosenTime || config?.dateTime?.time || "19:00";

                const subjectLabel = general.recipientName
                  ? `${general.recipientName} сказала`
                  : "Она сказала";
                const triumphantHeadline = `${subjectLabel} ДА! Вы идете на ${activityText} ${formattedDate} в ${timeStr}`;

                const claimedCouponObjects = (answers.claimedCoupons || []).map((cid) => {
                  const found = couponItems.find((item) => item.id === cid);
                  return found || { id: cid, emoji: "🎟️", title: cid };
                });

                return (
                  <motion.div
                    key={`accepted-${inv.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 p-[2px] shadow-xl shadow-rose-500/15"
                  >
                    <div className="bg-white rounded-[22px] p-6 sm:p-8 relative overflow-hidden">
                      {/* Romantic decorative light orbs */}
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

                      <div className="relative z-10 space-y-6">
                        {/* Header Badge & Title */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-5">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold tracking-wide">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                                <span>ИДЕАЛЬНЫЙ MATCH • СВИДАНИЕ НАЗНАЧЕНО</span>
                              </div>
                              {answers.guestReactionEmoji && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                                  <span>Реакция:</span>
                                  <span className="text-base leading-none">
                                    {answers.guestReactionEmoji}
                                  </span>
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                              🎉 {triumphantHeadline}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/invite/${inv.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                              <span>Открыть страницу</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/?edit=${encodeURIComponent(inv.id)}`}
                              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all"
                              title="Редактировать в конструкторе"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={(e) => handleCopyLink(inv.id, e)}
                              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all cursor-pointer"
                              title="Скопировать ссылку"
                            >
                              {copiedId === inv.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Details Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {/* 1. Activities */}
                          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                              <span>🍕 Выбранные активности</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {answers.selectedActivities &&
                              answers.selectedActivities.length > 0 ? (
                                answers.selectedActivities.map((act, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-lg bg-white text-slate-800 text-xs font-semibold shadow-2xs border border-rose-200/60"
                                  >
                                    {act}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-600 font-medium">
                                  {rawActivity}
                                </span>
                              )}
                              {answers.customActivityIdea && (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300/70">
                                  💡 Своя идея: {answers.customActivityIdea}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 2. Date & Time */}
                          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Дата и время</span>
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                              {formattedDate} в {timeStr}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {config?.dateTime?.location || "Встреча назначена"}
                            </p>
                          </div>

                          {/* 3. Refusal stats (No button clicks) */}
                          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                              <Smile className="w-3.5 h-3.5" />
                              <span>Битва с кнопкой «Нет»</span>
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                              {answers.noAttemptsCount !== undefined &&
                              answers.noAttemptsCount > 0
                                ? `${answers.noAttemptsCount} попыток отказаться 🤭`
                                : "Согласилась с первого клика! 💖"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Просмотров открытки: {inv.views_count || 1}
                            </p>
                          </div>

                          {/* 4. Timestamp */}
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Статус в Vercel DB</span>
                            </span>
                            <p className="text-sm font-bold text-emerald-800">
                              Сохранено в облаке
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {answers.acceptedAt
                                ? formatCreatedDate(answers.acceptedAt)
                                : formatCreatedDate(inv.updated_at)}
                            </p>
                          </div>
                        </div>

                        {/* Claimed Love Coupons */}
                        {claimedCouponObjects.length > 0 && (
                          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-2">
                            <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                              <Ticket className="w-4 h-4 text-rose-500" />
                              <span>
                                Активированные любовные купоны ({claimedCouponObjects.length}):
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {claimedCouponObjects.map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-slate-800 shadow-2xs"
                                >
                                  <span>{c.emoji}</span>
                                  <span>{c.title}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quiz Answers */}
                        {answers.quizAnswers && answers.quizAnswers.length > 0 && (
                          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-2">
                            <p className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4 text-indigo-500" />
                              <span>Ответы на любовный квиз:</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {answers.quizAnswers.map((qa, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-white border border-indigo-100 text-xs space-y-0.5"
                                >
                                  <p className="text-slate-500 font-medium line-clamp-1">
                                    {qa.question}
                                  </p>
                                  <p className="font-bold text-slate-800">
                                    Ответ: {qa.selectedOption}{" "}
                                    {qa.isCorrect ? "✅" : "💕"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Personal Guest Note if exists */}
                        {answers.guestNote && (
                          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                            <MessageCircleHeart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-800">
                                Записка от твоей половинки:
                              </p>
                              <p className="text-sm text-slate-700 italic">
                                «{answers.guestNote}»
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ALL INVITATIONS LIST & FILTERS                                            */}
        {/* ========================================================================= */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Список всех приглашений</h2>
              <p className="text-xs text-slate-500">
                Редактируйте открытки в один клик, делитесь QR-кодами и дублируйте лучшие шаблоны
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Все ({invitations.length})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "accepted"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Приняты ({stats.accepted})
              </button>
              <button
                onClick={() => setFilter("opened")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "opened"
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Просмотрены 👀 ({stats.openedCount - stats.accepted > 0 ? stats.openedCount - stats.accepted : 0})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "pending"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Не открыты ({stats.pendingUnread})
              </button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="h-40 bg-slate-100 rounded-2xl" />
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredInvitations.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-5 max-w-lg mx-auto shadow-xs">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-3xl shadow-inner">
                💌
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900">
                  {filter === "all"
                    ? "У вас пока нет приглашений"
                    : filter === "accepted"
                    ? "Пока никто не ответил согласием"
                    : filter === "opened"
                    ? "Нет открытых приглашений без ответа"
                    : "Нет неоткрытых приглашений"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {filter === "all"
                    ? "Создайте первое интерактивное приглашение с конвертом, убегающей кнопкой «Нет», купонами и обратным отсчетом!"
                    : "Отправьте ссылку вашей половинке — статус обновится автоматически, как только открытку откроют."}
                </p>
              </div>

              {filter === "all" ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Создать в конструкторе</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleCreateDemoInvite}
                    disabled={creatingDemo}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>
                      {creatingDemo ? "Создаем в БД..." : "Создать демо-открытку в 1 клик"}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFilter("all")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  Показать все приглашения
                </button>
              )}
            </div>
          )}

          {/* Cards Grid */}
          {!loading && filteredInvitations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInvitations.map((inv) => {
                const config = (inv.config || {}) as Record<string, any>;
                const general = config.general || {};
                const dateTime = config.dateTime || {};
                const answers = (inv.guest_answers || {}) as Record<string, any>;

                const isAccepted = inv.status === "accepted";
                const viewsCount = inv.views_count || (isAccepted ? 1 : 0);
                const isOpened = !isAccepted && (inv.status === "opened" || viewsCount > 0);
                const coverImage =
                  general.coverImageUrl ||
                  "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif";

                return (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Top Image Preview & Badge */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={coverImage}
                        alt="Превью"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                            isAccepted
                              ? "bg-emerald-500/95 text-white"
                              : isOpened
                              ? "bg-sky-500/95 text-white"
                              : "bg-amber-500/95 text-white"
                          }`}
                        >
                          {isAccepted
                            ? "💕 Сказала ДА!"
                            : isOpened
                            ? "👀 Открыто гостем"
                            : "⏳ Ждет открытия"}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-white/90 text-slate-800 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-rose-500" />
                          <span>{viewsCount}</span>
                        </span>
                      </div>

                      {/* Title at bottom of cover */}
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                        {general.recipientName && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/80 text-white mb-0.5">
                            Для {general.recipientName}
                          </span>
                        )}
                        <h4 className="font-bold text-sm sm:text-base line-clamp-1 drop-shadow-md">
                          {general.title || "Пойдешь со мной на свидание?"}
                        </h4>
                        <p className="text-[11px] text-white/80 line-clamp-1 font-mono">
                          /invite/{inv.id}
                        </p>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {isAccepted ? (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                          <p className="text-xs font-bold text-emerald-800 flex items-center justify-between gap-1.5">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>
                                {formatRussianDate(answers.chosenDate || dateTime.date)} в{" "}
                                {answers.chosenTime || dateTime.time || "19:00"}
                              </span>
                            </span>
                            {answers.guestReactionEmoji && (
                              <span className="text-sm">{answers.guestReactionEmoji}</span>
                            )}
                          </p>
                          {(answers.selectedActivities?.length > 0 ||
                            answers.customActivityIdea) && (
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              План:{" "}
                              {[
                                ...(answers.selectedActivities || []),
                                answers.customActivityIdea
                                  ? `💡 ${answers.customActivityIdea}`
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                          {Array.isArray(answers.claimedCoupons) &&
                            answers.claimedCoupons.length > 0 && (
                              <p className="text-[11px] text-rose-600 font-semibold">
                                🎟️ Забрала купонов: {answers.claimedCoupons.length}
                              </p>
                            )}
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-slate-500 text-xs">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Дата:{" "}
                              {dateTime.date
                                ? `${formatRussianDate(dateTime.date)} в ${dateTime.time || "19:00"}`
                                : "По выбору гостя"}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {inv.last_opened_at
                                ? `Открыто ${formatCreatedDate(inv.last_opened_at)}`
                                : `Создано ${formatCreatedDate(inv.created_at)}`}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Actions Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <Link
                          href={`/invite/${inv.id}`}
                          target="_blank"
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                        >
                          <span>Открыть</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          onClick={(e) => handleCopyLink(inv.id, e)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          title="Скопировать ссылку"
                        >
                          {copiedId === inv.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            setQrModalInvite({
                              id: inv.id,
                              title: general.title || "Приглашение на свидание",
                            })
                          }
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          title="Показать QR-код"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/?edit=${encodeURIComponent(inv.id)}`}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors"
                          title="Редактировать приглашение"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/?duplicate=${encodeURIComponent(inv.id)}`}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-700 transition-colors"
                          title="Дублировать как шаблон"
                        >
                          <Files className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={(e) => handleDelete(inv.id, e)}
                          disabled={deletingId === inv.id}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                          title="Удалить приглашение"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrModalInvite(null)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4 text-center relative"
            >
              <button
                onClick={() => setQrModalInvite(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold">
                  QR-код приглашения
                </span>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1 px-4">
                  {qrModalInvite.title}
                </h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                    qrShareUrl
                  )}`}
                  alt="QR-код приглашения"
                  className="w-48 h-48 rounded-lg bg-white p-2"
                />
              </div>

              <p className="text-xs text-slate-500">
                Отсканируйте камерой телефона или отправьте скриншот своей половинке 💌
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleCopyLink(qrModalInvite.id)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedId === qrModalInvite.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Скопировать ссылку</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
