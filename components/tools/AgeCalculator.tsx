'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import CalculatorCard from '../CalculatorCard';
import { calculateAge } from '@/lib/calculations';

export default function AgeCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const today = new Date().toISOString().split('T')[0];
  const [dob, setDob] = useState(params.get('dob') || '');
  const [result, setResult] = useState<ReturnType<typeof calculateAge> | null>(null);

  useEffect(() => {
    if (!dob) return;
    const birth = new Date(dob);
    if (isNaN(birth.getTime()) || birth > new Date()) return;
    setResult(calculateAge(birth));
    router.replace(`?dob=${dob}`, { scroll: false });
  }, [dob, router]);

  const stats = result
    ? [
        { label: 'Total Days', value: result.totalDays.toLocaleString('en-IN'), icon: 'lucide:calendar' },
        { label: 'Weeks Lived', value: Math.floor(result.totalDays / 7).toLocaleString('en-IN'), icon: 'lucide:calendar-range' },
        { label: 'Months Lived', value: Math.floor(result.totalDays / 30.44).toLocaleString('en-IN'), icon: 'lucide:calendar-days' },
        { label: 'Days to Birthday', value: result.daysUntilBirthday.toLocaleString('en-IN'), icon: 'lucide:gift' },
      ]
    : [];

  return (
    <CalculatorCard title="Age Calculator" icon="lucide:calendar-days">
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={today}
            className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium px-3.5 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors" />
        </div>
      </div>

      {result ? (
        <div className="space-y-3">
          {/* Primary display */}
          <div className="bg-gray-950 dark:bg-white rounded-xl px-6 py-5 text-center">
            <p className="text-sm font-medium text-white/50 dark:text-gray-400 mb-3">Your exact age</p>
            <div className="flex items-baseline justify-center gap-4 flex-wrap">
              {[
                { val: result.years, unit: 'years' },
                { val: result.months, unit: 'months' },
                { val: result.days, unit: 'days' },
              ].map(({ val, unit }) => (
                <div key={unit} className="text-center">
                  <span className="text-4xl font-black text-white dark:text-gray-900">{val}</span>
                  <p className="text-xs text-white/50 dark:text-gray-400 font-medium mt-0.5">{unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                  <Icon icon={s.icon} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-center">
          <p className="text-sm text-gray-400">Select your date of birth to calculate your exact age</p>
        </div>
      )}

      <button onClick={() => { setDob(''); setResult(null); }}
        className="mt-4 w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
        Reset
      </button>
    </CalculatorCard>
  );
}
