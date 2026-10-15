"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Plus,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  MessageCircleHeart,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Share2,
  Smile,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { DbInvitation } from "@/types/db";
import { fetchInvitations, deleteInvitationApi } from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";

// Helper to inflect activity for "Вы идете на ..."
function formatActivityInRussian(activityRaw?: string): string {
  if (!activityRaw) return "свидание";
  // Remove leading emojis
  const clean = activityRaw.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Symbol}\s]+/u, "").trim();

  const lower = clean.toLowerCase();
  if (lower.startsWith("пицц")) return "Пиццу";
  if (lower.startsWith("прогулк")) return "Прогулку с кофе";
  if (lower.startsWith("ужин")) return "Ужин при свечах";
  if (lower.startsWith("кино")) return "Кино";
  if (lower.startsWith("выставк")) return "Выставку";
  if (lower.startsWith("концерт")) return "Концерт";
  if (lower.startsWith("пикник")) return "Пикник";

  return clean;
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
  const [filter, setFilter] = useState<"all" | "accepted" | "pending">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load invitations
  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetchInvitations();
      if (res.success && Array.isArray(res.invitations)) {
        setInvitations(res.invitations);
      }
    } catch (err) {
      console.error("Failed to load dashboard invitations:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    if (!confirm("Вы уверены, что хотите удалить это приглашение?")) return;

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

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    if (filter === "accepted") {
      return invitations.filter((inv) => inv.status === "accepted");
    }
    if (filter === "pending") {
      return invitations.filter((inv) => inv.status !== "accepted");
    }
    return invitations;
  }, [invitations, filter]);

  // Find accepted invitations for the special triumphant highlight card
  const acceptedInvitations = useMemo(() => {
    return invitations.filter((inv) => inv.status === "accepted");
  }, [invitations]);

  // Statistics
  const stats = useMemo(() => {
    const total = invitations.length;
    const accepted = invitations.filter((inv) => inv.status === "accepted").length;
    const pending = total - accepted;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, accepted, pending, successRate };
  }, [invitations]);

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
                Личный кабинет свиданий
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Обновить данные"
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
                Отслеживайте ответы ваших половинок и планируйте незабываемые свидания
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

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Сказали «ДА!»</p>
                <p className="text-xl font-bold text-emerald-600">{stats.accepted}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Ждут ответа</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Успешность</p>
                <p className="text-xl font-bold text-purple-600">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SPECIAL RESULT CARDS: ЕСЛИ ГОСТЬ ПРОШЕЛ ПРИГЛАШЕНИЕ                       */}
        {/* "Она сказала ДА! Вы идете на Пиццу 26 июля в 19:00"                       */}
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
                const answers = (inv.guest_answers || {}) as {
                  selectedActivities?: string[];
                  chosenDate?: string;
                  chosenTime?: string;
                  noAttemptsCount?: number;
                  acceptedAt?: string;
                  guestNote?: string;
                };

                const rawActivity =
                  answers.selectedActivities && answers.selectedActivities.length > 0
                    ? answers.selectedActivities[0]
                    : "Пицца";
                const activityText = formatActivityInRussian(rawActivity);

                const dateStr =
                  answers.chosenDate ||
                  (inv.config as any)?.dateTime?.date ||
                  "2026-07-26";
                const formattedDate = formatRussianDate(dateStr);

                const timeStr =
                  answers.chosenTime ||
                  (inv.config as any)?.dateTime?.time ||
                  "19:00";

                // EXACT REQUIRED STRING FORMAT:
                // "Она сказала ДА! Вы идете на Пиццу 26 июля в 19:00"
                const triumphantHeadline = `Она сказала ДА! Вы идете на ${activityText} ${formattedDate} в ${timeStr}`;

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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold tracking-wide">
                              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                              <span>ИДЕАЛЬНЫЙ MATCH • СВИДАНИЕ НАЗНАЧЕНО</span>
                            </div>

                            {/* The Prominent Result Headline */}
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

                            <button
                              onClick={(e) => handleCopyLink(inv.id, e)}
                              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all"
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
                              {answers.selectedActivities && answers.selectedActivities.length > 0 ? (
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
                            <p className="text-[11px] text-slate-500">
                              Добавьте в календарь
                            </p>
                          </div>

                          {/* 3. Refusal stats (No button clicks) */}
                          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                              <Smile className="w-3.5 h-3.5" />
                              <span>Битва с кнопкой «Нет»</span>
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                              {answers.noAttemptsCount !== undefined && answers.noAttemptsCount > 0
                                ? `${answers.noAttemptsCount} попыток отказаться 🤭`
                                : "Согласилась с первого клика! 💖"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Но магия любви победила!
                            </p>
                          </div>

                          {/* 4. Timestamp */}
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Статус в БД</span>
                            </span>
                            <p className="text-sm font-bold text-emerald-800">
                              Подтверждено в БД
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {answers.acceptedAt
                                ? formatCreatedDate(answers.acceptedAt)
                                : "Только что"}
                            </p>
                          </div>
                        </div>

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
                Управляйте ссылками, просматривайте детали и следите за статусом
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
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
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === "pending"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ожидают ({stats.pending})
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
                    : "Нет активных приглашений в ожидании"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {filter === "all"
                    ? "Создайте первое красивое интерактивное приглашение с вопросом, активностями и магической кнопкой!"
                    : "Отправьте ссылку на приглашение вашей половинке, чтобы увидеть ее реакцию здесь."}
                </p>
              </div>

              {filter === "all" ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-sm font-bold shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Создать первое приглашение</span>
                </Link>
              ) : (
                <button
                  onClick={() => setFilter("all")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
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
                const config = (inv.config || {}) as any;
                const general = config.general || {};
                const dateTime = config.dateTime || {};
                const answers = (inv.guest_answers || {}) as any;

                const isAccepted = inv.status === "accepted";
                const isPaid = inv.is_paid;
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                            isAccepted
                              ? "bg-emerald-500/90 text-white"
                              : "bg-amber-500/90 text-white"
                          }`}
                        >
                          {isAccepted ? "💕 Сказала ДА!" : "⏳ Ждет ответа"}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-white/90 text-rose-700">
                          Бесплатно 🎁
                        </span>
                      </div>

                      {/* Title at bottom of cover */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h4 className="font-bold text-sm sm:text-base line-clamp-1 drop-shadow-md">
                          {general.title || "Пойдешь со мной на свидание?"}
                        </h4>
                        <p className="text-[11px] text-white/80 line-clamp-1">
                          {general.subtitle || "Особенный вечер..."}
                        </p>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Guest answers summary if accepted */}
                      {isAccepted ? (
                        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {formatRussianDate(answers.chosenDate || dateTime.date)} в{" "}
                              {answers.chosenTime || dateTime.time || "19:00"}
                            </span>
                          </p>
                          {answers.selectedActivities && answers.selectedActivities.length > 0 && (
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              Активности: {answers.selectedActivities.join(", ")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 text-slate-500 text-xs">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Предложено: {dateTime.date ? formatRussianDate(dateTime.date) : "По договоренности"}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Создано {formatCreatedDate(inv.created_at)}</span>
                          </p>
                        </div>
                      )}

                      {/* Actions Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
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
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                          title="Скопировать ссылку"
                        >
                          {copiedId === inv.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleDelete(inv.id, e)}
                          disabled={deletingId === inv.id}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"
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
    </div>
  );
}
