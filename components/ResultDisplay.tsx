'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';

export interface ResultItem {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
}

interface ResultDisplayProps {
  results: ResultItem[];
  copyText?: string;
  /** e.g. mt-4 when placed after a primary action */
  className?: string;
}

/**
 * Long multiline or JSON result: same "Result" header + copy as {@link ResultDisplay}, scrollable body (not a textarea).
 */
export function ResultScrollableText({
  value,
  variant = 'pre',
  maxHeightClass = 'max-h-96',
  className = '',
}: {
  value: string;
  variant?: 'pre' | 'plain';
  maxHeightClass?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 ${className}`.trim()}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="w-3.5 h-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div
        className={`${maxHeightClass} overflow-y-auto overscroll-y-contain px-4 py-3 bg-white dark:bg-gray-900 [scrollbar-gutter:stable]`}
      >
        {variant === 'pre' ? (
          <pre className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
            {value}
          </pre>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function ResultDisplay({ results, copyText, className: outerClassName }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    // Copy only raw result values to avoid extra descriptive text.
    const text = results.map((r) => r.value).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${outerClassName || ''}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="w-3.5 h-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Results */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {results.map((item, i) =>
          item.highlight ? (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-4 bg-gray-950 dark:bg-white min-w-0">
              <span className="text-sm font-medium text-white/70 dark:text-gray-500 shrink-0 max-w-[40%]">
                {item.label}
              </span>
              <div className="text-right min-w-0 flex-1">
                <p className="text-xl font-black text-white dark:text-gray-900 break-words break-all">
                  {item.value}
                </p>
                {item.subtext && <p className="text-xs text-white/50 dark:text-gray-400 mt-0.5">{item.subtext}</p>}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-900 min-w-0">
              <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 max-w-[45%]">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white text-right min-w-0 break-words break-all">
                {item.value}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
