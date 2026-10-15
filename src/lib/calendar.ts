// Helpers for generating calendar events (Google Calendar & .ics download)

export interface CalendarEventData {
  title: string;
  description: string;
  location?: string;
  dateStr: string; // "YYYY-MM-DD"
  timeStr: string; // "HH:MM"
  durationMinutes?: number;
}

function parseDateTime(dateStr: string, timeStr: string): { start: Date; end: Date } {
  let [year, month, day] = [2026, 7, 26];
  if (dateStr && dateStr.includes("-")) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
  }

  let [hours, minutes] = [19, 0];
  if (timeStr && timeStr.includes(":")) {
    const parts = timeStr.split(":").map(Number);
    if (parts.length >= 2) {
      hours = parts[0];
      minutes = parts[1];
    }
  }

  const start = new Date(year, month - 1, day, hours, minutes);
  const end = new Date(start.getTime() + 120 * 60 * 1000); // 2 hours default duration

  return { start, end };
}

function formatIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

// 1. Google Calendar Web Link
export function getGoogleCalendarUrl(data: CalendarEventData): string {
  const { start, end } = parseDateTime(data.dateStr, data.timeStr);
  const startIso = formatIcsDate(start);
  const endIso = formatIcsDate(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: data.title || "Особенное свидание 💖",
    details: data.description || "Наше романтическое свидание!",
    location: data.location || "Уютное место",
    dates: `${startIso}/${endIso}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// 2. Download standard .ics file for Apple Calendar / Outlook / Android
export function downloadIcsFile(data: CalendarEventData) {
  const { start, end } = parseDateTime(data.dateStr, data.timeStr);
  const startIso = formatIcsDate(start);
  const endIso = formatIcsDate(end);
  const nowIso = formatIcsDate(new Date());

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LoveEvol//Romantic Invitation//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:invite-${Date.now()}@loveevol.app`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${(data.title || "Особенное свидание 💖").replace(/,/g, "\\,")}`,
    `DESCRIPTION:${(data.description || "Наше романтическое свидание!").replace(/\n/g, "\\n").replace(/,/g, "\\,")}`,
    `LOCATION:${(data.location || "Уютное место").replace(/,/g, "\\,")}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "DESCRIPTION:Напоминание о свидании через 2 часа! 🌹",
    "ACTION:DISPLAY",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "date-invitation.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
