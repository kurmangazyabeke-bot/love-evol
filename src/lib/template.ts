export interface TemplateContext {
  date?: string;
  time?: string;
  activity?: string;
  location?: string;
  recipient?: string;
  sender?: string;
}

export function formatTemplate(template: string, context: TemplateContext): string {
  if (!template) return "";

  let formattedDate = context.date || "в назначенный день";
  if (context.date && /^\d{4}-\d{2}-\d{2}$/.test(context.date)) {
    try {
      const [y, m, d] = context.date.split("-").map(Number);
      const dateObj = new Date(y, (m || 1) - 1, d || 1);
      formattedDate = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      });
    } catch {
      formattedDate = context.date;
    }
  }

  const formattedTime = context.time || "в условленное время";
  const formattedActivity = context.activity || "наш совместный план";
  const formattedLocation = context.location || "уютное место";
  const formattedRecipient = context.recipient || "любимая";
  const formattedSender = context.sender || "твой человек";

  return template
    .replace(/\{date\}/g, formattedDate)
    .replace(/\{time\}/g, formattedTime)
    .replace(/\{activity\}/g, formattedActivity)
    .replace(/\{location\}/g, formattedLocation)
    .replace(/\{name\}/g, formattedRecipient)
    .replace(/\{recipient\}/g, formattedRecipient)
    .replace(/\{sender\}/g, formattedSender);
}
