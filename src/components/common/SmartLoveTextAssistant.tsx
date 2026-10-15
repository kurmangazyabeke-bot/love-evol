"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Heart, Check, ChevronRight, X } from "lucide-react";
import { useInviteStore } from "@/store/useInviteStore";

interface LovePreset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  generalTitle: string;
  generalSubtitle: string;
  yesText: string;
  noText: string;
  confirmTitle: string;
  confirmSubtitle: string;
  finalTitle: string;
  finalMessage: string;
  secretMessage: string;
}

const LOVE_PRESETS: LovePreset[] = [
  {
    id: "first-date",
    name: "Первое свидание",
    emoji: "☕",
    tagline: "Легкое, интригующее и безумно милое приглашение",
    generalTitle: "Сходим выпить кофе и поболтать? ☕✨",
    generalSubtitle: "Знаю одно невероятно уютное место с лучшими круассанами в городе...",
    yesText: "Конечно, с удовольствием! 🥰",
    noText: "Я подумаю...",
    confirmTitle: "Ура, ты согласилась! Мой день официально удался! 🎉",
    confirmSubtitle: "Теперь давай решим, куда пойдем и когда встретимся ✨",
    finalTitle: "Считаю часы до нашей встречи {date} в {time}! ☕💖",
    finalMessage: "Мы обязательно устроим {activity}! Это будет самый теплый вечер.",
    secretMessage: "P.S. Обещаю, я не буду нервничать... ну или хотя бы постараюсь 😉❤️",
  },
  {
    id: "valentines",
    name: "14 февраля / Валентинка",
    emoji: "💖",
    tagline: "Страстное и трогательное признание в любви",
    generalTitle: "Будешь моей Валентинкой? 🌹💖",
    generalSubtitle: "Я приготовил для нас особенный вечер и очень жду твоего ответа...",
    yesText: "Да, тысячу раз да! 🥰",
    noText: "Нет...",
    confirmTitle: "Подожди, ты реально сказала да?! 🥹❤️",
    confirmSubtitle: "Мое сердечко сейчас просто растает от счастья! ✨",
    finalTitle: "Наш незабываемый День Влюбленных {date} в {time}! 🎉",
    finalMessage: "Мы обязательно устроим {activity}! Ты делаешь мою жизнь сказкой.",
    secretMessage: "P.S. Главный подарок этого дня — это ты. Я безумно тебя люблю! ❤️",
  },
  {
    id: "anniversary",
    name: "Годовщина отношений",
    emoji: "💍",
    tagline: "Глубокие чувства, воспоминания и благодарность за каждый день",
    generalTitle: "Приглашаю тебя отпраздновать нашу дату! 🥂✨",
    generalSubtitle: "Столько счастливых моментов позади, и сколько всего прекрасного впереди...",
    yesText: "С радостью, любимый! 💖",
    noText: "Нет...",
    confirmTitle: "Спасибо, что ты рядом со мной каждый день! 🥰",
    confirmSubtitle: "Давай сделаем этот вечер по-настоящему особенным ✨",
    finalTitle: "Наш вечер любви и воспоминаний {date} в {time}! 🥂",
    finalMessage: "Мы устроим {activity}! Спасибо тебе за твою нежность и любовь.",
    secretMessage: "P.S. С каждым днем я люблю тебя только сильнее ❤️",
  },
  {
    id: "apology",
    name: "Хочу помириться",
    emoji: "🥺",
    tagline: "Искреннее, нежное признание и желание обнять",
    generalTitle: "Давай забудем все обиды и обнимемся? 🥺❤️",
    generalSubtitle: "Мне так не хватает твоей улыбки... Давай встретимся и поговорим?",
    yesText: "Да, давай мириться! 🫂",
    noText: "Я все еще дуюсь...",
    confirmTitle: "Ура! Ты самое дорогое, что у меня есть! 🥹❤️",
    confirmSubtitle: "Я обещаю исправиться и сделать тебя самой счастливой ✨",
    finalTitle: "Жду момента, когда смогу тебя крепко обнять {date}! 💖",
    finalMessage: "Мы пойдем на {activity} и оставим все плохое позади.",
    secretMessage: "P.S. Я куплю твои любимые сладости и буду держать за руку! 🍫❤️",
  },
  {
    id: "spontaneous",
    name: "Спонтанный сюрприз",
    emoji: "✨",
    tagline: "Неожиданный романтический жест без повода",
    generalTitle: "Украду тебя сегодня на особенный вечер? 😉🌹",
    generalSubtitle: "Никаких планов — только ты, я и море приятных эмоций...",
    yesText: "Похищай скорее! 🥰",
    noText: "Не сегодня...",
    confirmTitle: "План похищения одобрен! Готовься к сюрпризу! 🚀",
    confirmSubtitle: "Выбирай маршрут нашей романтической вылазки ✨",
    finalTitle: "Наше спонтанное приключение начнется {date} в {time}! 🎉",
    finalMessage: "Нас ждет {activity}! Одевайся красиво и приготовься улыбаться.",
    secretMessage: "P.S. Сюрприз уже упакован и ждет встречи с тобой 🤫🎁",
  },
];

export function SmartLoveTextAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const {
    updateGeneral,
    updateConfirmation,
    updateFinalScreen,
  } = useInviteStore();

  const applyPreset = (preset: LovePreset) => {
    updateGeneral({
      title: preset.generalTitle,
      subtitle: preset.generalSubtitle,
      yesButtonText: preset.yesText,
      noButtonText: preset.noText,
    });

    updateConfirmation({
      title: preset.confirmTitle,
      subtitle: preset.confirmSubtitle,
    });

    updateFinalScreen({
      title: preset.finalTitle,
      message: preset.finalMessage,
      secretMessage: preset.secretMessage,
    });

    setAppliedId(preset.id);
    setTimeout(() => {
      setAppliedId(null);
      setIsOpen(false);
    }, 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>🪄 Помощник по текстам</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Умный романтический помощник
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Выберите повод, и мы наполним всю открытку готовыми текстами
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {LOVE_PRESETS.map((preset) => {
                const isApplied = appliedId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/30 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{preset.emoji}</span>
                        <h4 className="text-xs font-bold text-slate-900">
                          {preset.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {preset.tagline}
                      </p>
                      <p className="text-[10px] text-rose-600 font-medium italic">
                        «{preset.generalTitle}»
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                        isApplied
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-900 hover:bg-rose-500 text-white shadow-2xs"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Применено</span>
                        </>
                      ) : (
                        <>
                          <span>Выбрать</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
