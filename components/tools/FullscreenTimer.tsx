'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const BG_PRESETS: {
  id: string;
  label: string;
  style?: CSSProperties;
  imageUrl?: string;
}[] = [
  { id: 'black', label: 'Pure black', style: { backgroundColor: '#000000' } },
  {
    id: 'g-midnight',
    label: 'Midnight',
    style: { background: 'linear-gradient(165deg, #0f172a 0%, #020617 50%, #000 100%)' },
  },
  {
    id: 'g-ocean',
    label: 'Ocean',
    style: { background: 'linear-gradient(155deg, #0c4a6e 0%, #0d9488 45%, #0f172a 100%)' },
  },
  {
    id: 'g-ember',
    label: 'Ember',
    style: { background: 'linear-gradient(195deg, #4c1d95 0%, #9f1239 50%, #431407 100%)' },
  },
  {
    id: 'g-aurora',
    label: 'Aurora',
    style: { background: 'linear-gradient(180deg, #134e4a 0%, #1e1b4b 55%, #312e81 100%)' },
  },
  {
    id: 'img-forest',
    label: 'Forest (default)',
    imageUrl: 'https://picsum.photos/seed/wbeze-forest/1920/1080',
  },
  {
    id: 'img-lake',
    label: 'Lake (default)',
    imageUrl: 'https://picsum.photos/seed/wbeze-lake/1920/1080',
  },
  {
    id: 'img-dunes',
    label: 'Dunes (default)',
    imageUrl: 'https://picsum.photos/seed/wbeze-dunes/1920/1080',
  },
  { id: 'custom', label: 'Custom image', style: { backgroundColor: '#0a0a0a' } },
];

function formatDisplay(ms: number, showCentiseconds: boolean) {
  const t = Math.max(0, Math.floor(ms));
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const cs = Math.floor((t % 1000) / 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) {
    if (showCentiseconds) return `${h}:${pad(m)}:${pad(s)}`;
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  if (showCentiseconds) return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  return `${pad(m)}:${pad(s)}`;
}

function requestFullscreenFor(el: HTMLElement): Promise<void> {
  const anyEl = el as HTMLElement & { webkitRequestFullscreen?: () => void; msRequestFullscreen?: () => void };
  if (el.requestFullscreen) return Promise.resolve(el.requestFullscreen());
  if (anyEl.webkitRequestFullscreen) return Promise.resolve(anyEl.webkitRequestFullscreen());
  if (anyEl.msRequestFullscreen) return Promise.resolve(anyEl.msRequestFullscreen());
  return Promise.reject(new Error('Fullscreen not available'));
}

function exitFullscreen(): Promise<void> {
  const d = document as Document & { webkitExitFullscreen?: () => void; msExitFullscreen?: () => void };
  if (document.exitFullscreen) return Promise.resolve(document.exitFullscreen());
  if (d.webkitExitFullscreen) return Promise.resolve(d.webkitExitFullscreen());
  if (d.msExitFullscreen) return Promise.resolve(d.msExitFullscreen());
  return Promise.resolve();
}

function isFullscreenElement(el: HTMLElement | null) {
  if (!el) return false;
  const doc = document as Document & { webkitFullscreenElement?: Element; msFullscreenElement?: Element };
  const fs = document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement;
  return fs === el;
}

function playEndBeep() {
  type Win = typeof window & { webkitAudioContext?: typeof AudioContext };
  const w = window as Win;
  const Ctx = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.frequency.value = 880;
  g.gain.setValueAtTime(0.12, ctx.currentTime);
  o.start();
  o.stop(ctx.currentTime + 0.1);
  setTimeout(() => ctx.close().catch(() => undefined), 400);
}

export type TimerMode = 'stopwatch' | 'countdown';

export default function FullscreenTimer({ defaultMode = 'stopwatch' as TimerMode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<TimerMode>(defaultMode);
  const [bgId, setBgId] = useState(BG_PRESETS[0]!.id);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  runningRef.current = running;

  const [cdHours, setCdHours] = useState(0);
  const [cdMinutes, setCdMinutes] = useState(5);
  const [cdSeconds, setCdSeconds] = useState(0);
  const [displayMs, setDisplayMs] = useState(() => (defaultMode === 'countdown' ? 5 * 60 * 1000 : 0));
  const accRef = useRef(defaultMode === 'countdown' ? 5 * 60 * 1000 : 0);
  const startWallRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const countEndRef = useRef<number | null>(null);

  const [fullscreenActive, setFullscreenActive] = useState(false);
  const syncFs = useCallback(() => {
    setFullscreenActive(isFullscreenElement(containerRef.current));
  }, []);

  useEffect(() => {
    const onFs = () => syncFs();
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    syncFs();
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, [syncFs]);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      stopRaf();
      return;
    }
    const step = () => {
      rafRef.current = requestAnimationFrame(() => {
        if (!runningRef.current) return;
        if (mode === 'stopwatch') {
          if (startWallRef.current == null) {
            startWallRef.current = performance.now();
          }
          setDisplayMs(accRef.current + (performance.now() - startWallRef.current));
        } else {
          if (countEndRef.current == null) return;
          const left = Math.max(0, countEndRef.current - performance.now());
          setDisplayMs(left);
          if (left <= 0) {
            runningRef.current = false;
            setRunning(false);
            countEndRef.current = null;
            accRef.current = 0;
            setDisplayMs(0);
            playEndBeep();
            return;
          }
        }
        step();
      });
    };
    step();
    return () => stopRaf();
  }, [running, mode, stopRaf]);

  const start = () => {
    if (mode === 'countdown') {
      const total = cdHours * 3600000 + cdMinutes * 60000 + cdSeconds * 1000;
      if (total <= 0) return;
      if (!running) {
        if (countEndRef.current == null) {
          const remaining = accRef.current > 0 ? accRef.current : total;
          countEndRef.current = performance.now() + remaining;
        }
      }
    } else {
      if (!running && startWallRef.current == null) {
        startWallRef.current = performance.now();
      }
    }
    setRunning(true);
  };

  const pause = () => {
    if (mode === 'stopwatch' && running && startWallRef.current != null) {
      accRef.current += performance.now() - startWallRef.current;
      startWallRef.current = null;
      setDisplayMs(accRef.current);
    }
    if (mode === 'countdown' && running && countEndRef.current != null) {
      const left = Math.max(0, countEndRef.current - performance.now());
      accRef.current = left;
      setDisplayMs(left);
      countEndRef.current = null;
    }
    setRunning(false);
  };

  const reset = () => {
    stopRaf();
    setRunning(false);
    accRef.current = 0;
    startWallRef.current = null;
    countEndRef.current = null;
    if (mode === 'stopwatch') {
      setDisplayMs(0);
    } else {
      const t = cdHours * 3600000 + cdMinutes * 60000 + cdSeconds * 1000;
      accRef.current = t;
      setDisplayMs(t);
    }
  };

  const onModeChange = (m: TimerMode) => {
    setMode(m);
    setRunning(false);
    stopRaf();
    startWallRef.current = null;
    countEndRef.current = null;
    if (m === 'stopwatch') {
      accRef.current = 0;
      setDisplayMs(0);
    } else {
      const t = cdHours * 3600000 + cdMinutes * 60000 + cdSeconds * 1000;
      accRef.current = t;
      setDisplayMs(t);
    }
  };

  useEffect(() => {
    if (mode !== 'countdown' || runningRef.current) return;
    const t = cdHours * 3600000 + cdMinutes * 60000 + cdSeconds * 1000;
    accRef.current = t;
    setDisplayMs(t);
  }, [cdHours, cdMinutes, cdSeconds, mode]);

  const startRef = useRef(start);
  const pauseRef = useRef(pause);
  startRef.current = start;
  pauseRef.current = pause;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== ' ') return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      if (runningRef.current) pauseRef.current();
      else startRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onEnterFs = () => {
    if (!containerRef.current) return;
    requestFullscreenFor(containerRef.current).catch(() => undefined);
  };

  const onExitFs = () => {
    exitFullscreen().catch(() => undefined);
  };

  const bgPreset = BG_PRESETS.find((b) => b.id === bgId) ?? BG_PRESETS[0]!;
  const isPhoto = Boolean(bgPreset.imageUrl);
  const isCustom = bgId === 'custom';
  const hasCustom = Boolean(customUrl);

  const backgroundStyle: CSSProperties = (() => {
    if (isCustom) {
      if (hasCustom && customUrl) {
        return {
          backgroundColor: '#000',
          backgroundImage: `url(${customUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      return { backgroundColor: '#000' };
    }
    if (isPhoto && bgPreset.imageUrl) {
      return {
        backgroundColor: '#000',
        backgroundImage: `url(${bgPreset.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return bgPreset.style ?? { backgroundColor: '#000' };
  })();

  const onPickBg = (id: string) => {
    setBgId(id);
    if (id === 'custom' && !customUrl) {
      fileInputRef.current?.click();
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (customUrl) URL.revokeObjectURL(customUrl);
    setCustomUrl(URL.createObjectURL(f));
    setBgId('custom');
  };

  useEffect(
    () => () => {
      if (customUrl) URL.revokeObjectURL(customUrl);
    },
    [customUrl],
  );

  const showCentiseconds = mode === 'stopwatch';
  const canStartCountdown = mode === 'countdown' && cdHours + cdMinutes + cdSeconds > 0;

  return (
    <div className="outline-none" tabIndex={-1} role="region" aria-label="Timer display">
      <div
        ref={containerRef}
        className="relative w-full min-h-[min(75dvh,720px)] overflow-hidden rounded-2xl sm:min-h-[min(78dvh,820px)]"
        style={backgroundStyle}
      >
        {(isPhoto || (isCustom && hasCustom)) && (
          <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden />
        )}

        <div className="relative z-10 flex min-h-[min(75dvh,720px)] flex-col sm:min-h-[min(78dvh,820px)]">
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-6">
            <p
              className="font-mono text-[clamp(3rem,14vw,9rem)] font-bold leading-none tracking-tight text-white [text-shadow:0_4px_32px_rgba(0,0,0,0.85)]"
              aria-live="polite"
            >
              {formatDisplay(displayMs, showCentiseconds)}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-2 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {!fullscreenActive ? (
                <button
                  type="button"
                  onClick={onEnterFs}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Icon icon="lucide:maximize" className="h-4 w-4" aria-hidden />
                  Enter fullscreen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onExitFs}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Icon icon="lucide:minimize" className="h-4 w-4" aria-hidden />
                  Exit fullscreen
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (running) pause();
                  else if (mode === 'countdown' && !canStartCountdown) return;
                  else start();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
                disabled={mode === 'countdown' && !running && !canStartCountdown}
              >
                <Icon icon={running ? 'lucide:pause' : 'lucide:play'} className="h-4 w-4" />
                {running ? 'Pause' : 'Start'}
              </button>

              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-black/35"
              >
                <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
                Reset
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:bg-black/35"
                aria-expanded={settingsOpen}
              >
                <Icon icon="lucide:settings" className="h-4 w-4" />
                {settingsOpen ? 'Hide' : 'Options'}
              </button>
            </div>

            {settingsOpen && (
              <div
                className="mx-auto w-full max-w-lg rounded-2xl border border-white/15 bg-black/55 p-3 text-left text-sm text-white/95 shadow-xl backdrop-blur-md sm:p-4"
                role="group"
                aria-label="Timer options"
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="w-full text-xs font-medium text-white/60">Mode</span>
                  <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                    {(['stopwatch', 'countdown'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => onModeChange(m)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium sm:text-sm ${
                          mode === m ? 'bg-white text-black' : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {m === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'countdown' && (
                  <div className="mb-3 flex flex-wrap items-end gap-2">
                    <span className="w-full text-xs font-medium text-white/60">Countdown duration</span>
                    <label className="flex flex-col text-xs text-white/70">
                      Hours
                      <input
                        type="number"
                        min={0}
                        max={99}
                        disabled={running}
                        value={cdHours}
                        onChange={(e) => setCdHours(Math.max(0, Math.min(99, Math.floor(+e.target.value) || 0)))}
                        className="mt-0.5 w-16 rounded border border-white/20 bg-black/30 px-2 py-1 text-sm text-white"
                      />
                    </label>
                    <label className="flex flex-col text-xs text-white/70">
                      Minutes
                      <input
                        type="number"
                        min={0}
                        max={59}
                        disabled={running}
                        value={cdMinutes}
                        onChange={(e) => setCdMinutes(Math.max(0, Math.min(59, Math.floor(+e.target.value) || 0)))}
                        className="mt-0.5 w-16 rounded border border-white/20 bg-black/30 px-2 py-1 text-sm text-white"
                      />
                    </label>
                    <label className="flex flex-col text-xs text-white/70">
                      Seconds
                      <input
                        type="number"
                        min={0}
                        max={59}
                        disabled={running}
                        value={cdSeconds}
                        onChange={(e) => setCdSeconds(Math.max(0, Math.min(59, Math.floor(+e.target.value) || 0)))}
                        className="mt-0.5 w-16 rounded border border-white/20 bg-black/30 px-2 py-1 text-sm text-white"
                      />
                    </label>
                  </div>
                )}

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-white/60">Background</span>
                  <div className="grid max-h-32 grid-cols-2 gap-1.5 overflow-y-auto sm:max-h-40 sm:grid-cols-3">
                    {BG_PRESETS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onPickBg(b.id)}
                        className={`rounded-lg border px-2 py-1.5 text-left text-xs font-medium ${
                          bgId === b.id
                            ? 'border-white bg-white/20'
                            : 'border-white/15 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onFile}
                    aria-label="Upload background image"
                  />
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs text-sky-300 underline hover:text-sky-200"
                    >
                      Choose image file
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-white/50">Space — start / pause (when not typing in a field)</p>
                <p className="mt-2">
                  <Link
                    href="/"
                    className="text-xs font-medium text-sky-300 underline-offset-2 hover:underline"
                  >
                    ← All tools
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
