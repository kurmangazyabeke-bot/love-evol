"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, Check, ChevronRight, X } from "lucide-react";
import { useInviteStore } from "@/store/useInviteStore";
import { VibeType, ParticlesType } from "@/types/invite";

interface LovePreset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  vibe: VibeType;
  particles: ParticlesType;
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
    vibe: "sweet-peach",
    particles: "hearts",
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
    name: "Валентинка / Признание",
    emoji: "💖",
    tagline: "Страстное и трогательное признание в любви",
    vibe: "sunset-blush",
    particles: "roses",
    generalTitle: "Будешь моей самой любимой половинкой? 🌹💖",
    generalSubtitle: "Я приготовил для нас особенный вечер и очень жду твоего ответа...",
    yesText: "Да, тысячу раз да! 🥰",
    noText: "Нет...",
    confirmTitle: "Подожди, ты реально сказала да?! 🥹❤️",
    confirmSubtitle: "Мое сердечко сейчас просто растает от счастья! ✨",
    finalTitle: "Наш незабываемый вечер любви {date} в {time}! 🎉",
    finalMessage: "Мы обязательно устроим {activity}! Ты делаешь мою жизнь сказкой.",
    secretMessage: "P.S. Главный подарок в моей жизни — это ты. Безумно тебя люблю! ❤️",
  },
  {
    id: "anniversary",
    name: "Годовщина отношений",
    emoji: "💍",
    tagline: "Глубокие чувства, воспоминания и благодарность за каждый день",
    vibe: "golden-champagne",
    particles: "champagne",
    generalTitle: "Приглашаю тебя отпраздновать нашу особенную дату! 🥂✨",
    generalSubtitle: "Столько счастливых моментов позади, и сколько всего прекрасного впереди...",
    yesText: "С радостью! 💖",
    noText: "Нет...",
    confirmTitle: "Спасибо, что ты рядом со мной каждый день! 🥰",
    confirmSubtitle: "Давай сделаем этот вечер по-настоящему особенным ✨",
    finalTitle: "Наш вечер любви и воспоминаний {date} в {time}! 🥂",
    finalMessage: "Мы устроим {activity}! Спасибо тебе за твою нежность и тепло.",
    secretMessage: "P.S. С каждым днем я влюбляюсь в тебя только сильнее ❤️",
  },
  {
    id: "apology",
    name: "Хочу помириться",
    emoji: "🥺",
    tagline: "Искреннее, нежное признание и желание обнять",
    vibe: "lavender-dream",
    particles: "sakura",
    generalTitle: "Давай забудем все обиды и крепко обнимемся? 🥺❤️",
    generalSubtitle: "Мне так не хватает твоей улыбки... Давай встретимся и поговорим?",
    yesText: "Да, давай мириться! 🫂",
    noText: "Я все еще дуюсь...",
    confirmTitle: "Ура! Ты самое дорогое, что у меня есть! 🥹❤️",
    confirmSubtitle: "Обещаю беречь твою улыбку и сделать этот вечер чудесным ✨",
    finalTitle: "Жду момента, когда смогу тебя крепко обнять {date}! 💖",
    finalMessage: "Мы пойдем на {activity} и оставим все плохое позади.",
    secretMessage: "P.S. Я куплю твои любимые вкусняшки и не буду отпускать из объятий! 🍫❤️",
  },
  {
    id: "spontaneous",
    name: "Спонтанное похищение",
    emoji: "🚀",
    tagline: "Дерзкий и романтический сюрприз без повода",
    vibe: "midnight-romance",
    particles: "stars",
    generalTitle: "Официально похищаю тебя на особенный вечер! 😉✨",
    generalSubtitle: "Никаких скучных планов — только ночной город, музыка и мы вдвоем...",
    yesText: "Похищай скорее! 🥰",
    noText: "Не сегодня...",
    confirmTitle: "План похищения одобрен! Готовься к сюрпризу! 🚀",
    confirmSubtitle: "Выбирай маршрут нашей романтической вылазки ✨",
    finalTitle: "Наше ночное приключение начнется {date} в {time}! 🌌",
    finalMessage: "Нас ждет {activity}! Одевайся красиво и приготовься улыбаться.",
    secretMessage: "P.S. Заеду за тобой с твоим любимым напитком и классным плейлистом 🤫🎶",
  },
  {
    id: "birthday-date",
    name: "День рождения половинки",
    emoji: "🎂",
    tagline: "Праздничное приглашение для именинницы / именинника",
    vibe: "rose-petal",
    particles: "butterflies",
    generalTitle: "Готова отпраздновать твой день по-королевски? 👑🎂",
    generalSubtitle: "Сегодня все желания исполняются только для тебя!",
    yesText: "Да, празднуем! 🥂",
    noText: "Стесняюсь...",
    confirmTitle: "С Днем Рождения, мое чудо! 🎉💖",
    confirmSubtitle: "Выбирай всё, чего душа пожелает в твой праздник ✨",
    finalTitle: "Твой праздничный вечер {date} в {time}! 🎂🥂",
    finalMessage: "В программе {activity} в {location}, море цветов и сюрпризов!",
    secretMessage: "P.S. Главный подарок ждет тебя при личной встрече! 🎁❤️",
  },
  {
    id: "cozy-home",
    name: "Домашний вечер вдвоем",
    emoji: "🕯️",
    tagline: "Плед, вкусная еда, свечи и любимый сериал",
    vibe: "french-vanilla",
    particles: "cats",
    generalTitle: "Устроим самый уютный вечер под пледом? 🕯️🍕",
    generalSubtitle: "Отключим телефоны, закажем вкусняшек и побудем только вдвоем...",
    yesText: "Идеальный план! 🥰",
    noText: "Хочу спать...",
    confirmTitle: "Готовлю самый мягкий плед и зажигаю свечи! ✨",
    confirmSubtitle: "Выбирай нашу программу уюта на вечер 🍿",
    finalTitle: "Вечер полного релакса {date} в {time}! 🕯️❤️",
    finalMessage: "Устроим {activity}! Никакой суеты — только тепло и объятия.",
    secretMessage: "P.S. Купон на массаж и выбор фильма сегодня полностью в твоих руках! 💆‍♀️🎬",
  },
];

export function SmartLoveTextAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [applyThemeToo, setApplyThemeToo] = useState(true);

  const { general, updateGeneral, updateConfirmation, updateFinalScreen } = useInviteStore();

  const handleApplyPreset = (preset: LovePreset) => {
    const namePrefix = general.recipientName?.trim()
      ? `${general.recipientName.trim()}, `
      : "";
    const personalizedTitle = namePrefix
      ? `${namePrefix}${preset.generalTitle.charAt(0).toLowerCase()}${preset.generalTitle.slice(1)}`
      : preset.generalTitle;

    updateGeneral({
      title: personalizedTitle,
      subtitle: preset.generalSubtitle,
      yesButtonText: preset.yesText,
      noButtonText: preset.noText,
      ...(applyThemeToo
        ? {
            vibe: preset.vibe,
            particlesType: preset.particles,
          }
        : {}),
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
    }, 850);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white text-xs font-bold shadow-sm shadow-rose-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>✨ Подобрать сценарий (7 тем)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Мастер готовых сценариев ✨
                  </h3>
                  <p className="text-xs text-slate-500">
                    Заполнит тексты{general.recipientName ? ` для «${general.recipientName}»` : ""}, кнопки, секрет и атмосферу в 1 клик
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800">
                🎨 Также подобрать подходящий фон (Вайб) и падающие частицы
              </span>
              <input
                type="checkbox"
                checked={applyThemeToo}
                onChange={(e) => setApplyThemeToo(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </label>

            <div className="space-y-2.5">
              {LOVE_PRESETS.map((preset) => {
                const isApplied = appliedId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-rose-400 hover:bg-rose-50/30 text-left transition-all flex items-start gap-3.5 group cursor-pointer shadow-2xs"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {preset.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                          {preset.name}
                        </span>
                        {isApplied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Применено!
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{preset.tagline}</p>
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 font-medium truncate">
                        «{preset.generalTitle}»
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
