"use client";

import React from "react";
import { Wifi } from "lucide-react";

export function StatusBar({ dark = true }: { dark?: boolean }) {
  const textColor = dark ? "text-neutral-900" : "text-white";

  return (
    <div
      className={`absolute top-0 left-0 right-0 h-11 px-7 flex items-center justify-between text-xs font-semibold z-20 pointer-events-none select-none ${textColor}`}
    >
      {/* Time */}
      <span className="text-[13px] tracking-tight pl-1 font-medium">9:41</span>

      {/* Status Icons */}
      <div className="flex items-center gap-1.5 pr-1">
        {/* Cellular signal bars */}
        <div className="flex items-end gap-[2px] h-3">
          <span className="w-[3px] h-[4px] bg-current rounded-sm" />
          <span className="w-[3px] h-[6px] bg-current rounded-sm" />
          <span className="w-[3px] h-[9px] bg-current rounded-sm" />
          <span className="w-[3px] h-[11px] bg-current rounded-sm" />
        </div>

        {/* Wi-Fi Icon */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery Icon */}
        <div className="flex items-center">
          <div className="w-[20px] h-[10px] border border-current rounded-[3px] p-[1px] flex items-center">
            <div className="w-full h-full bg-current rounded-[1.5px]" />
          </div>
          <div className="w-[1.5px] h-[4px] bg-current rounded-r-sm -ml-[0.5px]" />
        </div>
      </div>
    </div>
  );
}
