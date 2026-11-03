import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  pgCreateSession,
  pgGetSessionWithUser,
  pgDeleteSession,
} from "./db";
import { DbUser } from "@/types/db";

export const AUTH_COOKIE_NAME = "love_evol_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Hash password using crypto PBKDF2 (100,000 iterations, SHA-512)
 * Format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored "salt:hash"
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const checkHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(checkHash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Create a new DB-backed session token
 */
export async function createSession(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await pgCreateSession(token, userId, expiresAt);
  return { token, expiresAt };
}

/**
 * Get user by session token
 */
export async function getSessionUser(token?: string | null): Promise<DbUser | null> {
  if (!token) return null;
  const session = await pgGetSessionWithUser(token);
  return session ? session.user : null;
}

/**
 * Invalidate session token
 */
export async function destroySession(token?: string | null): Promise<void> {
  if (!token) return;
  await pgDeleteSession(token);
}

/**
 * Extract authenticated user from incoming HTTP request
 */
export async function getAuthUserFromRequest(
  req: NextRequest
): Promise<DbUser | null> {
  const token =
    req.cookies.get(AUTH_COOKIE_NAME)?.value ||
    req.headers.get("x-love-evol-session") ||
    null;
  return getSessionUser(token);
}
