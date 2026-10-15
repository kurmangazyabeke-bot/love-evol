export interface TemplateContext {
  date?: string;
  time?: string;
  activity?: string;
  location?: string;
}

export function formatTemplate(template: string, context: TemplateContext): string {
  if (!template) return "";

  let formattedDate = context.date || "в назначенный день";
  if (context.date && /^\d{4}-\d{2}-\d{2}$/.test(context.date)) {
    try {
      const d = new Date(context.date);
      formattedDate = d.toLocaleDateString("ru-RU", {
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

  return template
    .replace(/\{date\}/g, formattedDate)
    .replace(/\{time\}/g, formattedTime)
    .replace(/\{activity\}/g, formattedActivity)
    .replace(/\{location\}/g, formattedLocation);
}
