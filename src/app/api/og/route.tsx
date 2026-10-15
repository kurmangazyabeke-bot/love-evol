import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Пойдешь со мной на свидание? 💖";
    const subtitle =
      searchParams.get("subtitle") ||
      "Я приготовил для нас особенный вечер и очень жду твоего ответа...";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #ffedd5 100%)",
            padding: "60px 80px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Decorative heart watermark background */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              fontSize: "260px",
              opacity: 0.12,
            }}
          >
            💖
          </div>

          {/* Top Brand Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255, 255, 255, 0.85)",
              padding: "12px 28px",
              borderRadius: "50px",
              border: "1.5px solid rgba(244, 63, 94, 0.3)",
              boxShadow: "0 4px 15px rgba(244, 63, 94, 0.08)",
            }}
          >
            <span style={{ fontSize: "28px" }}>✨</span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#e11d48",
                letterSpacing: "-0.5px",
              }}
            >
              LoveEvol
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#9f1239",
                background: "#ffe4e6",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              Личное приглашение
            </span>
          </div>

          {/* Center Main Message Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: "960px",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.15,
                letterSpacing: "-1.5px",
                marginBottom: "24px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 500,
                color: "#475569",
                lineHeight: 1.35,
                maxWidth: "800px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: "24px",
              borderTop: "1.5px solid rgba(244, 63, 94, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "22px",
                fontWeight: 700,
                color: "#e11d48",
              }}
            >
              <span>💌</span>
              <span>Нажми на ссылку, чтобы ответить «ДА»</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "20px",
                color: "#64748b",
              }}
            >
              <span>Интерактивная открытка</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG generation error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
