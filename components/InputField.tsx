'use client';

import { useEffect, useState } from 'react';

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'number' | 'text' | 'date';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
  showSlider?: boolean;
}

export default function InputField({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 1,
  placeholder,
  prefix,
  suffix,
  hint,
  showSlider = false,
}: InputFieldProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const numVal = parseFloat(String(value)) || (min ?? 0);
  const pct =
    showSlider && min !== undefined && max !== undefined
      ? Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100))
      : 0;

  const fill = isDark ? '#f9fafb' : '#111827';
  const track = isDark ? '#374151' : '#e5e7eb';
  const sliderStyle = { background: `linear-gradient(to right, ${fill} ${pct}%, ${track} ${pct}%)` };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {showSlider && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
            {prefix}{value}{suffix && <span className="text-gray-400 font-normal ml-0.5 text-xs">{suffix}</span>}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm font-medium text-gray-400 pointer-events-none z-10">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
            text-gray-900 dark:text-white text-sm font-medium
            focus:outline-none focus:ring-0 focus:border-gray-900 dark:focus:border-white
            hover:border-gray-300 dark:hover:border-gray-600
            transition-colors
            ${prefix ? 'pl-7' : 'pl-3.5'}
            ${suffix && !showSlider ? 'pr-10' : 'pr-3.5'}
          `}
        />
        {suffix && !showSlider && (
          <span className="absolute right-3 text-sm text-gray-400 pointer-events-none">{suffix}</span>
        )}
      </div>

      {showSlider && min !== undefined && max !== undefined && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1"
          style={sliderStyle}
        />
      )}

      {hint && !showSlider && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}
