import { NextRequest, NextResponse } from "next/server";
import { isVercelPostgresConfigured, pgSaveMediaAsset } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "invitations-media";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Файл не передан" },
        { status: 400 }
      );
    }

    const isAudio = file.type.startsWith("audio/") || file.type === "video/webm";
    const isImage = file.type.startsWith("image/");

    if (!isAudio && !isImage) {
      return NextResponse.json(
        { success: false, message: "Поддерживаются только изображения или аудиофайлы" },
        { status: 400 }
      );
    }

    // Limit sizes: 8MB for images, 15MB for audio
    const maxSize = isAudio ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `Размер файла превышает лимит (${isAudio ? "15MB" : "8MB"})`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || (isAudio ? "webm" : "jpg");
    const assetId = crypto.randomUUID();
    const uniqueFileName = `${Date.now()}-${assetId.slice(0, 8)}.${ext}`;
    const normalizedMime = file.type === "video/webm" ? "audio/webm" : file.type;

    // 1. Try Vercel Blob storage if token is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blobRes = await put(`uploads/${uniqueFileName}`, buffer, {
          access: "public",
          addRandomSuffix: false,
          contentType: normalizedMime,
        });

        if (blobRes?.url) {
          return NextResponse.json({
            success: true,
            url: blobRes.url,
            provider: "vercel-blob",
            fileName: file.name,
            size: file.size,
            mimeType: normalizedMime,
          });
        }
      } catch (blobErr) {
        console.warn("Vercel Blob upload skipped, using Vercel Postgres media store:", blobErr);
      }
    }

    // 2. Store permanently in Vercel Postgres (media_assets table) -> clean /api/media/[id] URL
    if (isVercelPostgresConfigured()) {
      try {
        const base64Data = buffer.toString("base64");
        await pgSaveMediaAsset({
          id: assetId,
          mimeType: normalizedMime,
          fileName: file.name,
          sizeBytes: file.size,
          base64Data,
        });

        return NextResponse.json({
          success: true,
          url: `/api/media/${assetId}`,
          provider: "vercel-postgres",
          fileName: file.name,
          size: file.size,
          mimeType: normalizedMime,
        });
      } catch (pgErr) {
        console.warn("Vercel Postgres media upload error, checking fallbacks:", pgErr);
      }
    }

    // 3. Optional Supabase Storage if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/${bucket}/${uniqueFileName}`,
          {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": normalizedMime,
              "x-upsert": "true",
            },
            body: buffer,
          }
        );

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueFileName}`;
          return NextResponse.json({
            success: true,
            url: publicUrl,
            provider: "supabase",
            fileName: file.name,
            size: file.size,
            mimeType: normalizedMime,
          });
        }
      } catch {}
    }

    // 4. Local offline fallback: Data URL
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${normalizedMime};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      provider: "data-url",
      fileName: file.name,
      size: file.size,
      mimeType: normalizedMime,
    });
  } catch (error) {
    console.error("Storage upload handler error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при загрузке файла" },
      { status: 500 }
    );
  }
}
