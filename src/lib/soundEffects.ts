"use client";

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!sharedCtx) {
      sharedCtx = new Ctx();
    }
    if (sharedCtx.state === "suspended") {
      sharedCtx.resume().catch(() => {});
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

export function playSoftPop(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch {}
}

export function playDodgeBoing(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  } catch {}
}

export function playMagicalChime(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const start = ctx.currentTime + i * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.58);
    });
  } catch {}
}

export interface SynthPreset {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  tempoMs: number;
  notes: number[];
}

export const SYNTH_MELODY_PRESETS: SynthPreset[] = [
  {
    id: "moonlight-waltz",
    url: "synth:moonlight-waltz",
    title: "Лунный вальс (Музыкальная шкатулка) 🎹",
    subtitle: "Нежная фортепианная мелодия без внешних ссылок",
    tempoMs: 420,
    notes: [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 698.46, 659.25, 587.33, 523.25,
    ],
  },
  {
    id: "sweet-serenade",
    url: "synth:sweet-serenade",
    title: "Серенада влюбленных ✨",
    subtitle: "Теплые романтические аккорды арфы",
    tempoMs: 380,
    notes: [
      587.33, 739.99, 880.0, 1174.66, 880.0, 739.99, 659.25, 880.0,
      783.99, 659.25, 587.33, 739.99, 659.25, 587.33, 493.88, 587.33,
    ],
  },
  {
    id: "dreamy-stars",
    url: "synth:dreamy-stars",
    title: "Звездное небо вдвоем 🌌",
    subtitle: "Мечтательный Lo-Fi перебор",
    tempoMs: 480,
    notes: [
      440.0, 523.25, 659.25, 783.99, 659.25, 523.25, 493.88, 587.33,
      698.46, 880.0, 783.99, 659.25, 523.25, 659.25, 587.33, 523.25,
    ],
  },
];

export class SynthMelodyPlayer {
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private playing = false;

  start(presetUrl: string, onTick?: (progressPct: number, elapsedSec: number, totalSec: number) => void) {
    this.stop();
    const preset =
      SYNTH_MELODY_PRESETS.find((p) => p.url === presetUrl) || SYNTH_MELODY_PRESETS[0];
    const ctx = getAudioContext();
    if (!ctx) return;

    this.playing = true;
    this.step = 0;
    const totalSec = Math.round((preset.notes.length * preset.tempoMs) / 1000);

    const playNextNote = () => {
      if (!this.playing) return;
      const c = getAudioContext();
      if (!c) return;
      const idx = this.step % preset.notes.length;
      const freq = preset.notes[idx];
      const now = c.currentTime;

      try {
        // Bell / Music-box main tone + soft octave harmonic
        const osc = c.createOscillator();
        const sub = c.createOscillator();
        const gain = c.createGain();

        osc.type = "sine";
        sub.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        sub.frequency.setValueAtTime(freq * 0.5, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.085, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.1);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(c.destination);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 1.15);
        sub.stop(now + 1.15);
      } catch {}

      const pct = ((idx + 1) / preset.notes.length) * 100;
      const elapsed = ((idx + 1) * preset.tempoMs) / 1000;
      onTick?.(pct, elapsed, totalSec);
      this.step++;
    };

    playNextNote();
    this.timer = setInterval(playNextNote, preset.tempoMs);
  }

  stop() {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
