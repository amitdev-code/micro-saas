'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import ResultDisplay from '../ResultDisplay';
import { calculateDiscount } from '@/lib/calculations';

const QUICK = [10, 15, 20, 25, 30, 40, 50, 70];

export default function DiscountCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [price, setPrice] = useState(params.get('p') || '2000');
  const [discount, setDiscount] = useState(params.get('d') || '20');

  const p = parseFloat(price) || 0;
  const d = parseFloat(discount) || 0;
  const result = p > 0 && d > 0 ? calculateDiscount(p, d) : null;

  useEffect(() => {
    router.replace(`?p=${price}&d=${discount}`, { scroll: false });
  }, [price, discount, router]);

  return (
    <CalculatorCard title="Discount Calculator" icon="lucide:tag">
      <div className="space-y-5 mb-6">
        <InputField label="Original Price (MRP)" value={price} onChange={setPrice}
          prefix="₹" min={1} max={1000000} step={100} showSlider />
        <InputField label="Discount Percentage" value={discount} onChange={setDiscount}
          suffix="%" min={1} max={99} step={1} showSlider />

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quick select</label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((d) => (
              <button key={d} onClick={() => setDiscount(String(d))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                  discount === String(d)
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}>
                {d}% off
              </button>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <>
          <ResultDisplay
            results={[
              { label: 'Original Price', value: `₹${p.toFixed(2)}` },
              { label: `Discount (${d}% off)`, value: `− ₹${result.discountAmount.toFixed(2)}` },
              { label: 'Final Price', value: `₹${result.finalPrice.toFixed(2)}`, highlight: true },
            ]}
            copyText={`Discount Results\nOriginal: ₹${price} | Discount: ${discount}%\nSavings: ₹${result.discountAmount.toFixed(2)}\nFinal: ₹${result.finalPrice.toFixed(2)}`}
          />
          <div className="mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              You save <span className="text-gray-700 dark:text-gray-200">₹{result.savings.toFixed(2)}</span> on this purchase
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Enter price and discount percentage to calculate savings</p>
        </div>
      )}

      <button onClick={() => { setPrice('2000'); setDiscount('20'); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset to defaults
      </button>
    </CalculatorCard>
  );
}
