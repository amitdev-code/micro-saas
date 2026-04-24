'use client';

import { useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';

type Tab = 'format' | 'compare' | 'convert';
type ConvertFormat = 'yaml' | 'xml' | 'csv' | 'ts';
type DiffType = 'added' | 'removed' | 'changed';

interface DiffItem {
  path: string;
  type: DiffType;
  from?: unknown;
  to?: unknown;
}

interface JsonStats {
  keys: number;
  depth: number;
  bytes: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

// ─────────────────── Helpers (pure) ───────────────────

function tryParse(str: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

function computeStats(obj: unknown, json: string): JsonStats {
  let keys = 0, depth = 0, arrays = 0, objects = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0;

  function walk(v: unknown, d: number) {
    if (d > depth) depth = d;
    if (v === null) { nulls++; return; }
    if (Array.isArray(v)) {
      arrays++;
      v.forEach((item) => walk(item, d + 1));
      return;
    }
    switch (typeof v) {
      case 'object':
        objects++;
        Object.entries(v as Record<string, unknown>).forEach(([, val]) => {
          keys++;
          walk(val, d + 1);
        });
        return;
      case 'string': strings++; return;
      case 'number': numbers++; return;
      case 'boolean': booleans++; return;
    }
  }
  walk(obj, 0);

  return {
    keys, depth, arrays, objects, strings, numbers, booleans, nulls,
    bytes: new Blob([json]).size,
  };
}

function diffJson(a: unknown, b: unknown, path = ''): DiffItem[] {
  const out: DiffItem[] = [];

  if (a === b) return out;

  const isObjA = a !== null && typeof a === 'object' && !Array.isArray(a);
  const isObjB = b !== null && typeof b === 'object' && !Array.isArray(b);
  const isArrA = Array.isArray(a);
  const isArrB = Array.isArray(b);

  if (isObjA && isObjB) {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    const all = Array.from(new Set(ka.concat(kb)));
    for (const k of all) {
      const p = path ? `${path}.${k}` : k;
      const av = (a as Record<string, unknown>)[k];
      const bv = (b as Record<string, unknown>)[k];
      if (!(k in (a as object))) out.push({ path: p, type: 'added', to: bv });
      else if (!(k in (b as object))) out.push({ path: p, type: 'removed', from: av });
      else out.push(...diffJson(av, bv, p));
    }
    return out;
  }

  if (isArrA && isArrB) {
    const maxLen = Math.max((a as unknown[]).length, (b as unknown[]).length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`;
      if (i >= (a as unknown[]).length) out.push({ path: p, type: 'added', to: (b as unknown[])[i] });
      else if (i >= (b as unknown[]).length) out.push({ path: p, type: 'removed', from: (a as unknown[])[i] });
      else out.push(...diffJson((a as unknown[])[i], (b as unknown[])[i], p));
    }
    return out;
  }

  out.push({ path: path || '(root)', type: 'changed', from: a, to: b });
  return out;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] || c
  ));
}

function jsonToXml(obj: unknown, key = 'root', indent = ''): string {
  const tag = key.replace(/[^\w-]/g, '_');
  if (obj === null) return `${indent}<${tag} />`;
  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, tag, indent)).join('\n');
  }
  if (typeof obj === 'object') {
    const inner = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => jsonToXml(v, k, indent + '  '))
      .join('\n');
    return `${indent}<${tag}>\n${inner}\n${indent}</${tag}>`;
  }
  return `${indent}<${tag}>${escapeXml(String(obj))}</${tag}>`;
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'string') {
    return /[:#\n\-]/.test(obj) ? JSON.stringify(obj) : obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map((item) => {
      const val = jsonToYaml(item, indent + 1);
      return `${pad}- ${val.startsWith(' ') ? val.trimStart() : val}`;
    }).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([k, v]) => {
      const val = jsonToYaml(v, indent + 1);
      const isContainer = (v !== null && typeof v === 'object');
      return isContainer ? `${pad}${k}:\n${val}` : `${pad}${k}: ${val}`;
    }).join('\n');
  }
  return String(obj);
}

function jsonToCsv(obj: unknown): string {
  if (!Array.isArray(obj) || obj.length === 0) {
    throw new Error('CSV conversion requires a non-empty array of objects');
  }
  const rows = obj.filter((r) => r !== null && typeof r === 'object' && !Array.isArray(r)) as Record<string, unknown>[];
  if (rows.length === 0) throw new Error('CSV conversion requires objects inside the array');

  const headers = Array.from(rows.reduce<Set<string>>((acc, r) => {
    Object.keys(r).forEach((k) => acc.add(k));
    return acc;
  }, new Set()));

  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(',')).join('\n');
  return `${headers.join(',')}\n${body}`;
}

function jsonToTs(obj: unknown, interfaceName = 'Root'): string {
  const interfaces: string[] = [];
  const seen = new Map<string, string>();

  function tsType(v: unknown, hintName: string): string {
    if (v === null) return 'null';
    if (Array.isArray(v)) {
      if (v.length === 0) return 'unknown[]';
      const types = Array.from(new Set(v.map((item) => tsType(item, hintName))));
      return types.length === 1 ? `${types[0]}[]` : `(${types.join(' | ')})[]`;
    }
    if (typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>);
      const body = entries.map(([k, val]) => {
        const safeKey = /^[A-Za-z_$][\w$]*$/.test(k) ? k : `"${k}"`;
        const childName = capitalize(k);
        return `  ${safeKey}: ${tsType(val, childName)};`;
      }).join('\n');
      const shape = `{\n${body}\n}`;
      const existing = seen.get(shape);
      if (existing) return existing;
      const name = uniqueName(hintName, seen);
      seen.set(shape, name);
      interfaces.push(`export interface ${name} ${shape}`);
      return name;
    }
    return typeof v;
  }

  function capitalize(s: string) { return s.replace(/[^A-Za-z0-9]/g, '').replace(/^./, (c) => c.toUpperCase()) || 'Item'; }
  function uniqueName(base: string, map: Map<string, string>) {
    const existing = new Set(map.values());
    let n = base, i = 2;
    while (existing.has(n)) n = `${base}${i++}`;
    return n;
  }

  tsType(obj, interfaceName);
  return interfaces.reverse().join('\n\n');
}

function formatValue(v: unknown): string {
  if (v === undefined) return 'undefined';
  try { return JSON.stringify(v); } catch { return String(v); }
}

// ─────────────────── Component ───────────────────

export default function JSONFormatter() {
  const [tab, setTab] = useState<Tab>('format');

  // Format tab
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Compare tab
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [compareError, setCompareError] = useState('');
  const [diff, setDiff] = useState<DiffItem[] | null>(null);

  // Convert tab
  const [convertInput, setConvertInput] = useState('');
  const [convertOutput, setConvertOutput] = useState('');
  const [convertError, setConvertError] = useState('');
  const [convertFormat, setConvertFormat] = useState<ConvertFormat>('yaml');

  // Shared UI
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'input' | 'inputA' | 'inputB' | 'convertInput'>('input');

  // ── Derived stats (for format tab, when valid)
  const stats: JsonStats | null = useMemo(() => {
    if (!output || status !== 'valid') return null;
    const r = tryParse(output);
    return r.ok ? computeStats(r.value, output) : null;
  }, [output, status]);

  // ─────── Format actions ───────
  function runFormat() {
    if (!input.trim()) return;
    const r = tryParse(input);
    if (r.ok) {
      setOutput(JSON.stringify(r.value, null, indent));
      setError('');
      setStatus('valid');
    } else {
      setError(r.error);
      setOutput('');
      setStatus('invalid');
    }
  }

  function runMinify() {
    if (!input.trim()) return;
    const r = tryParse(input);
    if (r.ok) {
      setOutput(JSON.stringify(r.value));
      setError('');
      setStatus('valid');
    } else {
      setError(r.error);
      setOutput('');
      setStatus('invalid');
    }
  }

  function runValidate() {
    if (!input.trim()) return;
    const r = tryParse(input);
    if (r.ok) { setError(''); setStatus('valid'); setOutput(JSON.stringify(r.value, null, indent)); }
    else { setError(r.error); setStatus('invalid'); }
  }

  function runSortKeys() {
    if (!input.trim()) return;
    const r = tryParse(input);
    if (r.ok) {
      const sorted = sortKeysDeep(r.value);
      setOutput(JSON.stringify(sorted, null, indent));
      setError('');
      setStatus('valid');
    } else {
      setError(r.error);
      setStatus('invalid');
    }
  }

  function runEscape() {
    if (!input.trim()) return;
    setOutput(JSON.stringify(input));
    setError('');
    setStatus('valid');
  }

  function runUnescape() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed !== 'string') throw new Error('Input must be a JSON string to unescape');
      setOutput(parsed);
      setError('');
      setStatus('valid');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('invalid');
    }
  }

  // ─────── Compare actions ───────
  function runCompare() {
    if (!inputA.trim() || !inputB.trim()) {
      setCompareError('Provide JSON in both panels to compare');
      setDiff(null);
      return;
    }
    const ra = tryParse(inputA);
    const rb = tryParse(inputB);
    if (!ra.ok) { setCompareError(`Left JSON: ${ra.error}`); setDiff(null); return; }
    if (!rb.ok) { setCompareError(`Right JSON: ${rb.error}`); setDiff(null); return; }
    setCompareError('');
    setDiff(diffJson(ra.value, rb.value));
  }

  // ─────── Convert actions ───────
  function runConvert() {
    if (!convertInput.trim()) return;
    const r = tryParse(convertInput);
    if (!r.ok) { setConvertError(r.error); setConvertOutput(''); return; }
    try {
      let result = '';
      if (convertFormat === 'yaml') result = jsonToYaml(r.value);
      if (convertFormat === 'xml') result = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(r.value)}`;
      if (convertFormat === 'csv') result = jsonToCsv(r.value);
      if (convertFormat === 'ts') result = jsonToTs(r.value);
      setConvertOutput(result);
      setConvertError('');
    } catch (e) {
      setConvertError(e instanceof Error ? e.message : String(e));
      setConvertOutput('');
    }
  }

  // ─────── Shared actions ───────
  async function copy(text: string, key: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  function download(text: string, filename: string) {
    if (!text) return;
    const blob = new Blob([text], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerUpload(target: typeof uploadTarget) {
    setUploadTarget(target);
    fileInputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      if (uploadTarget === 'input') setInput(text);
      if (uploadTarget === 'inputA') setInputA(text);
      if (uploadTarget === 'inputB') setInputB(text);
      if (uploadTarget === 'convertInput') setConvertInput(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function loadSample(target: 'input' | 'inputA' | 'inputB' | 'convertInput') {
    const sampleA = {
      name: 'Webeze',
      version: '1.0.0',
      tools: [
        { slug: 'sip-calculator', category: 'Finance' },
        { slug: 'json-formatter', category: 'Text' },
      ],
      free: true,
      meta: { year: 2026, team: 'Webeze' },
    };
    const sampleB = {
      name: 'Webeze',
      version: '1.1.0',
      tools: [
        { slug: 'sip-calculator', category: 'Finance' },
        { slug: 'json-formatter', category: 'Developer' },
        { slug: 'yaml-formatter', category: 'Developer' },
      ],
      free: true,
      meta: { year: 2026, team: 'Webeze', license: 'MIT' },
    };
    const text = (t: string) => (t === 'inputB' ? JSON.stringify(sampleB, null, 2) : JSON.stringify(sampleA, null, 2));
    if (target === 'input') { setInput(text('input')); setOutput(''); setError(''); setStatus('idle'); }
    if (target === 'inputA') setInputA(text('inputA'));
    if (target === 'inputB') setInputB(text('inputB'));
    if (target === 'convertInput') { setConvertInput(text('convertInput')); setConvertOutput(''); setConvertError(''); }
  }

  function resetFormat() {
    setInput(''); setOutput(''); setError(''); setStatus('idle');
  }
  function resetCompare() {
    setInputA(''); setInputB(''); setDiff(null); setCompareError('');
  }
  function resetConvert() {
    setConvertInput(''); setConvertOutput(''); setConvertError('');
  }

  const diffSummary = useMemo(() => {
    if (!diff) return null;
    const counts = { added: 0, removed: 0, changed: 0 };
    diff.forEach((d) => counts[d.type]++);
    return counts;
  }, [diff]);

  // ─────── UI ───────
  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
      tab === t
        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  const iconBtn =
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all';

  const primaryBtn =
    'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-all';

  return (
    <CalculatorCard title="JSON Formatter" icon="lucide:braces">
      <input ref={fileInputRef} type="file" accept=".json,application/json,text/plain" onChange={handleFile} className="hidden" />

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button onClick={() => setTab('format')} className={tabClass('format')}>
          <Icon icon="lucide:align-left" className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
          Format
        </button>
        <button onClick={() => setTab('compare')} className={tabClass('compare')}>
          <Icon icon="lucide:git-compare" className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
          Compare
        </button>
        <button onClick={() => setTab('convert')} className={tabClass('convert')}>
          <Icon icon="lucide:arrow-right-left" className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
          Convert
        </button>
      </div>

      {/* ══════════════ FORMAT TAB ══════════════ */}
      {tab === 'format' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-400">Indent</span>
              {[2, 4].map((n) => (
                <button key={n} onClick={() => setIndent(n)}
                  className={`w-8 h-8 text-xs font-bold rounded-md border transition-all ${
                    indent === n
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}>
                  {n}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <button onClick={runSortKeys} className={iconBtn} title="Sort object keys alphabetically">
              <Icon icon="lucide:arrow-down-a-z" className="w-3.5 h-3.5" /> Sort Keys
            </button>
            <button onClick={runEscape} className={iconBtn} title="Escape as JSON string">
              <Icon icon="lucide:quote" className="w-3.5 h-3.5" /> Escape
            </button>
            <button onClick={runUnescape} className={iconBtn} title="Unescape a JSON string">
              <Icon icon="lucide:text-quote" className="w-3.5 h-3.5" /> Unescape
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <button onClick={() => triggerUpload('input')} className={iconBtn}>
              <Icon icon="lucide:upload" className="w-3.5 h-3.5" /> Upload
            </button>
            <button onClick={() => loadSample('input')} className={iconBtn}>
              <Icon icon="lucide:file-code" className="w-3.5 h-3.5" /> Sample
            </button>
            {input && (
              <button onClick={resetFormat} className={iconBtn}>
                <Icon icon="lucide:x" className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button onClick={runValidate} className={iconBtn}>
                <Icon icon="lucide:shield-check" className="w-3.5 h-3.5" /> Validate
              </button>
              <button onClick={runMinify} className={iconBtn}>
                <Icon icon="lucide:minimize-2" className="w-3.5 h-3.5" /> Minify
              </button>
              <button onClick={runFormat} className={primaryBtn}>
                <Icon icon="lucide:wand-sparkles" className="w-3.5 h-3.5" /> Format
              </button>
            </div>
          </div>

          {/* Editors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input JSON</label>
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setStatus('idle'); setError(''); }}
                spellCheck={false}
                placeholder={'{\n  "key": "value"\n}'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-y h-[560px] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</label>
                {output && (
                  <div className="flex gap-1.5">
                    <button onClick={() => download(output, 'output.json')} className={iconBtn}>
                      <Icon icon="lucide:download" className="w-3 h-3" /> Download
                    </button>
                    <button onClick={() => copy(output, 'format')} className={iconBtn}>
                      <Icon icon={copied === 'format' ? 'lucide:check' : 'lucide:copy'} className="w-3 h-3" />
                      {copied === 'format' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              {error ? (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 h-[560px] overflow-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Parse Error</p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all leading-relaxed">{error}</p>
                  <div className="mt-5 pt-4 border-t border-red-100 dark:border-red-900 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Common fixes:</p>
                    <p>&middot; Use double quotes for all keys and string values</p>
                    <p>&middot; Remove trailing commas after the last item</p>
                    <p>&middot; Replace undefined / NaN with null</p>
                    <p>&middot; Wrap property names in double quotes</p>
                  </div>
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder="Formatted output will appear here..."
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono outline-none py-3.5 px-4 resize-y h-[560px] leading-relaxed cursor-default placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <Icon
                icon={status === 'valid' ? 'lucide:check-circle' : status === 'invalid' ? 'lucide:x-circle' : 'lucide:circle-dashed'}
                className={`w-4 h-4 ${status === 'valid' ? 'text-green-500' : status === 'invalid' ? 'text-red-500' : 'text-gray-400'}`}
              />
              <span className={`font-semibold ${status === 'valid' ? 'text-green-600 dark:text-green-400' : status === 'invalid' ? 'text-red-500' : 'text-gray-400'}`}>
                {status === 'valid' ? 'Valid JSON' : status === 'invalid' ? 'Invalid JSON' : 'Awaiting input'}
              </span>
            </div>

            {stats && (
              <>
                <StatPill label="Keys" value={stats.keys} />
                <StatPill label="Depth" value={stats.depth} />
                <StatPill label="Size" value={`${stats.bytes.toLocaleString()} B`} />
                <StatPill label="Arrays" value={stats.arrays} />
                <StatPill label="Objects" value={stats.objects} />
                <StatPill label="Strings" value={stats.strings} />
                <StatPill label="Numbers" value={stats.numbers} />
                <StatPill label="Booleans" value={stats.booleans} />
                <StatPill label="Nulls" value={stats.nulls} />
              </>
            )}
          </div>
        </>
      )}

      {/* ══════════════ COMPARE TAB ══════════════ */}
      {tab === 'compare' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button onClick={() => triggerUpload('inputA')} className={iconBtn}>
              <Icon icon="lucide:upload" className="w-3.5 h-3.5" /> Upload A
            </button>
            <button onClick={() => triggerUpload('inputB')} className={iconBtn}>
              <Icon icon="lucide:upload" className="w-3.5 h-3.5" /> Upload B
            </button>
            <button onClick={() => { loadSample('inputA'); loadSample('inputB'); }} className={iconBtn}>
              <Icon icon="lucide:file-code" className="w-3.5 h-3.5" /> Load Samples
            </button>
            {(inputA || inputB) && (
              <button onClick={resetCompare} className={iconBtn}>
                <Icon icon="lucide:x" className="w-3.5 h-3.5" /> Clear All
              </button>
            )}

            <div className="ml-auto">
              <button onClick={runCompare} className={primaryBtn}>
                <Icon icon="lucide:git-compare" className="w-3.5 h-3.5" /> Compare
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">JSON A (original)</label>
              <textarea
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
                spellCheck={false}
                placeholder={'Paste the original JSON here...'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-y h-[480px] leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">JSON B (compared)</label>
              <textarea
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
                spellCheck={false}
                placeholder={'Paste the JSON to compare against...'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-y h-[480px] leading-relaxed"
              />
            </div>
          </div>

          {/* Diff results */}
          <div className="mt-5">
            {compareError && (
              <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 flex items-center gap-2">
                <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{compareError}</p>
              </div>
            )}

            {diff && !compareError && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs">
                  {diff.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                      <Icon icon="lucide:check-circle-2" className="w-4 h-4" />
                      Both JSONs are identical
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-500 dark:text-gray-400">
                        {diff.length} difference{diff.length === 1 ? '' : 's'}
                      </span>
                      {diffSummary && (
                        <div className="flex gap-3">
                          <span className="text-green-600 dark:text-green-400">+{diffSummary.added} added</span>
                          <span className="text-red-600 dark:text-red-400">−{diffSummary.removed} removed</span>
                          <span className="text-amber-600 dark:text-amber-400">~{diffSummary.changed} changed</span>
                        </div>
                      )}
                      <button
                        onClick={() => copy(diff.map((d) => `${d.type === 'added' ? '+' : d.type === 'removed' ? '-' : '~'} ${d.path}`).join('\n'), 'diff')}
                        className={`${iconBtn} ml-auto`}
                      >
                        <Icon icon={copied === 'diff' ? 'lucide:check' : 'lucide:copy'} className="w-3 h-3" />
                        {copied === 'diff' ? 'Copied' : 'Copy Diff'}
                      </button>
                    </>
                  )}
                </div>

                {diff.length > 0 && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-auto">
                    {diff.map((d, i) => (
                      <DiffRow key={i} item={d} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {!diff && !compareError && (
              <div className="text-center py-8 text-sm text-gray-400">
                Paste or upload two JSONs above, then press <span className="font-semibold text-gray-600 dark:text-gray-300">Compare</span> to see the diff.
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ CONVERT TAB ══════════════ */}
      {tab === 'convert' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-400">Format</span>
              {(['yaml', 'xml', 'csv', 'ts'] as ConvertFormat[]).map((f) => (
                <button key={f} onClick={() => setConvertFormat(f)}
                  className={`px-3 h-8 text-xs font-bold rounded-md border uppercase transition-all ${
                    convertFormat === f
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <button onClick={() => triggerUpload('convertInput')} className={iconBtn}>
              <Icon icon="lucide:upload" className="w-3.5 h-3.5" /> Upload
            </button>
            <button onClick={() => loadSample('convertInput')} className={iconBtn}>
              <Icon icon="lucide:file-code" className="w-3.5 h-3.5" /> Sample
            </button>
            {convertInput && (
              <button onClick={resetConvert} className={iconBtn}>
                <Icon icon="lucide:x" className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <div className="ml-auto">
              <button onClick={runConvert} className={primaryBtn}>
                <Icon icon="lucide:arrow-right-left" className="w-3.5 h-3.5" /> Convert
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input JSON</label>
              <textarea
                value={convertInput}
                onChange={(e) => setConvertInput(e.target.value)}
                spellCheck={false}
                placeholder={'{\n  "example": "Paste JSON to convert..."\n}'}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-y h-[560px] leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Output ({convertFormat.toUpperCase()})
                </label>
                {convertOutput && (
                  <div className="flex gap-1.5">
                    <button onClick={() => download(convertOutput, `output.${convertFormat === 'ts' ? 'ts' : convertFormat}`)} className={iconBtn}>
                      <Icon icon="lucide:download" className="w-3 h-3" /> Download
                    </button>
                    <button onClick={() => copy(convertOutput, 'convert')} className={iconBtn}>
                      <Icon icon={copied === 'convert' ? 'lucide:check' : 'lucide:copy'} className="w-3 h-3" />
                      {copied === 'convert' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              {convertError ? (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 h-[560px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">Conversion Error</p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all leading-relaxed">{convertError}</p>
                </div>
              ) : (
                <textarea
                  value={convertOutput}
                  readOnly
                  placeholder={`Converted ${convertFormat.toUpperCase()} output will appear here...`}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono outline-none py-3.5 px-4 resize-y h-[560px] leading-relaxed cursor-default placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            {convertFormat === 'csv' && 'CSV export requires an array of flat objects (rows).'}
            {convertFormat === 'ts' && 'Generates TypeScript interfaces matching the JSON structure.'}
            {convertFormat === 'yaml' && 'Produces standard YAML — compatible with most YAML parsers.'}
            {convertFormat === 'xml' && 'Produces well-formed XML with the JSON as child elements.'}
          </p>
        </>
      )}

      <p className="text-xs text-center text-gray-400 mt-6">
        All processing happens locally in your browser — your data never leaves your device.
      </p>
    </CalculatorCard>
  );
}

// ─────── Sub components ───────

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function DiffRow({ item }: { item: DiffItem }) {
  const color =
    item.type === 'added'
      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-l-green-500'
      : item.type === 'removed'
      ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-l-red-500'
      : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-l-amber-500';

  const sigil = item.type === 'added' ? '+' : item.type === 'removed' ? '−' : '~';

  return (
    <div className={`${color} border-l-4 px-4 py-2.5 text-xs font-mono flex items-start gap-3`}>
      <span className="font-bold w-4 shrink-0 text-center">{sigil}</span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold break-all">{item.path}</div>
        {item.type === 'changed' && (
          <div className="mt-1 text-gray-600 dark:text-gray-400 break-all">
            <span className="text-red-600 dark:text-red-400 line-through">{formatValue(item.from)}</span>
            <span className="mx-2 text-gray-400">→</span>
            <span className="text-green-600 dark:text-green-400">{formatValue(item.to)}</span>
          </div>
        )}
        {item.type === 'added' && (
          <div className="mt-1 text-gray-600 dark:text-gray-400 break-all">{formatValue(item.to)}</div>
        )}
        {item.type === 'removed' && (
          <div className="mt-1 text-gray-600 dark:text-gray-400 break-all">{formatValue(item.from)}</div>
        )}
      </div>
    </div>
  );
}
