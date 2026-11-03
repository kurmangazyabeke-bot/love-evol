import { SaveDraftResponse, DbInvitation } from "@/types/db";

const CREATOR_ID_KEY = "love_evol_creator_id";
const INVITATION_IDS_KEY = "love_evol_invitation_ids";

export function getOrCreateCreatorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let cid = localStorage.getItem(CREATOR_ID_KEY);
    if (!cid) {
      cid = crypto.randomUUID();
      localStorage.setItem(CREATOR_ID_KEY, cid);
    }
    return cid;
  } catch {
    return "";
  }
}

export function getStoredInvitationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INVITATION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberInvitationId(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const list = getStoredInvitationIds();
    const updated = [id, ...list.filter((x) => x !== id)].slice(0, 100);
    localStorage.setItem(INVITATION_IDS_KEY, JSON.stringify(updated));
  } catch {}
}

export function forgetInvitationId(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const list = getStoredInvitationIds().filter((x) => x !== id);
    localStorage.setItem(INVITATION_IDS_KEY, JSON.stringify(list));
  } catch {}
}

export async function saveDraft(
  config: Record<string, unknown>,
  id?: string,
  userId?: string
): Promise<SaveDraftResponse> {
  const effectiveUserId = userId || getOrCreateCreatorId() || undefined;
  const res = await fetch("/api/invitations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id || undefined,
      userId: effectiveUserId,
      config,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка сохранения: ${res.statusText}`);
  }

  const data: SaveDraftResponse = await res.json();
  if (data.invitation?.id) {
    rememberInvitationId(data.invitation.id);
  }
  return data;
}

export async function fetchInvitation(id: string, trackView = false) {
  const url = `/api/invitations?id=${encodeURIComponent(id)}${trackView ? "&trackView=1" : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Приглашение не найдено: ${res.statusText}`);
  }
  return res.json() as Promise<{ success: boolean; invitation: DbInvitation }>;
}

export async function recordGuestView(id: string) {
  try {
    await fetch(`/api/invitations?id=${encodeURIComponent(id)}&trackView=1`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {}
}

export async function uploadFile(
  file: File | Blob,
  bucket: "images" | "audio" = "images",
  customFileName?: string
): Promise<{ success: boolean; url: string; fileName: string; size: number; provider?: string }> {
  const formData = new FormData();
  if (file instanceof File) {
    formData.append("file", file);
  } else {
    const ext = file.type.includes("mp4") ? "m4a" : file.type.includes("mpeg") ? "mp3" : "webm";
    formData.append("file", file, customFileName || `voice-${Date.now()}.${ext}`);
  }
  formData.append("bucket", bucket);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка загрузки файла: ${res.statusText}`);
  }

  return res.json();
}

export async function submitGuestAnswers(
  id: string,
  answers: Record<string, unknown>,
  method: "PATCH" | "PUT" = "PATCH"
): Promise<{ success: boolean; invitation: DbInvitation; guest_answers?: unknown; message?: string }> {
  const res = await fetch("/api/invitations", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      answers,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка сохранения ответов: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchInvitations(userId?: string): Promise<{
  success: boolean;
  invitations: DbInvitation[];
  storageProvider?: string;
}> {
  const effectiveUserId = userId || getOrCreateCreatorId();
  const storedIds = getStoredInvitationIds();
  const params = new URLSearchParams();
  if (effectiveUserId) params.set("userId", effectiveUserId);
  if (storedIds.length > 0) params.set("ids", storedIds.join(","));

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`/api/invitations${query}`, { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка получения списка: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteInvitationApi(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`/api/invitations?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка удаления: ${res.statusText}`);
  }
  forgetInvitationId(id);
  return res.json();
}

export async function fetchDbHealth(): Promise<{
  ok: boolean;
  connected: boolean;
  provider: string;
  invitationsCount?: number;
  mediaCount?: number;
  latencyMs?: number;
}> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    return await res.json();
  } catch {
    return { ok: false, connected: false, provider: "offline" };
  }
}
