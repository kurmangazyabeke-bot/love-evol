import { NextRequest, NextResponse } from "next/server";
import { getInvitationById, markInvitationAsPaid } from "@/lib/supabase";

// POST /api/checkout - Free platform instant unlock
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { invitationId } = body;

    if (!invitationId) {
      return NextResponse.json(
        { success: false, message: "ID приглашения обязателен" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Приглашение не найдено в базе данных" },
        { status: 404 }
      );
    }

    // 100% Free platform - instant unlock without cards
    await markInvitationAsPaid(invitationId);

    return NextResponse.json({
      success: true,
      free: true,
      is_paid: true,
      invitationId,
      shareUrl: `/invite/${invitationId}`,
      message: "Платформа полностью бесплатна! Приглашение активно.",
    });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// GET /api/checkout?invitationId=... - Check payment/active status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { success: false, message: "Параметр invitationId обязателен" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Приглашение не найдено" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      is_paid: true, // Always free and active
      status: invitation.status,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Ошибка проверки статуса" },
      { status: 500 }
    );
  }
}
