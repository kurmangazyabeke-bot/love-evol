import { VibeType, OpeningAnimationType } from "@/types/invite";

export type VibeCategory = "pastel" | "light" | "romantic" | "dark" | "custom";

export interface VibeConfig {
  id: VibeType;
  name: string;
  category: VibeCategory;
  subtitle: string;
  bgGradient: string; // Tailwind gradient classes
  cssGradient: string; // Direct bulletproof CSS gradient
  accentHex: string;
  tagClass: string;
  isDark: boolean; // True when background is dark, requires light text & borders
}

export function isColorDark(hexColor?: string): boolean {
  if (!hexColor || !hexColor.startsWith("#")) return false;
  const hex = hexColor.replace("#", "");
  const fullHex = hex.length === 3
    ? hex.split("").map((c) => c + c).join("")
    : hex;
  const r = parseInt(fullHex.substring(0, 2), 16) || 0;
  const g = parseInt(fullHex.substring(2, 4), 16) || 0;
  const b = parseInt(fullHex.substring(4, 6), 16) || 0;
  // Perceived brightness formula (ITU-R BT.709)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 130;
}

export const VIBES: VibeConfig[] = [
  // 1. ПАСТЕЛЬНЫЕ ШАБЛОНЫ
  {
    id: "sunset-blush",
    name: "Розовый Закат",
    category: "pastel",
    subtitle: "Теплый персик, коралл и нежное золото",
    bgGradient: "from-rose-200 via-orange-100 to-amber-200",
    cssGradient: "linear-gradient(135deg, #fecdd3 0%, #fed7aa 50%, #fef08a 100%)",
    accentHex: "#f43f5e",
    tagClass: "bg-rose-100 text-rose-700 border-rose-200",
    isDark: false,
  },
  {
    id: "rose-petal",
    name: "Нежный Лепесток",
    category: "pastel",
    subtitle: "Пудровая роза, пион и шелковая дымка",
    bgGradient: "from-pink-200 via-rose-100 to-purple-200",
    cssGradient: "linear-gradient(135deg, #fbcfe8 0%, #fecdd3 50%, #e9d5ff 100%)",
    accentHex: "#ec4899",
    tagClass: "bg-pink-100 text-pink-700 border-pink-200",
    isDark: false,
  },
  {
    id: "sweet-peach",
    name: "Персиковый Крем",
    category: "pastel",
    subtitle: "Сочный персик, ваниль и утреннее солнце",
    bgGradient: "from-orange-200 via-amber-100 to-rose-200",
    cssGradient: "linear-gradient(135deg, #fdba74 0%, #fed7aa 50%, #fecdd3 100%)",
    accentHex: "#f97316",
    tagClass: "bg-orange-100 text-orange-700 border-orange-200",
    isDark: false,
  },
  {
    id: "lavender-dream",
    name: "Лавандовая Мечта",
    category: "pastel",
    subtitle: "Французская лаванда, сирень и мята",
    bgGradient: "from-purple-200 via-indigo-100 to-pink-200",
    cssGradient: "linear-gradient(135deg, #d8b4fe 0%, #c7d2fe 50%, #fbcfe8 100%)",
    accentHex: "#a855f7",
    tagClass: "bg-purple-100 text-purple-700 border-purple-200",
    isDark: false,
  },
  {
    id: "cotton-candy",
    name: "Сладкая Вата",
    category: "pastel",
    subtitle: "Зефирный микс небесного и розового",
    bgGradient: "from-sky-200 via-slate-100 to-pink-200",
    cssGradient: "linear-gradient(135deg, #7dd3fc 0%, #e0f2fe 50%, #f9a8d4 100%)",
    accentHex: "#0284c7",
    tagClass: "bg-sky-100 text-sky-700 border-sky-200",
    isDark: false,
  },

  // 2. СВЕТЛАЯ ЭЛЕГАНТНОСТЬ
  {
    id: "pure-silk",
    name: "Белый Шелк",
    category: "light",
    subtitle: "Минималистичный чистый светлый фон с мягким кремовым отливом",
    bgGradient: "from-slate-100 via-white to-rose-100",
    cssGradient: "linear-gradient(135deg, #f1f5f9 0%, #ffffff 50%, #ffe4e6 100%)",
    accentHex: "#e11d48",
    tagClass: "bg-white text-slate-800 border-slate-200 shadow-2xs",
    isDark: false,
  },
  {
    id: "golden-champagne",
    name: "Золотое Шампанское",
    category: "light",
    subtitle: "Изысканный янтарь, крем и сияние свечей",
    bgGradient: "from-amber-200 via-yellow-100 to-orange-200",
    cssGradient: "linear-gradient(135deg, #fef08a 0%, #fde047 50%, #fdba74 100%)",
    accentHex: "#d97706",
    tagClass: "bg-amber-100 text-amber-800 border-amber-200",
    isDark: false,
  },
  {
    id: "french-vanilla",
    name: "Французская Ваниль",
    category: "light",
    subtitle: "Теплый бежевый, карамель и молочная пенка",
    bgGradient: "from-amber-100 via-stone-100 to-orange-100",
    cssGradient: "linear-gradient(135deg, #fef9c3 0%, #fef08a 50%, #fed7aa 100%)",
    accentHex: "#b45309",
    tagClass: "bg-amber-50 text-amber-900 border-amber-200",
    isDark: false,
  },
  {
    id: "pearly-cloud",
    name: "Жемчужное Облако",
    category: "light",
    subtitle: "Нежнейший перламутровый градиент и хрусталь",
    bgGradient: "from-zinc-100 via-rose-100 to-sky-100",
    cssGradient: "linear-gradient(135deg, #e2e8f0 0%, #fce7f3 50%, #e0f2fe 100%)",
    accentHex: "#64748b",
    tagClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    isDark: false,
  },

  // 3. РОМАНТИЧЕСКИЕ ГРАДИЕНТЫ
  {
    id: "cherry-blossom",
    name: "Цветущая Сакура",
    category: "romantic",
    subtitle: "Яркий цвет сакуры и малиновые лепестки",
    bgGradient: "from-rose-300 via-pink-200 to-red-200",
    cssGradient: "linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #fda4af 100%)",
    accentHex: "#f43f5e",
    tagClass: "bg-rose-200/80 text-rose-800 border-rose-300",
    isDark: false,
  },
  {
    id: "ruby-sunset",
    name: "Алый Закат",
    category: "romantic",
    subtitle: "Теплые кораллово-красные переливы страсти",
    bgGradient: "from-rose-300 via-red-200 to-amber-200",
    cssGradient: "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #fbbf24 100%)",
    accentHex: "#e11d48",
    tagClass: "bg-red-100 text-red-700 border-red-200",
    isDark: false,
  },
  {
    id: "strawberry-mochi",
    name: "Клубничный Моти",
    category: "romantic",
    subtitle: "Клубника со сливками и сладкий десерт",
    bgGradient: "from-pink-300 via-rose-200 to-pink-100",
    cssGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fbcfe8 100%)",
    accentHex: "#db2777",
    tagClass: "bg-pink-100 text-pink-800 border-pink-200",
    isDark: false,
  },
  {
    id: "aurora-love",
    name: "Северное Сияние",
    category: "romantic",
    subtitle: "Лавандовая сказка с бирюзовыми искрами",
    bgGradient: "from-indigo-200 via-purple-200 to-teal-200",
    cssGradient: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #2dd4bf 100%)",
    accentHex: "#8b5cf6",
    tagClass: "bg-purple-100 text-purple-700 border-purple-200",
    isDark: false,
  },

  // 4. НОЧНЫЕ & ТЕМНЫЕ ШАБЛОНЫ (DARK MODE)
  {
    id: "midnight-romance",
    name: "Ночная Романтика",
    category: "dark",
    subtitle: "Глубокий индиго, бархат и звездный блеск",
    bgGradient: "from-slate-900 via-purple-950 to-slate-900",
    cssGradient: "linear-gradient(180deg, #090d16 0%, #2e1065 50%, #090d16 100%)",
    accentHex: "#a855f7",
    tagClass: "bg-purple-900/60 text-purple-200 border-purple-700/60",
    isDark: true,
  },
  {
    id: "starry-night",
    name: "Звездное Небо",
    category: "dark",
    subtitle: "Полуночный сапфир и мерцание далеких звезд",
    bgGradient: "from-slate-950 via-blue-950 to-indigo-950",
    cssGradient: "linear-gradient(180deg, #020617 0%, #1e3a8a 50%, #172554 100%)",
    accentHex: "#38bdf8",
    tagClass: "bg-blue-900/60 text-blue-200 border-blue-700/60",
    isDark: true,
  },
  {
    id: "neon-passion",
    name: "Неоновый Аметист",
    category: "dark",
    subtitle: "Кибер-романтика с фиолетовым неоновым свечением",
    bgGradient: "from-purple-950 via-fuchsia-950 to-slate-950",
    cssGradient: "linear-gradient(180deg, #3b0764 0%, #86198f 50%, #030712 100%)",
    accentHex: "#e879f9",
    tagClass: "bg-fuchsia-900/60 text-fuchsia-200 border-fuchsia-700/60",
    isDark: true,
  },
  {
    id: "noir-velvet",
    name: "Бархатный Нуар",
    category: "dark",
    subtitle: "Глубокий темный графит с легким рубиновым отблеском",
    bgGradient: "from-neutral-950 via-rose-950 to-neutral-900",
    cssGradient: "linear-gradient(180deg, #0a0a0a 0%, #500724 50%, #0a0a0a 100%)",
    accentHex: "#fb7185",
    tagClass: "bg-rose-950/70 text-rose-200 border-rose-800/60",
    isDark: true,
  },

  // 5. КАСТОМНЫЙ ФОН
  {
    id: "custom",
    name: "Свой фон & Палитра",
    category: "custom",
    subtitle: "Выбери свой любимый цвет или градиент",
    bgGradient: "from-pink-200 via-rose-100 to-amber-200",
    cssGradient: "linear-gradient(135deg, #fecdd3 0%, #fef3c7 100%)",
    accentHex: "#f43f5e",
    tagClass: "bg-white text-slate-700 border-slate-300",
    isDark: false,
  },
];

export const CUSTOM_COLOR_PRESETS = [
  { name: "Нежно-розовый", hex: "#ffe4e6", isDark: false },
  { name: "Пудровый пион", hex: "#fce7f3", isDark: false },
  { name: "Персиковый мусс", hex: "#fed7aa", isDark: false },
  { name: "Теплый крем", hex: "#fef08a", isDark: false },
  { name: "Мятная нежность", hex: "#a7f3d0", isDark: false },
  { name: "Небесная лазурь", hex: "#bae6fd", isDark: false },
  { name: "Лавандовый шелк", hex: "#e9d5ff", isDark: false },
  { name: "Чистый снег", hex: "#ffffff", isDark: false },
  { name: "Глубокий индиго", hex: "#1e1b4b", isDark: true },
  { name: "Темный бархат", hex: "#0f172a", isDark: true },
  { name: "Сливовый нуар", hex: "#2e1065", isDark: true },
  { name: "Винный рубин", hex: "#4c0519", isDark: true },
];

export interface OpeningAnimationConfig {
  id: OpeningAnimationType;
  title: string;
  description: string;
  iconName: string;
  badge: string;
}

export const OPENING_ANIMATIONS: OpeningAnimationConfig[] = [
  {
    id: "ribbon",
    title: "Разрыв ленты",
    description: "Атласная лента с пышным бантом и разрезом ножницами",
    iconName: "Gift",
    badge: "Магия 🎀",
  },
  {
    id: "frosted-glass",
    title: "Запотевшее стекло",
    description: "Интерактивный туман — сотрите пар пальцем или курсором",
    iconName: "Sparkles",
    badge: "Canvas 🌫️",
  },
  {
    id: "envelope",
    title: "Конверт с письмом",
    description: "Классический любовный конверт с выезжающей карточкой",
    iconName: "Mail",
    badge: "Классика 💌",
  },
  {
    id: "wax-seal",
    title: "Сургучная печать",
    description: "Винтажная восковая печать с трещиной при нажатии",
    iconName: "ShieldAlert",
    badge: "Винтаж 🕯️",
  },
  {
    id: "none",
    title: "Без анимации",
    description: "Сразу показывать приглашение без ожидания открытия",
    iconName: "Eye",
    badge: "Быстро",
  },
];
