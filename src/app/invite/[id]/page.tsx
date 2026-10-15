import { Metadata } from "next";
import { getInvitationById, upsertInvitation } from "@/lib/supabase";
import { GuestInvitationView } from "@/components/guest/GuestInvitationView";
import { GuestInviteClientResolver } from "@/components/guest/GuestInviteClientResolver";
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
    return <GuestInviteClientResolver id={id} />;
  }

  return <GuestInvitationView invitation={invitation} />;
}
