"use client";

import React from "react";

export function DynamicIsland() {
  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
      <div className="w-[100px] h-[26px] bg-black rounded-full flex items-center justify-between px-3 shadow-sm border border-neutral-900/40 transition-all duration-300">
        {/* Front camera lens reflection */}
        <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-950/70 border border-neutral-700/60" />
        </div>
        {/* Sensor dot */}
        <div className="w-2 h-2 rounded-full bg-neutral-950/80" />
      </div>
    </div>
  );
}
