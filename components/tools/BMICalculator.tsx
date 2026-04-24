'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CalculatorCard from '../CalculatorCard';
import InputField from '../InputField';
import { calculateBMI } from '@/lib/calculations';

const ZONES = [
  { label: 'Underweight', range: '< 18.5', pct: 18.5, bg: 'bg-gray-300 dark:bg-gray-600' },
  { label: 'Normal', range: '18.5–24.9', pct: 25, bg: 'bg-gray-600 dark:bg-gray-400' },
  { label: 'Overweight', range: '25–29.9', pct: 20, bg: 'bg-gray-800 dark:bg-gray-200' },
  { label: 'Obese', range: '≥ 30', pct: 36.5, bg: 'bg-gray-950 dark:bg-white' },
];

const ADVICE: Record<string, string> = {
  Underweight: 'Focus on nutrient-dense foods and strength training to gain healthy weight.',
  'Normal weight': 'Great — maintain your healthy weight with balanced diet and regular exercise.',
  Overweight: 'Aim for 0.5 kg/week loss through a modest caloric deficit and moderate exercise.',
  Obese: 'Consult a doctor or registered dietician for a personalized weight management plan.',
};

export default function BMICalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [weight, setWeight] = useState(params.get('w') || '');
  const [height, setHeight] = useState(params.get('h') || '');

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const result = w > 0 && h > 0 ? calculateBMI(w, h) : null;

  useEffect(() => {
    if (!weight || !height) return;
    router.replace(`?w=${weight}&h=${height}`, { scroll: false });
  }, [weight, height, router]);

  // Gauge: clamp BMI 10–40 → 0–100%
  const gaugePos = result ? Math.min(98, Math.max(2, ((result.bmi - 10) / 30) * 100)) : null;

  return (
    <CalculatorCard title="BMI Calculator" icon="lucide:activity">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <InputField label="Weight" value={weight} onChange={setWeight}
          suffix="kg" min={20} max={300} step={0.5} showSlider />
        <InputField label="Height" value={height} onChange={setHeight}
          suffix="cm" min={100} max={250} step={1} showSlider />
      </div>

      {result ? (
        <div className="space-y-3">
          {/* BMI value */}
          <div className="bg-gray-950 dark:bg-white rounded-xl px-6 py-5 text-center">
            <p className="text-sm text-white/50 dark:text-gray-400 mb-1">Your BMI</p>
            <p className="text-5xl font-black text-white dark:text-gray-900">{result.bmi}</p>
            <p className="text-base font-semibold text-white/80 dark:text-gray-600 mt-1">{result.category}</p>
          </div>

          {/* Scale */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">BMI Scale</p>
            <div className="relative mb-4">
              <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                {ZONES.map((z) => (
                  <div key={z.label} className={z.bg} style={{ width: `${z.pct}%` }} />
                ))}
              </div>
              {gaugePos !== null && (
                <div
                  className="absolute -top-0.5 w-4 h-4 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-white rounded-full shadow-sm transition-all duration-500"
                  style={{ left: `calc(${gaugePos}% - 8px)` }}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {ZONES.map((z) => (
                <div key={z.label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${z.bg}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{z.label}</span> ({z.range})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Health tip</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ADVICE[result.category]}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Enter weight and height to calculate your BMI</p>
        </div>
      )}

      <button onClick={() => { setWeight(''); setHeight(''); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset
      </button>
    </CalculatorCard>
  );
}
