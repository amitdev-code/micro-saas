'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';
import { calculateEMI, formatCurrency } from '@/lib/calculations';

export default function EMICalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [principal, setPrincipal] = useState(params.get('p') || '1000000');
  const [rate, setRate] = useState(params.get('r') || '8.5');
  const [tenure, setTenure] = useState(params.get('t') || '240');

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(tenure) || 0;
  const result = p > 0 && r > 0 && t > 0 ? calculateEMI(p, r, t) : null;

  useEffect(() => {
    router.replace(`?p=${principal}&r=${rate}&t=${tenure}`, { scroll: false });
  }, [principal, rate, tenure, router]);

  return (
    <CalculatorCard title="EMI Calculator" icon="lucide:landmark">
      <div className="space-y-5 mb-6">
        <InputField label="Loan Amount" value={principal} onChange={setPrincipal}
          prefix="₹" min={10000} max={10000000} step={50000} showSlider />
        <InputField label="Annual Interest Rate" value={rate} onChange={setRate}
          suffix="% p.a." min={1} max={36} step={0.1} showSlider />
        <InputField label="Loan Tenure" value={tenure} onChange={setTenure}
          suffix="months" min={6} max={360} step={6} showSlider hint="e.g. 240 = 20 years" />
      </div>

      {result ? (
        <ResultDisplay
          results={[
            { label: 'Monthly EMI', value: formatCurrency(result.emi), highlight: true },
            { label: 'Principal Amount', value: formatCurrency(p) },
            { label: 'Total Interest', value: formatCurrency(result.totalInterest) },
            { label: 'Total Payment', value: formatCurrency(result.totalPayment) },
          ]}
          copyText={`EMI Results\nLoan: ₹${principal} | Rate: ${rate}% | Tenure: ${tenure}mo\nEMI: ${formatCurrency(result.emi)}\nInterest: ${formatCurrency(result.totalInterest)}\nTotal: ${formatCurrency(result.totalPayment)}`}
        />
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Adjust the sliders to calculate your EMI</p>
        </div>
      )}

      <button onClick={() => { setPrincipal('1000000'); setRate('8.5'); setTenure('240'); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset to defaults
      </button>
    </CalculatorCard>
  );
}
