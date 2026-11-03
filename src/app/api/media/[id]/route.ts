import { NextRequest, NextResponse } from "next/server";
import { pgGetMediaAsset, isVercelPostgresConfigured } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse("Missing media ID", { status: 400 });
    }

    if (!isVercelPostgresConfigured()) {
      return new NextResponse("Database not configured", { status: 404 });
    }

    const asset = await pgGetMediaAsset(id);
    if (!asset) {
      return new NextResponse("Media not found", { status: 404 });
    }

    const buffer = Buffer.from(asset.base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving media asset:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
