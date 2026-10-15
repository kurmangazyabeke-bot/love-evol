"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ url, title = "Голосовое послание для тебя 🎙️", className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log("Audio play error", e));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!url) return null;

  return (
    <div
      className={cn(
        "w-full bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2 select-none",
        className
      )}
    >
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Header */}
      <div className="flex items-center justify-between text-left px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <Mic className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[170px]">
            {title}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </span>
      </div>

      {/* Player Bar & Waveform */}
      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          )}
        </button>

        {/* Waveform bars simulation */}
        <div className="flex-1 flex items-center gap-[3px] h-6 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const barProgress = (i / 24) * 100;
            const isPassed = progress >= barProgress;
            // Waveform height modulation
            const height = Math.sin(i * 0.6) * 10 + 14;

            return (
              <span
                key={i}
                style={{ height: `${height}px` }}
                className={cn(
                  "w-[3px] rounded-full transition-all duration-150",
                  isPassed
                    ? "bg-rose-500"
                    : "bg-slate-200",
                  isPlaying && isPassed && "animate-pulse"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
