'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

const PRESETS: { id: string; label: string; text: string }[] = [
  {
    id: 'short',
    label: 'Short',
    text: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'medium',
    label: 'Medium',
    text: 'Speed and accuracy matter in the digital age. Practice daily, focus on rhythm, and let muscle memory guide your fingers across the keyboard without looking down.',
  },
  {
    id: 'long',
    label: 'Long',
    text: 'Typing is a fundamental skill for students, developers, writers, and professionals. A comfortable layout, consistent practice, and mindful error correction help you build reliable words per minute while keeping fatigue low. This test runs entirely in your browser—your text never leaves your device.',
  },
  {
    id: 'code',
    label: 'Code',
    text: "const sum = (a: number, b: number) => a + b;\nexport async function fetchData(url: string) {\n  const res = await fetch(url);\n  return res.json();\n}",
  },
];

/** Twenty varied paragraphs for the Random passage button (short and longer mixes). */
const RANDOM_PASSAGES: string[] = [
  'Morning light spilled across the desk. Coffee cooled in the cup while the city woke outside the window, one siren at a time.',
  'Libraries reward patience. Shelves hold more stories than one life can read, yet every visitor leaves with a single new idea worth keeping.',
  'The mountain trail turned steeper after noon. Rest stops mattered as much as speed; the view from the ridge paid back every hard breath.',
  'Children learn by imitation long before they understand rules. A calm voice in the room matters more than the perfect answer on the first try.',
  'Budget spreadsheets do not make dreams come true, but they show which tradeoffs are real. That clarity is often enough to start.',
  'Old maps charm us because they are wrong on purpose, compressed for a traveler’s hand. The coastline was never that smooth in reality.',
  'Ships use stars when electronics fail. Skills outlive gadgets, and humility keeps a crew listening when the horizon lies.',
  'A recipe is a small contract between cook and table. Change one line and you have signed a new agreement with the people you feed.',
  'Rain on a tent roof is either music or menace, depending on whether you are dry. Pack for both interpretations when you go outdoors.',
  'Cities are argument machines. Every crosswalk and zoning law is a paragraph in a long essay about who gets to stand still and who must move.',
  'Music practice is not repetition until boredom. It is repetition until the mistake you fear becomes the neighbor you understand.',
  'Good feedback names behavior, not character. "This draft wanders" helps; "you are unfocused" often ends a conversation that needed to continue.',
  'Markets price fear faster than they price hope. A patient investor is someone who can read a headline without flinching at every line.',
  'A broken pencil still marks the page if you press hard enough. Tools matter, but stubbornness in small doses has its uses.',
  'Travel teaches that politeness and kindness are not the same. One is costume; the other is work that does not need an audience.',
  'Physics jokes rely on delivery timing like punchlines in a dark room. If nobody laughs, check whether the room shares your unit system.',
  'Winter gardens look empty only if you forget what sleeps underground. The honest season is the one that refuses to perform on demand.',
  'Writing first drafts is allowed to be untidy. Revision is where you become the kind of person who can stand behind a sentence in public.',
  'Small businesses survive on memory as much as margin. A customer’s name, remembered without being asked, is a kind of interest payment.',
  'The night bus carries tired victories and soft defeats in equal measure. Strangers share armrests and the quiet agreement to arrive without drama.',
];

function pickRandomPassage(exclude?: string): string {
  if (RANDOM_PASSAGES.length === 0) return '';
  if (RANDOM_PASSAGES.length === 1) return RANDOM_PASSAGES[0];
  let pick = RANDOM_PASSAGES[Math.floor(Math.random() * RANDOM_PASSAGES.length)];
  if (exclude) {
    let guard = 0;
    while (pick === exclude && guard < 32) {
      pick = RANDOM_PASSAGES[Math.floor(Math.random() * RANDOM_PASSAGES.length)];
      guard += 1;
    }
  }
  return pick;
}

function countCorrect(typed: string, target: string): number {
  let n = 0;
  const len = Math.min(typed.length, target.length);
  for (let i = 0; i < len; i += 1) {
    if (typed[i] === target[i]) n += 1;
  }
  return n;
}

export default function TypingSpeedTest() {
  const [presetId, setPresetId] = useState(PRESETS[1].id);
  const [target, setTarget] = useState(PRESETS[1].text);
  const [typed, setTyped] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const [customError, setCustomError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const finished = target.length > 0 && typed.length >= target.length;

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt, finishedAt]);

  useEffect(() => {
    if (finished && !finishedAt && startedAt) {
      setFinishedAt(Date.now());
    }
  }, [finished, finishedAt, startedAt]);

  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0;
    const end = finishedAt ?? now;
    return Math.max(0, end - startedAt);
  }, [startedAt, finishedAt, now]);

  const elapsedMin = elapsedMs / 60000;

  const correct = useMemo(() => countCorrect(typed, target), [typed, target]);
  const errors = Math.max(0, typed.length - correct);
  const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 1000) / 10 : 100;
  const netWpm =
    elapsedMin > 0 && startedAt ? Math.round((correct / 5) / elapsedMin) : 0;
  const grossWpm =
    elapsedMin > 0 && startedAt ? Math.round((typed.length / 5) / elapsedMin) : 0;

  const reset = useCallback(() => {
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setCustomError('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const applyPreset = useCallback((p: (typeof PRESETS)[number]) => {
    setPresetId(p.id);
    setTarget(p.text);
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setCustomError('');
    setCustomOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const applyCustom = useCallback(() => {
    const t = customDraft.trim();
    if (t.length < 12) {
      setCustomError('Use at least 12 characters for a fair test.');
      return;
    }
    if (t.length > 4000) {
      setCustomError('Maximum length is 4000 characters.');
      return;
    }
    setCustomError('');
    setPresetId('custom');
    setTarget(t);
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setCustomOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [customDraft]);

  const applyRandom = useCallback(() => {
    setPresetId('random');
    setTarget(pickRandomPassage(target));
    setTyped('');
    setStartedAt(null);
    setFinishedAt(null);
    setCustomError('');
    setCustomOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [target]);

  const onInputChange = useCallback(
    (v: string) => {
      if (v.length > target.length) return;
      setTyped(v);
      if (!startedAt && v.length > 0) {
        setStartedAt(Date.now());
        setFinishedAt(null);
      }
    },
    [target.length, startedAt]
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 text-gray-100 shadow-2xl ring-1 ring-white/5 min-h-[min(80vh,920px)] flex flex-col"
        role="region"
        aria-label="Typing speed test. Press Tab to reach controls, or click the passage area to type."
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col flex-1 p-5 sm:p-8 lg:p-10">
          {/* Controls — must stay above the invisible input */}
          <div className="relative z-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Passage</p>
              <h2 className="text-lg font-bold text-white mt-0.5">Choose or write your text</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    presetId === p.id
                      ? 'bg-white text-gray-950 border-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={applyRandom}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  presetId === 'random'
                    ? 'bg-white text-gray-950 border-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
                }`}
                title="Pick one of 20 random paragraphs"
              >
                <Icon icon="lucide:shuffle" className="w-3.5 h-3.5" />
                Random
              </button>
              <button
                type="button"
                onClick={() => setCustomOpen((o) => !o)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  presetId === 'custom'
                    ? 'bg-white text-gray-950 border-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon icon="lucide:pen-line" className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>
          </div>

          {customOpen && (
            <div className="relative z-20 mb-6 rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <label className="text-xs font-medium text-gray-400" htmlFor="custom-passage">
                Your text
              </label>
              <textarea
                id="custom-passage"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                placeholder="Write or paste a paragraph (12–4000 characters)…"
                rows={5}
                className="w-full rounded-lg border border-white/15 bg-gray-900/80 px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              {customError && <p className="text-sm text-red-400">{customError}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyCustom}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-200 transition-colors"
                >
                  Use this text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpen(false);
                    setCustomError('');
                  }}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="relative z-20 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {(
              [
                { label: 'WPM (net)', value: String(netWpm), accent: true },
                { label: 'Accuracy', value: `${accuracy}%`, accent: false },
                {
                  label: 'Time',
                  value: startedAt ? `${(elapsedMs / 1000).toFixed(1)}s` : '—',
                  accent: false,
                },
                { label: 'Errors', value: String(errors), accent: false },
              ] as { label: string; value: string; accent: boolean }[]
            ).map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border px-3 py-3 sm:px-4 ${
                  s.accent
                    ? 'border-white/25 bg-white text-gray-950'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    s.accent ? 'text-gray-600' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-xl sm:text-2xl font-black tabular-nums mt-0.5 ${
                    s.accent ? 'text-gray-950' : 'text-white'
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Passage: pointer-events none so the layer below receives typing */}
          <div className="relative z-10 flex-1 min-h-[14rem]">
            <div
              className="pointer-events-none font-mono text-lg sm:text-xl md:text-2xl leading-[1.75] sm:leading-[1.8] text-left"
              aria-hidden
            >
              <p className="whitespace-pre-wrap break-words">
                {Array.from(target).map((ch, i) => {
                  const isTyped = i < typed.length;
                  const isCorrect = isTyped && typed[i] === ch;
                  const showCaret = i === typed.length && !finished;
                  const charStyle = isTyped
                    ? isCorrect
                      ? 'text-emerald-400 bg-emerald-500/10 rounded-sm px-0.5'
                      : 'text-red-400 bg-red-500/15 rounded-sm px-0.5 line-through decoration-red-500/50'
                    : 'text-gray-500';

                  if (ch === '\n') {
                    return (
                      <span key={i} className="relative">
                        {showCaret && (
                          <span className="inline-block w-0.5 h-[1.1em] align-middle bg-white animate-pulse ml-0.5 mr-0.5 -mb-0.5" />
                        )}
                        <span className={charStyle}>
                          <span className="text-gray-600" aria-label="line break">
                            ↵
                          </span>
                          {'\n'}
                        </span>
                      </span>
                    );
                  }

                  return (
                    <span key={i} className="relative">
                      {showCaret && (
                        <span className="inline-block w-0.5 h-[1.1em] align-middle bg-white animate-pulse ml-0.5 mr-0.5 -mb-0.5" />
                      )}
                      <span className={charStyle}>
                        {ch === ' ' ? (
                          <span className="inline-block min-w-[0.35em] border-b border-dashed border-white/20">
                            &nbsp;
                          </span>
                        ) : (
                          ch
                        )}
                      </span>
                    </span>
                  );
                })}
              </p>
            </div>

            <label htmlFor="typing-capture" className="sr-only">
              Type the passage. Keystrokes are captured in this field.
            </label>
            <textarea
              id="typing-capture"
              ref={inputRef}
              value={typed}
              onChange={(e) => onInputChange(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              readOnly={customOpen}
              tabIndex={customOpen ? -1 : 0}
              className="absolute inset-0 z-30 w-full h-full min-h-[14rem] cursor-text bg-transparent text-transparent caret-transparent resize-none focus:outline-none focus:ring-0 border-0 p-0"
              style={{ pointerEvents: customOpen ? 'none' : 'auto' }}
              rows={1}
            />
          </div>

          {finished && (
            <p
              className="relative z-20 mt-6 text-center text-sm font-medium text-emerald-400/90"
              role="status"
            >
              <Icon icon="lucide:check-circle" className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Passage complete — {netWpm} WPM net · {grossWpm} WPM gross
            </p>
          )}

          <div className="relative z-20 mt-auto pt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <p className="text-xs text-gray-500 max-w-prose">
              <span className="text-emerald-400">Green</span> = correct,{' '}
              <span className="text-red-400">red</span> = typo. Pasting is disabled. Use the Reset button to start
              over.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
