'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';
import { calculateFD, formatCurrency } from '@/lib/calculations';

const COMPOUNDING = [
  { label: 'Monthly', value: 12 },
  { label: 'Quarterly', value: 4 },
  { label: 'Half-Yearly', value: 2 },
  { label: 'Yearly', value: 1 },
];

export default function FDCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [principal, setPrincipal] = useState(params.get('p') || '100000');
  const [rate, setRate] = useState(params.get('r') || '7');
  const [years, setYears] = useState(params.get('y') || '5');
  const [compounding, setCompounding] = useState(Number(params.get('c')) || 4);

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const y = parseFloat(years) || 0;
  const result = p > 0 && r > 0 && y > 0 ? calculateFD(p, r, y, compounding) : null;

  useEffect(() => {
    router.replace(`?p=${principal}&r=${rate}&y=${years}&c=${compounding}`, { scroll: false });
  }, [principal, rate, years, compounding, router]);

  return (
    <CalculatorCard title="FD Calculator" icon="lucide:piggy-bank">
      <div className="space-y-5 mb-6">
        <InputField label="Principal Amount" value={principal} onChange={setPrincipal}
          prefix="₹" min={1000} max={5000000} step={5000} showSlider />
        <InputField label="Annual Interest Rate" value={rate} onChange={setRate}
          suffix="% p.a." min={1} max={15} step={0.1} showSlider />
        <InputField label="Time Period" value={years} onChange={setYears}
          suffix="years" min={1} max={20} step={1} showSlider />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Compounding Frequency</label>
          <div className="grid grid-cols-4 gap-2">
            {COMPOUNDING.map((opt) => (
              <button key={opt.value} onClick={() => setCompounding(opt.value)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  compounding === opt.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <ResultDisplay
          results={[
            { label: 'Principal Amount', value: formatCurrency(p) },
            { label: 'Interest Earned', value: formatCurrency(result.interestEarned) },
            { label: 'Maturity Amount', value: formatCurrency(result.maturityAmount), highlight: true },
          ]}
          copyText={`FD Results\nPrincipal: ₹${principal} | Rate: ${rate}% | Period: ${years}yr\nInterest: ${formatCurrency(result.interestEarned)}\nMaturity: ${formatCurrency(result.maturityAmount)}`}
        />
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Adjust the sliders to calculate FD returns</p>
        </div>
      )}

      <button onClick={() => { setPrincipal('100000'); setRate('7'); setYears('5'); setCompounding(4); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset to defaults
      </button>
    </CalculatorCard>
  );
}
