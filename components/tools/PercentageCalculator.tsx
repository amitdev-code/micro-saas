'use client';

import { useState } from 'react';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import { calculatePercentageOf, calculateWhatPercent, calculatePercentageChange } from '@/lib/calculations';

type Mode = 'of' | 'what' | 'change';

const MODES: { id: Mode; title: string; desc: string; aLabel: string; aSuffix?: string; bLabel: string }[] = [
  { id: 'of', title: 'X% of Y', desc: 'Find a percentage of a number', aLabel: 'Percentage (X)', aSuffix: '%', bLabel: 'Number (Y)' },
  { id: 'what', title: 'X is what % of Y?', desc: 'What percent is X of Y?', aLabel: 'Value (X)', bLabel: 'Total (Y)' },
  { id: 'change', title: 'Percentage Change', desc: 'Find % increase or decrease', aLabel: 'Original Value', bLabel: 'New Value' },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  const current = MODES.find((m) => m.id === mode)!;

  function getResult() {
    if (!numA || !numB) return null;
    if (mode === 'of') return { value: calculatePercentageOf(numA, numB), isPercent: false };
    if (mode === 'what') return { value: calculateWhatPercent(numA, numB), isPercent: true };
    return { value: calculatePercentageChange(numA, numB), isPercent: true, isChange: true };
  }

  const result = getResult();

  return (
    <CalculatorCard title="Percentage Calculator" icon="lucide:percent">
      {/* Mode tabs */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setA(''); setB(''); }}
            className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-semibold text-left transition-all ${
              mode === m.id
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }`}>
            {m.title}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 mb-5">
        {current.desc}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label={current.aLabel} value={a} onChange={setA} suffix={current.aSuffix} placeholder="Enter value" />
        <InputField label={current.bLabel} value={b} onChange={setB} placeholder="Enter value" />
      </div>

      {result ? (
        <div className="bg-gray-950 dark:bg-white rounded-xl px-6 py-5 text-center">
          <p className="text-sm text-white/50 dark:text-gray-400 mb-1">Result</p>
          <p className="text-4xl font-black text-white dark:text-gray-900">
            {result.isChange && result.value > 0 ? '+' : ''}
            {result.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            {result.isPercent ? '%' : ''}
          </p>
          {'isChange' in result && result.isChange && (
            <p className="text-xs text-white/50 dark:text-gray-400 mt-2">
              {result.value >= 0 ? 'increase' : 'decrease'} from {a} to {b}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Enter both values to see the result</p>
        </div>
      )}

      <button onClick={() => { setA(''); setB(''); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Clear
      </button>
    </CalculatorCard>
  );
}
