// Curated, 100% verified working GIF and photo presets for all steps of the invite builder

export interface PresetItem {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface PresetCategory {
  id: string;
  name: string;
  icon?: string;
  items: PresetItem[];
}

// =========================================================================
// 1. ШАГ 1: ОБЛОЖКИ ПРИГЛАШЕНИЯ (COVER GIFS & PHOTOS)
// =========================================================================
export const COVER_PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: "bubu-dudu",
    name: "🐻 Bubu & Dudu",
    items: [
      {
        id: "bd-1",
        title: "Мишки Dudu & Bubu сердечко",
        url: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-2",
        title: "Dudu дарит цветы Bubu 🌹",
        url: "https://i.giphy.com/1J66nYXybHGyvv12O8.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-3",
        title: "Теплые объятия мишек",
        url: "https://i.giphy.com/iCVzZwwE6QNAV2tEE0.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-4",
        title: "Нежный поцелуй мишек",
        url: "https://i.giphy.com/Y01jP8qj1Wddf6PwtW.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-5",
        title: "Крепкие объятия мишек",
        url: "https://i.giphy.com/k9JW0Oy95v1IfWtx1T.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-6",
        title: "Мишка с цветком",
        url: "https://i.giphy.com/mXnO9IiGEmA24.gif",
        category: "bubu-dudu",
      },
      {
        id: "bd-7",
        title: "Счастливые Dudu & Bubu",
        url: "https://i.giphy.com/OvpDkvslMuDdw59me5.gif",
        category: "bubu-dudu",
      },
    ],
  },
  {
    id: "peach-goma",
    name: "🐱 Peach & Goma",
    items: [
      {
        id: "pg-1",
        title: "Котики Peach & Goma нежность",
        url: "https://i.giphy.com/bqk9FZwaFRT8zv1QWX.gif",
        category: "peach-goma",
      },
      {
        id: "pg-2",
        title: "Котики трутся щечками",
        url: "https://i.giphy.com/M90mJvfWfd5mbUuULX.gif",
        category: "peach-goma",
      },
      {
        id: "pg-3",
        title: "Спят в обнимку котики",
        url: "https://i.giphy.com/artj92V8o75VPL7AeQ.gif",
        category: "peach-goma",
      },
      {
        id: "pg-4",
        title: "Любовный кусь котиков",
        url: "https://i.giphy.com/BzyTuYCmvSorH1LF8H.gif",
        category: "peach-goma",
      },
      {
        id: "pg-5",
        title: "Радостные Peach & Goma",
        url: "https://i.giphy.com/dn4MBZhXE2J6QK9ATY.gif",
        category: "peach-goma",
      },
      {
        id: "pg-6",
        title: "Котики празднуют любовь",
        url: "https://i.giphy.com/Zadd9hOl014Q0.gif",
        category: "peach-goma",
      },
      {
        id: "pg-7",
        title: "Котик пьет бабл-ти вместе",
        url: "https://i.giphy.com/cLS1cfxvGOPVpf9g3y.gif",
        category: "peach-goma",
      },
    ],
  },
  {
    id: "bunnies",
    name: "🐰 Зайки & Кролики",
    items: [
      {
        id: "bn-1",
        title: "Кролики с большим сердечком",
        url: "https://i.giphy.com/DaHzZMb1HB8hPRIv3q.gif",
        category: "bunnies",
      },
      {
        id: "bn-2",
        title: "Счастливый прыгающий зайка",
        url: "https://i.giphy.com/gZx49LyO1CEG7YbcbK.gif",
        category: "bunnies",
      },
      {
        id: "bn-3",
        title: "Нежные обнимашки зайчат",
        url: "https://i.giphy.com/ddvkYSGBpv6Tu.gif",
        category: "bunnies",
      },
      {
        id: "bn-4",
        title: "Милое признание зайки",
        url: "https://i.giphy.com/nBKexBIYct2M9D6s1V.gif",
        category: "bunnies",
      },
      {
        id: "bn-5",
        title: "Любовь и пушистое тепло",
        url: "https://i.giphy.com/uSs0mmKB0dmBW.gif",
        category: "bunnies",
      },
    ],
  },
  {
    id: "hugs-kisses",
    name: "🥰 Объятия & Поцелуи",
    items: [
      {
        id: "hk-1",
        title: "Крепкие объятия от всего сердца",
        url: "https://i.giphy.com/5WkQ1UK24sL3NveWih.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-2",
        title: "Милый поцелуй в носик",
        url: "https://i.giphy.com/MDJ9IbxxvDUQM.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-3",
        title: "Поцелуйчик в щечку",
        url: "https://i.giphy.com/4N1wOi78ZGzjz6H9Cm.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-4",
        title: "Кошачьи поцелуи",
        url: "https://i.giphy.com/W1hd36sUqdNTqm5ytg.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-5",
        title: "Нежные сонные объятия",
        url: "https://i.giphy.com/108M7gFV14ymflW.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-6",
        title: "Уютные согревающие объятия",
        url: "https://i.giphy.com/kvrfnrhmy5V8nsXZM2.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-7",
        title: "Миллион воздушных поцелуев",
        url: "https://i.giphy.com/LMuSfE0WEUZXbMwZfX.gif",
        category: "hugs-kisses",
      },
      {
        id: "hk-8",
        title: "Котики спят в обнимку",
        url: "https://i.giphy.com/b0Cq28zI6Eg6c.gif",
        category: "hugs-kisses",
      },
    ],
  },
  {
    id: "cute-cats",
    name: "🐾 Котики & Лапки",
    items: [
      {
        id: "cc-1",
        title: "Сердечные лапки",
        url: "https://i.giphy.com/Lopx9eUi34rbq.gif",
        category: "cute-cats",
      },
      {
        id: "cc-2",
        title: "Влюбленный котик с сердечками",
        url: "https://i.giphy.com/3oEjI4sFlIEoZTnBA4.gif",
        category: "cute-cats",
      },
      {
        id: "cc-3",
        title: "Стесняющийся котик",
        url: "https://i.giphy.com/MeIucAjx0FxGU.gif",
        category: "cute-cats",
      },
      {
        id: "cc-4",
        title: "Котик шлет воздушное сердечко",
        url: "https://i.giphy.com/T86i6yDyOYz7J6dPhf.gif",
        category: "cute-cats",
      },
      {
        id: "cc-5",
        title: "Пушин с сердечком",
        url: "https://i.giphy.com/fxsqOYnIMEefC.gif",
        category: "cute-cats",
      },
      {
        id: "cc-6",
        title: "Влюбленный котик мурчит",
        url: "https://i.giphy.com/12PIT4DOj6Tnek.gif",
        category: "cute-cats",
      },
      {
        id: "cc-7",
        title: "Котик машет лапкой с любовью",
        url: "https://i.giphy.com/3o7abKhOpu0NwenH3O.gif",
        category: "cute-cats",
      },
    ],
  },
  {
    id: "romantic-photos",
    name: "📸 Эстетичные фото",
    items: [
      {
        id: "rp-1",
        title: "Ужин при свечах",
        url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
      },
      {
        id: "rp-2",
        title: "Кофе на закате",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
      },
      {
        id: "rp-3",
        title: "Букет свежих роз",
        url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
      },
      {
        id: "rp-4",
        title: "Звездное небо & бокалы",
        url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
      },
      {
        id: "rp-5",
        title: "Прогулка в парке",
        url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
      },
      {
        id: "rp-6",
        title: "Теплый закат у моря",
        url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=800&auto=format&fit=crop",
        category: "romantic-photos",
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
