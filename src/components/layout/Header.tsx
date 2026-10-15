"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Share2, Save, Smartphone, Sliders, Check, Loader2, Heart, Link as LinkIcon } from "lucide-react";
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
  const [savedId, setSavedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle Save Draft to API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Snapshot the configuration part of the store
      const configSnapshot = {
        general: store.general,
        confirmation: store.confirmation,
        noButton: store.noButton,
        activitiesConfig: store.activitiesConfig,
        activities: store.activities,
        dateTime: store.dateTime,
        audio: store.audio,
        finalScreen: store.finalScreen,
        quiz: store.quiz,
        telegramNotification: store.telegramNotification,
      };

      const result = await saveDraft(configSnapshot, savedId || undefined);
      if (result.success && result.invitation) {
        setSavedId(result.invitation.id);
        setIsSaved(true);

        try {
          const existingIds = JSON.parse(localStorage.getItem("love_evol_invitation_ids") || "[]");
          if (!existingIds.includes(result.invitation.id)) {
            existingIds.unshift(result.invitation.id);
            localStorage.setItem("love_evol_invitation_ids", JSON.stringify(existingIds));
          }
        } catch {
          // ignore localStorage error
        }

        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
      alert("Не удалось сохранить черновик. Попробуйте еще раз.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Share link copy
  const handleShare = async () => {
    let currentId = savedId || (typeof window !== "undefined" ? localStorage.getItem("love_evol_draft_id") : null);

    // If no draft ID saved yet, automatically save draft now
    if (!currentId) {
      setIsSaving(true);
      try {
        const configSnapshot = {
          general: store.general,
          confirmation: store.confirmation,
          noButton: store.noButton,
          activitiesConfig: store.activitiesConfig,
          activities: store.activities,
          dateTime: store.dateTime,
          audio: store.audio,
          finalScreen: store.finalScreen,
          quiz: store.quiz,
          telegramNotification: store.telegramNotification,
        };
        const result = await saveDraft(configSnapshot);
        if (result?.invitation?.id) {
          currentId = result.invitation.id;
          setSavedId(currentId);
          localStorage.setItem("love_evol_draft_id", currentId);

          try {
            const existingIds = JSON.parse(localStorage.getItem("love_evol_invitation_ids") || "[]");
            if (!existingIds.includes(currentId)) {
              existingIds.unshift(currentId);
              localStorage.setItem("love_evol_invitation_ids", JSON.stringify(existingIds));
            }
          } catch {}
        }
      } catch (err) {
        console.error("Auto-save on share failed:", err);
      } finally {
        setIsSaving(false);
      }
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
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Branding & Step Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-900 text-base sm:text-lg tracking-tight">
              LoveEvol
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 font-medium">
              Конструктор
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Интерактивный редактор электронных приглашений
          </p>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible on small screens only) */}
      <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => onTabChange?.("editor")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeMobileTab === "editor"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Настройки</span>
        </button>
        <button
          onClick={() => onTabChange?.("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all active:scale-95 shadow-xs"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span className="hidden sm:inline">Мои приглашения</span>
          <span className="sm:hidden">Кабинет</span>
        </Link>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Ссылка скопирована!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поделиться</span>
            </>
          )}
        </button>

        {/* Save Draft Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm ${
            isSaved
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Сохранение...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Сохранено!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить черновик</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
