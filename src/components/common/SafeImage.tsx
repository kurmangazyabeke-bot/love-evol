"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
}

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop";

export function SafeImage({
  src,
  alt = "Изображение",
  className,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  fallbackText,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || (hasError && !fallbackSrc)) {
    return (
      <div
        className={cn(
          "w-full h-full min-h-[60px] bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center text-rose-400 p-2 text-center select-none",
          className
        )}
      >
        <Sparkles className="w-5 h-5 text-rose-400/80 mb-1" />
        <span className="text-[10px] font-medium text-rose-700/70 truncate max-w-full px-2">
          {fallbackText || alt || "Изображение"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => {
        if (!hasError && fallbackSrc && src !== fallbackSrc) {
          setHasError(true);
        }
      }}
      {...props}
    />
  );
}
