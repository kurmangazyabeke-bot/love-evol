import { NextRequest, NextResponse } from "next/server";
import {
  upsertInvitation,
  getInvitationById,
  updateGuestAnswers,
  recordInvitationView,
  listInvitations,
  deleteInvitation,
} from "@/lib/supabase";
import { isVercelPostgresConfigured } from "@/lib/db";
import { getAuthUserFromRequest } from "@/lib/auth";
import { SaveDraftRequest, SaveDraftResponse } from "@/types/db";

async function sendTelegramAlert(params: {
  botToken?: string;
  chatId?: string;
  text: string;
}) {
  const token = (params.botToken || process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = (params.chatId || "").trim();
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: params.text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.warn("Telegram notification failed (non-blocking):", err);
  }
}

// POST /api/invitations - Save or update invitation in Vercel Postgres
export async function POST(req: NextRequest) {
  try {
    const body: SaveDraftRequest = await req.json();

    if (!body.config || typeof body.config !== "object") {
      return NextResponse.json(
        { success: false, message: "Поле config обязательно для сохранения приглашения" },
        { status: 400 }
      );
    }

    // Sanitize custom slug / id if provided
    const cleanId = body.id
      ? body.id
          .trim()
          .replace(/[^a-zA-Z0-9_-]/g, "-")
          .slice(0, 64)
      : undefined;

    // Check if user is authenticated via session cookie
    const authUser = await getAuthUserFromRequest(req);
    const effectiveUserId = authUser?.id || body.userId || null;

    const invitation = await upsertInvitation({
      id: cleanId || undefined,
      user_id: effectiveUserId,
      config: body.config,
      is_paid: true,
    });

    const responseData: SaveDraftResponse = {
      success: true,
      invitation,
      shareUrl: `/invite/${invitation.id}`,
      storageProvider: isVercelPostgresConfigured() ? "vercel-postgres" : "fallback",
      message: "Приглашение сохранено в базе данных Vercel",
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error saving invitation:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при сохранении" },
      { status: 500 }
    );
  }
}

// GET /api/invitations - Get invitation by ID or list user's invitations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const trackView = searchParams.get("trackView") === "1";
    const userId = searchParams.get("userId") || searchParams.get("user_id");
    const idsParam = searchParams.get("ids");
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (id) {
      let invitation = await getInvitationById(id);

      if (!invitation) {
        return NextResponse.json(
          { success: false, message: "Приглашение не найдено" },
          { status: 404 }
        );
      }

      if (trackView) {
        const wasNeverOpened = (invitation.views_count || 0) === 0;
        const updated = await recordInvitationView(id);
        if (updated) {
          invitation = updated;
        }

        if (wasNeverOpened) {
          const config = (invitation.config || {}) as Record<string, unknown>;
          const general = (config.general || {}) as Record<string, string>;
          const tg = (config.telegramNotification || {}) as Record<string, unknown>;
          if (tg.enabled && tg.notifyOnOpen !== false && tg.chatId) {
            const host = req.headers.get("host") || "love-evol.vercel.app";
            const proto = host.includes("localhost") ? "http" : "https";
            const inviteUrl = `${proto}://${host}/invite/${id}`;
            const who = general.recipientName ? ` (${general.recipientName})` : "";
            await sendTelegramAlert({
              botToken: tg.botToken as string,
              chatId: tg.chatId as string,
              text: `👀 *ОТКРЫТКА ПРОСМОТРЕНА!* ✨\n\nПолучатель${who} только что открыл твое приглашение «${general.title || "Свидание"}»!\nДержим кулачки и ждем заветное «ДА»... 🤞💖\n\n🔗 [Ссылка на открытку](${inviteUrl})`,
            });
          }
        }
      }

      return NextResponse.json({ success: true, invitation }, { status: 200 });
    }

    // Check authenticated user
    const authUser = await getAuthUserFromRequest(req);
    const effectiveUserId = authUser?.id || userId || undefined;

    // Privacy-safe listing: if neither effectiveUserId nor ids was supplied, return empty list
    if (!effectiveUserId && (!ids || ids.length === 0)) {
      return NextResponse.json({ success: true, invitations: [] }, { status: 200 });
    }

    const invitations = await listInvitations(effectiveUserId, ids);
    return NextResponse.json(
      {
        success: true,
        invitations,
        storageProvider: isVercelPostgresConfigured() ? "vercel-postgres" : "fallback",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations?id=... - Delete invitation
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Параметр id обязателен для удаления" },
        { status: 400 }
      );
    }

    const deleted = await deleteInvitation(id);
    return NextResponse.json(
      {
        success: deleted,
        message: deleted ? "Приглашение удалено" : "Не удалось найти или удалить приглашение",
      },
      { status: deleted ? 200 : 404 }
    );
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при удалении" },
      { status: 500 }
    );
  }
}

// PATCH / PUT /api/invitations - Update guest answers, reactions, coupons, and status
async function handleAnswersUpdate(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = body.id || searchParams.get("id");
    const answers = body.answers || body.guest_answers || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Параметр id обязателен для сохранения ответов гостя" },
        { status: 400 }
      );
    }

    // If only recording a view event via PATCH
    if (answers.stage === "view_only") {
      const viewed = await recordInvitationView(id);
      return NextResponse.json({ success: true, invitation: viewed }, { status: 200 });
    }

    const invitation = await updateGuestAnswers(id, answers, "accepted");

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Приглашение не найдено" },
        { status: 404 }
      );
    }

    // Optional Telegram notification to creator
    const config = (invitation.config || {}) as Record<string, unknown>;
    const general = (config.general || {}) as Record<string, string>;
    const tg = (config.telegramNotification || {}) as Record<string, unknown>;

    if (tg.enabled && tg.chatId) {
      const host = req.headers.get("host") || "love-evol.vercel.app";
      const proto = host.includes("localhost") ? "http" : "https";
      const inviteUrl = `${proto}://${host}/invite/${id}`;
      const dashboardUrl = `${proto}://${host}/dashboard`;
      const who = general.recipientName ? ` (${general.recipientName})` : "";

      let text = "";
      if (answers.stage === "initial_yes") {
        const tries = Number(answers.noAttemptsCount || 0);
        const triesLine =
          tries > 0 ? `\n🤭 Попыток нажать «Нет» до сдачи: *${tries}*` : "";
        text = `🎉 *УРА! СКАЗАЛА «ДА»!* 💖\n\nПолучатель${who} только что принял твое приглашение! 🥂✨${triesLine}\nСейчас выбирает активности и время встречи...\n\n💌 [Посмотреть в кабинете](${dashboardUrl})`;
      } else if (answers.stage === "guest_note" && answers.guestNote) {
        text = `💌 *НОВАЯ ЗАПИСКА ОТ ПОЛОВИНКИ!* 🥰\n\n💬 *"${answers.guestNote}"*\n${answers.guestReactionEmoji ? `Реакция: ${answers.guestReactionEmoji}\n` : ""}\n🔗 [Открыть кабинет LoveEvol](${dashboardUrl})`;
      } else if (answers.stage === "coupon_claim" && Array.isArray(answers.claimedCoupons)) {
        text = `🎟️ *АКТИВИРОВАНЫ КУПОНЫ ЛЮБВИ!* ✨\n\nВыбраны купоны:\n• ${answers.claimedCoupons.join("\n• ")}\n\n🔗 [Посмотреть все ответы](${dashboardUrl})`;
      } else {
        const actList =
          Array.isArray(answers.selectedActivities) && answers.selectedActivities.length > 0
            ? answers.selectedActivities.join(", ")
            : "Особенный вечер";
        const customIdea = answers.customActivityIdea
          ? `\n💡 *Своя идея гостя:* ${answers.customActivityIdea}`
          : "";
        const dateText = answers.chosenDate
          ? `${answers.chosenDate} в ${answers.chosenTime || "удобное время"}`
          : "По договоренности";
        const couponsLine =
          Array.isArray(answers.claimedCoupons) && answers.claimedCoupons.length > 0
            ? `\n🎟️ *Купоны:* ${answers.claimedCoupons.join(", ")}`
            : "";
        const note = answers.guestNote ? `\n💬 *Записка:* "${answers.guestNote}"` : "";

        text = `✨ *ПЛАН СВИДАНИЯ ПОДТВЕРЖДЕН!* 💖\n\n📅 *Когда:* ${dateText}\n🥂 *План:* ${actList}${customIdea}${couponsLine}${note}\n\n💌 [Открыть приглашение](${inviteUrl})`;
      }

      await sendTelegramAlert({
        botToken: tg.botToken as string,
        chatId: tg.chatId as string,
        text,
      });
    }

    return NextResponse.json(
      {
        success: true,
        invitation,
        guest_answers: invitation.guest_answers,
        message: "Ответы гостя сохранены в базе данных!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating guest answers:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при сохранении ответов" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return handleAnswersUpdate(req);
}

export async function PUT(req: NextRequest) {
  return handleAnswersUpdate(req);
}
