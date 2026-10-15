import { create } from "zustand";
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
  TelegramNotificationSettings,
} from "@/types/invite";

export const initialGeneral: GeneralInfo = {
  title: "Пойдешь со мной на свидание? 💖",
  subtitle: "Я приготовил для нас особенный вечер и очень жду твоего ответа...",
  coverImageUrl: "https://i.giphy.com/y7hFGjpKGo7qe1Tksx.gif",
  yesButtonText: "Да, с радостью! 🥰",
  noButtonText: "Нет...",
  vibe: "sunset-blush",
  openingAnimation: "ribbon",
  particlesType: "hearts",
  pinCode: "",
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
  selectionMode: "guest_chooses", // По умолчанию дату выбирает гость
  date: "2026-07-26",
  time: "19:00",
  title: "Когда тебе удобно встретиться? 🗓️",
  subtitle: "Выбери день и время, а я подстроюсь под тебя 🥰",
  continueButtonText: "Подтвердить дату и время ✨",
};

export const initialAudio: AudioSettings = {
  enabled: true,
  url: "",
  title: "Голосовое послание для тебя 🎙️",
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
  imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
  location: "Уютный ресторан в центре города",
  showConfetti: true,
  scratchCard: true, // Стираемый защитный слой включен по умолчанию для вау-эффекта
  extraNote: "Не забудь надеть улыбку и тепло одеться!",
  photoAlbum: [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop",
  ],
  secretMessage: "P.S. Я приготовил для тебя кое-что особенное, чего ты совсем не ожидаешь... ❤️🤫",
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

export const initialTelegramNotification: TelegramNotificationSettings = {
  enabled: false,
  chatId: "",
  botToken: "",
};

export const useInviteStore = create<InviteState>((set) => ({
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
  telegramNotification: initialTelegramNotification,

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
      if (state.activities.length >= 6) return state;
      return {
        activities: [
          ...state.activities,
          { ...activity, id: Date.now().toString() },
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

  resetToDefaults: () =>
    set({
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
      telegramNotification: initialTelegramNotification,
    }),
}));
