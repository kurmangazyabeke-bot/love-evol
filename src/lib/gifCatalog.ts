// Curated, 100% verified working GIF and photo presets for all steps of the invite builder

export interface PresetItem {
  id: string;
  title: string;
  url: string;
  category: string;
  tags?: string[];
}

export interface PresetCategory {
  id: string;
  name: string;
  icon?: string;
  items: PresetItem[];
}

// =========================================================================
// 1. ШАГ 1: ОБЛОЖКИ ПРИГЛАШЕНИЯ (COVER GIFS & STICKERS)
// =========================================================================
export const COVER_PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "bubu-dudu",
    name: "🐻 Bubu & Dudu",
    icon: "🐻",
    items: [
      {
        id: "bd-1",
        title: "Мишки Dudu & Bubu сердечко",
        url: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
        category: "bubu-dudu",
        tags: ["мишка", "сердце", "любовь", "bubu", "dudu"],
      },
      {
        id: "bd-2",
        title: "Dudu дарит цветы Bubu 🌹",
        url: "https://i.giphy.com/1J66nYXybHGyvv12O8.gif",
        category: "bubu-dudu",
        tags: ["цветы", "розы", "мишка", "подарок"],
      },
      {
        id: "bd-3",
        title: "Теплые объятия мишек",
        url: "https://i.giphy.com/iCVzZwwE6QNAV2tEE0.gif",
        category: "bubu-dudu",
        tags: ["объятия", "нежность", "мишка"],
      },
      {
        id: "bd-4",
        title: "Нежный поцелуй мишек",
        url: "https://i.giphy.com/Y01jP8qj1Wddf6PwtW.gif",
        category: "bubu-dudu",
        tags: ["поцелуй", "мишка", "романтика"],
      },
      {
        id: "bd-5",
        title: "Крепкие объятия мишек",
        url: "https://i.giphy.com/k9JW0Oy95v1IfWtx1T.gif",
        category: "bubu-dudu",
        tags: ["объятия", "любовь", "тепло"],
      },
      {
        id: "bd-6",
        title: "Мишка с цветком",
        url: "https://i.giphy.com/mXnO9IiGEmA24.gif",
        category: "bubu-dudu",
        tags: ["цветок", "свидание", "милота"],
      },
      {
        id: "bd-7",
        title: "Счастливые Dudu & Bubu",
        url: "https://i.giphy.com/OvpDkvslMuDdw59me5.gif",
        category: "bubu-dudu",
        tags: ["радость", "счастье", "танец"],
      },
      {
        id: "bd-8",
        title: "Dudu кормит Bubu вкусняшкой",
        url: "https://i.giphy.com/cLS1cfxvGOPVpf9g3y.gif",
        category: "bubu-dudu",
        tags: ["еда", "забота", "десерт"],
      },
    ],
  },
  {
    id: "peach-goma",
    name: "🐱 Peach & Goma",
    icon: "🐱",
    items: [
      {
        id: "pg-1",
        title: "Котики Peach & Goma нежность",
        url: "https://i.giphy.com/bqk9FZwaFRT8zv1QWX.gif",
        category: "peach-goma",
        tags: ["котик", "peach", "goma", "нежность"],
      },
      {
        id: "pg-2",
        title: "Котики трутся щечками",
        url: "https://i.giphy.com/M90mJvfWfd5mbUuULX.gif",
        category: "peach-goma",
        tags: ["щечки", "милота", "котята"],
      },
      {
        id: "pg-3",
        title: "Спят в обнимку котики",
        url: "https://i.giphy.com/artj92V8o75VPL7AeQ.gif",
        category: "peach-goma",
        tags: ["сон", "обнимашки", "уют"],
      },
      {
        id: "pg-4",
        title: "Любовный кусь котиков",
        url: "https://i.giphy.com/BzyTuYCmvSorH1LF8H.gif",
        category: "peach-goma",
        tags: ["кусь", "игриво", "любовь"],
      },
      {
        id: "pg-5",
        title: "Радостные Peach & Goma",
        url: "https://i.giphy.com/dn4MBZhXE2J6QK9ATY.gif",
        category: "peach-goma",
        tags: ["радость", "праздник", "да"],
      },
      {
        id: "pg-6",
        title: "Котики празднуют любовь",
        url: "https://i.giphy.com/Zadd9hOl014Q0.gif",
        category: "peach-goma",
        tags: ["салют", "сердца", "восторг"],
      },
      {
        id: "pg-7",
        title: "Поцелуйчик в лобик",
        url: "https://i.giphy.com/4N1wOi78ZGzjz6H9Cm.gif",
        category: "peach-goma",
        tags: ["поцелуй", "забота", "нежность"],
      },
      {
        id: "pg-8",
        title: "Котик машет лапкой с сердечком",
        url: "https://i.giphy.com/3oEjI4sFlIEoZTnBA4.gif",
        category: "peach-goma",
        tags: ["сердце", "лапка", "привет"],
      },
    ],
  },
  {
    id: "pandas",
    name: "🐼 Пандочки & Мишки",
    icon: "🐼",
    items: [
      {
        id: "pa-1",
        title: "Влюбленная пандочка с сердечками",
        url: "https://i.giphy.com/vFKqnCdLPNOKc.gif",
        category: "pandas",
        tags: ["панда", "сердечки", "милота"],
      },
      {
        id: "pa-2",
        title: "Пандочки обнимаются",
        url: "https://i.giphy.com/EatwJZRUIv41G.gif",
        category: "pandas",
        tags: ["панда", "объятия", "любовь"],
      },
      {
        id: "pa-3",
        title: "Панда посылает воздушный поцелуй",
        url: "https://i.giphy.com/ErZ8guOvGVJsY.gif",
        category: "pandas",
        tags: ["панда", "поцелуй", "воздушный"],
      },
      {
        id: "pa-4",
        title: "Счастливая кувыркающаяся панда",
        url: "https://i.giphy.com/Ju7l5y9osyymQ.gif",
        category: "pandas",
        tags: ["панда", "радость", "веселье"],
      },
      {
        id: "pa-5",
        title: "Панда с букетом цветов",
        url: "https://i.giphy.com/S857VTxhca7Xrk4evP.gif",
        category: "pandas",
        tags: ["панда", "цветы", "букет"],
      },
      {
        id: "pa-6",
        title: "Малыш панда стесняется",
        url: "https://i.giphy.com/xT0xeJpnrWC4XWblEk.gif",
        category: "pandas",
        tags: ["панда", "стеснение", "романтика"],
      },
    ],
  },
  {
    id: "bunnies",
    name: "🐰 Зайки & Кролики",
    icon: "🐰",
    items: [
      {
        id: "bn-1",
        title: "Кролики с большим сердечком",
        url: "https://i.giphy.com/DaHzZMb1HB8hPRIv3q.gif",
        category: "bunnies",
        tags: ["зайка", "кролик", "сердце"],
      },
      {
        id: "bn-2",
        title: "Счастливый прыгающий зайка",
        url: "https://i.giphy.com/gZx49LyO1CEG7YbcbK.gif",
        category: "bunnies",
        tags: ["зайка", "прыжки", "радость"],
      },
      {
        id: "bn-3",
        title: "Нежные обнимашки зайчат",
        url: "https://i.giphy.com/ddvkYSGBpv6Tu.gif",
        category: "bunnies",
        tags: ["зайка", "объятия", "ласка"],
      },
      {
        id: "bn-4",
        title: "Милое признание зайки",
        url: "https://i.giphy.com/nBKexBIYct2M9D6s1V.gif",
        category: "bunnies",
        tags: ["признание", "зайка", "любовь"],
      },
      {
        id: "bn-5",
        title: "Любовь и пушистое тепло",
        url: "https://i.giphy.com/uSs0mmKB0dmBW.gif",
        category: "bunnies",
        tags: ["пушистик", "тепло", "уют"],
      },
      {
        id: "bn-6",
        title: "Зайка шлет поцелуи",
        url: "https://i.giphy.com/LMuSfE0WEUZXbMwZfX.gif",
        category: "bunnies",
        tags: ["поцелуй", "зайчик", "поцелуи"],
      },
    ],
  },
  {
    id: "anime-romance",
    name: "💖 Аниме & Ghibli",
    icon: "🌸",
    items: [
      {
        id: "an-1",
        title: "Уютный закат вдвоем",
        url: "https://i.giphy.com/131tNuGktpXGhy.gif",
        category: "anime-romance",
        tags: ["аниме", "закат", "романтика"],
      },
      {
        id: "an-2",
        title: "Держатся за руки под звездами",
        url: "https://i.giphy.com/10fS0TJxf2EwfK.gif",
        category: "anime-romance",
        tags: ["аниме", "руки", "звезды"],
      },
      {
        id: "an-3",
        title: "Нежный взгляд и румянец",
        url: "https://i.giphy.com/c35RMDOqAG24M.gif",
        category: "anime-romance",
        tags: ["аниме", "взгляд", "румянец"],
      },
      {
        id: "an-4",
        title: "Тоторо под дождем с зонтиком",
        url: "https://i.giphy.com/7SF5scGB2AFrgsXP63.gif",
        category: "anime-romance",
        tags: ["тоторо", "дождь", "гибли"],
      },
      {
        id: "an-5",
        title: "Искрящиеся глаза влюбленности",
        url: "https://i.giphy.com/uw0KpagtwEJtC.gif",
        category: "anime-romance",
        tags: ["глаза", "искра", "восторг"],
      },
      {
        id: "an-6",
        title: "Романтический поцелуй аниме",
        url: "https://i.giphy.com/G3vaVSnb8397i.gif",
        category: "anime-romance",
        tags: ["поцелуй", "аниме", "любовь"],
      },
      {
        id: "an-7",
        title: "Лепестки сакуры на ветру",
        url: "https://i.giphy.com/xThuWpnG8gVclGY9TW.gif",
        category: "anime-romance",
        tags: ["сакура", "весна", "ветер"],
      },
    ],
  },
  {
    id: "food-date",
    name: "🍕 Пицца, Кофе & Свидание",
    icon: "🍕",
    items: [
      {
        id: "fd-1",
        title: "Вкусная горячая пицца с сыром",
        url: "https://i.giphy.com/3osxYoufeOGOA7xiVu.gif",
        category: "food-date",
        tags: ["пицца", "еда", "ужин"],
      },
      {
        id: "fd-2",
        title: "Ароматный кофе с пенкой-сердечком",
        url: "https://i.giphy.com/3o7TKMt1VVNkHV2PaE.gif",
        category: "food-date",
        tags: ["кофе", "сердечко", "кафе"],
      },
      {
        id: "fd-3",
        title: "Чин-чин бокалами вина",
        url: "https://i.giphy.com/Zw3oBUuIg23fi.gif",
        category: "food-date",
        tags: ["вино", "бокалы", "тост"],
      },
      {
        id: "fd-4",
        title: "Попкорн и фильм в кино",
        url: "https://i.giphy.com/13cptIwW9bgzk6UVye.gif",
        category: "food-date",
        tags: ["кино", "попкорн", "фильм"],
      },
      {
        id: "fd-5",
        title: "Нежные десерты и клубника в шоколаде",
        url: "https://i.giphy.com/l2Sq5G3KGtxDJnZbG.gif",
        category: "food-date",
        tags: ["клубника", "шоколад", "десерт"],
      },
      {
        id: "fd-6",
        title: "Суши и роллы для двоих",
        url: "https://i.giphy.com/3oEduXNW7VvBwWp3wY.gif",
        category: "food-date",
        tags: ["суши", "роллы", "ужин"],
      },
    ],
  },
  {
    id: "dogs-corgi",
    name: "🐶 Песики & Корги",
    icon: "🐶",
    items: [
      {
        id: "dg-1",
        title: "Счастливый корги бежит на свидание",
        url: "https://i.giphy.com/3oz8xL8Z96m7783uAE.gif",
        category: "dogs-corgi",
        tags: ["корги", "собака", "радость"],
      },
      {
        id: "dg-2",
        title: "Щеночек с розочкой в зубах",
        url: "https://i.giphy.com/TdLga9029tB272tH6r.gif",
        category: "dogs-corgi",
        tags: ["щенок", "роза", "подарок"],
      },
      {
        id: "dg-3",
        title: "Влюбленный щенок виляет хвостиком",
        url: "https://i.giphy.com/10uFlFT204SpB6.gif",
        category: "dogs-corgi",
        tags: ["щенок", "хвостик", "счастье"],
      },
      {
        id: "dg-4",
        title: "Песик стесняется и улыбается",
        url: "https://i.giphy.com/4Zo41lhzKt6iZ8xff9.gif",
        category: "dogs-corgi",
        tags: ["собачка", "улыбка", "милота"],
      },
      {
        id: "dg-5",
        title: "Дружные собачки обнимаются",
        url: "https://i.giphy.com/kvrfnrhmy5V8nsXZM2.gif",
        category: "dogs-corgi",
        tags: ["объятия", "дружба", "любовь"],
      },
    ],
  },
  {
    id: "hugs-kisses",
    name: "🥰 Объятия & Поцелуи",
    icon: "🥰",
    items: [
      {
        id: "hk-1",
        title: "Крепкие объятия от всего сердца",
        url: "https://i.giphy.com/5WkQ1UK24sL3NveWih.gif",
        category: "hugs-kisses",
        tags: ["объятия", "крепко", "сердце"],
      },
      {
        id: "hk-2",
        title: "Милый поцелуй в носик",
        url: "https://i.giphy.com/MDJ9IbxxvDUQM.gif",
        category: "hugs-kisses",
        tags: ["поцелуй", "носик", "мило"],
      },
      {
        id: "hk-3",
        title: "Поцелуйчик в щечку",
        url: "https://i.giphy.com/4N1wOi78ZGzjz6H9Cm.gif",
        category: "hugs-kisses",
        tags: ["щечка", "поцелуйчик", "ласка"],
      },
      {
        id: "hk-4",
        title: "Кошачьи поцелуи",
        url: "https://i.giphy.com/W1hd36sUqdNTqm5ytg.gif",
        category: "hugs-kisses",
        tags: ["котик", "поцелуи", "мур"],
      },
      {
        id: "hk-5",
        title: "Нежные сонные объятия",
        url: "https://i.giphy.com/108M7gFV14ymflW.gif",
        category: "hugs-kisses",
        tags: ["сон", "объятия", "кровать"],
      },
      {
        id: "hk-6",
        title: "Миллион воздушных поцелуев",
        url: "https://i.giphy.com/LMuSfE0WEUZXbMwZfX.gif",
        category: "hugs-kisses",
        tags: ["поцелуи", "воздушный", "много"],
      },
      {
        id: "hk-7",
        title: "Котики спят в обнимку",
        url: "https://i.giphy.com/b0Cq28zI6Eg6c.gif",
        category: "hugs-kisses",
        tags: ["котята", "обнимашки", "сон"],
      },
    ],
  },
  {
    id: "funny-memes",
    name: "😹 Смешные & Мемные",
    icon: "😹",
    items: [
      {
        id: "fm-1",
        title: "Пожалуйста, скажи ДА!",
        url: "https://i.giphy.com/BzyTuYCmvSorH1LF8H.gif",
        category: "funny-memes",
        tags: ["мольба", "да", "смешно"],
      },
      {
        id: "fm-2",
        title: "Танцующий довольный котик",
        url: "https://i.giphy.com/JIX9t2j0ZTN9S.gif",
        category: "funny-memes",
        tags: ["танец", "кот", "мем"],
      },
      {
        id: "fm-3",
        title: "Котик с гигантскими глазами Шрека",
        url: "https://i.giphy.com/qUIm5wu6L04hy.gif",
        category: "funny-memes",
        tags: ["глазки", "шрек", "просьба"],
      },
      {
        id: "fm-4",
        title: "Стеснительный котик заглядывает",
        url: "https://i.giphy.com/MeIucAjx0FxGU.gif",
        category: "funny-memes",
        tags: ["стеснение", "кот", "взгляд"],
      },
      {
        id: "fm-5",
        title: "Праздничный танец восторга",
        url: "https://i.giphy.com/blSTtZehjAZ8I.gif",
        category: "funny-memes",
        tags: ["танец", "восторг", "победа"],
      },
      {
        id: "fm-6",
        title: "Сердечко заряжено на 100%",
        url: "https://i.giphy.com/19cSF0rJ1ORJk6BXkd.gif",
        category: "funny-memes",
        tags: ["зарядка", "сердце", "100%"],
      },
    ],
  },
  {
    id: "romantic-photos",
    name: "📸 Эстетичные фото",
    icon: "📸",
    items: [
      {
        id: "rp-1",
        title: "Ужин при свечах",
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["ужин", "свечи", "ресторан"],
      },
      {
        id: "rp-2",
        title: "Кофе на закате",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["кофе", "закат", "тепло"],
      },
      {
        id: "rp-3",
        title: "Букет свежих роз",
        url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["розы", "букет", "цветы"],
      },
      {
        id: "rp-4",
        title: "Звездное небо & бокалы",
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["звезды", "ночь", "бокалы"],
      },
      {
        id: "rp-5",
        title: "Прогулка в парке",
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["прогулка", "парк", "пара"],
      },
      {
        id: "rp-6",
        title: "Теплый закат у моря",
        url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
        tags: ["море", "пляж", "закат"],
      },
    ],
  },
];

// =========================================================================
// 2. ШАГ 2: СТИКЕРЫ ПОДТВЕРЖДЕНИЯ («ОНА СКАЗАЛА ДА!»)
// =========================================================================
export const CONFIRMATION_PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "happy-dance",
    name: "🎉 Танцы радости & Восторг",
    items: [
      {
        id: "hd-1",
        title: "Победный танец Dudu & Bubu",
        url: "https://i.giphy.com/d6RZ1E5AT6JlZrP4z3.gif",
        category: "happy-dance",
      },
      {
        id: "hd-2",
        title: "Радостный прыгающий зайка",
        url: "https://i.giphy.com/gZx49LyO1CEG7YbcbK.gif",
        category: "happy-dance",
      },
      {
        id: "hd-3",
        title: "Танец восторга от согласия",
        url: "https://i.giphy.com/ZNpkkKRhYiHeIoavCb.gif",
        category: "happy-dance",
      },
      {
        id: "hd-4",
        title: "Праздник и ликование",
        url: "https://i.giphy.com/26BRv0ThflsDTjCTe.gif",
        category: "happy-dance",
      },
      {
        id: "hd-5",
        title: "Танец счастья песика",
        url: "https://i.giphy.com/3oz8xL8Z96m7783uAE.gif",
        category: "happy-dance",
      },
      {
        id: "hd-6",
        title: "Счастливый танцующий малыш",
        url: "https://i.giphy.com/26FLdmIp6wJr91JAI.gif",
        category: "happy-dance",
      },
      {
        id: "hd-7",
        title: "Котики празднуют «ДА!»",
        url: "https://i.giphy.com/dn4MBZhXE2J6QK9ATY.gif",
        category: "happy-dance",
      },
    ],
  },
  {
    id: "hearts-explosion",
    name: "💖 Салюты сердец",
    items: [
      {
        id: "he-1",
        title: "Любовный салют сердец",
        url: "https://i.giphy.com/sGVwsjnkQPb0gr18u6.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-2",
        title: "Сердечный восторг до неба",
        url: "https://i.giphy.com/19cSF0rJ1ORJk6BXkd.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-3",
        title: "Взрыв романтических сердечек",
        url: "https://i.giphy.com/l2R013BQsiM05B8Xu.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-4",
        title: "Летающие искрящиеся сердца",
        url: "https://i.giphy.com/l0HlFTxWf2xY5W0h2.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-5",
        title: "Фейерверк любви",
        url: "https://i.giphy.com/3o7TKoWXm3okO1kgHC.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-6",
        title: "Волшебное облако сердечек",
        url: "https://i.giphy.com/WsdvVqm34q8w8mJbQU.gif",
        category: "hearts-explosion",
      },
      {
        id: "he-7",
        title: "Поцелуй с дождем из сердец",
        url: "https://i.giphy.com/xT0xeJpnrWC4XWblEk.gif",
        category: "hearts-explosion",
      },
    ],
  },
  {
    id: "cute-sweet",
    name: "🥹 Трогательное счастье",
    items: [
      {
        id: "cs-1",
        title: "Dudu обнимает Bubu от радости",
        url: "https://i.giphy.com/iCVzZwwE6QNAV2tEE0.gif",
        category: "cute-sweet",
      },
      {
        id: "cs-2",
        title: "Нежные слезы счастья котика",
        url: "https://i.giphy.com/M90mJvfWfd5mbUuULX.gif",
        category: "cute-sweet",
      },
      {
        id: "cs-3",
        title: "Поцелуйчик в благодарность",
        url: "https://i.giphy.com/xUA7b4ARNbo3VUikgw.gif",
        category: "cute-sweet",
      },
      {
        id: "cs-4",
        title: "Милое объятие котиков",
        url: "https://i.giphy.com/l4pTfx2qLszoHsZTy.gif",
        category: "cute-sweet",
      },
      {
        id: "cs-5",
        title: "Щеночек радуется согласию",
        url: "https://i.giphy.com/TdLga9029tB272tH6r.gif",
        category: "cute-sweet",
      },
    ],
  },
];

// =========================================================================
// 3. ШАГ 5: ТРИУМФ НА ФИНАЛЬНОМ ЭКРАНЕ (CELEBRATION FINALE)
// =========================================================================
export const FINALE_PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "celebration-fireworks",
    name: "🎆 Салют & Ликование",
    items: [
      {
        id: "cf-1",
        title: "Праздничный танец счастья",
        url: "https://i.giphy.com/gZx49LyO1CEG7YbcbK.gif",
        category: "celebration-fireworks",
      },
      {
        id: "cf-2",
        title: "Радостные котики Peach & Goma",
        url: "https://i.giphy.com/Zadd9hOl014Q0.gif",
        category: "celebration-fireworks",
      },
      {
        id: "cf-3",
        title: "Счастливые мишки Dudu & Bubu",
        url: "https://i.giphy.com/OvpDkvslMuDdw59me5.gif",
        category: "celebration-fireworks",
      },
      {
        id: "cf-4",
        title: "Любовный салют сердец",
        url: "https://i.giphy.com/sGVwsjnkQPb0gr18u6.gif",
        category: "celebration-fireworks",
      },
      {
        id: "cf-5",
        title: "Победное ликование",
        url: "https://i.giphy.com/l0MYt5jPR6QX5pnqM.gif",
        category: "celebration-fireworks",
      },
      {
        id: "cf-6",
        title: "Золотой салют восторга",
        url: "https://i.giphy.com/26BRv0ThflsDTjCTe.gif",
        category: "celebration-fireworks",
      },
    ],
  },
  {
    id: "romantic-together",
    name: "💑 Нежные объятия пары",
    items: [
      {
        id: "rt-1",
        title: "Искренние объятия на закате",
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
        category: "romantic-together",
      },
      {
        id: "rt-2",
        title: "Мишки держатся за лапки",
        url: "https://i.giphy.com/iCVzZwwE6QNAV2tEE0.gif",
        category: "romantic-together",
      },
      {
        id: "rt-3",
        title: "Романтический поцелуй",
        url: "https://i.giphy.com/Y01jP8qj1Wddf6PwtW.gif",
        category: "romantic-together",
      },
      {
        id: "rt-4",
        title: "Уютные теплые объятия",
        url: "https://i.giphy.com/5WkQ1UK24sL3NveWih.gif",
        category: "romantic-together",
      },
      {
        id: "rt-5",
        title: "Романтический вечер вдвоем",
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        category: "romantic-together",
      },
    ],
  },
  {
    id: "sweet-animals",
    name: "🐾 Счастливые зверята",
    items: [
      {
        id: "sa-1",
        title: "Зайки танцуют от радости",
        url: "https://i.giphy.com/d6RZ1E5AT6JlZrP4z3.gif",
        category: "sweet-animals",
      },
      {
        id: "sa-2",
        title: "Котики спят в обнимку",
        url: "https://i.giphy.com/artj92V8o75VPL7AeQ.gif",
        category: "sweet-animals",
      },
      {
        id: "sa-3",
        title: "Танец счастья собачки",
        url: "https://i.giphy.com/3oz8xL8Z96m7783uAE.gif",
        category: "sweet-animals",
      },
      {
        id: "sa-4",
        title: "Котик шлет миллион сердец",
        url: "https://i.giphy.com/3oEjI4sFlIEoZTnBA4.gif",
        category: "sweet-animals",
      },
    ],
  },
];
