import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const chatId = body.chatId ? String(body.chatId).trim() : "";
    const botToken = (body.botToken ? String(body.botToken).trim() : "") || process.env.TELEGRAM_BOT_TOKEN || "";

    if (!chatId) {
      return NextResponse.json(
        {
          success: false,
          message: "Укажите ваш Telegram Chat ID. Узнать его можно за 2 секунды у @userinfobot в Telegram.",
        },
        { status: 400 }
      );
    }

    if (!botToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Не указан токен бота. Введите токен от @BotFather (или настройте системный токен в переменных).",
        },
        { status: 400 }
      );
    }

    const testMessage = `🎉 *LoveEvol — Тестовое оповещение!* 💖\n\nСвязь настроена успешно! Вы получите мгновенное уведомление в этот диалог, как только ваша половинка нажмет кнопку «Да»! ✨\n\n⏱️ Время проверки: ${new Date().toLocaleTimeString("ru-RU")}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: "Markdown",
      }),
    });

    const tgData = await tgRes.json().catch(() => ({}));

    if (tgRes.ok && tgData.ok) {
      return NextResponse.json({
        success: true,
        message: "✅ Тестовое сообщение доставлено в Telegram! Проверьте мессенджер.",
      });
    }

    const desc = tgData.description || "Неизвестная ошибка Telegram API";
    if (desc.includes("chat not found") || desc.includes("bot can't initiate") || desc.includes("blocked")) {
      return NextResponse.json(
        {
          success: false,
          message: `⚠️ Бот не может написать первым! Откройте диалог с ботом в Telegram, нажмите кнопку «Начать» (/start), а затем повторите проверку.`,
        },
        { status: 400 }
      );
    }

    if (desc.includes("Unauthorized") || desc.includes("token")) {
      return NextResponse.json(
        {
          success: false,
          message: `❌ Неверный токен бота (Bot Token). Проверьте правильность токена от @BotFather.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Ошибка Telegram: ${desc}`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Telegram test error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при отправке тестового сообщения" },
      { status: 500 }
    );
  }
}
