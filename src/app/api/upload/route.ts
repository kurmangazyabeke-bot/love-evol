import { NextRequest, NextResponse } from "next/server";

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

    const isAudio = file.type.startsWith("audio/");
    const isImage = file.type.startsWith("image/");

    if (!isAudio && !isImage) {
      return NextResponse.json(
        { success: false, message: "Поддерживаются только изображения или аудиофайлы" },
        { status: 400 }
      );
    }

    // Limit sizes: 10MB for images, 20MB for audio
    const maxSize = isAudio ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `Размер файла превышает лимит (${isAudio ? "20MB" : "10MB"})` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || (isAudio ? "mp3" : "jpg");
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 1. If Supabase Storage keys are present in env, upload to Supabase Storage
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
              "Content-Type": file.type,
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
            fileName: file.name,
            size: file.size,
            mimeType: file.type,
          });
        }
      } catch (err) {
        console.warn("Supabase Storage upload error, falling back to data URL:", err);
      }
    }

    // 2. Upload to Vercel Blob storage
    try {
      const { put } = await import("@vercel/blob");
      const blobRes = await put(`uploads/${uniqueFileName}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      });

      if (blobRes?.url) {
        return NextResponse.json({
          success: true,
          url: blobRes.url,
          fileName: file.name,
          size: file.size,
          mimeType: file.type,
        });
      }
    } catch (blobErr) {
      console.warn("Vercel Blob upload fallback:", blobErr);
    }

    // 3. Fallback: Convert to Base64 Data URL so local development works smoothly without cloud keys
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Storage upload handler error:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера при загрузке файла" },
      { status: 500 }
    );
  }
}
