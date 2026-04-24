'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';
import { calculateGST } from '@/lib/calculations';

const GST_RATES = [3, 5, 12, 18, 28];

export default function GSTCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [amount, setAmount] = useState(params.get('a') || '1000');
  const [gstRate, setGstRate] = useState(Number(params.get('g')) || 18);
  const [inclusive, setInclusive] = useState(params.get('i') === '1');

  const a = parseFloat(amount) || 0;
  const result = a > 0 ? calculateGST(a, gstRate, inclusive) : null;

  useEffect(() => {
    router.replace(`?a=${amount}&g=${gstRate}&i=${inclusive ? '1' : '0'}`, { scroll: false });
  }, [amount, gstRate, inclusive, router]);

  const btnBase = 'py-2 text-xs font-semibold rounded-lg border transition-all';
  const btnActive = 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white';
  const btnInactive = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500';

  return (
    <CalculatorCard title="GST Calculator" icon="lucide:receipt">
      <div className="space-y-5 mb-6">
        <InputField label="Amount" value={amount} onChange={setAmount} prefix="₹" min={1} placeholder="1000" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GST Rate</label>
          <div className="flex gap-2">
            {GST_RATES.map((r) => (
              <button key={r} onClick={() => setGstRate(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${gstRate === r ? btnActive : btnInactive}`}>
                {r}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Add GST to amount', sub: 'Exclusive', value: false },
              { label: 'Extract GST from amount', sub: 'Inclusive', value: true },
            ].map(({ label, sub, value }) => (
              <button key={String(value)} onClick={() => setInclusive(value)}
                className={`py-3 px-3 rounded-lg border text-left transition-all ${inclusive === value ? btnActive : btnInactive}`}>
                <p className={`text-xs font-bold ${inclusive === value ? '' : 'text-gray-700 dark:text-gray-300'}`}>{sub}</p>
                <p className={`text-xs mt-0.5 ${inclusive === value ? 'opacity-60' : 'text-gray-400'}`}>{label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <ResultDisplay
          results={[
            { label: 'Base Amount (excl. GST)', value: `₹${result.baseAmount.toFixed(2)}` },
            { label: `GST @ ${gstRate}%`, value: `₹${result.gstAmount.toFixed(2)}` },
            { label: 'Total Amount (incl. GST)', value: `₹${result.totalAmount.toFixed(2)}`, highlight: true },
          ]}
          copyText={`GST Results\nAmount: ₹${amount} | Rate: ${gstRate}% | ${inclusive ? 'Inclusive' : 'Exclusive'}\nBase: ₹${result.baseAmount.toFixed(2)}\nGST: ₹${result.gstAmount.toFixed(2)}\nTotal: ₹${result.totalAmount.toFixed(2)}`}
        />
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Enter an amount to calculate GST</p>
        </div>
      )}

      <button onClick={() => { setAmount('1000'); setGstRate(18); setInclusive(false); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset to defaults
      </button>
    </CalculatorCard>
  );
}
