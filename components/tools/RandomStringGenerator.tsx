'use client';

import { useCallback, useMemo, useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const HEX_POOL = '0123456789abcdef';

function removeAmbiguous(pool: string): string {
  return pool
    .split('')
    .filter((c) => !'0O1lI'.includes(c))
    .join('');
}

function randomFrom(pool: string): string {
  if (!pool.length) return '';
  return pool[Math.floor(Math.random() * pool.length)] ?? '';
}

function shuffleString(s: string): string {
  const a = s.split('');
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.join('');
}

type Preset = 'alnum' | 'lower' | 'upper' | 'digits' | 'hex' | 'all';

function toggleBoxClass(active: boolean) {
  return `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
    active
      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
  }`;
}

export default function RandomStringGenerator() {
  const [length, setLength] = useState('16');
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [hexOnly, setHexOnly] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const pools = useMemo(() => {
    let u = UPPER;
    let l = LOWER;
    let d = DIGITS;
    let s = SYMBOLS;
    if (excludeAmbiguous) {
      u = removeAmbiguous(u);
      l = removeAmbiguous(l);
      d = removeAmbiguous(d);
      s = removeAmbiguous(s);
    }
    return { u, l, d, s };
  }, [excludeAmbiguous]);

  const buildFullPool = useCallback(() => {
    let p = '';
    if (useUpper) p += pools.u;
    if (useLower) p += pools.l;
    if (useDigits) p += pools.d;
    if (useSymbols) p += pools.s;
    return p;
  }, [useUpper, useLower, useDigits, useSymbols, pools]);

  const activeSetCount = [useUpper, useLower, useDigits, useSymbols].filter(Boolean).length;

  const applyPreset = (preset: Preset) => {
    setError('');
    setHexOnly(false);
    switch (preset) {
      case 'alnum':
        setUseUpper(true);
        setUseLower(true);
        setUseDigits(true);
        setUseSymbols(false);
        break;
      case 'lower':
        setUseUpper(false);
        setUseLower(true);
        setUseDigits(false);
        setUseSymbols(false);
        break;
      case 'upper':
        setUseUpper(true);
        setUseLower(false);
        setUseDigits(false);
        setUseSymbols(false);
        break;
      case 'digits':
        setUseUpper(false);
        setUseLower(false);
        setUseDigits(true);
        setUseSymbols(false);
        break;
      case 'hex':
        setHexOnly(true);
        setLength('32');
        setExcludeAmbiguous(false);
        setUseUpper(false);
        setUseLower(false);
        setUseDigits(false);
        setUseSymbols(false);
        break;
      case 'all':
        setUseUpper(true);
        setUseLower(true);
        setUseDigits(true);
        setUseSymbols(true);
        break;
      default:
        break;
    }
  };

  const generate = useCallback(() => {
    setError('');
    const n = parseInt(length, 10);
    if (Number.isNaN(n) || n < 1) {
      setError('Length must be at least 1.');
      setOutput('');
      return;
    }
    if (n > 512) {
      setError('Maximum length is 512.');
      setOutput('');
      return;
    }

    if (hexOnly) {
      setOutput(
        Array.from({ length: n }, () => randomFrom(HEX_POOL)).join('')
      );
      return;
    }

    if (activeSetCount === 0) {
      setError('Select at least one character set, or use the Hexadecimal mode.');
      setOutput('');
      return;
    }

    const { u, l, d, s } = pools;
    const parts: string[] = [];
    if (useUpper) parts.push(randomFrom(u));
    if (useLower) parts.push(randomFrom(l));
    if (useDigits) parts.push(randomFrom(d));
    if (useSymbols) parts.push(randomFrom(s));

    if (n < parts.length) {
      setError(`Length must be at least ${parts.length} to include one character from each selected set.`);
      setOutput('');
      return;
    }

    const full = buildFullPool();
    if (!full.length) {
      setError('Character pool is empty. Turn off “exclude ambiguous” or enable another set.');
      setOutput('');
      return;
    }

    for (let i = parts.length; i < n; i += 1) {
      parts.push(randomFrom(full));
    }
    setOutput(shuffleString(parts.join('')));
  }, [
    length,
    hexOnly,
    activeSetCount,
    useUpper,
    useLower,
    useDigits,
    useSymbols,
    pools,
    buildFullPool,
  ]);

  return (
    <CalculatorCard title="Random String Generator" icon="lucide:a-large-small">
      <div className="space-y-5 mb-6">
        <InputField
          label="Length"
          value={length}
          onChange={setLength}
          min={1}
          max={512}
          step={1}
          showSlider
          hint="1–512 characters"
        />

        <label className={toggleBoxClass(hexOnly)}>
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600"
            checked={hexOnly}
            onChange={(e) => {
              setHexOnly(e.target.checked);
              if (e.target.checked) setError('');
            }}
          />
          <span>
            <span className="font-medium text-gray-900 dark:text-white">Hexadecimal only</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Uses 0–9 and a–f only (ignores character set options below).
            </span>
          </span>
        </label>

        <div className={hexOnly ? 'opacity-40 pointer-events-none' : ''}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Character sets</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className={toggleBoxClass(useUpper)}>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                checked={useUpper}
                onChange={(e) => {
                  setUseUpper(e.target.checked);
                  setHexOnly(false);
                }}
              />
              <span>Uppercase (A–Z)</span>
            </label>
            <label className={toggleBoxClass(useLower)}>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                checked={useLower}
                onChange={(e) => {
                  setUseLower(e.target.checked);
                  setHexOnly(false);
                }}
              />
              <span>Lowercase (a–z)</span>
            </label>
            <label className={toggleBoxClass(useDigits)}>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                checked={useDigits}
                onChange={(e) => {
                  setUseDigits(e.target.checked);
                  setHexOnly(false);
                }}
              />
              <span>Numbers (0–9)</span>
            </label>
            <label className={toggleBoxClass(useSymbols)}>
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-600"
                checked={useSymbols}
                onChange={(e) => {
                  setUseSymbols(e.target.checked);
                  setHexOnly(false);
                }}
              />
              <span>Symbols</span>
            </label>
          </div>
        </div>

        <label className={`${toggleBoxClass(excludeAmbiguous)} ${hexOnly ? 'opacity-40 pointer-events-none' : ''}`}>
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-600"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            disabled={hexOnly}
          />
          <span>Exclude ambiguous (0, O, 1, l, I)</span>
        </label>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'alnum' as const, label: 'Alphanumeric' },
                { id: 'lower' as const, label: 'Lowercase only' },
                { id: 'upper' as const, label: 'Uppercase only' },
                { id: 'digits' as const, label: 'Numbers only' },
                { id: 'hex' as const, label: 'Hex string' },
                { id: 'all' as const, label: 'All sets' },
              ]
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        className="w-full py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold"
      >
        Generate
      </button>

      {output && (
        <ResultDisplay className="mt-4" results={[{ label: 'String', value: output, highlight: true }]} />
      )}
    </CalculatorCard>
  );
}
