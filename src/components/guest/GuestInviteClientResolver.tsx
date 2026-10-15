"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DbInvitation } from "@/types/db";
import { GuestInvitationView } from "./GuestInvitationView";
import { Heart, Sparkles, RefreshCw, Loader2 } from "lucide-react";

interface GuestInviteClientResolverProps {
  id: string;
}

export function GuestInviteClientResolver({ id }: GuestInviteClientResolverProps) {
  const [invitation, setInvitation] = useState<DbInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const tryResolve = async () => {
    setLoading(true);

    // 1. Check URL query params for ?d= (encoded config payload)
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const d = urlParams.get("d");
        if (d) {
          let parsedConfig: Record<string, unknown> | null = null;
          try {
            const raw = Buffer.from(decodeURIComponent(d), "base64url").toString("utf-8");
            parsedConfig = JSON.parse(raw);
          } catch {
            try {
              const raw = atob(decodeURIComponent(d));
              parsedConfig = JSON.parse(raw);
            } catch {}
          }

          if (parsedConfig && typeof parsedConfig === "object") {
            const localInv: DbInvitation = {
              id,
              user_id: null,
              config: parsedConfig,
              is_paid: true,
              status: "pending",
              guest_answers: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setInvitation(localInv);
            setLoading(false);
            // Sync with backend in background
            fetch("/api/invitations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, config: parsedConfig }),
            }).catch(() => {});
            return;
          }
        }
      } catch (err) {
        console.warn("Failed reading payload query param:", err);
      }
    }

    // 2. Fetch from API endpoint /api/invitations?id=...
    try {
      const res = await fetch(`/api/invitations?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.invitation) {
          setInvitation(data.invitation);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("API resolve error:", e);
    }

    // 3. Fallback: check localStorage for creator preview
    if (typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem("love-evol-invite-draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          const config = parsed.state || parsed;
          if (config && (config.general || config.title)) {
            const draftInv: DbInvitation = {
              id,
              user_id: null,
              config,
              is_paid: true,
              status: "pending",
              guest_answers: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setInvitation(draftInv);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    setLoading(false);
  };

  useEffect(() => {
    tryResolve();
  }, [id, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
            <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
          </div>
        </div>
        <div className="mt-6 text-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Загружаем романтическое послание...</span>
            <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
          </h2>
          <p className="text-xs text-rose-200/80">
            Готовим открытку, анимации и сюрпризы для вас ✨
          </p>
        </div>
      </div>
    );
  }

  if (invitation) {
    return <GuestInvitationView invitation={invitation} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/15 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-400/30">
          <Heart className="w-8 h-8 fill-rose-400/30 stroke-rose-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Приглашение не найдено
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Возможно, ссылка была скопирована не полностью или черновик еще загружается в базу данных.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Попробовать снова</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Создать свое</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
