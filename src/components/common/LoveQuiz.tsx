"use client";

import React, { useState } from "react";
import { QuizSettings } from "@/types/invite";
import { Sparkles, HelpCircle, CheckCircle2, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface LoveQuizProps {
  quiz: QuizSettings;
  onPassed: () => void;
}

export function LoveQuiz({ quiz, onPassed }: LoveQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reactionText, setReactionText] = useState<string | null>(null);

  if (!quiz.enabled || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const question = quiz.questions[currentIdx] || quiz.questions[0];

  const handleSelect = (opt: string) => {
    setSelectedOption(opt);
    setReactionText(question.reaction || "Это самый правильный и милый ответ! 🥰");

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#fda4af", "#ffd700"],
    });

    setTimeout(() => {
      if (currentIdx + 1 < quiz.questions.length) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
        setReactionText(null);
      } else {
        onPassed();
      }
    }, 1600);
  };

  return (
    <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-xl space-y-4 animate-in fade-in zoom-in-95 text-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
        <HelpCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
          Вопрос для двоих 💖
        </span>
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {question.question}
        </h3>
      </div>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={i}
              type="button"
              disabled={selectedOption !== null}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between cursor-pointer",
                isSelected
                  ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]"
                  : "bg-slate-50 hover:bg-rose-50/60 text-slate-800 border-slate-200 hover:border-rose-300"
              )}
            >
              <span>{opt}</span>
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              ) : (
                <Heart className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {reactionText && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-in fade-in flex items-center justify-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>{reactionText}</span>
        </div>
      )}
    </div>
  );
}
