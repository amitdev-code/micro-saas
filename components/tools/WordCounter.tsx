'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';
import { analyzeText } from '@/lib/calculations';

const STAT_ITEMS = [
  { key: 'words', label: 'Words', icon: 'lucide:type' },
  { key: 'characters', label: 'Characters', icon: 'lucide:case-sensitive' },
  { key: 'charactersNoSpaces', label: 'No Spaces', icon: 'lucide:minus' },
  { key: 'sentences', label: 'Sentences', icon: 'lucide:align-left' },
  { key: 'paragraphs', label: 'Paragraphs', icon: 'lucide:layout-list' },
  { key: 'readingTime', label: 'Min Read', icon: 'lucide:clock' },
] as const;

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => analyzeText(text), [text]);

  async function copyStats() {
    const s = STAT_ITEMS.map((i) => `${i.label}: ${stats[i.key]}`).join('\n');
    await navigator.clipboard.writeText(s);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <CalculatorCard title="Word Counter" icon="lucide:file-text">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paste or type your text</label>
            <div className="flex gap-2">
              {text && (
                <>
                  <button onClick={copyStats}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border transition-all ${
                      copied
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}>
                    <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="w-3 h-3" />
                    {copied ? 'Copied' : 'Copy Stats'}
                  </button>
                  <button onClick={() => setText('')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Start typing or paste your text here to get an instant word count..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors py-3.5 px-4 resize-y min-h-[160px] leading-relaxed placeholder:text-gray-400"
          />

          {text && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (stats.words / 1000) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 tabular-nums shrink-0">{stats.words} / 1000 words</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-center">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon icon={item.icon} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">{stats[item.key].toLocaleString()}</p>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
            </div>
          ))}
        </div>

        {stats.words > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stats.words.toLocaleString()} words &middot; {stats.characters.toLocaleString()} characters &middot; ~{stats.readingTime} min read
            </p>
          </div>
        )}
      </div>
    </CalculatorCard>
  );
}
