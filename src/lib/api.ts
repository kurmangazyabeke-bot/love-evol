import { SaveDraftResponse } from "@/types/db";

export async function saveDraft(
  config: Record<string, unknown>,
  id?: string,
  userId?: string
): Promise<SaveDraftResponse> {
  const res = await fetch("/api/invitations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      userId,
      config,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка сохранения: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchInvitation(id: string) {
  const res = await fetch(`/api/invitations?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Приглашение не найдено: ${res.statusText}`);
  }
  return res.json();
}

export async function uploadFile(
  file: File,
  bucket: "images" | "audio" = "images"
): Promise<{ success: boolean; url: string; fileName: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);
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
): Promise<{ success: boolean; invitation: unknown; guest_answers?: unknown; message?: string }> {
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

export async function createCheckoutSession(
  invitationId: string,
  provider: "stripe" | "yookassa" = "stripe",
  demo = false
): Promise<{
  success: boolean;
  url?: string;
  demo?: boolean;
  is_paid?: boolean;
  shareUrl?: string;
  message?: string;
}> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invitationId,
      provider,
      demo,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка инициализации оплаты: ${res.statusText}`);
  }

  return res.json();
}

export async function checkPaymentStatus(
  invitationId: string
): Promise<{ success: boolean; is_paid: boolean; status?: string }> {
  const res = await fetch(`/api/checkout?invitationId=${encodeURIComponent(invitationId)}`);
  if (!res.ok) {
    return { success: false, is_paid: false };
  }
  return res.json();
}

export async function fetchInvitations(userId?: string): Promise<{
  success: boolean;
  invitations: import("@/types/db").DbInvitation[];
}> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const res = await fetch(`/api/invitations${query}`);
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
  return res.json();
}
