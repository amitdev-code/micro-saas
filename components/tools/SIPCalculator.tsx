'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';
import { calculateSIP, formatCurrency } from '@/lib/calculations';

export default function SIPCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [monthly, setMonthly] = useState(params.get('m') || '5000');
  const [rate, setRate] = useState(params.get('r') || '12');
  const [years, setYears] = useState(params.get('y') || '10');

  const m = parseFloat(monthly) || 0;
  const r = parseFloat(rate) || 0;
  const y = parseFloat(years) || 0;
  const result = m > 0 && r > 0 && y > 0 ? calculateSIP(m, r, y) : null;

  useEffect(() => {
    router.replace(`?m=${monthly}&r=${rate}&y=${years}`, { scroll: false });
  }, [monthly, rate, years, router]);

  return (
    <CalculatorCard title="SIP Calculator" icon="lucide:trending-up">
      <div className="space-y-5 mb-6">
        <InputField label="Monthly Investment" value={monthly} onChange={setMonthly}
          prefix="₹" min={500} max={200000} step={500} showSlider />
        <InputField label="Expected Annual Return" value={rate} onChange={setRate}
          suffix="% p.a." min={1} max={30} step={0.5} showSlider />
        <InputField label="Investment Period" value={years} onChange={setYears}
          suffix="years" min={1} max={40} step={1} showSlider />
      </div>

      {result ? (
        <ResultDisplay
          results={[
            { label: 'Total Invested', value: formatCurrency(result.totalInvestment) },
            { label: 'Estimated Returns', value: formatCurrency(result.estimatedReturns) },
            {
              label: 'Total Corpus',
              value: formatCurrency(result.futureValue),
              highlight: true,
              subtext: `${Math.round((result.estimatedReturns / result.totalInvestment) * 100)}% profit on investment`,
            },
          ]}
          copyText={`SIP Results\nMonthly: ₹${monthly} | Rate: ${rate}% | Period: ${years}yr\nInvested: ${formatCurrency(result.totalInvestment)}\nReturns: ${formatCurrency(result.estimatedReturns)}\nTotal: ${formatCurrency(result.futureValue)}`}
        />
      ) : (
        <EmptyState label="Adjust the sliders to see your SIP returns" />
      )}

      <ResetBtn onClick={() => { setMonthly('5000'); setRate('12'); setYears('10'); }} />
    </CalculatorCard>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function ResetBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
      Reset to defaults
    </button>
  );
}
