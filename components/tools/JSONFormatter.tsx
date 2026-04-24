'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';

export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  function tryParse() {
    try { return { ok: true, parsed: JSON.parse(input) }; }
    catch (e) { return { ok: false, err: String(e) }; }
  }

  function format() {
    if (!input.trim()) return;
    const r = tryParse();
    if (r.ok) { setOutput(JSON.stringify(r.parsed, null, indent)); setError(''); setStatus('valid'); }
    else { setError(r.err!); setOutput(''); setStatus('invalid'); }
  }

  function minify() {
    if (!input.trim()) return;
    const r = tryParse();
    if (r.ok) { setOutput(JSON.stringify(r.parsed)); setError(''); setStatus('valid'); }
    else { setError(r.err!); setOutput(''); setStatus('invalid'); }
  }

  function validate() {
    if (!input.trim()) return;
    const r = tryParse();
    if (r.ok) { setError(''); setStatus('valid'); }
    else { setError(r.err!); setStatus('invalid'); }
  }

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function loadSample() {
    setInput(JSON.stringify({ name: 'Webeze', version: '1.0', tools: ['SIP', 'EMI', 'JSON'], free: true, meta: { year: 2024 } }, null, 2));
    setOutput(''); setError(''); setStatus('idle');
  }

  function reset() { setInput(''); setOutput(''); setError(''); setStatus('idle'); }

  const statusLabel = { idle: '', valid: 'Valid JSON', invalid: 'Invalid JSON' }[status];
  const statusClass = { idle: '', valid: 'text-gray-500 dark:text-gray-400', invalid: 'text-red-500' }[status];

  return (
    <CalculatorCard title="JSON Formatter" icon="lucide:braces">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-400">Indent:</span>
          {[2, 4].map((n) => (
            <button key={n} onClick={() => setIndent(n)}
              className={`w-8 h-8 text-sm font-bold rounded-md border transition-all ${
                indent === n
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              }`}>
              {n}
            </button>
          ))}
        </div>

        <button onClick={loadSample}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
          Load Sample
        </button>

        {statusLabel && (
          <span className={`ml-1 text-xs font-semibold ${statusClass} flex items-center gap-1`}>
            <Icon icon={status === 'valid' ? 'lucide:check-circle' : 'lucide:x-circle'} className="w-3.5 h-3.5" />
            {statusLabel}
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={validate}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            Validate
          </button>
          <button onClick={minify}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            Minify
          </button>
          <button onClick={format}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-all">
            Format
          </button>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input</label>
            {input && (
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Clear</button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus('idle'); setError(''); setOutput(''); }}
            rows={14}
            spellCheck={false}
            placeholder={'{\n  "key": "value"\n}'}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-none min-h-[260px] leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</label>
            {output && (
              <button onClick={copyOutput}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border transition-all ${
                  copied
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }`}>
                <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="w-3 h-3" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 min-h-[260px]">
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
              </div>
            </div>
          ) : (
            <textarea
              value={output}
              readOnly
              rows={14}
              placeholder="Formatted output will appear here..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono outline-none py-3.5 px-4 resize-none min-h-[260px] leading-relaxed cursor-default placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          )}
        </div>
      </div>

      {!input && (
        <p className="text-xs text-center text-gray-400 mt-4">
          All processing happens locally in your browser — your data never leaves your device
        </p>
      )}
    </CalculatorCard>
  );
}
