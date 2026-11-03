"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Share2,
  Save,
  Smartphone,
  Sliders,
  Check,
  Loader2,
  Heart,
  Plus,
} from "lucide-react";
import { useInviteStore } from "@/store/useInviteStore";
import { saveDraft } from "@/lib/api";

interface HeaderProps {
  activeMobileTab?: "editor" | "preview";
  onTabChange?: (tab: "editor" | "preview") => void;
}

export function Header({ activeMobileTab = "editor", onTabChange }: HeaderProps) {
  const store = useInviteStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const getConfigSnapshot = () => ({
    general: store.general,
    confirmation: store.confirmation,
    noButton: store.noButton,
    activitiesConfig: store.activitiesConfig,
    activities: store.activities,
    dateTime: store.dateTime,
    audio: store.audio,
    finalScreen: store.finalScreen,
    quiz: store.quiz,
    coupons: store.coupons,
    telegramNotification: store.telegramNotification,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentId =
        store.draftId ||
        (typeof window !== "undefined" ? localStorage.getItem("love_evol_draft_id") : null) ||
        undefined;

      const result = await saveDraft(getConfigSnapshot(), currentId);
      if (result.success && result.invitation) {
        store.setDraftId(result.invitation.id);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
      alert("Не удалось сохранить приглашение в БД. Попробуйте еще раз.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    let currentId =
      store.draftId ||
      (typeof window !== "undefined" ? localStorage.getItem("love_evol_draft_id") : null);

    setIsSaving(true);
    try {
      const result = await saveDraft(getConfigSnapshot(), currentId || undefined);
      if (result?.invitation?.id) {
        currentId = result.invitation.id;
        store.setDraftId(currentId);
      }
    } catch (err) {
      console.error("Auto-save on share failed:", err);
    } finally {
      setIsSaving(false);
    }

    if (currentId) {
      const shareUrl = `${window.location.origin}/invite/${currentId}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between gap-2">
      {/* Left: Branding */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-rose-200 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
              LoveEvol
            </h1>
            <span className="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 font-semibold">
              Pro Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden xl:block truncate">
            Интерактивные приглашения с облачной базой данных Vercel
          </p>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange?.("editor")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMobileTab === "editor"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Редактор</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange?.("preview")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMobileTab === "preview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Превью</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => store.startNewInvitation()}
          title="Создать новое приглашение с чистого листа"
          className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Новая</span>
        </button>

        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all active:scale-95 shadow-2xs"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span className="hidden sm:inline">Мои приглашения</span>
          <span className="sm:hidden">Кабинет</span>
        </Link>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold hidden sm:inline">Скопировано!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ссылка</span>
            </>
          )}
        </button>

        {/* Save Draft Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer ${
            isSaved ? "bg-emerald-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Сохраняем...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">В базе!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сохранить</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
