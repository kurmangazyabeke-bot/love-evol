"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Check, RefreshCw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, durationSec: number) => void;
  initialAudioUrl?: string;
  onClear?: () => void;
}

export function VoiceRecorder({ onAudioReady, initialAudioUrl, onClear }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>(initialAudioUrl || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

      // Determine supported mime type
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });

        // Convert to data URL for instant standalone playback without server dependency
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioUrl(base64Data);
          onAudioReady(base64Data, recordingTime);
        };

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            // Auto stop at 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicError("Доступ к микрофону отклонен или микрофон не найден в браузере.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleClear = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioUrl("");
    setIsPlaying(false);
    setRecordingTime(0);
    if (onClear) onClear();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 via-slate-50 to-pink-50/60 border border-rose-200/80 space-y-3">
      {micError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {micError}
        </div>
      )}

      {/* STATE 1: NOT RECORDED YET & NOT RECORDING */}
      {!isRecording && !audioUrl && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <Mic className="w-3.5 h-3.5 text-rose-500" />
              <span>Записать искреннее голосовое сообщение</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Нажмите кнопку, чтобы сказать теплые слова своим голосом (до 2 мин)
            </p>
          </div>

          <button
            type="button"
            onClick={startRecording}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Начать запись</span>
          </button>
        </div>
      )}

      {/* STATE 2: CURRENTLY RECORDING */}
      {isRecording && (
        <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div className="text-xs font-bold text-rose-600 font-mono tracking-wider">
              Идет запись... {formatTime(recordingTime)}
            </div>
          </div>

          {/* Sound waves animation */}
          <div className="flex items-center gap-0.5 h-4">
            <div className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms] h-3" />
            <div className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:150ms] h-4" />
            <div className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms] h-2" />
            <div className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:75ms] h-4" />
            <div className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:200ms] h-3" />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>Готово</span>
          </button>
        </div>
      )}

      {/* STATE 3: RECORDED AUDIO AVAILABLE */}
      {audioUrl && !isRecording && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Volume2 className="w-4 h-4 text-rose-500" />
              <span>Голосовое сообщение записано</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              ✓ Готово к прослушиванию
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            {/* Fake wave bars */}
            <div className="flex-1 flex items-center gap-0.5 h-6 px-1">
              {[40, 70, 90, 50, 80, 100, 60, 40, 70, 95, 60, 85, 40, 75, 90, 55, 65, 80, 95, 45].map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-full transition-all duration-200",
                    isPlaying ? "bg-rose-500" : "bg-slate-300"
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <button
              type="button"
              onClick={startRecording}
              title="Перезаписать"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              title="Удалить"
              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
