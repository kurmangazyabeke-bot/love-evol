import { NextResponse } from "next/server";
import { pgCheckHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await pgCheckHealth();
  return NextResponse.json({
    ok: health.connected,
    ...health,
    timestamp: new Date().toISOString(),
  });
}
