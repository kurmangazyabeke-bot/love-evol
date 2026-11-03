"use client";

import React, { useState } from "react";
import { Download, MapPin, Navigation, Ticket, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePassTicketProps {
  inviteId?: string;
  recipientName?: string;
  senderName?: string;
  dateDisplay: string;
  timeDisplay: string;
  location?: string;
  mapLink?: string;
  activitiesSummary: string;
  isDark?: boolean;
}

export function DatePassTicket({
  inviteId = "LOVE-2026",
  recipientName,
  senderName,
  dateDisplay,
  timeDisplay,
  location,
  mapLink,
  activitiesSummary,
  isDark = false,
}: DatePassTicketProps) {
  const [downloaded, setDownloaded] = useState(false);

  const ticketCode = `LV-${inviteId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "VIP777"}`;
  const cleanLocation = location?.trim() || "Особенное место встречи";

  const resolvedMapUrl =
    mapLink && mapLink.trim().startsWith("http")
      ? mapLink.trim()
      : `https://2gis.kz/search/${encodeURIComponent(cleanLocation)}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanLocation)}`;

  const handleDownloadTicketPng = () => {
    try {
      const canvas = document.createElement("canvas");
      const w = 1080;
      const h = 1350;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ambient gradient background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#fff1f2");
      bg.addColorStop(0.5, "#ffe4e6");
      bg.addColorStop(1, "#fef3c7");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Decorative soft circles
      ctx.fillStyle = "rgba(244, 63, 94, 0.10)";
      ctx.beginPath();
      ctx.arc(920, 180, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(160, 1180, 240, 0, Math.PI * 2);
      ctx.fill();

      // Main Ticket Card
      const tx = 90;
      const ty = 130;
      const tw = 900;
      const th = 1090;
      const r = 48;

      ctx.save();
      ctx.shadowColor = "rgba(225, 29, 72, 0.16)";
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, r);
      ctx.fill();
      ctx.restore();

      // Top Header Banner inside Ticket
      const headGrad = ctx.createLinearGradient(tx, ty, tx + tw, ty + 220);
      headGrad.addColorStop(0, "#f43f5e");
      headGrad.addColorStop(0.6, "#ec4899");
      headGrad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 220, [r, r, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("✨ LOVEEVOL • OFFICIAL VIP PASS", tx + 56, ty + 82);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.fillText("БИЛЕТ НА СВИДАНИЕ 💖", tx + 56, ty + 162);

      // Fields helper
      const drawField = (label: string, value: string, x: number, y: number, maxW: number) => {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(label.toUpperCase(), x, y);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 36px sans-serif";
        const trimmed = value.length > 38 ? `${value.slice(0, 36)}…` : value;
        ctx.fillText(trimmed, x, y + 48, maxW);
      };

      const startY = ty + 310;
      drawField("Для кого", recipientName || "Самой прекрасной половинки ❤️", tx + 56, startY, 380);
      drawField("От кого", senderName || "С любовью и нежностью ✨", tx + 480, startY, 360);

      drawField("Дата встречи", dateDisplay || "По договоренности", tx + 56, startY + 150, 380);
      drawField("Время", timeDisplay || "19:00", tx + 480, startY + 150, 360);

      drawField("Локация", cleanLocation, tx + 56, startY + 300, 780);
      drawField("Программа вечера", activitiesSummary || "Особенный романтический вечер", tx + 56, startY + 450, 780);

      // Perforation dashed line
      const perfY = ty + 880;
      ctx.setLineDash([16, 14]);
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx + 40, perfY);
      ctx.lineTo(tx + tw - 40, perfY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perforation cutouts
      ctx.fillStyle = "#ffe4e6";
      ctx.beginPath();
      ctx.arc(tx, perfY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + tw, perfY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Bottom stub
      ctx.fillStyle = "#e11d48";
      ctx.font = "900 34px monospace";
      ctx.fillText(`КОД БИЛЕТА: ${ticketCode}`, tx + 56, perfY + 95);

      ctx.fillStyle = "#64748b";
      ctx.font = "600 24px sans-serif";
      ctx.fillText("Статус: ПОДТВЕРЖДЕНО • Вход строго с улыбкой 🥰", tx + 56, perfY + 145);

      const link = document.createElement("a");
      link.download = `date-ticket-${ticketCode.toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      console.error("Failed generating ticket PNG:", e);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl overflow-hidden border shadow-sm text-left",
        isDark
          ? "bg-slate-900/90 border-white/15 text-white"
          : "bg-white border-rose-200/90 text-slate-900"
      )}
    >
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Ticket className="w-4 h-4" />
          <span className="text-xs font-extrabold tracking-wide uppercase">
            Билет на свидание
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
          {ticketCode}
        </span>
      </div>

      {/* Ticket Body */}
      <div className="p-3.5 space-y-3">
        {(recipientName || senderName) && (
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-dashed border-rose-200/60">
            {recipientName && (
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Для кого
                </span>
                <span className="text-xs font-bold text-rose-500 truncate block">
                  {recipientName} 💖
                </span>
              </div>
            )}
            {senderName && (
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  От кого
                </span>
                <span
                  className={cn(
                    "text-xs font-bold truncate block",
                    isDark ? "text-slate-100" : "text-slate-800"
                  )}
                >
                  {senderName} ✨
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Дата
            </span>
            <span className="text-xs font-bold">{dateDisplay}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Время
            </span>
            <span className="text-xs font-bold">{timeDisplay}</span>
          </div>
        </div>

        {cleanLocation && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-snug">{cleanLocation}</div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <a
                href={resolvedMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors",
                  isDark
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/70"
                    : "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                )}
              >
                <Navigation className="w-2.5 h-2.5" />
                <span>Открыть в 2ГИС / Карте</span>
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors",
                  isDark
                    ? "bg-white/10 border-white/15 text-slate-200 hover:bg-white/15"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Google Maps</span>
              </a>
            </div>
          </div>
        )}

        {/* Perforated Stub Action: Download Ticket PNG */}
        <div className="pt-2.5 border-t border-dashed border-rose-200/70 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>На память или в Stories</span>
          </span>

          <button
            type="button"
            onClick={handleDownloadTicketPng}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95",
              downloaded
                ? "bg-emerald-600 text-white"
                : "bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
            )}
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Билет скачан!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Скачать билет PNG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
