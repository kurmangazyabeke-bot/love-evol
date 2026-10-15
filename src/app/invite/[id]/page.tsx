import { Metadata } from "next";
import Link from "next/link";
import { getInvitationById, upsertInvitation } from "@/lib/supabase";
import { GuestInvitationView } from "@/components/guest/GuestInvitationView";
import { Heart, Sparkles, Home } from "lucide-react";
import { DbInvitation } from "@/types/db";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ d?: string }>;
}

async function resolveInvitation(id: string, d?: string): Promise<DbInvitation | null> {
  let invitation = await getInvitationById(id);
  if (!invitation && d) {
    try {
      const decodedJson = Buffer.from(decodeURIComponent(d), "base64url").toString("utf-8");
      const config = JSON.parse(decodedJson);
      if (config && typeof config === "object") {
        invitation = {
          id,
          user_id: null,
          config,
          is_paid: true,
          status: "pending",
          guest_answers: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        upsertInvitation(invitation).catch(() => {});
      }
    } catch {
      try {
        const decodedJson = Buffer.from(decodeURIComponent(d), "base64").toString("utf-8");
        const config = JSON.parse(decodedJson);
        if (config && typeof config === "object") {
          invitation = {
            id,
            user_id: null,
            config,
            is_paid: true,
            status: "pending",
            guest_answers: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          upsertInvitation(invitation).catch(() => {});
        }
      } catch {}
    }
  }
  return invitation;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const search = searchParams ? await searchParams : undefined;
  const invitation = await resolveInvitation(id, search?.d);

  if (!invitation) {
    return {
      title: "Приглашение на свидание | LoveEvol",
      description: "Интерактивное романтическое приглашение на особенный вечер",
    };
  }

  const rawConfig = (invitation.config || {}) as Record<string, unknown>;
  const general = (rawConfig.general || {}) as Record<string, string>;

  const title = general.title || "Пойдешь со мной на свидание? 💖";
  const subtitle =
    general.subtitle || "Я приготовил для нас особенный вечер и очень жду твоего ответа...";
  const coverImageUrl =
    general.coverImageUrl ||
    `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`;

  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`;

  return {
    title: `${title} | LoveEvol`,
    description: subtitle,
    openGraph: {
      title: `💌 ${title}`,
      description: `${subtitle} — Нажмите, чтобы открыть интерактивное приглашение!`,
      siteName: "LoveEvol",
      locale: "ru_RU",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
        ...(coverImageUrl && coverImageUrl !== ogImageUrl
          ? [
              {
                url: coverImageUrl,
                alt: "Обложка приглашения",
              },
            ]
          : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `💌 ${title}`,
      description: subtitle,
      images: [ogImageUrl],
    },
  };
}

export default async function GuestInvitePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const search = searchParams ? await searchParams : undefined;
  const invitation = await resolveInvitation(id, search?.d);

  if (!invitation) {
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
              Возможно, ссылка была изменена или черновик еще не был сохранен в базе данных.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Создать свое приглашение</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <GuestInvitationView invitation={invitation} />;
}
