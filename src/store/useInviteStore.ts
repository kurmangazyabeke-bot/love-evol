import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  InviteState,
  GeneralInfo,
  ConfirmationSettings,
  ActivitiesConfig,
  DateTimeSettings,
  AudioSettings,
  NoButtonSettings,
  ActivityOption,
  FinalScreenSettings,
  QuizSettings,
  CouponsSettings,
  LoveCoupon,
  TelegramNotificationSettings,
} from "@/types/invite";

function getUpcomingDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const initialGeneral: GeneralInfo = {
  title: "Пойдешь со мной на свидание? 💖",
  subtitle: "Я приготовил для нас особенный вечер и очень жду твоего ответа...",
  recipientName: "",
  senderName: "",
  coverImageUrl: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
  yesButtonText: "Да, с радостью! 🥰",
  noButtonText: "Нет...",
  vibe: "sunset-blush",
  openingAnimation: "ribbon",
  particlesType: "hearts",
  pinCode: "",
  soundEffects: true,
};

export const initialConfirmation: ConfirmationSettings = {
  title: "Подожди, ты реально сказала да?! 🥹❤️",
  subtitle: "Я не верю своему счастью! Теперь давай решим, как мы проведем этот вечер... ✨",
  continueButtonText: "Выбрать, чем мы займемся 🥰",
  stickerUrl: "https://i.giphy.com/d6RZ1E5AT6JlZrP4z3.gif",
};

export const initialActivitiesConfig: ActivitiesConfig = {
  title: "Чем мы займемся? 🥰",
  subtitle: "Выбери один или несколько вариантов",
  continueButtonText: "Перейти к выбору даты 📅",
  allowCustomIdea: true,
};

export const initialActivities: ActivityOption[] = [
  {
    id: "1",
    title: "Пицца и кино",
    icon: "🍕",
    selected: true,
  },
  {
    id: "2",
    title: "Прогулка с кофе",
    icon: "☕",
    selected: true,
  },
  {
    id: "3",
    title: "Ужин при свечах",
    icon: "🍷",
    selected: false,
  },
  {
    id: "4",
    title: "Киномарафон под пледом",
    icon: "🎬",
    selected: false,
  },
];

export const initialDateTime: DateTimeSettings = {
  enabled: true,
  selectionMode: "guest_chooses",
  date: getUpcomingDefaultDate(),
  time: "19:00",
  title: "Когда тебе удобно встретиться? 🗓️",
  subtitle: "Выбери день и время, а я подстроюсь под тебя 🥰",
  continueButtonText: "Подтвердить дату и время ✨",
};

export const initialAudio: AudioSettings = {
  enabled: true,
  url: "synth:moonlight-waltz",
  title: "Лунный вальс для тебя 🎹",
};

export const initialNoButton: NoButtonSettings = {
  mode: "runaway",
  yesButtonGrowth: true,
  growthStep: 0.18,
  phrases: [
    "Нет...",
    "Ты уверена? 🥺",
    "Подумай ещё разок! 🙏",
    "А если я куплю пиццу и кофе? 🍕",
    "Ну пожалуйста-пожалуйста! ❤️",
    "Не нажимай сюда, нажми ДА! 🥹",
    "Ты разбиваешь мне сердечко 💔",
    "Кнопка 'Нет' устала и сдается! ✨",
  ],
};

export const initialFinalScreen: FinalScreenSettings = {
  title: "Урааа! Жду нашу встречу {date} в {time}! 🎉💖",
  message: "Мы обязательно устроим {activity}! Это будет самый незабываемый вечер в {location}.",
  imageUrl:
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
  location: "Уютный ресторан в центре города",
  mapLink: "",
  showConfetti: true,
  scratchCard: true,
  showCountdown: true,
  showDateTicket: true,
  extraNote: "Не забудь надеть улыбку и тепло одеться!",
  photoAlbum: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop",
  ],
  secretMessage:
    "P.S. Я приготовил для тебя кое-что особенное, чего ты совсем не ожидаешь... ❤️🤫",
};

export const initialQuiz: QuizSettings = {
  enabled: false,
  questions: [
    {
      id: "q1",
      question: "Кто из нас двоих сильнее любит? 🥰",
      options: ["Я тебя! 💕", "Нет, я сильнее! 💖", "Оба до луны и обратно! ✨"],
      reaction: "Правильный ответ! Мы оба без ума друг от друга! 🥰",
    },
  ],
};

export const initialCoupons: CouponsSettings = {
  enabled: true,
  title: "Подарочные купоны любви 🎟️",
  subtitle: "Выбери купоны, которые хочешь активировать на нашей встрече!",
  items: [
    {
      id: "c1",
      title: "Право выбора любого фильма",
      icon: "🎬",
      description: "Никаких споров — смотрим то, что скажешь ты!",
      enabled: true,
    },
    {
      id: "c2",
      title: "Любой десерт или вкусняшка",
      icon: "🍰",
      description: "Исполняю любой сладкий каприз за мой счёт",
      enabled: true,
    },
    {
      id: "c3",
      title: "Крепкие объятия без лимита",
      icon: "🫂",
      description: "Действует бессрочно и в любое время суток",
      enabled: true,
    },
    {
      id: "c4",
      title: "20 минут расслабляющего массажа",
      icon: "💆‍♀️",
      description: "Для самого лучшего отдыха после долгого дня",
      enabled: false,
    },
  ],
};

export const initialTelegramNotification: TelegramNotificationSettings = {
  enabled: false,
  chatId: "",
  botToken: "",
  notifyOnOpen: true,
};

export const useInviteStore = create<InviteState>()(
  persist(
    (set) => ({
      draftId: null,
      currentStep: 1,
      general: initialGeneral,
      confirmation: initialConfirmation,
      noButton: initialNoButton,
      activitiesConfig: initialActivitiesConfig,
      activities: initialActivities,
      dateTime: initialDateTime,
      audio: initialAudio,
      finalScreen: initialFinalScreen,
      quiz: initialQuiz,
      coupons: initialCoupons,
      telegramNotification: initialTelegramNotification,

      setDraftId: (id) => {
        if (typeof window !== "undefined") {
          if (id) {
            localStorage.setItem("love_evol_draft_id", id);
          } else {
            localStorage.removeItem("love_evol_draft_id");
          }
        }
        set({ draftId: id });
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      updateGeneral: (data) =>
        set((state) => ({
          general: { ...state.general, ...data },
        })),

      updateConfirmation: (data) =>
        set((state) => ({
          confirmation: { ...state.confirmation, ...data },
        })),

      updateNoButton: (data) =>
        set((state) => ({
          noButton: { ...state.noButton, ...data },
        })),

      updateActivitiesConfig: (data) =>
        set((state) => ({
          activitiesConfig: { ...state.activitiesConfig, ...data },
        })),

      setActivities: (activities) => set({ activities }),

      toggleActivity: (id) =>
        set((state) => ({
          activities: state.activities.map((act) =>
            act.id === id ? { ...act, selected: !act.selected } : act
          ),
        })),

      updateActivity: (id, patch) =>
        set((state) => ({
          activities: state.activities.map((act) =>
            act.id === id ? { ...act, ...patch } : act
          ),
        })),

      addActivity: (activity) =>
        set((state) => {
          if (state.activities.length >= 8) return state;
          return {
            activities: [
              ...state.activities,
              { ...activity, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
            ],
          };
        }),

      removeActivity: (id) =>
        set((state) => {
          if (state.activities.length <= 1) return state;
          return {
            activities: state.activities.filter((act) => act.id !== id),
          };
        }),

      updateDateTime: (data) =>
        set((state) => ({
          dateTime: { ...state.dateTime, ...data },
        })),

      updateAudio: (data) =>
        set((state) => ({
          audio: { ...state.audio, ...data },
        })),

      updateFinalScreen: (data) =>
        set((state) => ({
          finalScreen: { ...state.finalScreen, ...data },
        })),

      updateQuiz: (data) =>
        set((state) => ({
          quiz: { ...state.quiz, ...data },
        })),

      updateCoupons: (data) =>
        set((state) => ({
          coupons: { ...state.coupons, ...data },
        })),

      toggleCoupon: (id) =>
        set((state) => ({
          coupons: {
            ...state.coupons,
            items: state.coupons.items.map((c) =>
              c.id === id ? { ...c, enabled: !c.enabled } : c
            ),
          },
        })),

      addCoupon: (coupon: Omit<LoveCoupon, "id">) =>
        set((state) => {
          if (state.coupons.items.length >= 8) return state;
          return {
            coupons: {
              ...state.coupons,
              items: [
                ...state.coupons.items,
                { ...coupon, id: `cp-${Date.now()}` },
              ],
            },
          };
        }),

      removeCoupon: (id) =>
        set((state) => ({
          coupons: {
            ...state.coupons,
            items: state.coupons.items.filter((c) => c.id !== id),
          },
        })),

      updateTelegramNotification: (data) =>
        set((state) => ({
          telegramNotification: { ...state.telegramNotification, ...data },
        })),

      addPhotosToAlbum: (newPhotos) =>
        set((state) => ({
          finalScreen: {
            ...state.finalScreen,
            photoAlbum: [...state.finalScreen.photoAlbum, ...newPhotos].slice(0, 12),
          },
        })),

      removePhotoFromAlbum: (index) =>
        set((state) => ({
          finalScreen: {
            ...state.finalScreen,
            photoAlbum: state.finalScreen.photoAlbum.filter((_, i) => i !== index),
          },
        })),

      loadFromConfig: (rawConfig, id = null) => {
        if (typeof window !== "undefined") {
          if (id) {
            localStorage.setItem("love_evol_draft_id", id);
          } else {
            localStorage.removeItem("love_evol_draft_id");
          }
        }
        set({
          draftId: id,
          currentStep: 1,
          general: { ...initialGeneral, ...((rawConfig.general as Partial<GeneralInfo>) || {}) },
          confirmation: {
            ...initialConfirmation,
            ...((rawConfig.confirmation as Partial<ConfirmationSettings>) || {}),
          },
          noButton: {
            ...initialNoButton,
            ...((rawConfig.noButton as Partial<NoButtonSettings>) || {}),
          },
          activitiesConfig: {
            ...initialActivitiesConfig,
            ...((rawConfig.activitiesConfig as Partial<ActivitiesConfig>) || {}),
          },
          activities:
            Array.isArray(rawConfig.activities) && rawConfig.activities.length > 0
              ? (rawConfig.activities as ActivityOption[])
              : initialActivities,
          dateTime: {
            ...initialDateTime,
            ...((rawConfig.dateTime as Partial<DateTimeSettings>) || {}),
          },
          audio: {
            ...initialAudio,
            ...((rawConfig.audio as Partial<AudioSettings>) || {}),
          },
          finalScreen: {
            ...initialFinalScreen,
            ...((rawConfig.finalScreen as Partial<FinalScreenSettings>) || {}),
          },
          quiz: {
            ...initialQuiz,
            ...((rawConfig.quiz as Partial<QuizSettings>) || {}),
          },
          coupons: {
            ...initialCoupons,
            ...((rawConfig.coupons as Partial<CouponsSettings>) || {}),
          },
          telegramNotification: {
            ...initialTelegramNotification,
            ...((rawConfig.telegramNotification as Partial<TelegramNotificationSettings>) || {}),
          },
        });
      },

      startNewInvitation: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("love_evol_draft_id");
        }
        set({
          draftId: null,
          currentStep: 1,
          general: initialGeneral,
          confirmation: initialConfirmation,
          noButton: initialNoButton,
          activitiesConfig: initialActivitiesConfig,
          activities: initialActivities,
          dateTime: { ...initialDateTime, date: getUpcomingDefaultDate() },
          audio: initialAudio,
          finalScreen: initialFinalScreen,
          quiz: initialQuiz,
          coupons: initialCoupons,
          telegramNotification: initialTelegramNotification,
        });
      },

      resetToDefaults: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("love_evol_draft_id");
        }
        set({
          draftId: null,
          currentStep: 1,
          general: initialGeneral,
          confirmation: initialConfirmation,
          noButton: initialNoButton,
          activitiesConfig: initialActivitiesConfig,
          activities: initialActivities,
          dateTime: { ...initialDateTime, date: getUpcomingDefaultDate() },
          audio: initialAudio,
          finalScreen: initialFinalScreen,
          quiz: initialQuiz,
          coupons: initialCoupons,
          telegramNotification: initialTelegramNotification,
        });
      },
    }),
    {
      name: "love-evol-invite-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        draftId: state.draftId,
        currentStep: state.currentStep,
        general: state.general,
        confirmation: state.confirmation,
        noButton: state.noButton,
        activitiesConfig: state.activitiesConfig,
        activities: state.activities,
        dateTime: state.dateTime,
        audio: state.audio,
        finalScreen: state.finalScreen,
        quiz: state.quiz,
        coupons: state.coupons,
        telegramNotification: state.telegramNotification,
      }),
    }
  )
);
