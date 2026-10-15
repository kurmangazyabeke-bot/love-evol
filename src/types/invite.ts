export type NoAnimationMode = "runaway" | "shrink" | "multiply";

export type VibeType =
  | "sunset-blush"
  | "rose-petal"
  | "sweet-peach"
  | "lavender-dream"
  | "cotton-candy"
  | "pure-silk"
  | "golden-champagne"
  | "french-vanilla"
  | "pearly-cloud"
  | "cherry-blossom"
  | "ruby-sunset"
  | "strawberry-mochi"
  | "aurora-love"
  | "midnight-romance"
  | "starry-night"
  | "neon-passion"
  | "noir-velvet"
  | "custom";

export type OpeningAnimationType =
  | "ribbon"
  | "frosted-glass"
  | "envelope"
  | "wax-seal"
  | "none";

export interface ActivityOption {
  id: string;
  title: string;
  icon: string;
  description?: string;
  selected: boolean;
}

export type ParticlesType = "hearts" | "roses" | "stars" | "sakura" | "cats";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  reaction: string;
}

export interface QuizSettings {
  enabled: boolean;
  questions: QuizQuestion[];
}

export interface TelegramNotificationSettings {
  enabled: boolean;
  chatId?: string;
  botToken?: string;
}

export interface GeneralInfo {
  title: string;
  subtitle: string;
  coverImageUrl: string;
  yesButtonText: string;
  noButtonText: string;
  vibe: VibeType;
  customBgColor?: string; // Hex color or CSS gradient when vibe is "custom"
  openingAnimation: OpeningAnimationType;
  particlesType: ParticlesType;
  pinCode?: string; // 4-digit secret code, if set guest must enter it
}

export interface ConfirmationSettings {
  title: string; // "Подожди, ты реально сказала да?"
  subtitle: string; // Вторая строка
  continueButtonText: string; // Текст кнопки продолжения
  stickerUrl: string; // Стикер / картинка / GIF
}

export interface ActivitiesConfig {
  title: string; // "Чем займемся?"
  subtitle: string; // "Выбери варианты для нашего свидания"
  continueButtonText: string;
}

export type DateSelectionMode = "guest_chooses" | "sender_sets";

export interface DateTimeSettings {
  enabled: boolean; // Включить/выключить выбор даты и времени
  selectionMode: DateSelectionMode; // "guest_chooses" (гость выбирает сам) | "sender_sets" (отправитель назначает дату)
  date: string; // Дата встречи (ГГГГ-ММ-ДД)
  time: string; // Время встречи (ЧЧ:ММ)
  title: string; // "Когда встретимся?"
  subtitle: string; // "Выбери день и время"
  continueButtonText: string;
}

export interface AudioSettings {
  enabled: boolean;
  url: string; // URL загруженного аудио или голосового сообщения
  title: string; // "Голосовое послание для тебя 🎙️"
}

export interface NoButtonSettings {
  mode: NoAnimationMode;
  yesButtonGrowth: boolean;
  growthStep: number;
  phrases: string[];
}

export interface FinalScreenSettings {
  title: string;
  message: string;
  imageUrl: string;
  location: string;
  showConfetti: boolean;
  scratchCard: boolean; // Стираемый защитный слой для секретного сообщения
  extraNote?: string;
  photoAlbum: string[]; // До 12 фото
  secretMessage: string; // Секретное послание
}

export interface InviteState {
  currentStep: number;
  general: GeneralInfo;
  confirmation: ConfirmationSettings;
  noButton: NoButtonSettings;
  activitiesConfig: ActivitiesConfig;
  activities: ActivityOption[];
  dateTime: DateTimeSettings;
  audio: AudioSettings;
  finalScreen: FinalScreenSettings;
  quiz: QuizSettings;
  telegramNotification: TelegramNotificationSettings;

  // Actions
  setCurrentStep: (step: number) => void;
  updateGeneral: (data: Partial<GeneralInfo>) => void;
  updateConfirmation: (data: Partial<ConfirmationSettings>) => void;
  updateNoButton: (data: Partial<NoButtonSettings>) => void;
  updateActivitiesConfig: (data: Partial<ActivitiesConfig>) => void;
  setActivities: (activities: ActivityOption[]) => void;
  toggleActivity: (id: string) => void;
  updateActivity: (id: string, patch: Partial<ActivityOption>) => void;
  addActivity: (activity: Omit<ActivityOption, "id">) => void;
  removeActivity: (id: string) => void;
  updateDateTime: (data: Partial<DateTimeSettings>) => void;
  updateAudio: (data: Partial<AudioSettings>) => void;
  updateFinalScreen: (data: Partial<FinalScreenSettings>) => void;
  updateQuiz: (data: Partial<QuizSettings>) => void;
  updateTelegramNotification: (data: Partial<TelegramNotificationSettings>) => void;
  addPhotosToAlbum: (photos: string[]) => void;
  removePhotoFromAlbum: (index: number) => void;
  resetToDefaults: () => void;
}
