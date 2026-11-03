"use client";

import React, { useState } from "react";
import { QuizSettings } from "@/types/invite";
import { QuizAnswerEntry } from "@/types/db";
import { Sparkles, HelpCircle, CheckCircle2, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { playSoftPop } from "@/lib/soundEffects";

interface LoveQuizProps {
  quiz: QuizSettings;
  onPassed: (answers?: QuizAnswerEntry[]) => void;
  soundEnabled?: boolean;
}

export function LoveQuiz({ quiz, onPassed, soundEnabled = true }: LoveQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reactionText, setReactionText] = useState<string | null>(null);
  const [collected, setCollected] = useState<QuizAnswerEntry[]>([]);

  if (!quiz.enabled || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const total = quiz.questions.length;
  const question = quiz.questions[currentIdx] || quiz.questions[0];

  const handleSelect = (opt: string) => {
    playSoftPop(soundEnabled);
    setSelectedOption(opt);
    setReactionText(question.reaction || "Это самый правильный и милый ответ! 🥰");

    const nextAnswers: QuizAnswerEntry[] = [
      ...collected,
      { question: question.question, answer: opt },
    ];
    setCollected(nextAnswers);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#fda4af", "#ffd700"],
    });

    setTimeout(() => {
      if (currentIdx + 1 < total) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
        setReactionText(null);
      } else {
        onPassed(nextAnswers);
      }
    }, 1450);
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95 text-center">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Мини-викторина 💖</span>
        </span>
        {total > 1 && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            {currentIdx + 1} / {total}
          </span>
        )}
      </div>

      {total > 1 && (
        <div className="w-full h-1.5 rounded-full bg-rose-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      )}

      <h3 className="text-sm font-bold text-slate-900 leading-snug px-1">
        {question.question}
      </h3>

      <div className="space-y-2">
        {(question.options || []).filter(Boolean).map((opt, i) => {
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
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />
          <span>{reactionText}</span>
        </div>
      )}
    </div>
  );
}
