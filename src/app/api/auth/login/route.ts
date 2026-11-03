import { NextRequest, NextResponse } from "next/server";
import { pgGetUserByEmail, pgClaimGuestInvitations } from "@/lib/db";
import { verifyPassword, createSession, AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const guestInvitationIds = Array.isArray(body.guestInvitationIds)
      ? body.guestInvitationIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : [];

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Пожалуйста, укажите email и пароль" },
        { status: 400 }
      );
    }

    const user = await pgGetUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Link any guest invitations created before login
    if (guestInvitationIds.length > 0) {
      try {
        await pgClaimGuestInvitations(user.id, guestInvitationIds);
      } catch (err) {
        console.warn("Failed linking guest invitations during login:", err);
      }
    }

    const session = await createSession(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
        message: "Успешный вход в личный кабинет",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при входе" },
      { status: 500 }
    );
  }
}
