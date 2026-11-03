"use client";

import React, { useState, useRef } from "react";
import { useInviteStore } from "@/store/useInviteStore";
import { formatTemplate } from "@/lib/template";
import {
  PartyPopper,
  Type,
  Image as ImageIcon,
  Upload,
  Trash2,
  Lock,
  Plus,
  Sparkles,
  MapPin,
  Eye,
  Camera,
  FileImage,
  Loader2,
  X,
  Check,
  Send,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  Ticket,
  Clock,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";
import { FINALE_PRESET_CATEGORIES } from "@/lib/gifCatalog";

const SAMPLE_PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=600&auto=format&fit=crop",
];

const COUPON_PRESETS = [
  { icon: "💆‍♀️", title: "30 минут массажа", description: "Полный релакс после долгого дня" },
  { icon: "☕", title: "Завтрак в постель", description: "В любое воскресное утро на твой выбор" },
  { icon: "🍕", title: "Любая еда за мой счёт", description: "Выбирай доставку без ограничений" },
  { icon: "🎬", title: "Выбор любого фильма", description: "Смотрим то, что скажешь ты, без споров" },
  { icon: "💐", title: "Внеплановый букет цветов", description: "Просто так, чтобы увидеть твою улыбку" },
  { icon: "🧞‍♂️", title: "Исполнение 1 желания", description: "Твой личный джинн на один вечер" },
];

export function Step5FinalScreen() {
  const {
    finalScreen,
    dateTime,
    activities,
    quiz,
    coupons,
    telegramNotification,
    updateFinalScreen,
    updateQuiz,
    updateCoupons,
    toggleCoupon,
    addCoupon,
    removeCoupon,
    updateTelegramNotification,
    addPhotosToAlbum,
    removePhotoFromAlbum,
  } = useInviteStore();

  const [newCouponIcon, setNewCouponIcon] = useState("🎁");
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponDesc, setNewCouponDesc] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const celebrationInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [isUploadingAlbum, setIsUploadingAlbum] = useState(false);
  const [albumProgress, setAlbumProgress] = useState({ current: 0, total: 0 });
  const [isUploadingCelebration, setIsUploadingCelebration] = useState(false);
  const [celebrationTab, setCelebrationTab] = useState<"presets" | "upload" | "url">("presets");
  const [celebrationCategory, setCelebrationCategory] = useState<string>("all");
  const [testingTg, setTestingTg] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestTelegram = async () => {
    if (!telegramNotification.chatId) {
      setTgTestResult({ success: false, message: "Введите ваш Telegram Chat ID перед отправкой теста" });
      return;
    }
    setTestingTg(true);
    setTgTestResult(null);
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: telegramNotification.chatId,
          botToken: telegramNotification.botToken,
        }),
      });
      const data = await res.json();
      setTgTestResult({
        success: data.success,
        message: data.message || (data.success ? "Тестовое сообщение отправлено!" : "Ошибка отправки"),
      });
    } catch {
      setTgTestResult({
        success: false,
        message: "Ошибка сети при обращении к серверу",
      });
    } finally {
      setTestingTg(false);
    }
  };

  // Template context
  const selectedActs = activities.filter((a) => a.selected);
  const activityText =
    selectedActs.length > 0
      ? selectedActs.map((a) => `${a.icon} ${a.title}`).join(", ")
      : "наш особенный вечер";

  const templateContext = {
    date: dateTime.enabled ? dateTime.date : "в любой день",
    time: dateTime.enabled ? dateTime.time : "в удобное время",
    activity: activityText,
    location: finalScreen.location || "уютное место",
  };

  // Helper to insert a tag into text fields
  const insertTag = (field: "title" | "message", tag: string) => {
    const currentVal = finalScreen[field] || "";
    updateFinalScreen({ [field]: `${currentVal} ${tag}` });
  };

  // Handle celebration image file upload
  const handleCelebrationFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите изображение или GIF");
      return;
    }
    setIsUploadingCelebration(true);
    try {
      const res = await uploadFile(file, "images");
      if (res.url) {
        updateFinalScreen({ imageUrl: res.url });
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Ошибка загрузки изображения");
    } finally {
      setIsUploadingCelebration(false);
    }
  };

  // Handle multiple files for photo album
  const handleAlbumFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = 12 - finalScreen.photoAlbum.length;
    if (remainingSlots <= 0) {
      alert("В фотоальбоме уже максимальное количество фото (12 шт.)");
      return;
    }

    const filesToProcess = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    setIsUploadingAlbum(true);
    setAlbumProgress({ current: 0, total: filesToProcess.length });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      setAlbumProgress({ current: i + 1, total: filesToProcess.length });
      try {
        const res = await uploadFile(filesToProcess[i], "images");
        if (res.url) {
          uploadedUrls.push(res.url);
        }
      } catch (err) {
        console.error("Failed to upload image to album:", err);
      }
    }

    if (uploadedUrls.length > 0) {
      addPhotosToAlbum(uploadedUrls);
    }
    setIsUploadingAlbum(false);
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <PartyPopper className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-rose-900">Финальный экран триумфа</h4>
          <p className="text-[11px] text-rose-700/90 leading-relaxed mt-0.5">
            Здесь отображается итоговый результат: поздравление с авто-подстановкой тегов, фотоальбом памятных моментов и секретное послание для второй половинки!
          </p>
        </div>
      </div>

      {/* ================= 1. ИНПУТЫ ЗАГОЛОВКА И ОПИСАНИЯ С ТЕГАМИ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Тексты с авто-тегами</h3>
            <p className="text-xs text-slate-500">
              Используйте теги <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded text-[11px]">{"{date}"}</code>, <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded text-[11px]">{"{time}"}</code>, <code className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded text-[11px]">{"{activity}"}</code> для динамической подстановки
            </p>
          </div>
        </div>

        {/* Tag Buttons Bar */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Кликните по тегу для вставки:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { tag: "{date}", label: "📅 {date} (Дата)" },
              { tag: "{time}", label: "⏰ {time} (Время)" },
              { tag: "{activity}", label: "✨ {activity} (Активность)" },
              { tag: "{location}", label: "📍 {location} (Локация)" },
            ].map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => insertTag("message", item.tag)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200/80 font-mono transition-colors flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3 h-3 text-slate-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Финальный заголовок</span>
            <button
              onClick={() => insertTag("title", "{date}")}
              className="text-[10px] text-rose-600 hover:underline font-mono"
            >
              + вставить {"{date}"}
            </button>
          </label>
          <input
            type="text"
            value={finalScreen.title}
            onChange={(e) => updateFinalScreen({ title: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
            placeholder="Урааа! Жду нашу встречу {date} в {time}! 🎉"
          />
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Финальное описание / сообщение
          </label>
          <textarea
            rows={3}
            value={finalScreen.message}
            onChange={(e) => updateFinalScreen({ message: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none leading-relaxed"
            placeholder="Мы обязательно устроим {activity}! Это будет самый незабываемый вечер..."
          />
        </div>

        {/* Live substitution preview box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Живой предпросмотр подстановки:</span>
          </div>
          <p className="text-xs font-bold text-slate-900">
            {formatTemplate(finalScreen.title, templateContext)}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {formatTemplate(finalScreen.message, templateContext)}
          </p>
        </div>

        {/* Location & Map Link input */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Локация встречи (название места или адрес)</span>
            </label>
            <input
              type="text"
              value={finalScreen.location}
              onChange={(e) => updateFinalScreen({ location: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Уютный ресторан в центре города"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ссылка на 2ГИС / Яндекс.Карты / Google Maps (опционально)</span>
            </label>
            <input
              type="url"
              value={finalScreen.mapLink || ""}
              onChange={(e) => updateFinalScreen({ mapLink: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
              placeholder="https://go.2gis.com/... (если пусто — авто-поиск в 2ГИС по названию)"
            />
          </div>

          {/* Interactive Finale Widgets Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Таймер до встречи</span>
                </span>
                <p className="text-[10px] text-slate-500">Обратный отсчет дней и секунд</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateFinalScreen({ showCountdown: finalScreen.showCountdown === false ? true : false })
                }
                className={cn(
                  "w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer",
                  finalScreen.showCountdown !== false ? "bg-rose-500" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-[3px]",
                    finalScreen.showCountdown !== false ? "translate-x-5 left-0" : "translate-x-1 left-0"
                  )}
                />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-500" />
                  <span>VIP-Билет на свидание</span>
                </span>
                <p className="text-[10px] text-slate-500">Скачивание PNG билета для Stories</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateFinalScreen({ showDateTicket: finalScreen.showDateTicket === false ? true : false })
                }
                className={cn(
                  "w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer",
                  finalScreen.showDateTicket !== false ? "bg-rose-500" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-[3px]",
                    finalScreen.showDateTicket !== false ? "translate-x-5 left-0" : "translate-x-1 left-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. ПРАЗДНИЧНОЕ ИЗОБРАЖЕНИЕ / GIF ТРИУМФА ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Главное праздничное фото / GIF</h3>
              <p className="text-xs text-slate-500">
                Картинка триумфа вверху финального экрана
              </p>
            </div>
          </div>

          {finalScreen.imageUrl && (
            <div className="relative group shrink-0">
              <SafeImage
                src={finalScreen.imageUrl}
                alt="Celebration"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
              <button
                type="button"
                onClick={() => updateFinalScreen({ imageUrl: "" })}
                title="Очистить"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* PROMINENT LIVE PREVIEW OF CELEBRATION IMAGE */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-slate-50 to-amber-50/40 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-36 aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0">
            {finalScreen.imageUrl ? (
              <SafeImage
                src={finalScreen.imageUrl}
                alt="Активное изображение триумфа"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-50">
                <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                <span className="text-[11px] font-medium">Нет изображения</span>
              </div>
            )}
            {finalScreen.imageUrl && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Выбрано
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`w-2 h-2 rounded-full ${finalScreen.imageUrl ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {finalScreen.imageUrl ? "Активное изображение триумфа" : "Изображение не выбрано"}
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {finalScreen.imageUrl
                ? "Это праздничное фото или GIF будет венчаться салютом на экране согласия."
                : "Выберите анимацию из каталога ниже или загрузите свое особенное фото."}
            </p>
            {finalScreen.imageUrl && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateFinalScreen({ imageUrl: "" })}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-lg transition-colors font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Удалить изображение</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs for celebration media */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setCelebrationTab("presets")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              celebrationTab === "presets"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Пресеты</span>
          </button>
          <button
            onClick={() => setCelebrationTab("upload")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              celebrationTab === "upload"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Upload className="w-3.5 h-3.5 text-rose-500" />
            <span>Загрузить</span>
          </button>
          <button
            onClick={() => setCelebrationTab("url")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
              celebrationTab === "url"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
            <span>Ссылка</span>
          </button>
        </div>

        {celebrationTab === "presets" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setCelebrationCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                  celebrationCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <span>🎆 Все варианты</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  celebrationCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                )}>
                  {FINALE_PRESET_CATEGORIES.reduce((acc, c) => acc + c.items.length, 0)}
                </span>
              </button>
              {FINALE_PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCelebrationCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                    celebrationCategory === cat.id
                      ? "bg-rose-500 text-white shadow-xs font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    celebrationCategory === cat.id ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    {cat.items.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
              {FINALE_PRESET_CATEGORIES
                .filter((cat) => celebrationCategory === "all" || cat.id === celebrationCategory)
                .flatMap((cat) => cat.items)
                .map((item) => {
                  const isSelected = finalScreen.imageUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateFinalScreen({ imageUrl: item.url })}
                      className={cn(
                        "relative rounded-xl overflow-hidden border text-left group transition-all aspect-[4/3] flex flex-col justify-end p-2 cursor-pointer shadow-2xs",
                        isSelected
                          ? "ring-2 ring-rose-500 border-rose-500 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      )}
                    >
                      <SafeImage
                        src={item.url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                      <span className="relative z-10 text-[11px] font-medium text-white truncate drop-shadow-sm">
                        {item.title}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {celebrationTab === "upload" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <input
              ref={celebrationInputRef}
              type="file"
              accept="image/*,.gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCelebrationFile(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => !isUploadingCelebration && celebrationInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                isUploadingCelebration
                  ? "border-rose-400 bg-rose-50/50 pointer-events-none"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
              )}
            >
              {isUploadingCelebration ? (
                <div className="flex flex-col items-center justify-center py-1">
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                  <h4 className="text-xs font-semibold text-slate-800">
                    Загрузка изображения на сервер...
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Сохраняем в Supabase Storage
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-white text-rose-500 flex items-center justify-center shadow-2xs border border-slate-100 mb-2">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mb-0.5">
                    Выберите файл с устройства
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    Поддерживаются GIF, PNG, JPG, WebP
                  </p>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                    Выбрать файл
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {celebrationTab === "url" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="text-xs font-medium text-slate-700">
              Прямая ссылка на GIF или картинку
            </label>
            <input
              type="url"
              value={finalScreen.imageUrl}
              onChange={(e) => updateFinalScreen({ imageUrl: e.target.value })}
              placeholder="https://.../celebrate.gif"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        )}
      </section>

      {/* ================= 3. ФОТОАЛЬБОМ НАШИХ МОМЕНТОВ (ДО 12 ФОТО) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Фотоальбом наших моментов</h3>
              <p className="text-xs text-slate-500">
                Загрузите до 12 памятных совместных фото или картинок
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border",
              finalScreen.photoAlbum.length >= 12
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            {finalScreen.photoAlbum.length} из 12 фото
          </span>
        </div>

        {/* Hidden multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAlbumFiles(e.target.files)}
        />

        {/* Drag & drop upload zone */}
        {finalScreen.photoAlbum.length < 12 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleAlbumFiles(e.dataTransfer.files);
            }}
            onClick={() => !isUploadingAlbum && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
              dragActive
                ? "border-rose-400 bg-rose-50/50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50",
              isUploadingAlbum && "pointer-events-none opacity-85"
            )}
          >
            {isUploadingAlbum ? (
              <div className="flex flex-col items-center justify-center py-2 animate-in fade-in space-y-2.5 w-full max-w-xs">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <h4 className="text-xs font-semibold text-slate-800">
                  Загрузка фото {albumProgress.current} из {albumProgress.total}...
                </h4>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(albumProgress.current / (albumProgress.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Сохраняем изображения в хранилище Storage
                </p>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white text-rose-500 flex items-center justify-center shadow-2xs border border-slate-100 mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mb-0.5">
                  Нажмите для выбора фото или перетащите их сюда
                </h4>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Можно выбрать сразу несколько изображений (до 12 фото всего)
                </p>
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors">
                  Выбрать фото с устройства
                </span>
              </>
            )}
          </div>
        )}

        {/* Quick presets button */}
        {finalScreen.photoAlbum.length === 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => addPhotosToAlbum(SAMPLE_PHOTO_PRESETS.slice(0, 4))}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Заполнить примерными романтическими фото</span>
            </button>
          </div>
        )}

        {/* Photo Album Thumbnails Grid */}
        {finalScreen.photoAlbum.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
            {finalScreen.photoAlbum.map((photoUrl, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group shadow-2xs bg-slate-100"
              >
                <SafeImage
                  src={photoUrl}
                  alt={`Moment #${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => removePhotoFromAlbum(idx)}
                  title="Удалить фото"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono pointer-events-none">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= 3. ПОЛЕ ДЛЯ СЕКРЕТНОГО СООБЩЕНИЯ ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Секретное послание</h3>
            <p className="text-xs text-slate-500">
              Личная записка, которая скрыта в превью и открывается только по клику
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Текст секретного сообщения
          </label>
          <textarea
            rows={3}
            value={finalScreen.secretMessage}
            onChange={(e) => updateFinalScreen({ secretMessage: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none leading-relaxed"
            placeholder="P.S. Я приготовил для тебя кое-что особенное, чего ты совсем не ожидаешь... ❤️🤫"
          />
          <p className="text-[11px] text-slate-500">
            В мобильном превью появится карточка с секретом, которую получатель сможет прочесть!
          </p>

          {/* Scratch Card Toggle */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Стираемый защитный слой (Scratch Card)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">HOT</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Получатель стирает слой пальцем или монеткой, как в лотерейном билете!
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateFinalScreen({ scratchCard: !finalScreen.scratchCard })}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
                finalScreen.scratchCard ? "bg-rose-500" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                  finalScreen.scratchCard ? "translate-x-6 left-0" : "translate-x-1 left-0"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ================= 3.8. РОМАНТИЧЕСКИЕ КУПОНЫ ЛЮБВИ (LOVE COUPONS) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>Подарочные купоны любви</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                  NEW 🎟️
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Половинка сможет выбрать и активировать милые купоны желаний прямо на финальном экране!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateCoupons({ enabled: !coupons.enabled })}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
              coupons.enabled ? "bg-rose-500" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                coupons.enabled ? "translate-x-6 left-0" : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>

        {coupons.enabled && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Быстрое добавление купонов:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COUPON_PRESETS.map((cp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      addCoupon({
                        icon: cp.icon,
                        title: cp.title,
                        description: cp.description,
                        enabled: true,
                      })
                    }
                    disabled={coupons.items.length >= 8}
                    className="px-2.5 py-1 rounded-lg text-xs bg-amber-50/70 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{cp.icon}</span>
                    <span>{cp.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {coupons.items.length < 8 && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCouponIcon}
                  onChange={(e) => setNewCouponIcon(e.target.value)}
                  className="w-14 px-2 py-2 text-center text-sm rounded-xl border border-slate-200 bg-slate-50/50"
                  placeholder="🎁"
                />
                <input
                  type="text"
                  value={newCouponTitle}
                  onChange={(e) => setNewCouponTitle(e.target.value)}
                  placeholder="Название купона (напр. Поцелуй без повода)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="Описание (опционально)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCouponTitle.trim()) return;
                    addCoupon({
                      icon: newCouponIcon.trim() || "🎁",
                      title: newCouponTitle.trim(),
                      description: newCouponDesc.trim() || undefined,
                      enabled: true,
                    });
                    setNewCouponTitle("");
                    setNewCouponDesc("");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить</span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              {coupons.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between gap-3 transition-all",
                    item.enabled
                      ? "bg-rose-50/40 border-rose-200"
                      : "bg-slate-50 border-slate-200 opacity-65"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleCoupon(item.id)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
                        item.enabled
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-white border-slate-300"
                      )}
                    >
                      {item.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeCoupon(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ================= 4. МИНИ-ВИКТОРИНА (LOVE QUIZ — ДО 5 ВОПРОСОВ) ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Мини-викторина для двоих (до 5 вопросов)
              </h3>
              <p className="text-xs text-slate-500">
                Вопросы перед выбором «Да/Нет» — ответы гостя сохранятся в вашем кабинете!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateQuiz({ enabled: !quiz.enabled })}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
              quiz.enabled ? "bg-rose-500" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                quiz.enabled ? "translate-x-6 left-0" : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>

        {quiz.enabled && (
          <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            {quiz.questions.map((qItem, qIdx) => (
              <div
                key={qItem.id || qIdx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600">
                    Вопрос #{qIdx + 1}
                  </span>
                  {quiz.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuiz({
                          questions: quiz.questions.filter((_, idx) => idx !== qIdx),
                        })
                      }
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Текст вопроса</label>
                  <input
                    type="text"
                    value={qItem.question}
                    onChange={(e) => {
                      const updated = [...quiz.questions];
                      updated[qIdx] = { ...qItem, question: e.target.value };
                      updateQuiz({ questions: updated });
                    }}
                    placeholder="Кто из нас двоих сильнее любит? 🥰"
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-600">Варианты ответа</label>
                  {(qItem.options || ["", "", ""]).map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-[11px] text-slate-400 font-mono">
                        #{oIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...quiz.questions];
                          const nextOpts = [...(qItem.options || ["", "", ""])];
                          nextOpts[oIdx] = e.target.value;
                          updated[qIdx] = { ...qItem, options: nextOpts };
                          updateQuiz({ questions: updated });
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Реакция после ответа</label>
                  <input
                    type="text"
                    value={qItem.reaction}
                    onChange={(e) => {
                      const updated = [...quiz.questions];
                      updated[qIdx] = { ...qItem, reaction: e.target.value };
                      updateQuiz({ questions: updated });
                    }}
                    placeholder="Самый милый ответ! 🥰"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            ))}

            {quiz.questions.length < 5 && (
              <button
                type="button"
                onClick={() =>
                  updateQuiz({
                    questions: [
                      ...quiz.questions,
                      {
                        id: `q-${Date.now()}`,
                        question: "Какой момент со мной тебе запомнился больше всего? ✨",
                        options: [
                          "Наша первая встреча 💫",
                          "Наши долгие разговоры до ночи 🌙",
                          "Каждая минута рядом с тобой ❤️",
                        ],
                        reaction: "Мое сердечко тает от этих слов! 🥹💖",
                      },
                    ],
                  })
                }
                className="w-full py-2.5 rounded-xl border border-dashed border-rose-300 bg-rose-50/40 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить еще вопрос ({quiz.questions.length}/5)</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* ================= 5. УВЕДОМЛЕНИЯ В TELEGRAM ================= */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Оповещение в Telegram при согласии
              </h3>
              <p className="text-xs text-slate-500">
                Мгновенное уведомление в Telegram, когда получатель нажмет «Да»
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateTelegramNotification({ enabled: !telegramNotification.enabled })}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none shadow-2xs shrink-0 cursor-pointer",
              telegramNotification.enabled ? "bg-sky-500" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full bg-white block transition-transform shadow-xs absolute top-1",
                telegramNotification.enabled ? "translate-x-6 left-0" : "translate-x-1 left-0"
              )}
            />
          </button>
        </div>

        {telegramNotification.enabled && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Chat ID Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">1. Ваш Telegram Chat ID</label>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  <span>Узнать свой ID в @userinfobot</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={telegramNotification.chatId || ""}
                onChange={(e) => updateTelegramNotification({ chatId: e.target.value.trim() })}
                placeholder="Например: 123456789"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Откройте бота <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-600 font-mono">@userinfobot</code> в Telegram, нажмите Start и скопируйте число напротив «Id».
              </p>
            </div>

            {/* Custom Bot Token Field */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  2. Токен бота (Bot Token) <span className="font-normal text-slate-400">(опционально)</span>
                </label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1"
                >
                  <span>Создать бота в @BotFather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={telegramNotification.botToken || ""}
                onChange={(e) => updateTelegramNotification({ botToken: e.target.value.trim() })}
                placeholder="Токен от @BotFather (или оставьте пустым для системного бота)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Перед отправкой обязательно откройте диалог с вашим ботом и нажмите кнопку <b>/start</b>, чтобы бот получил разрешение присылать вам сообщения!
              </p>
            </div>

            {/* Test Send Button & Feedback */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTg || !telegramNotification.chatId}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {testingTg ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    <span>Отправка тестового сообщения в Telegram...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-sky-600" />
                    <span>⚡ Отправить тестовое оповещение</span>
                  </>
                )}
              </button>

              {tgTestResult && (
                <div
                  className={cn(
                    "p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 flex items-start gap-2",
                    tgTestResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  )}
                >
                  {tgTestResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{tgTestResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
