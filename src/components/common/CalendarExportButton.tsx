"use client";

import React, { useState } from "react";
import { Calendar, ChevronDown, Check, ExternalLink, Download } from "lucide-react";
import { CalendarEventData, getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar";
import { cn } from "@/lib/utils";

interface CalendarExportButtonProps {
  eventData: CalendarEventData;
  className?: string;
}

export function CalendarExportButton({ eventData, className }: CalendarExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadIcs = () => {
    downloadIcsFile(eventData);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer",
          "bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 hover:border-slate-300",
          className
        )}
      >
        <Calendar className="w-4 h-4 text-rose-500" />
        <span>Добавить в Календарь</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Выберите календарь:
          </div>

          {/* Google Calendar */}
          <a
            href={getGoogleCalendarUrl(eventData)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">Google Calendar</div>
              <div className="text-[10px] text-slate-400">Открыть в браузере</div>
            </div>
          </a>

          {/* Apple / Outlook .ics download */}
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-900">Apple / iPhone / Outlook</div>
              <div className="text-[10px] text-slate-400">Скачать файл встречи .ics</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
