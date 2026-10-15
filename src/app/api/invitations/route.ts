import { NextRequest, NextResponse } from "next/server";
import { upsertInvitation, getInvitationById, updateGuestAnswers, listInvitations, deleteInvitation } from "@/lib/supabase";
import { SaveDraftRequest, SaveDraftResponse } from "@/types/db";

// POST /api/invitations - Save or update draft invitation
export async function POST(req: NextRequest) {
  try {
    const body: SaveDraftRequest = await req.json();

    if (!body.config || typeof body.config !== "object") {
      return NextResponse.json(
        { success: false, message: "Поле config обязательно для сохранения черновика" },
        { status: 400 }
      );
    }

    const invitation = await upsertInvitation({
      id: body.id,
      user_id: body.userId || null,
      config: body.config,
      is_paid: body.isPaid,
    });

    const responseData: SaveDraftResponse = {
      success: true,
      invitation,
      shareUrl: `/invite/${invitation.id}`,
      message: "Черновик приглашения успешно сохранен",
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error saving draft invitation:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при сохранении" },
      { status: 500 }
    );
  }
}

// GET /api/invitations - Get invitation by ID or list all invitations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId") || searchParams.get("user_id");

    // If ID is provided, fetch single invitation
    if (id) {
      const invitation = await getInvitationById(id);

      if (!invitation) {
        return NextResponse.json(
          { success: false, message: "Приглашение не найдено" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, invitation }, { status: 200 });
    }

    // Otherwise, return list of invitations (filtered by user if provided)
    const invitations = await listInvitations(userId);
    return NextResponse.json({ success: true, invitations }, { status: 200 });
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
      { success: deleted, message: deleted ? "Приглашение удалено" : "Не удалось найти или удалить приглашение" },
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

// PATCH /api/invitations - Update guest answers and status
export async function PATCH(req: NextRequest) {
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

    const invitation = await updateGuestAnswers(id, answers);

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Приглашение не найдено" },
        { status: 404 }
      );
    }

    // Optional Telegram notification to creator
    try {
      const config = (invitation.config || {}) as Record<string, unknown>;
      const tg = (config.telegramNotification as Record<string, string | boolean>) || {};
      const botToken = (tg.botToken as string) || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = (tg.chatId as string)?.trim();

      if (tg.enabled && chatId && botToken) {
        const host = req.headers.get("host") || "love-evol.vercel.app";
        const proto = host.includes("localhost") ? "http" : "https";
        const inviteUrl = `${proto}://${host}/invite/${id}`;

        let text = "";
        if (answers.stage === "initial_yes") {
          text = `🎉 *ОНА СКАЗАЛА ДА!* 💖\n\nТвоя половинка только что открыла открытку и нажала «Да»! 🥂✨\nСейчас она выбирает план встречи...\n\n💌 [Открыть приглашение](${inviteUrl})`;
        } else {
          const actList = Array.isArray(answers.selectedActivities) && answers.selectedActivities.length > 0
            ? answers.selectedActivities.join(", ")
            : "Особенный вечер";
          const dateText = answers.chosenDate
            ? `${answers.chosenDate} в ${answers.chosenTime || "удобное время"}`
            : "На выбор";
          const note = answers.guestNote ? `\n💬 *Записка:* "${answers.guestNote}"` : "";

          text = `✨ *ПЛАН СВИДАНИЯ ПОДТВЕРЖДЕН!* 💖\n\n📅 *Дата:* ${dateText}\n✨ *План:* ${actList}${note}\n\n💌 [Открыть открытку](${inviteUrl})`;
        }

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
          }),
        }).catch((err) => console.warn("Telegram notification dispatch error:", err));
      }
    } catch (e) {
      console.warn("Telegram notification check failed:", e);
    }

    return NextResponse.json(
      {
        success: true,
        invitation,
        guest_answers: invitation.guest_answers,
        message: "Ответ гостя успешно сохранен в базе данных",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating guest answers:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при обновлении ответов гостя" },
      { status: 500 }
    );
  }
}

// PUT /api/invitations - Update guest answers and status (alias to PATCH)
export async function PUT(req: NextRequest) {
  return PATCH(req);
}

