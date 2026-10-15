import { DbInvitation } from "@/types/db";

// In-memory fallback repository for local development & preview when Supabase env keys are not yet provided
const memoryInvitations = new Map<string, DbInvitation>();

export async function upsertInvitation(data: {
  id?: string;
  user_id?: string | null;
  config: Record<string, unknown>;
  is_paid?: boolean;
}): Promise<DbInvitation> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const id = data.id || crypto.randomUUID();
  const now = new Date().toISOString();

  // 1. If Supabase keys are configured, use Supabase REST API
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          id,
          user_id: data.user_id || null,
          config: data.config,
          is_paid: true, // 100% Free platform
          status: "pending",
          updated_at: now,
        }),
      });

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          return records[0] as DbInvitation;
        }
      }
    } catch (err) {
      console.warn("Supabase request failed, falling back to local memory store:", err);
    }
  }

  // 2. Fallback in-memory store
  const existing = memoryInvitations.get(id);
  const record: DbInvitation = {
    id,
    user_id: data.user_id || null,
    config: data.config,
    is_paid: true, // 100% Free platform
    status: existing?.status || "pending",
    guest_answers: existing?.guest_answers || {},
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  memoryInvitations.set(id, record);
  return record;
}

export async function getInvitationById(id: string): Promise<DbInvitation | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=eq.${id}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          return records[0] as DbInvitation;
        }
      }
    } catch (err) {
      console.warn("Supabase query failed, checking local memory:", err);
    }
  }

  return memoryInvitations.get(id) || null;
}

export async function updateGuestAnswers(
  id: string,
  answers: Record<string, unknown>
): Promise<DbInvitation | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            status: "accepted",
            guest_answers: answers,
            updated_at: now,
          }),
        }
      );

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          return records[0] as DbInvitation;
        }
      }
    } catch (err) {
      console.warn("Supabase update answers query failed, checking local memory:", err);
    }
  }

  const existing = memoryInvitations.get(id);
  if (existing) {
    const updated: DbInvitation = {
      ...existing,
      status: "accepted",
      guest_answers: { ...existing.guest_answers, ...answers },
      updated_at: now,
    };
    memoryInvitations.set(id, updated);
    return updated;
  }

  return null;
}

export async function markInvitationAsPaid(id: string): Promise<DbInvitation | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            is_paid: true,
            updated_at: now,
          }),
        }
      );

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          return records[0] as DbInvitation;
        }
      }
    } catch (err) {
      console.warn("Supabase mark paid error, checking local memory:", err);
    }
  }

  const existing = memoryInvitations.get(id);
  if (existing) {
    const updated: DbInvitation = {
      ...existing,
      is_paid: true,
      updated_at: now,
    };
    memoryInvitations.set(id, updated);
    return updated;
  }

  return null;
}

export async function listInvitations(userId?: string | null): Promise<DbInvitation[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      let queryUrl = `${supabaseUrl}/rest/v1/invitations?select=*&order=created_at.desc`;
      if (userId) {
        queryUrl += `&user_id=eq.${userId}`;
      }

      const res = await fetch(queryUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records)) {
          return records as DbInvitation[];
        }
      }
    } catch (err) {
      console.warn("Supabase listInvitations failed, falling back to local memory:", err);
    }
  }

  // Ensure demo seed exists if store is empty so dashboard displays sample result card
  if (memoryInvitations.size === 0) {
    seedDemoInvitations();
  }

  const list = Array.from(memoryInvitations.values());
  if (userId) {
    return list.filter((item) => item.user_id === userId);
  }
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/invitations?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        memoryInvitations.delete(id);
        return true;
      }
    } catch (err) {
      console.warn("Supabase delete failed, falling back to local memory:", err);
    }
  }

  return memoryInvitations.delete(id);
}

function seedDemoInvitations() {
  const sampleAccepted: DbInvitation = {
    id: "demo-accepted-invite",
    user_id: "demo-user",
    config: {
      general: {
        title: "Пойдешь со мной на свидание? 💖",
        subtitle: "Я приготовил для нас особенный вечер и очень жду твоего ответа...",
        coverImageUrl: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
        yesButtonText: "Да, с радостью! 🥰",
        noButtonText: "Нет...",
        vibe: "sunset-blush",
        openingAnimation: "ribbon",
      },
      confirmation: {
        title: "Подожди, ты реально сказала да?! 🥹❤️",
        subtitle: "Я не верю своему счастью! Теперь давай решим, как мы проведем этот вечер... ✨",
        continueButtonText: "Выбрать, чем мы займемся 🥰",
        stickerUrl: "https://i.giphy.com/d6RZ1E5AT6JlZrP4z3.gif",
      },
      dateTime: {
        enabled: true,
        date: "2026-07-26",
        time: "19:00",
        title: "Когда встретимся? 🗓️",
        subtitle: "Выбери день и время нашей встречи",
        continueButtonText: "Завершить и подтвердить ✨",
      },
      finalScreen: {
        title: "Урааа! Жду нашу встречу 26 июля в 19:00! 🎉💖",
        message: "Мы обязательно пойдем на Пиццу! Это будет самый незабываемый вечер.",
        imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
        location: "Уютный ресторан в центре города",
        showConfetti: true,
        extraNote: "Не забудь улыбку!",
        photoAlbum: [],
        secretMessage: "P.S. Я приготовил для тебя кое-что особенное ❤️",
      },
    },
    is_paid: true,
    status: "accepted",
    guest_answers: {
      selectedActivities: ["🍕 Пицца и кино", "☕ Прогулка с кофе"],
      chosenDate: "2026-07-26",
      chosenTime: "19:00",
      noAttemptsCount: 5,
      acceptedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      guestNote: "Безумно жду этого вечера! Пицца — идеальный выбор! 🥰🍕",
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  };

  const samplePending: DbInvitation = {
    id: "demo-pending-invite",
    user_id: "demo-user",
    config: {
      general: {
        title: "Сходим выпить кофе и поболтать? ☕✨",
        subtitle: "Знаю одно невероятно уютное место с лучшими круассанами в городе...",
        coverImageUrl: "https://i.giphy.com/ddvkYSGBpv6Tu.gif",
        yesButtonText: "Конечно, погнали! 🥰",
        noButtonText: "Я занята...",
        vibe: "golden-champagne",
        openingAnimation: "envelope",
      },
      dateTime: {
        enabled: true,
        date: "2026-08-01",
        time: "18:30",
        title: "Когда?",
        subtitle: "Выбери время",
        continueButtonText: "Дальше",
      },
    },
    is_paid: true,
    status: "pending",
    guest_answers: {},
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  };

  memoryInvitations.set(sampleAccepted.id, sampleAccepted);
  memoryInvitations.set(samplePending.id, samplePending);
}


