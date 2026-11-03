"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Check, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/api";

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, durationSec: number) => void;
  initialAudioUrl?: string;
  onClear?: () => void;
}

export function VoiceRecorder({ onAudioReady, initialAudioUrl, onClear }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>(
    initialAudioUrl && !initialAudioUrl.startsWith("synth:") ? initialAudioUrl : ""
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordedSecsRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });

        setIsUploading(true);
        try {
          const uploaded = await uploadFile(audioBlob, "audio", `voice-${Date.now()}.webm`);
          if (uploaded?.url) {
            setAudioUrl(uploaded.url);
            onAudioReady(uploaded.url, recordedSecsRef.current);
            setIsUploading(false);
            return;
          }
        } catch (err) {
          console.warn("Cloud voice upload fallback to local Data URL:", err);
        }

        // Fallback to Data URL if offline
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          onAudioReady(base64Audio, recordedSecsRef.current);
          setIsUploading(false);
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordedSecsRef.current = 0;

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordedSecsRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      setMicError(
        "Не удалось получить доступ к микрофону. Разрешите использование микрофона в браузере."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const togglePlay = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
    setAudioUrl("");
    setRecordingTime(0);
    onClear?.();
  };

  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="p-4 rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/30 space-y-3">
      {micError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {micError}
        </div>
      )}

      {isUploading ? (
        <div className="flex items-center justify-center gap-2.5 py-4 text-xs font-semibold text-rose-700">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>Сохраняем голосовое послание в облачную БД Vercel...</span>
        </div>
      ) : !isRecording && !audioUrl ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Записать живое голосовое послание 🎙️
              </h4>
              <p className="text-[11px] text-slate-500">
                Скажите теплые слова своим голосом — сохраняется прямо в БД Vercel!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startRecording}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>Начать запись</span>
          </button>
        </div>
      ) : null}

      {isRecording && (
        <div className="flex items-center justify-between gap-3 py-1 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-red-600">
              Идет запись... {formatSecs(recordingTime)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Остановить</span>
          </button>
        </div>
      )}

      {!isRecording && !isUploading && audioUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                <span className="text-xs font-bold text-slate-800">
                  Голосовое сообщение сохранено!
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Нажмите Play для прослушивания ({formatSecs(recordingTime || 5)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Перезаписать</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Удалить запись"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
