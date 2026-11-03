import { DbInvitation, DbInvitationStatus } from "@/types/db";
import { put, get, list, del } from "@vercel/blob";
import {
  isVercelPostgresConfigured,
  pgUpsertInvitation,
  pgGetInvitationById,
  pgUpdateGuestAnswers,
  pgRecordInvitationView,
  pgListInvitations,
  pgDeleteInvitation,
} from "@/lib/db";

// In-memory fallback repository for offline development when cloud env keys are absent
const memoryInvitations = new Map<string, DbInvitation>();

async function saveToBlob(record: DbInvitation): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return false;
  }
  try {
    await put(`invitations/${record.id}.json`, JSON.stringify(record), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return true;
  } catch (err) {
    console.warn("Vercel Blob save fallback:", err);
    return false;
  }
}

async function readFromBlob(id: string): Promise<DbInvitation | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return null;
  }
  try {
    const res = await get(`invitations/${id}.json`, { access: "public" });
    if (res && res.statusCode === 200 && res.stream) {
      const text = await new Response(res.stream).text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && parsed.id) {
        return parsed as DbInvitation;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function listFromBlob(): Promise<DbInvitation[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return [];
  }
  try {
    const { blobs } = await list({ prefix: "invitations/" });
    if (!blobs || blobs.length === 0) return [];

    const records = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: "no-store" });
          if (res.ok) {
            return (await res.json()) as DbInvitation;
          }
        } catch {}
        return null;
      })
    );

    return records.filter(
      (r): r is DbInvitation => r !== null && typeof r === "object" && !!r.id
    );
  } catch (err) {
    console.warn("Vercel Blob list fallback:", err);
    return [];
  }
}

async function deleteFromBlob(id: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
    return false;
  }
  try {
    await del(`invitations/${id}.json`);
    return true;
  } catch {
    return false;
  }
}

export async function upsertInvitation(data: {
  id?: string;
  user_id?: string | null;
  config: Record<string, unknown>;
  is_paid?: boolean;
}): Promise<DbInvitation> {
  const id = (data.id || crypto.randomUUID()).trim();
  const now = new Date().toISOString();

  // 1. PRIMARY: Vercel Postgres (Neon Serverless Database)
  if (isVercelPostgresConfigured()) {
    try {
      const pgRec = await pgUpsertInvitation({
        id,
        user_id: data.user_id || null,
        config: data.config,
        is_paid: true,
      });
      memoryInvitations.set(id, pgRec);
      return pgRec;
    } catch (err) {
      console.error("Vercel Postgres upsert error, checking fallbacks:", err);
    }
  }

  // 2. SECONDARY: Supabase REST API (if configured)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
          is_paid: true,
          status: "pending",
          updated_at: now,
        }),
      });

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          const rec = records[0] as DbInvitation;
          memoryInvitations.set(id, rec);
          return rec;
        }
      }
    } catch (err) {
      console.warn("Supabase request failed, falling back to blob/memory:", err);
    }
  }

  // 3. TERTIARY: Persistent Vercel Blob store & In-memory cache
  const existing = memoryInvitations.get(id);
  const record: DbInvitation = {
    id,
    user_id: data.user_id || existing?.user_id || null,
    config: data.config,
    is_paid: true,
    status: existing?.status || "pending",
    views_count: existing?.views_count || 0,
    first_opened_at: existing?.first_opened_at || null,
    last_opened_at: existing?.last_opened_at || null,
    guest_answers: existing?.guest_answers || {},
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  memoryInvitations.set(id, record);
  await saveToBlob(record);
  return record;
}

export async function getInvitationById(id: string): Promise<DbInvitation | null> {
  // 1. PRIMARY: Vercel Postgres (always fresh so guest status & answers are live)
  if (isVercelPostgresConfigured()) {
    try {
      const pgRec = await pgGetInvitationById(id);
      if (pgRec) {
        memoryInvitations.set(id, pgRec);
        return pgRec;
      }
    } catch (err) {
      console.warn("Vercel Postgres getInvitationById failed:", err);
    }
  }

  const cached = memoryInvitations.get(id);
  if (cached) return cached;

  // 2. SECONDARY: Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          const rec = records[0] as DbInvitation;
          memoryInvitations.set(id, rec);
          return rec;
        }
      }
    } catch (err) {
      console.warn("Supabase query failed, checking blob storage:", err);
    }
  }

  // 3. Check persistent Vercel Blob store
  const fromBlob = await readFromBlob(id);
  if (fromBlob) {
    memoryInvitations.set(id, fromBlob);
    return fromBlob;
  }

  return null;
}

export async function recordInvitationView(id: string): Promise<DbInvitation | null> {
  if (isVercelPostgresConfigured()) {
    try {
      const updated = await pgRecordInvitationView(id);
      if (updated) {
        memoryInvitations.set(id, updated);
        return updated;
      }
    } catch (err) {
      console.warn("Vercel Postgres recordInvitationView error:", err);
    }
  }

  const existing = await getInvitationById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: DbInvitation = {
    ...existing,
    views_count: (existing.views_count || 0) + 1,
    first_opened_at: existing.first_opened_at || now,
    last_opened_at: now,
    status: existing.status === "pending" ? "opened" : existing.status,
  };
  memoryInvitations.set(id, updated);
  await saveToBlob(updated);
  return updated;
}

export async function updateGuestAnswers(
  id: string,
  answers: Record<string, unknown>,
  nextStatus: DbInvitationStatus = "accepted"
): Promise<DbInvitation | null> {
  // 1. PRIMARY: Vercel Postgres
  if (isVercelPostgresConfigured()) {
    try {
      const updated = await pgUpdateGuestAnswers(id, answers, nextStatus);
      if (updated) {
        memoryInvitations.set(id, updated);
        return updated;
      }
    } catch (err) {
      console.warn("Vercel Postgres updateGuestAnswers error:", err);
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();

  const existing = await getInvitationById(id);

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            status: nextStatus,
            guest_answers: { ...(existing?.guest_answers || {}), ...answers },
            updated_at: now,
          }),
        }
      );

      if (res.ok) {
        const records = await res.json();
        if (records && records[0]) {
          const rec = records[0] as DbInvitation;
          memoryInvitations.set(id, rec);
          return rec;
        }
      }
    } catch (err) {
      console.warn("Supabase update answers failed:", err);
    }
  }

  if (existing) {
    const updated: DbInvitation = {
      ...existing,
      status: nextStatus,
      guest_answers: { ...existing.guest_answers, ...answers },
      updated_at: now,
    };
    memoryInvitations.set(id, updated);
    await saveToBlob(updated);
    return updated;
  }

  return null;
}

export async function markInvitationAsPaid(id: string): Promise<DbInvitation | null> {
  const existing = await getInvitationById(id);
  if (!existing) return null;
  if (existing.is_paid) return existing;
  return upsertInvitation({
    id,
    user_id: existing.user_id,
    config: existing.config as Record<string, unknown>,
    is_paid: true,
  });
}

export async function listInvitations(
  userId?: string | null,
  ids?: string[]
): Promise<DbInvitation[]> {
  // 1. PRIMARY: Vercel Postgres
  if (isVercelPostgresConfigured()) {
    try {
      const list = await pgListInvitations({ userId, ids });
      return list;
    } catch (err) {
      console.warn("Vercel Postgres listInvitations error:", err);
    }
  }

  // 2. SECONDARY: Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      let queryUrl = `${supabaseUrl}/rest/v1/invitations?select=*&order=created_at.desc`;
      if (userId) {
        queryUrl += `&user_id=eq.${encodeURIComponent(userId)}`;
      }

      const res = await fetch(queryUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records)) {
          return records as DbInvitation[];
        }
      }
    } catch (err) {
      console.warn("Supabase listInvitations failed:", err);
    }
  }

  // 3. Fallback: Blob + In-Memory
  const blobList = await listFromBlob();
  for (const b of blobList) {
    memoryInvitations.set(b.id, b);
  }

  const list = Array.from(memoryInvitations.values());
  const filtered =
    userId || (ids && ids.length > 0)
      ? list.filter(
          (item) =>
            (userId && item.user_id === userId) ||
            (ids && ids.includes(item.id))
        )
      : list;

  return filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteInvitation(id: string): Promise<boolean> {
  let deletedPg = false;
  if (isVercelPostgresConfigured()) {
    try {
      deletedPg = await pgDeleteInvitation(id);
    } catch (err) {
      console.warn("Vercel Postgres delete failed:", err);
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/invitations?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
    } catch {}
  }

  await deleteFromBlob(id);
  const deletedMem = memoryInvitations.delete(id);
  return deletedPg || deletedMem;
}
