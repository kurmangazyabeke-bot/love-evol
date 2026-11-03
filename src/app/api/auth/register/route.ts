import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pgGetUserByEmail, pgCreateUser, pgClaimGuestInvitations } from "@/lib/db";
import { hashPassword, createSession, AUTH_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const guestInvitationIds = Array.isArray(body.guestInvitationIds)
      ? body.guestInvitationIds.filter((id: unknown) => typeof id === "string" && id.length > 0)
      : [];

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Пожалуйста, введите корректный адрес электронной почты" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Пароль должен содержать не менее 6 символов" },
        { status: 400 }
      );
    }

    const existingUser = await pgGetUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите." },
        { status: 409 }
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    const user = await pgCreateUser({
      id: userId,
      email,
      passwordHash,
      name: name || email.split("@")[0],
    });

    // Link any guest invitations created before registration to this new account
    if (guestInvitationIds.length > 0) {
      try {
        await pgClaimGuestInvitations(user.id, guestInvitationIds);
      } catch (err) {
        console.warn("Failed linking guest invitations during register:", err);
      }
    }

    const session = await createSession(user.id);

    const response = NextResponse.json(
      {
        success: true,
        user,
        message: "Регистрация успешно завершена! Добро пожаловать в LoveEvol.",
      },
      { status: 201 }
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
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при регистрации" },
      { status: 500 }
    );
  }
}
